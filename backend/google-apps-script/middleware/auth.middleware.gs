/**
 * SPWN Apps 2.0 - Authentication & Authorization Middleware
 * Location: backend/google-apps-script/middleware/auth.middleware.gs
 * -----------------------------------------------------------------
 * Tanggung Jawab:
 * 1. Rate Limiting via CacheService (untuk auth.login, verify.kta, dll).
 * 2. Ekstraksi Bearer Token dari Header / Body / Query.
 * 3. Validasi Sesi pengguna via AuthService.
 * 4. Pengisian RequestContext (user, role, permissions).
 * 5. Penegakan hak akses peran (Role-Based Access Control) & izin granular.
 */

var AuthMiddleware = (function() {
  /**
   * Rate limiter berbasis CacheService.
   * 
   * @param {string} bucketName - Kategori aksi (misal: 'login', 'verify_kta')
   * @param {string} identifier - Identifier klien (IP atau User ID)
   * @param {number} maxRequests - Batas maksimum request dalam window
   * @param {number} windowSeconds - Jendela waktu dalam detik
   * @returns {{ allowed: boolean, remaining: number }}
   */
  function checkRateLimit(bucketName, identifier, maxRequests, windowSeconds) {
    identifier = identifier || 'anon';
    var cacheKey = 'RATE_LIMIT_' + bucketName + '_' + identifier;
    var cache = CacheService.getScriptCache();
    
    var currentCount = 0;
    var cached = cache.get(cacheKey);
    if (cached) {
      currentCount = parseInt(cached, 10) || 0;
    }

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0
      };
    }

    currentCount++;
    cache.put(cacheKey, currentCount.toString(), windowSeconds || 60);

    return {
      allowed: true,
      remaining: maxRequests - currentCount
    };
  }

  /**
   * Ekstraksi token otentikasi dari HTTP request.
   * 
   * @param {Object} context 
   * @returns {string} Token otentikasi atau string kosong
   */
  function _extractToken(context) {
    if (!context) return '';

    // 1. Dari Header Authorization: Bearer <TOKEN>
    if (context.headers && context.headers['authorization']) {
      var authHeader = context.headers['authorization'];
      var parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1].trim();
      }
    }

    // 2. Dari Query Parameter: ?token=...
    if (context.query && context.query.token) {
      return context.query.token.toString().trim();
    }

    // 3. Dari Body Payload: { token: ... }
    if (context.body && context.body.token) {
      return context.body.token.toString().trim();
    }

    return '';
  }

  /**
   * Middleware untuk memvalidasi sesi pengguna secara opsional atau wajib.
   * Mengisi context.user, context.role, context.permissions.
   * 
   * @param {Object} context - Objek RequestContext
   * @param {boolean} [isRequired=false] - Apakah otentikasi bersifat wajib
   * @returns {{ success: boolean, error?: { statusCode: number, message: string, code: string } }}
   */
  function authenticate(context, isRequired) {
    var token = _extractToken(context);

    if (!token) {
      if (isRequired) {
        return {
          success: false,
          error: {
            statusCode: 401,
            code: 'SPWN_UNAUTHORIZED',
            message: 'Akses ditolak: Token otentikasi wajib disertakan.'
          }
        };
      }
      // Public / Guest
      context.isAuthenticated = false;
      context.role = 'PUBLIC';
      context.permissions = [];
      return { success: true };
    }

    try {
      var sessionResult = AuthService.validateSession(token);
      if (!sessionResult || !sessionResult.isValid) {
        if (isRequired) {
          return {
            success: false,
            error: {
              statusCode: 401,
              code: 'SPWN_SESSION_EXPIRED',
              message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan login kembali.'
            }
          };
        }
        context.isAuthenticated = false;
        context.role = 'PUBLIC';
        return { success: true };
      }

      // Validasi berhasil
      context.isAuthenticated = true;
      context.user = sessionResult.user;
      context.role = sessionResult.user.role || 'MEMBER';
      context.permissions = sessionResult.user.permissions || [];
      return { success: true };
    } catch (e) {
      if (isRequired) {
        return {
          success: false,
          error: {
            statusCode: 401,
            code: 'SPWN_AUTH_ERROR',
            message: 'Gagal memverifikasi token sesi: ' + e.message
          }
        };
      }
      return { success: true };
    }
  }

  /**
   * Middleware untuk memeriksa apakah pengguna memiliki salah satu role yang diizinkan.
   * 
   * @param {Object} context 
   * @param {Array<string>} allowedRoles 
   * @returns {{ success: boolean, error?: Object }}
   */
  function authorizeRole(context, allowedRoles) {
    if (!context.isAuthenticated) {
      return {
        success: false,
        error: {
          statusCode: 401,
          code: 'SPWN_UNAUTHORIZED',
          message: 'Silakan login terlebih dahulu untuk mengakses sumber daya ini.'
        }
      };
    }

    var userRole = (context.role || '').toUpperCase();
    if (userRole === 'SUPER_ADMIN') {
      return { success: true }; // Super admin bypass
    }

    var isAllowed = false;
    for (var i = 0; i < allowedRoles.length; i++) {
      if (userRole === allowedRoles[i].toUpperCase()) {
        isAllowed = true;
        break;
      }
    }

    if (!isAllowed) {
      return {
        success: false,
        error: {
          statusCode: 403,
          code: 'SPWN_FORBIDDEN',
          message: 'Peran akun Anda (' + userRole + ') tidak memiliki hak akses untuk aksi ini.'
        }
      };
    }

    return { success: true };
  }

  /**
   * Middleware untuk memeriksa apakah pengguna memiliki permission spesifik.
   * 
   * @param {Object} context 
   * @param {string} requiredPermission 
   * @returns {{ success: boolean, error?: Object }}
   */
  function authorizePermission(context, requiredPermission) {
    if (!context.isAuthenticated) {
      return {
        success: false,
        error: {
          statusCode: 401,
          code: 'SPWN_UNAUTHORIZED',
          message: 'Silakan login terlebih dahulu.'
        }
      };
    }

    var userRole = (context.role || '').toUpperCase();
    if (userRole === 'SUPER_ADMIN') {
      return { success: true };
    }

    var perms = context.permissions || [];
    var hasPermission = (perms.indexOf(requiredPermission) !== -1);

    if (!hasPermission) {
      return {
        success: false,
        error: {
          statusCode: 403,
          code: 'SPWN_FORBIDDEN',
          message: 'Anda tidak memiliki izin [' + requiredPermission + '] untuk melakukan aksi ini.'
        }
      };
    }

    return { success: true };
  }

  return {
    checkRateLimit: checkRateLimit,
    authenticate: authenticate,
    authorizeRole: authorizeRole,
    authorizePermission: authorizePermission
  };
})();
