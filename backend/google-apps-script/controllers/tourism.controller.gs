/**
 * SPWN Apps 2.0 - Tourism Controller
 * Location: backend/google-apps-script/controllers/tourism.controller.gs
 * ---------------------------------------------------------------------
 * Menangani HTTP request untuk domain Pariwisata & Perjalanan:
 * - tourism.destinations (GET)
 * - tourism.destination (GET)
 * - tourism.createDestination (POST)
 * - tourism.packages (GET)
 * - tourism.review (POST - Secured with Rate Limiter / Auth Check)
 * - tourism.partners (GET)
 */

var TourismController = (function() {

  /**
   * Mengambil daftar destinasi wisata aktif (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listDestinations(context) {
    var query = context.query || {};

    var queryOptions = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 15,
      search: query.search || '',
      provinsi_id: query.provinsi_id || query.provinsiId || '',
      kategori: query.kategori || ''
    };

    try {
      var result = TourismService.listDestinations(queryOptions);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar destinasi wisata berhasil diambil',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat katalog destinasi',
        { code: err.code || 'SPWN_TOURISM_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil rincian destinasi wisata beserta skor Sapta Pesona (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function getDestination(context) {
    var id = (context.query && context.query.id) || (context.body && context.body.id);

    if (!id) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter ID destinasi wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var destination = TourismService.getDestinationById(id);
      if (!destination) {
        return ApiResponseFormatter.error(
          context.action,
          404,
          'Destinasi wisata tidak ditemukan: ' + id,
          { code: 'SPWN_NOT_FOUND' },
          context.requestId
        );
      }

      return ApiResponseFormatter.success(
        context.action,
        destination,
        'Detail destinasi wisata berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat rincian destinasi',
        { code: err.code || 'SPWN_TOURISM_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mendaftarkan destinasi wisata baru (RequireAuth: TOURISM_MANAGE).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function createDestination(context) {
    var body = context.body || {};

    if (!body.nama_destinasi) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nama destinasi wisata wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var created = TourismService.createDestination(body, context.user);
      AuditMiddleware.log(context, created.id, 'SUCCESS', { nama: created.nama_destinasi });

      return ApiResponseFormatter.success(
        context.action,
        created,
        'Destinasi wisata berhasil didaftarkan',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, body.nama_destinasi, 'FAILED', { error: err.message });
      var status = (err.code === 'SPWN_VALIDATION_ERROR') ? 400 : 500;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal mendaftarkan destinasi',
        { code: err.code || 'SPWN_TOURISM_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Menampilkan paket wisata binaan SAKA (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listPackages(context) {
    var destId = (context.query && context.query.destinasi_id) || '';

    try {
      var packages = TourismService.listTourPackages(destId);
      return ApiResponseFormatter.success(
        context.action,
        packages,
        'Daftar paket wisata berhasil diambil',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat paket wisata',
        { code: err.code || 'SPWN_TOURISM_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Pengiriman Ulasan Wisatawan (Keamanan Refinement: Dual-Gate).
   * - Pengguna terotentikasi (MEMBER) langsung diizinkan.
   * - Pengunjung publik dibatasi ketat: Maksimum 3 ulasan per jam per IP address.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function submitReview(context) {
    var body = context.body || {};
    var destId = body.destinasi_id || (context.query && context.query.destinasi_id);

    if (!destId || !body.rating) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID destinasi dan skor rating (1-5) wajib disertakan',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    // Rate Limiter untuk ulasan publik
    if (!context.isAuthenticated) {
      var clientIp = context.client.ip || 'anon';
      var rate = AuthMiddleware.checkRateLimit('REVIEW_SUBMISSION', clientIp, 3, 3600);
      if (!rate.allowed) {
        return ApiResponseFormatter.error(
          context.action,
          429,
          'Batas pengiriman ulasan tercapai (maks. 3 ulasan per jam). Silakan login akun Pramuka untuk ulasan tak terbatas.',
          { code: 'SPWN_RATE_LIMITED' },
          context.requestId
        );
      }
    } else {
      // Pasang data pengulas dari sesi login resmi jika tersedia
      body.nama_pengulas = (context.user && (context.user.nama || context.user.nama_lengkap)) || body.nama_pengulas;
      body.no_kta = (context.user && context.user.no_kta) || body.no_kta;
    }

    try {
      var reviewResult = TourismService.submitReview(destId, body);
      return ApiResponseFormatter.success(
        context.action,
        reviewResult,
        'Ulasan dan evaluasi Sapta Pesona berhasil dikirim',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        err.message || 'Gagal mengirimkan ulasan',
        { code: err.code || 'SPWN_REVIEW_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Menampilkan daftar mitra desa wisata & Pokdarwis (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listPartners(context) {
    var provId = (context.query && (context.query.provinsi_id || context.query.provinsiId)) || '';

    try {
      var partners = TourismService.listPartners(provId);
      return ApiResponseFormatter.success(
        context.action,
        partners,
        'Daftar mitra wisata berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat mitra wisata',
        { code: err.code || 'SPWN_TOURISM_ERROR' },
        context.requestId
      );
    }
  }

  return {
    listDestinations: listDestinations,
    getDestination: getDestination,
    createDestination: createDestination,
    listPackages: listPackages,
    submitReview: submitReview,
    listPartners: listPartners
  };
})();
