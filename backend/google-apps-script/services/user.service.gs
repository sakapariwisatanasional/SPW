/**
 * SPWN Apps 2.0 - User Management & Authentication Persistence Service
 * Location: backend/google-apps-script/services/user.service.gs
 * --------------------------------------------------------------------
 * Layanan terpusat pengelolaan akun pengguna (Users) pada SPWN_MEMBER_DATABASE:
 * 1. Pembuatan akun baru dengan ID standar USR-XXXXXXXX
 * 2. Hashing kata sandi menggunakan PasswordHasher existing
 * 3. Verifikasi ketersediaan / keunikan username & email
 * 4. Kepatuhan terhadap skema header Sheet Users:
 *    id, username, email, password_hash, role, status, last_login, created_at, updated_at
 */

var UserService = (function() {
  var _userRepo = null;

  function _getUserRepo() {
    if (!_userRepo) {
      _userRepo = SpreadsheetRepository.create('MEMBER', 'USERS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _userRepo;
  }

  function _createServiceError(code, message, details) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    if (details) err.details = details;
    return err;
  }

  /**
   * Membuat ID unik akun pengguna berformat USR-XXXXXXXX
   * @returns {string} Contoh: 'USR-B8F3C129'
   */
  function generateUserId() {
    var uuid = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
    return 'USR-' + uuid;
  }

  /**
   * Memeriksa apakah email atau username sudah terdaftar di Sheet Users
   * @param {string} emailOrUsername 
   * @returns {boolean}
   */
  function isUserRegistered(emailOrUsername) {
    if (!emailOrUsername) return false;
    var cleanId = emailOrUsername.toString().toLowerCase().trim();
    var repo = _getUserRepo();

    var existing = repo.findOne(function(u) {
      if (u.status === 'DELETED') return false;
      var uEmail = (u.email || '').toString().toLowerCase().trim();
      var uName = (u.username || '').toString().toLowerCase().trim();
      return (uEmail === cleanId || uName === cleanId);
    });

    return !!existing;
  }

  /**
   * Mencari user berdasarkan Email atau Username
   * @param {string} identifier 
   * @returns {Object|null}
   */
  function findByIdentifier(identifier) {
    if (!identifier) return null;
    var cleanId = identifier.toString().toLowerCase().trim();
    var repo = _getUserRepo();

    return repo.findOne(function(u) {
      if (u.status === 'DELETED') return false;
      var uEmail = (u.email || '').toString().toLowerCase().trim();
      var uName = (u.username || '').toString().toLowerCase().trim();
      var uId = (u.id || '').toString().toUpperCase().trim();
      return (uEmail === cleanId || uName === cleanId || uId === cleanId.toUpperCase());
    });
  }

  /**
   * Mendaftarkan entitas User baru ke Sheet Users
   * Sesuai kontrak database:
   * id, username, email, password_hash, role, status, last_login, created_at, updated_at
   * 
   * @param {Object} userData 
   * @param {string} userData.email - Alamat email (juga menjadi username)
   * @param {string} [userData.password] - Kata sandi mentah untuk di-hash
   * @param {string} [userData.role='MEMBER'] - Role pengguna
   * @param {string} [userData.status='PENDING'] - Status akun
   * @returns {Object} Data user yang berhasil disimpan
   */
  function createUser(userData) {
    if (!userData || typeof userData !== 'object') {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Payload data user tidak boleh kosong');
    }

    var email = (userData.email || '').toString().toLowerCase().trim();
    if (!email || email.indexOf('@') === -1) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Alamat email aktif wajib diisi');
    }

    // Proteksi duplikasi user
    if (isUserRegistered(email)) {
      throw _createServiceError('SPWN_DUPLICATE_MEMBER', 'Email atau nomor telepon sudah terdaftar.');
    }

    var nowIso = new Date().toISOString();
    var userId = userData.id || generateUserId();
    var role = (userData.role || 'MEMBER').toUpperCase();
    var status = userData.status || 'PENDING';

    // Hash kata sandi menggunakan PasswordHasher existing
    var passwordHash = '';
    if (userData.password) {
      passwordHash = PasswordHasher.hash(userData.password, 'SPWN_DEFAULT_SALT_2026');
    } else if (userData.password_hash) {
      passwordHash = userData.password_hash;
    }

    // Persiapan entitas Sheet Users sesuai DATABASE CONTRACT
    var userEntity = {
      id: userId,
      username: email,
      email: email,
      password_hash: passwordHash,
      role: role,
      status: status,
      last_login: '',
      created_at: nowIso,
      updated_at: nowIso
    };

    var repo = _getUserRepo();
    var inserted = repo.insert(userEntity);

    return inserted;
  }

  /**
   * Memperbarui informasi akun pengguna
   * @param {string} id 
   * @param {Object} patchData 
   * @returns {Object}
   */
  function updateUser(id, patchData) {
    if (!id) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID user wajib disertakan untuk pembaruan');
    }

    var safePatch = Object.assign({}, patchData);
    delete safePatch.id;
    delete safePatch.created_at;

    if (safePatch.password) {
      safePatch.password_hash = PasswordHasher.hash(safePatch.password, 'SPWN_DEFAULT_SALT_2026');
      delete safePatch.password;
    }

    safePatch.updated_at = new Date().toISOString();
    var repo = _getUserRepo();
    return repo.update(id, safePatch, 'id');
  }

  return {
    generateUserId: generateUserId,
    isUserRegistered: isUserRegistered,
    findByIdentifier: findByIdentifier,
    createUser: createUser,
    updateUser: updateUser
  };
})();
