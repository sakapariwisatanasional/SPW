/**
 * SPWN Apps 2.0 - Region Seeder & CSV Import Service
 * Location: backend/google-apps-script/services/import.service.gs
 * -------------------------------------------------------------
 * Layanan seeder dan impor data master wilayah nasional bertahap (chunked),
 * ramah batas memori Google Apps Script (heap limit 32 MB) dan batas waktu 6 menit.
 * 
 * Prinsip:
 * 1. Lazy & Chunked Loading (batch 500 baris).
 * 2. Idempotent: Memeriksa Wilayah_Provinsi terlebih dahulu.
 * 3. Cache auto-invalidation setelah import tuntas.
 */

var ImportService = (function() {
  var CHUNK_SIZE = 500;

  /**
   * Cek status kesiapan data master wilayah.
   */
  function getSeederStatus() {
    var provCount = 0;
    var kabCount = 0;
    var kecCount = 0;
    var desaCount = 0;

    try {
      provCount = RegionRepository.getProvRepo().count();
      kabCount = RegionRepository.getKabRepo().count();
      kecCount = RegionRepository.getKecRepo().count();
      desaCount = RegionRepository.getDesaRepo().count();
    } catch (e) {
      // Sheet mungkin belum dibuat / kosong
    }

    return {
      isSeeded: provCount >= 38,
      statistics: {
        provinces: provCount,
        regencies: kabCount,
        districts: kecCount,
        villages: desaCount
      },
      chunkSize: CHUNK_SIZE,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Data master 38 Provinsi Indonesia standar BPS/Kemendagri
   */
  var MASTER_PROVINCES = [
    { kode_provinsi: '11', nama_provinsi: 'ACEH', status: 'ACTIVE' },
    { kode_provinsi: '12', nama_provinsi: 'SUMATERA UTARA', status: 'ACTIVE' },
    { kode_provinsi: '13', nama_provinsi: 'SUMATERA BARAT', status: 'ACTIVE' },
    { kode_provinsi: '14', nama_provinsi: 'RIAU', status: 'ACTIVE' },
    { kode_provinsi: '15', nama_provinsi: 'JAMBI', status: 'ACTIVE' },
    { kode_provinsi: '16', nama_provinsi: 'SUMATERA SELATAN', status: 'ACTIVE' },
    { kode_provinsi: '17', nama_provinsi: 'BENGKULU', status: 'ACTIVE' },
    { kode_provinsi: '18', nama_provinsi: 'LAMPUNG', status: 'ACTIVE' },
    { kode_provinsi: '19', nama_provinsi: 'KEPULAUAN BANGKA BELITUNG', status: 'ACTIVE' },
    { kode_provinsi: '21', nama_provinsi: 'KEPULAUAN RIAU', status: 'ACTIVE' },
    { kode_provinsi: '31', nama_provinsi: 'DKI JAKARTA', status: 'ACTIVE' },
    { kode_provinsi: '32', nama_provinsi: 'JAWA BARAT', status: 'ACTIVE' },
    { kode_provinsi: '33', nama_provinsi: 'JAWA TENGAH', status: 'ACTIVE' },
    { kode_provinsi: '34', nama_provinsi: 'DI YOGYAKARTA', status: 'ACTIVE' },
    { kode_provinsi: '35', nama_provinsi: 'JAWA TIMUR', status: 'ACTIVE' },
    { kode_provinsi: '36', nama_provinsi: 'BANTEN', status: 'ACTIVE' },
    { kode_provinsi: '51', nama_provinsi: 'BALI', status: 'ACTIVE' },
    { kode_provinsi: '52', nama_provinsi: 'NUSA TENGGARA BARAT', status: 'ACTIVE' },
    { kode_provinsi: '53', nama_provinsi: 'NUSA TENGGARA TIMUR', status: 'ACTIVE' },
    { kode_provinsi: '61', nama_provinsi: 'KALIMANTAN BARAT', status: 'ACTIVE' },
    { kode_provinsi: '62', nama_provinsi: 'KALIMANTAN TENGAH', status: 'ACTIVE' },
    { kode_provinsi: '63', nama_provinsi: 'KALIMANTAN SELATAN', status: 'ACTIVE' },
    { kode_provinsi: '64', nama_provinsi: 'KALIMANTAN TIMUR', status: 'ACTIVE' },
    { kode_provinsi: '65', nama_provinsi: 'KALIMANTAN UTARA', status: 'ACTIVE' },
    { kode_provinsi: '71', nama_provinsi: 'SULAWESI UTARA', status: 'ACTIVE' },
    { kode_provinsi: '72', nama_provinsi: 'SULAWESI TENGAH', status: 'ACTIVE' },
    { kode_provinsi: '73', nama_provinsi: 'SULAWESI SELATAN', status: 'ACTIVE' },
    { kode_provinsi: '74', nama_provinsi: 'SULAWESI TENGGARA', status: 'ACTIVE' },
    { kode_provinsi: '75', nama_provinsi: 'GORONTALO', status: 'ACTIVE' },
    { kode_provinsi: '76', nama_provinsi: 'SULAWESI BARAT', status: 'ACTIVE' },
    { kode_provinsi: '81', nama_provinsi: 'MALUKU', status: 'ACTIVE' },
    { kode_provinsi: '82', nama_provinsi: 'MALUKU UTARA', status: 'ACTIVE' },
    { kode_provinsi: '91', nama_provinsi: 'PAPUA BARAT', status: 'ACTIVE' },
    { kode_provinsi: '92', nama_provinsi: 'PAPUA', status: 'ACTIVE' },
    { kode_provinsi: '93', nama_provinsi: 'PAPUA SELATAN', status: 'ACTIVE' },
    { kode_provinsi: '94', nama_provinsi: 'PAPUA TENGAH', status: 'ACTIVE' },
    { kode_provinsi: '95', nama_provinsi: 'PAPUA PEGUNUNGAN', status: 'ACTIVE' },
    { kode_provinsi: '96', nama_provinsi: 'PAPUA BARAT DAYA', status: 'ACTIVE' }
  ];

  /**
   * Menjalankan seeder idempotently.
   * @param {boolean} force - Jika true, tetap jalankan meski sudah ada data
   */
  function seedMasterRegions(force) {
    var status = getSeederStatus();
    if (status.isSeeded && !force) {
      return {
        success: true,
        message: 'Master wilayah sudah pernah di-seed (Idempotent skipped)',
        statistics: status.statistics
      };
    }

    var insertedProvinces = 0;
    for (var i = 0; i < MASTER_PROVINCES.length; i++) {
      var p = MASTER_PROVINCES[i];
      try {
        RegionRepository.getProvRepo().insert({
          id: 'PROV-' + p.kode_provinsi,
          kode_provinsi: p.kode_provinsi,
          nama_provinsi: p.nama_provinsi,
          status: p.status
        });
        insertedProvinces++;
      } catch (e) {
        // Skip jika sudah ada
      }
    }

    // Bersihkan cache agar data baru terbaca
    RegionService.clearCache();

    return {
      success: true,
      message: 'Seeder provinsi berhasil dijalankan',
      insertedProvinces: insertedProvinces,
      statistics: getSeederStatus().statistics
    };
  }

  /**
   * Import data CSV chunked (misal dari file Drive atau payload teks)
   */
  function importCsvChunk(level, csvText, startRow, maxRows) {
    if (!csvText) {
      throw new Error('Konten CSV tidak boleh kosong');
    }

    var lines = Utilities.parseCsv(csvText);
    if (lines.length <= 1) {
      return { processed: 0, total: 0, hasMore: false };
    }

    var headers = lines[0];
    var start = Math.max(1, startRow || 1);
    var limit = maxRows || CHUNK_SIZE;
    var end = Math.min(lines.length, start + limit);

    var batch = [];
    for (var r = start; r < end; r++) {
      var row = lines[r];
      var item = {};
      for (var c = 0; c < headers.length; c++) {
        var key = headers[c].trim().toLowerCase().replace(/\s+/g, '_');
        item[key] = row[c] !== undefined ? row[c].trim() : '';
      }
      if (!item.id) {
        item.id = level.toLowerCase() + '-' + (item.code || item.kode || r);
      }
      batch.push(item);
    }

    var inserted = RegionRepository.batchInsert(level, batch);
    RegionService.clearCache();

    return {
      level: level,
      startRow: start,
      processed: inserted,
      nextRow: end,
      totalRows: lines.length - 1,
      hasMore: end < lines.length
    };
  }

  return {
    getSeederStatus: getSeederStatus,
    seedMasterRegions: seedMasterRegions,
    importCsvChunk: importCsvChunk
  };
})();
