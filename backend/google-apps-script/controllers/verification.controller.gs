/**
 * SPWN Apps 2.0 - Verification Controller
 * Location: backend/google-apps-script/controllers/verification.controller.gs
 * --------------------------------------------------------------------------
 * Menangani HTTP request untuk validasi dan verifikasi KTA:
 * - verify.kta (GET/POST - Public via QR Token, Rate Limited)
 * - verify.internal (GET - RequireAuth, Fallback pencarian No KTA)
 */

var VerificationController = (function() {

  /**
   * Verifikasi keabsahan KTA berbasis QR Token (Publik).
   * Dilindungi Rate Limiter: Maksimum 30 request per menit per IP klien.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function verify(context) {
    var token = (context.query && context.query.token) || (context.body && context.body.token);

    if (!token) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Token QR KTA wajib disertakan',
        { code: 'SPWN_MISSING_TOKEN' },
        context.requestId
      );
    }

    // Rate limiting: 30 permintaan per menit per IP
    var clientIp = context.client.ip || 'anon';
    var rate = AuthMiddleware.checkRateLimit('VERIFY_KTA', clientIp, 30, 60);
    if (!rate.allowed) {
      return ApiResponseFormatter.error(
        context.action,
        429,
        'Batas permintaan verifikasi terlampaui. Harap tunggu 1 menit.',
        { code: 'SPWN_RATE_LIMITED' },
        context.requestId
      );
    }

    try {
      var result = VerificationService.verifyQrToken(token);
      return ApiResponseFormatter.success(
        context.action,
        result,
        result.isValid ? 'KTA terverifikasi SAH dan AKTIF' : 'KTA tidak valid atau kedaluwarsa',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        err.message || 'Gagal memverifikasi token QR KTA',
        { code: err.code || 'SPWN_VERIFY_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Verifikasi KTA internal berdasarkan Nomor KTA (Hanya untuk Admin/Pengurus).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function internalVerify(context) {
    var noKta = (context.query && context.query.no_kta) || (context.body && context.body.no_kta);

    if (!noKta) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nomor KTA wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var result = VerificationService.verifyByNoKta(noKta, context.role);
      return ApiResponseFormatter.success(
        context.action,
        result,
        result.isValid ? 'Data anggota ditemukan dan terverifikasi' : 'Nomor KTA tidak terdaftar',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memeriksa nomor KTA',
        { code: err.code || 'SPWN_VERIFY_ERROR' },
        context.requestId
      );
    }
  }

  return {
    verify: verify,
    internalVerify: internalVerify
  };
})();
