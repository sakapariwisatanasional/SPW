/**
 * SPWN Apps 2.0 - Authentication & Role-Based Access Control (RBAC) Service
 * Location: backend/google-apps-script/services/auth.service.gs
 * -------------------------------------------------------------------------
 * Layanan otentikasi akun, validasi kata sandi ter-enkripsi (salted SHA-256),
 * manajemen sesi token aman, dan resolusi hak akses matriks peran (Role_Master).
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - core/cache.service.gs (CacheManager, getFromCache, setToCache)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * FUNGSI UTAMA:
 * 1. login(identifier, password) -> Validasi kredensial, hash check, issue SPWN session token
 * 2. validateSession(token) -> Memverifikasi keabsahan sesi dan mengembalikan info user aktif
 * 3. logout(token) -> Terminasi sesi token
 * 4. hashPassword(password, salt) -> Hashing kriptografis salted SHA-256 (Anti-Plaintext)
 * 5. getRolePermissions(roleId) -> Resolusi matriks izin dari Role_Master
 */

var AuthService = (function() {
  var _userRepo = null;
  var _roleRepo = null;

  function _getUserRepo() {
    if (!_userRepo) {
      _userRepo = SpreadsheetRepository.create('MEMBER', 'USERS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _userRepo;
  }

  function _getRoleRepo() {
    if (!_roleRepo) {
      _roleRepo = SpreadsheetRepository.create('MEMBER', 'ROLE_MASTER', {
        primaryKey: 'role_id',
        statusColumn: 'status'
      });
    }
    return _roleRepo;
  }

  function _createAuthError(code, message) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    return err;
  }

  /**
   * Menghasilkan hash kata sandi ter-enkripsi melalui PasswordHasher abstraction.
   * DILARANG MENYIMPAN PASSWORD DALAM TEKS POLOS (PLAIN TEXT).
   * 
   * @param {string} password - Password mentah
   * @param {string} salt - String garam unik
   * @returns {string} Hexadecimal hash
   */
  function hashPassword(password, salt) {
    return PasswordHasher.hash(password, salt);
  }

  /**
   * Menghasilkan string acak unik sebagai garam (salt) melalui PasswordHasher.
   * 
   * @returns {string}
   */
  function generateSalt() {
    return PasswordHasher.generateSalt();
  }

  /**
   * Menghasilkan SPWN Session Token yang aman dan tidak dapat ditebak.
   * 
   * @param {string} userId 
   * @param {string} role 
   * @returns {string} Contoh: 'SPWN-SES-c4ca4238a0b923820dcc509a6f75849b-1726910243'
   */
  function _generateSessionToken(userId, role) {
    var randomSeed = Utilities.getUuid() + '|' + userId + '|' + role + '|' + new Date().getTime();
    var hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, randomSeed, Utilities.Charset.UTF_8);
    var tokenHex = '';
    for (var i = 0; i < 16; i++) {
      var b = (hashBytes[i] < 0) ? (hashBytes[i] + 256) : hashBytes[i];
      var h = b.toString(16);
      tokenHex += (h.length === 1 ? '0' : '') + h;
    }
    return 'SPWN-SES-' + tokenHex + '-' + Math.floor(new Date().getTime() / 1000);
  }

  /**
   * Mengambil matriks izin (permissions) berdasarkan Role dari Role_Master.
   * 
   * @param {string} roleId 
   * @returns {Array<string>} Daftar izin, e.g. ['MEMBER_READ', 'MEMBER_WRITE', 'VERIFY_KTA']
   */
  function getRolePermissions(roleId) {
    roleId = (roleId || 'MEMBER').toUpperCase();

    // Cek Role_Master
    var roleRecord = _getRoleRepo().findOne({ role_id: roleId });
    if (roleRecord && roleRecord.permissions) {
      if (Array.isArray(roleRecord.permissions)) {
        return roleRecord.permissions;
      }
      return roleRecord.permissions.toString().split(',').map(function(s) { return s.trim(); });
    }

    // Default Matrix jika Role_Master sheet belum terkonfigurasi
    var defaultRoleMatrix = {
      SUPER_ADMIN: ['*'],
      ADMIN_PUSAT: ['MEMBER_ALL', 'CONTENT_ALL', 'TOURISM_ALL', 'COMMERCE_ALL', 'VERIFY_KTA', 'ANALYTICS_VIEW'],
      ADMIN_WILAYAH: ['MEMBER_READ', 'MEMBER_WRITE_PROVINCE', 'VERIFY_KTA', 'TOURISM_WRITE_PROVINCE', 'CONTENT_WRITE'],
      MANAGER: ['ANALYTICS_VIEW', 'MEMBER_READ', 'TOURISM_READ', 'COMMERCE_MANAGE'],
      MEMBER: ['PROFILE_VIEW', 'PROFILE_UPDATE', 'VERIFY_KTA', 'COMMERCE_BUY'],
      PUBLIC_USER: ['PUBLIC_EXPLORE', 'VERIFY_KTA']
    };

    return defaultRoleMatrix[roleId] || defaultRoleMatrix.MEMBER;
  }

  /**
   * Proses Masuk (Login) Pengguna.
   * 
   * @param {string} identifier - Username, No KTA, atau Email terdaftar
   * @param {string} rawPassword - Kata sandi mentah untuk diverifikasi
   * @returns {{ token: string, user: Object, permissions: Array<string>, expiresAt: string }}
   */
  function login(identifier, rawPassword) {
    if (!identifier || !rawPassword) {
      throw _createAuthError('SPWN_AUTH_REQUIRED', 'Username/KTA dan Password wajib diisi.');
    }

    var cleanId = identifier.toString().trim().toLowerCase();
    var userRepo = _getUserRepo();

    // 1. Cari Pengguna di Sheet Users (berdasarkan username, email, atau no_kta)
    var user = userRepo.findOne(function(u) {
      var uName = (u.username || '').toString().toLowerCase().trim();
      var uEmail = (u.email || '').toString().toLowerCase().trim();
      var uKta = (u.no_kta || '').toString().toLowerCase().trim();
      return (uName === cleanId || uEmail === cleanId || uKta === cleanId);
    });

    if (!user) {
      throw _createAuthError('SPWN_INVALID_CREDENTIALS', 'Kredensial login tidak ditemukan atau tidak valid.');
    }

    if (user.status && user.status.toUpperCase() === 'INACTIVE') {
      throw _createAuthError('SPWN_USER_INACTIVE', 'Akun ini sedang dinonaktifkan. Hubungi Administrator SAKA Pariwisata.');
    }

    // 2. Verifikasi Password Menggunakan PasswordHasher
    var salt = user.salt || 'SPWN_DEFAULT_SALT_2026';
    var expectedHash = user.password_hash || user.password;
    var isPasswordValid = PasswordHasher.verify(rawPassword, expectedHash, salt);

    if (!isPasswordValid) {
      throw _createAuthError('SPWN_INVALID_CREDENTIALS', 'Kombinasi pengguna dan kata sandi salah.');
    }

    // 3. Resolusi Peran & Hak Akses
    var userRole = (user.role || 'MEMBER').toUpperCase();
    var permissions = getRolePermissions(userRole);

    // 4. Generate Sesi Token SPWN (Berlaku 24 Jam = 86400 detik)
    var sessionToken = _generateSessionToken(user.id || user.no_kta, userRole);
    var ttlSeconds = 86400;
    var expiresAt = new Date(new Date().getTime() + (ttlSeconds * 1000)).toISOString();

    var sessionPayload = {
      token: sessionToken,
      userId: user.id || user.no_kta,
      no_kta: user.no_kta || '',
      nama: user.nama_lengkap || user.nama || user.username,
      email: user.email || '',
      role: userRole,
      provinsi_id: user.provinsi_id || '',
      permissions: permissions,
      expiresAt: expiresAt
    };

    // Simpan token ke Cache Service sebagai Session Storage
    var sessionKey = 'SPWN:SESSION:' + sessionToken;
    setToCache(sessionKey, sessionPayload, ttlSeconds);

    // 5. Perbarui timestamp last_login_at di Sheet Users (asinkron aman)
    try {
      userRepo.update(user.id || user.username, {
        last_login_at: new Date().toISOString()
      }, user.id ? 'id' : 'username');
    } catch (e) {
      // Pembaruan audit log login tidak boleh menggagalkan sesi
    }

    return {
      token: sessionToken,
      user: {
        id: sessionPayload.userId,
        no_kta: sessionPayload.no_kta,
        nama: sessionPayload.nama,
        email: sessionPayload.email,
        role: sessionPayload.role,
        provinsi_id: sessionPayload.provinsi_id
      },
      permissions: permissions,
      expiresAt: expiresAt
    };
  }

  /**
   * Memvalidasi token sesi yang aktif.
   * 
   * @param {string} token - SPWN Session Token
   * @returns {{ isValid: boolean, session: Object|null }}
   */
  function validateSession(token) {
    if (!token || typeof token !== 'string') {
      return { isValid: false, session: null };
    }

    var cleanToken = token.trim();
    var sessionKey = 'SPWN:SESSION:' + cleanToken;
    var sessionData = getFromCache(sessionKey);

    if (!sessionData) {
      return { isValid: false, session: null };
    }

    // Periksa masa berlaku token
    if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      return { isValid: false, session: null, reason: 'EXPIRED' };
    }

    return {
      isValid: true,
      session: sessionData
    };
  }

  /**
   * Menghapus sesi login (Logout).
   * 
   * @param {string} token 
   * @returns {boolean}
   */
  function logout(token) {
    if (!token) return true;

    var cleanToken = token.trim();
    var sessionKey = 'SPWN:SESSION:' + cleanToken;
    var cache = CacheService.getScriptCache();
    cache.remove(sessionKey);

    return true;
  }

  return {
    hashPassword: hashPassword,
    generateSalt: generateSalt,
    getRolePermissions: getRolePermissions,
    login: login,
    validateSession: validateSession,
    logout: logout
  };
})();
