/**
 * SPWN Apps 2.0 - KTA (Kartu Tanda Anggota) Identity Service
 * Location: backend/google-apps-script/services/kta.service.gs
 * -------------------------------------------------------------
 * Layanan inti spesifikasi & penomoran Kartu Tanda Anggota (KTA) Digital SPWN.
 * 
 * ATURAN KTA FORMAT FINAL:
 * 1. Anggota Kwartir Nasional:
 *    Format: 00.NNNNNN
 *    - 00: Kode Tetap Kwartir Nasional
 *    - NNNNNN: Nomor Urut Anggota 6 digit
 * 
 * 2. Anggota Bukan Kwartir Nasional (Wilayah):
 *    Format: 00.PPKK.CCC.NNNNNN
 *    - 00: Kode Tetap Kwartir Nasional
 *    - PPKK: Kode Kabupaten/Kota dari regencies.csv (4 digit)
 *    - CCC: 3 Digit Kode Kecamatan turunan dari districts.csv
 *    - NNNNNN: Nomor Urut Anggota 6 digit
 * 
 * CATATAN PENTING:
 * - DILARANG menggunakan kode provinsi pada nomor KTA wilayah.
 * - Namun database tetap menyimpan:
 *   * kode_provinsi
 *   * kode_kabupaten
 *   * kode_kecamatan
 *   untuk kebutuhan pelaporan dan filtering.
 * - KtaService mendukung dua format berbeda berdasarkan level organisasi anggota.
 */

