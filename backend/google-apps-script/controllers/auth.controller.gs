/**
 * SPWN Apps 2.0 - Authentication Controller
 * Location: backend/google-apps-script/controllers/auth.controller.gs
 * ------------------------------------------------------------------
 * Menangani HTTP request untuk domain Otentikasi:
 * - auth.login (POST)
 * - auth.me (GET)
 * - auth.logout (POST)
 */

var AuthController = (function() {

  /**
   * Menangani aksi login kredensial akun.
   * Dilindungi Rate Limiter: Maksimum 5 kali percobaan gagal per 5 menit.
   * 
   * @param {Object} context - RequestContext
   * @returns {Object} ApiResponseFormatter
   */
  function login(context) {
    var body = context.body || {};
    var identifier = body.username || body.no_kta || body.email;
    var password = body.password;

    if (!identifier || !password) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nomor KTA / Username dan password wajib diisi',
        { code: 'SPWN_MISSING_CREDENTIALS' },
        context.requestId
      );
    }

    // Rate Limiting Check (5 percobaan per 5 menit per IP/Identifier)
    var clientKey = (context.client.ip || 'anon') + '_' + identifier;
    var rate = AuthMiddleware.checkRateLimit('LOGIN', clientKey, 5, 300);
    if (!rate.allowed) {
      AuditMiddleware.log(context, identifier, 'RATE_LIMITED', { ip: context.client.ip });
      return ApiResponseFormatter.error(
        context.action,
        429,
        'Terlalu banyak percobaan login gagal. Silakan tunggu 5 menit sebelum mencoba kembali.',
        { code: 'SPWN_RATE_LIMITED' },
        context.requestId
      );
    }

    try {
      var authResult = AuthService.login(identifier, password);

      // Catat audit login sukses
      AuditMiddleware.log(context, identifier, 'SUCCESS', { userId: authResult.user.id });

      return ApiResponseFormatter.success(
        context.action,
        authResult,
        'Login berhasil',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, identifier, 'FAILED', { error: err.message });
      var statusCode = (err.code === 'SPWN_INVALID_CREDENTIALS') ? 401 : 400;
      return ApiResponseFormatter.error(
        context.action,
        statusCode,
        err.message || 'Login gagal',
        { code: err.code || 'SPWN_AUTH_FAILED' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil data profil dan permission akun dari sesi aktif (auth.me).
   * 
   * @param {Object} context - RequestContext (wajib terotentikasi)
   * @returns {Object} ApiResponseFormatter
   */
  function me(context) {
    if (!context.isAuthenticated || !context.user) {
      return ApiResponseFormatter.error(
        context.action,
        401,
        'Sesi tidak valid atau telah berakhir',
        { code: 'SPWN_UNAUTHORIZED' },
        context.requestId
      );
    }

    var userData = {
      user: context.user,
      role: context.role,
      permissions: context.permissions,
      serverTime: new Date().toISOString()
    };

    return ApiResponseFormatter.success(
      context.action,
      userData,
      'Profil sesi aktif berhasil dimuat',
      null,
      context.requestId
    );
  }

  /**
   * Menangani logout dan invalidasi token sesi.
   * 
   * @param {Object} context - RequestContext
   * @returns {Object} ApiResponseFormatter
   */
  function logout(context) {
    var token = (context.headers && context.headers['authorization']) || context.body.token || context.query.token;
    if (token) {
      var parts = token.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
      try {
        AuthService.logout(token);
      } catch (e) {}
    }

    return ApiResponseFormatter.success(
      context.action,
      { loggedOut: true },
      'Sesi berhasil diakhiri',
      null,
      context.requestId
    );
  }

  return {
    login: login,
    me: me,
    logout: logout
  };
})();
