/**
 * SPWN Apps 2.0 - Tourism & Travel Domain Service
 * Location: backend/google-apps-script/services/tourism.service.gs
 * ---------------------------------------------------------------
 * Layanan katalog destinasi wisata binaan SAKA Pariwisata, paket tur,
 * jaringan kemitraan desa/pokdarwis, serta evaluasi ulasan Sapta Pesona.
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - core/cache.service.gs (CacheManager, generateCacheKey)
 * - config/database.config.gs (TRAVEL Database Domain)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * ATURAN ARSITEKTUR:
 * - Akses spreadsheet WAJIB melalui SpreadsheetRepository.
 * - Perhitungan kalkulasi rating dipisahkan ke modul internal RatingCalculator.
 * - Mutasi data dilindungi LockManager via Repository.
 */

// =========================================================================
// INTERNAL ABSTRACTION: RATING & SAPTA PESONA CALCULATOR
// =========================================================================
var RatingCalculator = (function() {

  /**
   * Menghitung statistik rating agregat dan evaluasi 7 Unsur Sapta Pesona.
   * Unsur Sapta Pesona: Aman, Tertib, Bersih, Sejuk, Indah, Ramah, Kenangan.
   * 
   * @param {Array<Object>} reviews - Daftar ulasan untuk destinasi tertentu
   * @returns {{ totalReviews: number, averageRating: number, distribution: Object, saptaPesona: Object }}
   */
  function calculateDestinationRating(reviews) {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0.0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        saptaPesona: {
          aman: 0,
          tertib: 0,
          bersih: 0,
          sejuk: 0,
          indah: 0,
          ramah: 0,
          kenangan: 0
        }
      };
    }

    var totalScore = 0;
    var dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    var spTotals = { aman: 0, tertib: 0, bersih: 0, sejuk: 0, indah: 0, ramah: 0, kenangan: 0 };
    var spCount = 0;

    for (var i = 0; i < reviews.length; i++) {
      var r = reviews[i];
      var score = parseFloat(r.rating) || 0;
      if (score < 1) score = 1;
      if (score > 5) score = 5;

      totalScore += score;
      var starBucket = Math.round(score);
      if (dist[starBucket] !== undefined) {
        dist[starBucket]++;
      }

      // Hitung agregat Sapta Pesona jika reviewer mengisi detail
      if (r.skor_aman || r.skor_tertib || r.skor_bersih) {
        spTotals.aman += parseFloat(r.skor_aman) || score;
        spTotals.tertib += parseFloat(r.skor_tertib) || score;
        spTotals.bersih += parseFloat(r.skor_bersih) || score;
        spTotals.sejuk += parseFloat(r.skor_sejuk) || score;
        spTotals.indah += parseFloat(r.skor_indah) || score;
        spTotals.ramah += parseFloat(r.skor_ramah) || score;
        spTotals.kenangan += parseFloat(r.skor_kenangan) || score;
        spCount++;
      }
    }

    var avg = totalScore / reviews.length;
    var roundedAvg = Math.round(avg * 10) / 10;

    var divisor = spCount > 0 ? spCount : reviews.length;
    var saptaPesonaAvg = {
      aman: Math.round((spTotals.aman / divisor) * 10) / 10,
      tertib: Math.round((spTotals.tertib / divisor) * 10) / 10,
      bersih: Math.round((spTotals.bersih / divisor) * 10) / 10,
      sejuk: Math.round((spTotals.sejuk / divisor) * 10) / 10,
      indah: Math.round((spTotals.indah / divisor) * 10) / 10,
      ramah: Math.round((spTotals.ramah / divisor) * 10) / 10,
      kenangan: Math.round((spTotals.kenangan / divisor) * 10) / 10
    };

    return {
      totalReviews: reviews.length,
      averageRating: roundedAvg,
      distribution: dist,
      saptaPesona: saptaPesonaAvg
    };
  }

  return {
    calculateDestinationRating: calculateDestinationRating
  };
})();


