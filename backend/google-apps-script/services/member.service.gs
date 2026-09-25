/**
 * SPWN Apps 2.0 - Member Management & Membership Service
 * Location: backend/google-apps-script/services/member.service.gs
 * -----------------------------------------------------------------
 * Layanan manajemen data anggota SAKA Pariwisata, pendaftaran KTA, dan validasi krida.
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - services/password.hasher.gs (PasswordHasher)
 * - services/user.service.gs (UserService)
 * - services/kta.service.gs (KtaService)
 * - services/member.mapper.gs (MemberMapper)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * DATABASE CONTRACT:
 * 1. Sheet: Anggota (Domain: MEMBER)
 *    Header: id,no_kta,full_name,email,phone,province,city,district,position,
 *            krida,status,photo_url,registered_at,verification_url,created_at,
 *            updated_at,updated_by,qr_token
 *    ID Format: SPW-XXXXXXXX
 * 
 * 2. Sheet: Users (Domain: MEMBER)
 *    Header: id,username,email,password_hash,role,status,last_login,created_at,updated_at
 *    ID Format: USR-XXXXXXXX
 */

var MemberService = (function() {
  var _memberRepo = null;
  var _userRepo = null;
  var _kridaRepo = null;

  // Google Drive folder existing resmi untuk pasfoto anggota
  var GOOGLE_DRIVE_PHOTO_FOLDER_ID = '14Mf7PMMAS1PQpqyztEY61VvYVEc4rZLE';

  function _getMemberRepo() {
    if (!_memberRepo) {
      _memberRepo = SpreadsheetRepository.create('MEMBER', 'ANGGOTA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _memberRepo;
  }

  function _getUserRepo() {
    if (!_userRepo) {
      _userRepo = SpreadsheetRepository.create('MEMBER', 'USERS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _userRepo;
  }

  function _getKridaRepo() {
    if (!_kridaRepo) {
      _kridaRepo = SpreadsheetRepository.create('MEMBER', 'KRIDA_MASTER', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _kridaRepo;
  }

  /**
   * Helper pembuat error bisnis standar MemberService.
   */
  function _createServiceError(code, message, details) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    if (details) err.details = details;
    return err;
  }

  /**
   * Mengunggah pasfoto base64 dari pendaftaran anggota ke folder Google Drive existing:
   * Folder ID: 14Mf7PMMAS1PQpqyztEY61VvYVEc4rZLE
   * Menghasilkan URL publik: https://lh3.googleusercontent.com/d/{FILE_ID}
   * 
   * @param {string} photoInput - Base64 Data URL atau URL eksternal
   * @param {string} fileNamePrefix - Prefix nama file
   * @returns {string} URL foto akhir
   */
  function _uploadPhotoToDrive(photoInput, fileNamePrefix) {
    if (!photoInput || typeof photoInput !== 'string') return '';
    var trimmed = photoInput.trim();

    // Jika sudah berupa URL web (http/https) langsung gunakan URL tersebut
    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      return trimmed;
    }

    // Periksa apakah format base64 Data URL
    if (trimmed.indexOf('data:image/') === 0) {
      try {
        var parts = trimmed.split(',');
        var meta = parts[0];
        var base64Data = parts.length > 1 ? parts[1] : parts[0];

        var contentType = 'image/jpeg';
        var ext = 'jpg';
        if (meta.indexOf('image/png') !== -1) {
          contentType = 'image/png';
          ext = 'png';
        } else if (meta.indexOf('image/webp') !== -1) {
          contentType = 'image/webp';
          ext = 'webp';
        }

        var decodedBytes = Utilities.base64Decode(base64Data);
        var fileName = (fileNamePrefix || 'SPW_PHOTO') + '_' + new Date().getTime() + '.' + ext;
        var blob = Utilities.newBlob(decodedBytes, contentType, fileName);

        // Ambil folder Google Drive existing berdasarkan ID yang ditentukan
        var targetFolder;
        try {
          targetFolder = DriveApp.getFolderById(GOOGLE_DRIVE_PHOTO_FOLDER_ID);
        } catch (fErr) {
          Logger.log('[MemberService] getFolderById fallback to root: ' + fErr.message);
          targetFolder = DriveApp.getRootFolder();
        }

        var file = targetFolder.createFile(blob);
        // Set hak akses agar foto KTA dapat diakses publik oleh aplikasi
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var fileId = file.getId();

        return 'https://lh3.googleusercontent.com/d/' + fileId;
      } catch (err) {
        Logger.log('[MemberService] Gagal upload foto ke Google Drive: ' + err.message);
        return '';
      }
    }

    return '';
  }

  /**
   * Mengambil daftar seluruh Krida SAKA Pariwisata resmi dari Krida_Master.
   * 
   * @returns {Array<Object>}
   */
  function getAvailableKrida() {
    try {
      var result = _getKridaRepo().findAll({
        page: 1,
        limit: 100,
        sortBy: 'urutan',
        sortOrder: 'asc'
      });

      if (result.data && result.data.length > 0) {
        return result.data;
      }
    } catch (e) {
      Logger.log('[MemberService] Krida_Master read fallback: ' + e.message);
    }

    // Default 4 Krida Pokok SAKA Pariwisata Nasional
    return [
      { id: 'KRIDA_01', kode: 'BW', nama: 'Krida Bina Wisata', deskripsi: 'Pemberdayaan dan pengembangan destinasi wisata', status: 'ACTIVE' },
      { id: 'KRIDA_02', kode: 'SW', nama: 'Krida Sadar Wisata', deskripsi: 'Sosialisasi Sapta Pesona dan sadar wisata masyarakat', status: 'ACTIVE' },
      { id: 'KRIDA_03', kode: 'KL', nama: 'Krida Kuliner Wisata', deskripsi: 'Pelestarian dan promosi kuliner tradisional nusantara', status: 'ACTIVE' },
      { id: 'KRIDA_04', kode: 'PW', nama: 'Krida Pemanduan Wisata', deskripsi: 'Pemanduan kepariwisataan dan interpretasi budaya', status: 'ACTIVE' }
    ];
  }

  /**
   * Mendaftarkan Anggota Baru ke dalam Ekosistem SAKA Pariwisata Network.
   * Menghasilkan 2 record otomatis:
   * 1. Sheet Anggota (ID: SPW-XXXXXXXX, Status: PENDING, Zero KTA/QR)
   * 2. Sheet Users (ID: USR-XXXXXXXX, Role: MEMBER, Status: PENDING, Password Hashed via PasswordHasher)
   * 
   * @param {Object} payload 
   * @returns {Object} Data anggota yang berhasil didaftarkan
   */
  function registerMember(payload) {
    if (!payload || typeof payload !== 'object') {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Payload pendaftaran anggota tidak boleh kosong');
    }

    // 1. Ekstraksi Data Input Wajib & Opsional
    var nama = (payload.full_name || payload.nama_lengkap || payload.nama || '').toString().trim();
    var email = (payload.email || '').toString().trim().toLowerCase();
    var telepon = (payload.phone || payload.telepon || payload.nomor_telepon || payload.no_hp || '').toString().trim();
    var password = (payload.password || '').toString();

    var provinsi = (payload.province || payload.provinsi_nama || payload.provinsi || 'Jawa Barat').toString().trim();
    var kota = (payload.city || payload.kabupaten_nama || payload.kabupaten_kota || payload.kota || '').toString().trim();
    var kecamatan = (payload.district || payload.kecamatan_nama || payload.kecamatan || '').toString().trim();
    var position = (payload.position || payload.tingkat_keanggotaan || payload.tingkatan || 'Anggota').toString().trim();
    var kridaInput = (payload.krida || payload.krida_nama || payload.krida_id || '').toString().trim();
    var fotoInput = (payload.foto_url || payload.photo_url || payload.foto || '').toString().trim();

    var isPublicRegistration = (payload.is_public === true || payload.source === 'PUBLIC_REGISTER' || !payload.allow_kta_generation);
    var nik = (payload.nik || '').toString().trim();

    // 2. Validasi Kelayakan Data
    if (!nama) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama lengkap anggota wajib diisi');
    }
    if (!email || email.indexOf('@') === -1) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Alamat email aktif wajib diisi');
    }
    if (!telepon || telepon.length < 8) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nomor telepon / WhatsApp aktif wajib diisi');
    }
    if (password && password.length < 8) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Kata sandi minimal 8 karakter');
    }

    var cleanPhone = telepon.replace(/[^0-9]/g, '');

    // 3. PROTEKSI DUPLIKASI DATA
    // Cek pada Sheet ANGGOTA (Email & Phone)
    var memberRepo = _getMemberRepo();
    var existingMember = memberRepo.findOne(function(m) {
      if (m.status === 'DELETED') return false;
      var mEmail = (m.email || '').toString().toLowerCase().trim();
      var mPhone = (m.phone || m.telepon || m.nomor_telepon || '').toString().replace(/[^0-9]/g, '');

      if (email && mEmail && mEmail === email) return true;
      if (cleanPhone && cleanPhone.length >= 8 && mPhone && mPhone === cleanPhone) return true;
      return false;
    });

    if (existingMember) {
      throw _createServiceError('SPWN_DUPLICATE_MEMBER', 'Email atau nomor telepon sudah terdaftar.');
    }

    // Cek pada Sheet USERS (Email / Username)
    var userRepo = _getUserRepo();
    var existingUser = userRepo.findOne(function(u) {
      if (u.status === 'DELETED') return false;
      var uEmail = (u.email || '').toString().toLowerCase().trim();
      var uName = (u.username || '').toString().toLowerCase().trim();
      return (email && (uEmail === email || uName === email));
    });

    if (existingUser) {
      throw _createServiceError('SPWN_DUPLICATE_MEMBER', 'Email atau nomor telepon sudah terdaftar.');
    }

    // 4. Resolusi Krida
    var kridaList = getAvailableKrida();
    var matchedKrida = kridaList.find(function(k) {
      return (
        k.id === kridaInput ||
        k.kode === kridaInput ||
        k.nama.toLowerCase().indexOf(kridaInput.toLowerCase()) !== -1
      );
    });
    var resolvedKridaName = matchedKrida ? matchedKrida.nama : (kridaInput || 'Krida Bina Wisata');

    // 5. Upload Foto ke Folder Google Drive Existing (14Mf7PMMAS1PQpqyztEY61VvYVEc4rZLE)
    var cleanNameForFile = nama.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
    var finalPhotoUrl = _uploadPhotoToDrive(fotoInput, 'SPW_' + cleanNameForFile);

    // 6. Generate ID Sesuai Format Standar SPWN
    // Sheet Anggota: SPW-XXXXXXXX
    var spwUuid = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
    var memberId = 'SPW-' + spwUuid;

    // Sheet Users: USR-XXXXXXXX
    var usrUuid = Utilities.getUuid().replace(/-/g, '').substring(0, 8).toUpperCase();
    var userId = 'USR-' + usrUuid;

    var nowIso = new Date().toISOString();

    // 7. RECORD 1: SHEET ANGGOTA (SPWN_MEMBER_DATABASE)
    // Header Wajib Sesuai Kontrak Database:
    // id,no_kta,full_name,email,phone,province,city,district,position,krida,status,photo_url,registered_at,verification_url,created_at,updated_at,updated_by,qr_token
    var memberEntity = {
      id: memberId,
      no_kta: '',
      full_name: nama,
      email: email,
      phone: telepon,
      province: provinsi,
      city: kota,
      district: kecamatan,
      position: position,
      krida: resolvedKridaName,
      status: 'PENDING',
      photo_url: finalPhotoUrl,
      registered_at: nowIso,
      verification_url: '',
      created_at: nowIso,
      updated_at: nowIso,
      updated_by: 'PUBLIC_REGISTER',
      qr_token: '',

      // Backward compatible aliases
      nama_lengkap: nama,
      nama: nama,
      telepon: telepon,
      nomor_telepon: telepon,
      no_hp: telepon,
      provinsi_nama: provinsi,
      provinsi_id: (payload.provinsi_id || '').toString(),
      kabupaten_nama: kota,
      kabupaten_id: (payload.kabupaten_id || '').toString(),
      kecamatan_nama: kecamatan,
      kecamatan_id: (payload.kecamatan_id || '').toString(),
      alamat_domisili: (payload.alamat_domisili || payload.alamat || '').toString().trim(),
      tingkat_keanggotaan: position,
      status_anggota: 'PENDING',
      pangkalan_gudep: (payload.pangkalan_gudep || payload.pangkalan || '').toString().trim(),
      kwartir_cabang: kota,
      kwartir_ranting: kecamatan,
      krida_id: matchedKrida ? matchedKrida.id : 'KRIDA_01',
      level_organisasi: 'WILAYAH',
      nik: nik
    };

    var insertedMember = memberRepo.insert(memberEntity);

    // 8. RECORD 2: SHEET USERS (SPWN_MEMBER_DATABASE)
    // Header Wajib Sesuai Kontrak Database:
    // id,username,email,password_hash,role,status,last_login,created_at,updated_at
    // Menggunakan PasswordHasher yang sudah ada (Anti-Plaintext)
    var passwordHash = '';
    if (password) {
      passwordHash = PasswordHasher.hash(password, 'SPWN_DEFAULT_SALT_2026');
    }

    var userEntity = {
      id: userId,
      username: email,
      email: email,
      password_hash: passwordHash,
      role: 'MEMBER',
      status: 'PENDING',
      last_login: '',
      created_at: nowIso,
      updated_at: nowIso
    };

    userRepo.insert(userEntity);

    if (SPWN_SYSTEM.DEBUG_MODE) {
      Logger.log('[MemberService] Registrasi berhasil: Anggota ' + memberId + ' & User ' + userId + ' [Status: PENDING]');
    }

    // 9. Kembalikan entitas bersih ke pemanggil (Zero password/hash/nik exposure)
    var sanitized = Object.assign({}, insertedMember);
    delete sanitized.password;
    delete sanitized.password_hash;
    delete sanitized.nik;

    return sanitized;
  }

  /**
   * Mengambil rincian data anggota berdasarkan ID atau No KTA.
   * 
   * @param {string} idOrNoKta 
   * @param {string} [callerRole='PUBLIC'] 
   * @returns {Object|null}
   */
  function getMember(idOrNoKta, callerRole) {
    if (!idOrNoKta) return null;

    var memberRepo = _getMemberRepo();
    var record = memberRepo.findOne(function(item) {
      return (
        item.no_kta === idOrNoKta ||
        item.id === idOrNoKta ||
        item.qr_token === idOrNoKta ||
        (item.full_name && item.full_name.toLowerCase() === idOrNoKta.toLowerCase()) ||
        (item.nama_lengkap && item.nama_lengkap.toLowerCase() === idOrNoKta.toLowerCase())
      );
    });

    if (!record || record.status === 'DELETED') {
      return null;
    }

    if (callerRole && callerRole.indexOf('ADMIN') !== -1) {
      return MemberMapper.toAdmin(record, callerRole);
    }

    return MemberMapper.toPublic(record);
  }

  /**
   * Mengambil daftar anggota terpaginasi dengan filter.
   * 
   * @param {Object} queryOptions 
   * @param {string} [callerRole='PUBLIC'] 
   * @returns {{ data: Array, pagination: Object }}
   */
  function listMembers(queryOptions, callerRole) {
    queryOptions = queryOptions || {};
    var memberRepo = _getMemberRepo();

    var repoOptions = {
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 20,
      search: queryOptions.search,
      searchColumns: ['full_name', 'nama_lengkap', 'no_kta', 'email', 'phone', 'province', 'city', 'krida'],
      sortBy: queryOptions.sortBy || 'created_at',
      sortOrder: queryOptions.sortOrder || 'desc',
      filter: {}
    };

    if (queryOptions.kode_provinsi || queryOptions.provinsi_id) {
      repoOptions.filter.kode_provinsi = queryOptions.kode_provinsi || queryOptions.provinsi_id;
    }
    if (queryOptions.kode_kabupaten || queryOptions.kabupaten_id) {
      repoOptions.filter.kode_kabupaten = queryOptions.kode_kabupaten || queryOptions.kabupaten_id;
    }
    if (queryOptions.status) {
      repoOptions.filter.status = queryOptions.status;
    }

    var result = memberRepo.findAll(repoOptions);

    var mappedData = result.data.map(function(raw) {
      if (callerRole && callerRole.indexOf('ADMIN') !== -1) {
        return MemberMapper.toAdmin(raw, callerRole);
      }
      return MemberMapper.toPublic(raw);
    });

    return {
      data: mappedData,
      pagination: result.pagination
    };
  }

  /**
   * Memperbarui informasi anggota (Partial Update).
   * 
   * @param {string} noKtaOrId 
   * @param {Object} patchData 
   * @returns {Object} Data anggota yang telah diperbarui
   */
  function updateMember(noKtaOrId, patchData) {
    if (!noKtaOrId) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID atau Nomor KTA wajib disertakan untuk pembaruan profil');
    }

    var safePatch = Object.assign({}, patchData);
    delete safePatch.no_kta;
    delete safePatch.qr_token;
    delete safePatch.created_at;

    var memberRepo = _getMemberRepo();
    var col = (noKtaOrId.toString().indexOf('SPW-') === 0 || noKtaOrId.toString().indexOf('MBR-') === 0) ? 'id' : 'no_kta';
    return memberRepo.update(noKtaOrId, safePatch, col);
  }

  /**
   * Deaktivasi keanggotaan (Soft Delete).
   * 
   * @param {string} noKtaOrId 
   * @param {string} [reason='Permohonan Anggota / Sanksi'] 
   * @returns {boolean}
   */
  function deactivateMember(noKtaOrId, reason) {
    if (!noKtaOrId) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID atau Nomor KTA wajib disertakan untuk penonaktifan');
    }

    var memberRepo = _getMemberRepo();
    var col = (noKtaOrId.toString().indexOf('SPW-') === 0 || noKtaOrId.toString().indexOf('MBR-') === 0) ? 'id' : 'no_kta';
    memberRepo.update(noKtaOrId, {
      status: 'INACTIVE',
      deactivation_reason: reason || 'Deaktivasi Mandiri / Penonaktifan',
      deactivated_at: new Date().toISOString()
    }, col);

    return true;
  }

  return {
    getAvailableKrida: getAvailableKrida,
    registerMember: registerMember,
    register: registerMember,
    getMember: getMember,
    findById: getMember,
    listMembers: listMembers,
    findAll: listMembers,
    updateMember: updateMember,
    update: updateMember,
    deactivateMember: deactivateMember,
    deactivate: deactivateMember
  };
})();