var KtaService = (function() {
  var _ktaSettingRepo = null;

  function _getRepo() {
    if (!_ktaSettingRepo) {
      _ktaSettingRepo = SpreadsheetRepository.create('MEMBER', 'KTA_SETTING', {
        primaryKey: 'key'
      });
    }
    return _ktaSettingRepo;
  }

  // Regex Format Final KTA SPWN
  var KTA_NASIONAL_REGEX = /^00\.([0-9]{6})$/;
  var KTA_WILAYAH_REGEX = /^00\.([0-9]{4})\.([0-9]{3})\.([0-9]{6})$/;

  /**
   * Menghasilkan nomor KTA resmi berbasis level organisasi anggota.
   * 
   * Dua format yang didukung:
   * 1. Kwartir Nasional: 00.NNNNNN
   * 2. Wilayah (Bukan Kwartir Nasional): 00.PPKK.CCC.NNNNNN
   * 
   * @param {Object|string} optionsOrLevel - Objek konfigurasi atau string level organisasi
   * @param {string} [regencyCode] - 4 digit kode Kabupaten/Kota (PPKK)
   * @param {string} [districtCode] - 3 digit kode Kecamatan (CCC) atau 7 digit PPKKCCC
   * @param {number|string} [sequence] - Nomor urut anggota
   * @returns {string} Contoh: '00.000001' (Nasional) atau '00.3204.190.000123' (Wilayah)
   */
  function generateKtaNumber(optionsOrLevel, regencyCode, districtCode, sequence) {
    var level = 'WILAYAH';
    var ppkk = '0000';
    var ccc = '000';
    var seq = 1;

    if (typeof optionsOrLevel === 'object' && optionsOrLevel !== null) {
      level = (optionsOrLevel.level || optionsOrLevel.level_organisasi || 'WILAYAH').toUpperCase();
      ppkk = (optionsOrLevel.kodeKabupaten || optionsOrLevel.kode_kabupaten || optionsOrLevel.regencyCode || '0000').toString();
      var rawC = (optionsOrLevel.kodeKecamatan || optionsOrLevel.kode_kecamatan || optionsOrLevel.districtCode || '000').toString();
      ccc = rawC.length >= 3 ? rawC.slice(-3) : rawC.padStart(3, '0');
      seq = parseInt(optionsOrLevel.sequence || optionsOrLevel.nomor_urut || 1, 10) || 1;
    } else if (typeof optionsOrLevel === 'string') {
      var upperLevel = optionsOrLevel.toUpperCase();
      if (upperLevel === 'KWARTIR_NASIONAL' || upperLevel === 'NASIONAL' || upperLevel === '00') {
        level = 'KWARTIR_NASIONAL';
        seq = parseInt(regencyCode || 1, 10) || 1;
      } else {
        level = 'WILAYAH';
        ppkk = (regencyCode || '0000').toString();
        var rawDistrict = (districtCode || '000').toString();
        ccc = rawDistrict.length >= 3 ? rawDistrict.slice(-3) : rawDistrict.padStart(3, '0');
        seq = parseInt(sequence || 1, 10) || 1;
      }
    }

    var seqStr = seq.toString().padStart(6, '0').slice(-6);

    // 1. Format Kwartir Nasional: 00.NNNNNN
    if (level === 'KWARTIR_NASIONAL') {
      return '00.' + seqStr;
    }

    // 2. Format Wilayah: 00.PPKK.CCC.NNNNNN
    var ppkkStr = ppkk.padStart(4, '0').slice(-4);
    var cccStr = ccc.padStart(3, '0').slice(-3);

    return '00.' + ppkkStr + '.' + cccStr + '.' + seqStr;
  }

  /**
   * Memvalidasi format penomoran KTA sesuai standar format final SPWN:
   * - Kwartir Nasional: 00.NNNNNN
   * - Wilayah: 00.PPKK.CCC.NNNNNN
   * 
   * @param {string} noKta 
   * @returns {{ isValid: boolean, type?: string, level?: string, kodeNasional?: string, kodeKabupaten?: string, kodeKecamatan?: string, sequence?: string, message?: string }}
   */
  function validateKta(noKta) {
    if (!noKta || typeof noKta !== 'string') {
      return { isValid: false, message: 'Nomor KTA tidak boleh kosong' };
    }

    var cleanKta = noKta.trim();

    // 1. Uji Format Kwartir Nasional (00.NNNNNN)
    var matchNasional = cleanKta.match(KTA_NASIONAL_REGEX);
    if (matchNasional) {
      return {
        isValid: true,
        type: 'KWARTIR_NASIONAL',
        level: 'KWARTIR_NASIONAL',
        kodeNasional: '00',
        sequence: matchNasional[1],
        formatted: cleanKta,
        message: 'KTA Kwartir Nasional Valid'
      };
    }

    // 2. Uji Format Wilayah (00.PPKK.CCC.NNNNNN)
    var matchWilayah = cleanKta.match(KTA_WILAYAH_REGEX);
    if (matchWilayah) {
      return {
        isValid: true,
        type: 'WILAYAH',
        level: 'WILAYAH',
        kodeNasional: '00',
        kodeKabupaten: matchWilayah[1],
        kodeKecamatan: matchWilayah[2],
        sequence: matchWilayah[3],
        formatted: cleanKta,
        message: 'KTA Wilayah Valid'
      };
    }

    return {
      isValid: false,
      message: 'Format Nomor KTA tidak valid. Format resmi: 00.NNNNNN (Kwartir Nasional) atau 00.PPKK.CCC.NNNNNN (Wilayah)'
    };
  }

  /**
   * Mengurai komponen nomor KTA menjadi metadata terstruktur.
   * 
   * @param {string} noKta 
   * @returns {Object}
   */
  function parseKta(noKta) {
    var val = validateKta(noKta);
    if (!val.isValid) {
      return { isValid: false, message: val.message };
    }

    return {
      isValid: true,
      level: val.level,
      kode_nasional: '00',
      kode_kabupaten: val.kodeKabupaten || '',
      kode_kecamatan: val.kodeKecamatan || '',
      nomor_urut: val.sequence || '',
      formatted: val.formatted
    };
  }

  /**
   * Menghasilkan Dynamic Secure Verification QR Token untuk kartu tanda anggota.
   * Format: SPWN-QR-{random_secure_token} (16-32 karakter entropy tinggi).
   * Unik, acak, non-sequential, zero PII.
   * 
   * @param {string} [seed] 
   * @returns {string} Contoh: 'SPWN-QR-A8K29DJM4P7X8N1Q2W3E4R5T'
   */
  function generateQrToken(seed) {
    var rawSeed = (seed || '') + '|' + Utilities.getUuid() + '|' + new Date().getTime() + '|' + Math.random();
    var hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawSeed, Utilities.Charset.UTF_8);
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var token = '';
    // 24 karakter dari hash entropy
    for (var i = 0; i < 24; i++) {
      var byteVal = (hashBytes[i % hashBytes.length] < 0) ? (hashBytes[i % hashBytes.length] + 256) : hashBytes[i % hashBytes.length];
      token += chars.charAt((byteVal + i) % chars.length);
    }
    return 'SPWN-QR-' + token;
  }

  /**
   * Menghasilkan QR URL dinamis menggunakan SPWN_SYSTEM.PUBLIC_URL
   * 
   * @param {string} qrToken
   * @returns {string}
   */
  function generateMemberQrUrl(qrToken) {
    var baseUrl = (SPWN_SYSTEM && SPWN_SYSTEM.PUBLIC_URL) ? SPWN_SYSTEM.PUBLIC_URL : 'https://ais-dev-kpcsufjvxrvm25tv5c5n5m-74565716531.asia-southeast1.run.app';
    baseUrl = baseUrl.replace(/\/+$/, '');
    return baseUrl + '/verifikasi/' + encodeURIComponent(qrToken || '');
  }

  /**
   * Mengambil metadata visual dan template KTA Digital.
   * 
   * @param {string} [tier='REGULAR'] - 'REGULAR' | 'PENGURUS' | 'KEHORMATAN'
   * @returns {Object} Spesifikasi template KTA
   */
  function getKtaTemplate(tier) {
    tier = (tier || 'REGULAR').toUpperCase();

    var templates = {
      REGULAR: {
        tierName: 'Anggota Saka Pariwisata',
        primaryColor: '#006633', // Hijau Khas Pramuka / Pariwisata
        secondaryColor: '#E6A100', // Kuning Emas
        backgroundColor: '#F8FAF7',
        textColor: '#1A2E1C',
        logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120&auto=format&fit=crop',
        watermarkUrl: '',
        cardRatio: '85.6mm x 53.98mm (CR80 Standard)',
        dimensions: { width: 1012, height: 638 }
      },
      PENGURUS: {
        tierName: 'Pengurus Saka Pariwisata',
        primaryColor: '#1A365D', // Navy Wibawa
        secondaryColor: '#D69E2E',
        backgroundColor: '#F7FAFC',
        textColor: '#1A202C',
        logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120&auto=format&fit=crop',
        watermarkUrl: '',
        cardRatio: '85.6mm x 53.98mm (CR80 Standard)',
        dimensions: { width: 1012, height: 638 }
      },
      KEHORMATAN: {
        tierName: 'Anggota Kehormatan / Pembina',
        primaryColor: '#742A2A', // Marun Prestisius
        secondaryColor: '#ECC94B',
        backgroundColor: '#FFFAF0',
        textColor: '#2D3748',
        logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120&auto=format&fit=crop',
        watermarkUrl: '',
        cardRatio: '85.6mm x 53.98mm (CR80 Standard)',
        dimensions: { width: 1012, height: 638 }
      }
    };

    return templates[tier] || templates.REGULAR;
  }

  return {
    generateKtaNumber: generateKtaNumber,
    validateKta: validateKta,
    parseKta: parseKta,
    generateQrToken: generateQrToken,
    generateMemberQrUrl: generateMemberQrUrl,
    getKtaTemplate: getKtaTemplate
  };
})();