// =========================================================================
// MAIN SERVICE: TOURISM SERVICE
// =========================================================================
var TourismService = (function() {
  var _destRepo = null;
  var _paketRepo = null;
  var _mitraRepo = null;
  var _reviewRepo = null;

  function _getDestRepo() {
    if (!_destRepo) {
      _destRepo = SpreadsheetRepository.create('TRAVEL', 'DESTINASI', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _destRepo;
  }

  function _getPaketRepo() {
    if (!_paketRepo) {
      _paketRepo = SpreadsheetRepository.create('TRAVEL', 'PAKET', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _paketRepo;
  }

  function _getMitraRepo() {
    if (!_mitraRepo) {
      _mitraRepo = SpreadsheetRepository.create('TRAVEL', 'MITRA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _mitraRepo;
  }

  function _getReviewRepo() {
    if (!_reviewRepo) {
      _reviewRepo = SpreadsheetRepository.create('TRAVEL', 'REVIEW', {
        primaryKey: 'id'
      });
    }
    return _reviewRepo;
  }

  function _createServiceError(code, message) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    return err;
  }

  /**
   * Menampilkan daftar destinasi wisata terpaginasi.
   * 
   * @param {Object} queryOptions 
   * @returns {{ data: Array<Object>, pagination: Object }}
   */
  function listDestinations(queryOptions) {
    queryOptions = queryOptions || {};
    var destRepo = _getDestRepo();

    var repoOptions = {
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 15,
      search: queryOptions.search,
      searchColumns: ['nama_destinasi', 'provinsi', 'kabupaten_kota', 'kategori', 'deskripsi'],
      sortBy: queryOptions.sortBy || 'rating',
      sortOrder: queryOptions.sortOrder || 'desc',
      filter: {}
    };

    if (queryOptions.status) {
      repoOptions.filter.status = queryOptions.status;
    } else {
      repoOptions.filter.status = 'ACTIVE'; // Default hanya destinasi aktif
    }

    if (queryOptions.provinsi_id) {
      repoOptions.filter.provinsi_id = queryOptions.provinsi_id;
    }
    if (queryOptions.kategori) {
      repoOptions.filter.kategori = queryOptions.kategori;
    }

    return destRepo.findAll(repoOptions);
  }

  /**
   * Mengambil rincian destinasi wisata beserta evaluasi ulasan Sapta Pesona.
   * 
   * @param {string} id 
   * @returns {Object|null}
   */
  function getDestinationById(id) {
    if (!id) return null;

    var destRepo = _getDestRepo();
    var destination = destRepo.findById(id);
    if (!destination) return null;

    // Ambil ulasan terkini untuk destinasi ini
    var reviewRepo = _getReviewRepo();
    var reviewsResult = reviewRepo.findAll({
      page: 1,
      limit: 50,
      filter: { destinasi_id: id },
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    var ratingSummary = RatingCalculator.calculateDestinationRating(reviewsResult.data);
    destination.rating_stats = ratingSummary;
    destination.recent_reviews = reviewsResult.data.slice(0, 5);

    return destination;
  }

  /**
   * Pendaftaran destinasi wisata baru (binaan SAKA Pariwisata / Pokdarwis).
   * 
   * @param {Object} payload 
   * @param {Object} creator - Informasi user pembuat (admin / pembina)
   * @returns {Object} Destinasi yang baru disimpan
   */
  function createDestination(payload, creator) {
    if (!payload || !payload.nama_destinasi) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama destinasi wisata wajib diisi');
    }

    creator = creator || {};
    var destRepo = _getDestRepo();

    var newId = 'DST-' + (payload.provinsi_id || '32') + '-' + new Date().getTime().toString(36).toUpperCase();
    var record = {
      id: newId,
      nama_destinasi: payload.nama_destinasi.trim(),
      kategori: payload.kategori || 'Wisata Alam',
      deskripsi: payload.deskripsi || '',
      provinsi_id: payload.provinsi_id || '32',
      provinsi: payload.provinsi || 'Jawa Barat',
      kabupaten_kota: payload.kabupaten_kota || payload.kota || '',
      alamat_lengkap: payload.alamat_lengkap || '',
      latitude: payload.latitude || 0,
      longitude: payload.longitude || 0,
      harga_tiket: parseFloat(payload.harga_tiket) || 0,
      jam_operasional: payload.jam_operasional || '08:00 - 17:00 WIB',
      fasilitas: payload.fasilitas || 'Parkir, Toilet, Mushola, Kios Kuliner',
      foto_utama: payload.foto_utama || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
      rating: 5.0, // Initial rating
      total_ulasan: 0,
      pengelola_nama: payload.pengelola_nama || 'Kelompok Sadar Wisata (Pokdarwis)',
      pengelola_kontak: payload.pengelola_kontak || '',
      created_by: creator.userId || creator.id || 'SYSTEM',
      status: payload.status || 'ACTIVE'
    };

    return destRepo.insert(record);
  }

  /**
   * Pembaruan profil destinasi wisata.
   * 
   * @param {string} id 
   * @param {Object} patchData 
   * @returns {Object}
   */
  function updateDestination(id, patchData) {
    if (!id) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID destinasi wajib disertakan');
    }

    var safePatch = Object.assign({}, patchData);
    delete safePatch.id;
    delete safePatch.created_at;

    var destRepo = _getDestRepo();
    return destRepo.update(id, safePatch);
  }

  /**
   * Menampilkan paket wisata binaan SAKA Pariwisata.
   * 
   * @param {string} [destinationId] 
   * @returns {Array<Object>}
   */
  function listTourPackages(destinationId) {
    var paketRepo = _getPaketRepo();
    var filterObj = { status: 'ACTIVE' };
    if (destinationId) {
      filterObj.destinasi_id = destinationId;
    }

    var result = paketRepo.findAll({
      page: 1,
      limit: 30,
      filter: filterObj,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    return result.data;
  }

  /**
   * Mendaftarkan paket wisata baru.
   * 
   * @param {Object} payload 
   * @returns {Object}
   */
  function createTourPackage(payload) {
    if (!payload || !payload.nama_paket) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama paket wisata wajib diisi');
    }

    var paketRepo = _getPaketRepo();
    var pkgId = 'PKG-' + new Date().getTime().toString(36).toUpperCase();

    var pkgRecord = {
      id: pkgId,
      destinasi_id: payload.destinasi_id || '',
      nama_paket: payload.nama_paket.trim(),
      durasi: payload.durasi || '1 Hari',
      harga_per_orang: parseFloat(payload.harga_per_orang) || 0,
      kuota_minimal: parseInt(payload.kuota_minimal, 10) || 5,
      itinerary: payload.itinerary || '',
      fasilitas_termasuk: payload.fasilitas_termasuk || 'Pemandu Krida, Tiket Masuk, Konsumsi',
      kontak_reservasi: payload.kontak_reservasi || '',
      status: 'ACTIVE'
    };

    return paketRepo.insert(pkgRecord);
  }

  /**
   * Mengirim ulasan wisatawan dan memperbarui agregat rating destinasi secara otomatis.
   * 
   * @param {string} destinationId 
   * @param {Object} reviewPayload 
   * @returns {{ review: Object, updatedRating: number }}
   */
  function submitReview(destinationId, reviewPayload) {
    if (!destinationId) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID destinasi tujuan ulasan wajib disertakan');
    }
    if (!reviewPayload || !reviewPayload.rating) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Rating ulasan (1-5) wajib diisi');
    }

    var reviewRepo = _getReviewRepo();
    var destRepo = _getDestRepo();

    var reviewId = 'REV-' + new Date().getTime().toString(36).toUpperCase();
    var newReview = {
      id: reviewId,
      destinasi_id: destinationId,
      nama_pengulas: reviewPayload.nama_pengulas || 'Wisatawan Ramah',
      no_kta: reviewPayload.no_kta || '',
      rating: parseFloat(reviewPayload.rating) || 5,
      komentar: reviewPayload.komentar || '',
      skor_aman: reviewPayload.skor_aman || reviewPayload.rating,
      skor_tertib: reviewPayload.skor_tertib || reviewPayload.rating,
      skor_bersih: reviewPayload.skor_bersih || reviewPayload.rating,
      skor_sejuk: reviewPayload.skor_sejuk || reviewPayload.rating,
      skor_indah: reviewPayload.skor_indah || reviewPayload.rating,
      skor_ramah: reviewPayload.skor_ramah || reviewPayload.rating,
      skor_kenangan: reviewPayload.skor_kenangan || reviewPayload.rating
    };

    var savedReview = reviewRepo.insert(newReview);

    // Hitung ulang rating agregat destinasi
    var allReviews = reviewRepo.findAll({
      page: 1,
      limit: 100,
      filter: { destinasi_id: destinationId }
    });

    var newStats = RatingCalculator.calculateDestinationRating(allReviews.data);

    // Update rating di sheet Destinasi
    destRepo.update(destinationId, {
      rating: newStats.averageRating,
      total_ulasan: newStats.totalReviews
    });

    return {
      review: savedReview,
      ratingSummary: newStats
    };
  }

  /**
   * Menampilkan daftar mitra pengelola wisata (Desa Wisata, Pokdarwis, Hotel/Homestay).
   * 
   * @param {string} [provinceId] 
   * @returns {Array<Object>}
   */
  function listPartners(provinceId) {
    var mitraRepo = _getMitraRepo();
    var filterObj = { status: 'ACTIVE' };
    if (provinceId) {
      filterObj.provinsi_id = provinceId;
    }

    var result = mitraRepo.findAll({
      page: 1,
      limit: 50,
      filter: filterObj,
      sortBy: 'nama_mitra',
      sortOrder: 'asc'
    });

    return result.data;
  }

  /**
   * Registrasi kemitraan baru dengan SAKA Pariwisata.
   * 
   * @param {Object} payload 
   * @returns {Object}
   */
  function registerPartner(payload) {
    if (!payload || !payload.nama_mitra) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama mitra wisata wajib diisi');
    }

    var mitraRepo = _getMitraRepo();
    var mitraId = 'MTR-' + new Date().getTime().toString(36).toUpperCase();

    var mitraRecord = {
      id: mitraId,
      nama_mitra: payload.nama_mitra.trim(),
      tipe_mitra: payload.tipe_mitra || 'Desa Wisata / Pokdarwis',
      provinsi_id: payload.provinsi_id || '32',
      provinsi: payload.provinsi || 'Jawa Barat',
      kabupaten_kota: payload.kabupaten_kota || '',
      penanggung_jawab: payload.penanggung_jawab || '',
      kontak: payload.kontak || '',
      status: 'ACTIVE'
    };

    return mitraRepo.insert(mitraRecord);
  }

  return {
    listDestinations: listDestinations,
    getDestinationById: getDestinationById,
    createDestination: createDestination,
    updateDestination: updateDestination,
    listTourPackages: listTourPackages,
    createTourPackage: createTourPackage,
    submitReview: submitReview,
    listPartners: listPartners,
    registerPartner: registerPartner
  };
})();
