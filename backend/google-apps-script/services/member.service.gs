/**
 * SPWN Apps 2.0 - Member Management & Membership Service
 * Location: backend/google-apps-script/services/member.service.gs
 * -----------------------------------------------------------------
 * Layanan manajemen data anggota SAKA Pariwisata, pendaftaran KTA, dan validasi krida.
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - services/kta.service.gs (KtaService)
 * - services/member.mapper.gs (MemberMapper)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * FUNGSI UTAMA:
 * 1. registerMember(payload) -> Pendaftaran anggota baru, validasi NIK, Krida & generate KTA
 * 2. getMember(idOrNoKta, callerRole) -> Ambil data anggota dengan proteksi role-based mapper
 * 3. listMembers(queryOptions, callerRole) -> List anggota terpaginasi dengan filter wilayah & krida
 * 4. updateMember(noKta, patchData) -> Pembaruan data profil keanggotaan
 * 5. deactivateMember(noKta, reason) -> Deaktivasi anggota (soft delete)
 * 6. getAvailableKrida() -> Ambil daftar krida aktif dari Krida_Master
 */

var MemberService = (function() {
  var _memberRepo = null;
  var _kridaRepo = null;

  function _getMemberRepo() {
    if (!_memberRepo) {
      _memberRepo = SpreadsheetRepository.create('MEMBER', 'ANGGOTA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _memberRepo;
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
   * Mengambil daftar seluruh Krida SAKA Pariwisata resmi dari Krida_Master.
   * 
   * @returns {Array<Object>}
   */
  function getAvailableKrida() {
    var result = _getKridaRepo().findAll({
      page: 1,
      limit: 100,
      sortBy: 'urutan',
      sortOrder: 'asc'
    });

    if (result.data && result.data.length > 0) {
      return result.data;
    }

    // Default 4 Krida Pokok SAKA Pariwisata Nasional jika sheet master belum terisi
    return [
      { id: 'KRIDA_01', kode: 'BW', nama: 'Krida Bina Wisata', deskripsi: 'Pemberdayaan dan pengembangan destinasi wisata', status: 'ACTIVE' },
      { id: 'KRIDA_02', kode: 'SW', nama: 'Krida Sadar Wisata', deskripsi: 'Sosialisasi Sapta Pesona dan sadar wisata masyarakat', status: 'ACTIVE' },
      { id: 'KRIDA_03', kode: 'KL', nama: 'Krida Kuliner Wisata', deskripsi: 'Pelestarian dan promosi kuliner tradisional nusantara', status: 'ACTIVE' },
      { id: 'KRIDA_04', kode: 'PW', nama: 'Krida Pemanduan Wisata', deskripsi: 'Pemanduan kepariwisataan dan interpretasi budaya', status: 'ACTIVE' }
    ];
  }

  /**
   * Mendaftarkan Anggota Baru ke dalam Ekosistem SAKA Pariwisata Network.
   * 
   * ALUR VALIDASI BISNIS:
   * 1. Validasi field wajib (nama, nik, provinsi_id, krida_id)
   * 2. Validasi format 16 digit NIK (UU Administrasi Kependudukan)
   * 3. Validasi keunikan NIK (mencegah duplikasi akun)
   * 4. Validasi ketersediaan krida yang dipilih di Krida_Master
   * 5. Generate nomor KTA resmi melalui KtaService
   * 6. Generate secure QR token verifikasi
   * 7. Simpan record via Member Repository (atomik dengan LockService)
   * 
   * @param {Object} payload 
   * @returns {Object} Data anggota yang berhasil didaftarkan
   */
  function registerMember(payload) {
    if (!payload || typeof payload !== 'object') {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Payload pendaftaran anggota tidak boleh kosong');
    }

    var nama = (payload.nama_lengkap || payload.nama || '').toString().trim();
    var nik = (payload.nik || '').toString().trim();
    var levelOrganisasi = (payload.level_organisasi || payload.level || 'WILAYAH').toUpperCase();
    if (levelOrganisasi === 'NASIONAL' || levelOrganisasi === 'PUSAT') {
      levelOrganisasi = 'KWARTIR_NASIONAL';
    }

    var kodeProvinsi = (payload.kode_provinsi || payload.provinsi_id || payload.provinsi_code || '32').toString().trim();
    var provinsiNama = (payload.provinsi || payload.provinsi_nama || 'Jawa Barat').toString().trim();
    var kodeKabupaten = (payload.kode_kabupaten || payload.kabupaten_id || '3204').toString().trim().padStart(4, '0').slice(-4);
    var kota = (payload.kabupaten_kota || payload.kota || '').toString().trim();
    var kodeKecamatan = (payload.kode_kecamatan || payload.kecamatan_id || '190').toString().trim();
    var kecamatanNama = (payload.kecamatan || payload.kecamatan_nama || '').toString().trim();

    var kridaKodeOrId = (payload.krida_id || payload.krida || 'BW').toString().trim();
    var tingkat = (payload.tingkat_keanggotaan || 'Penegak').toString().trim();

    // 1. Validasi Input Wajib
    if (!nama) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama lengkap anggota wajib diisi');
    }

    // 2. Periksa apakah registrasi publik mandiri (Self-Registration)
    var isPublicRegistration = (payload.is_public === true || payload.source === 'PUBLIC_REGISTER' || !payload.allow_kta_generation);

    // Validasi NIK: Jika NIK diberikan, wajib 16 digit. Jika tidak diberikan, hanya diizinkan untuk registrasi publik.
    if (nik) {
      if (nik.length !== 16 || !/^\d{16}$/.test(nik)) {
        throw _createServiceError('SPWN_INVALID_NIK', 'NIK harus terdiri dari tepat 16 digit angka');
      }
    } else if (!isPublicRegistration) {
      throw _createServiceError('SPWN_INVALID_NIK', 'NIK harus terdiri dari tepat 16 digit angka');
    }

    var memberRepo = _getMemberRepo();

    // 3. Validasi Duplikasi NIK (hanya jika NIK diisi)
    if (nik) {
      var existingNik = memberRepo.findOne({ nik: nik });
      if (existingNik && existingNik.status !== 'DELETED') {
        throw _createServiceError('SPWN_DUPLICATE_MEMBER', 'NIK ' + nik + ' sudah terdaftar sebagai anggota dengan No KTA: ' + existingNik.no_kta);
      }
    }

    // 4. Validasi Krida
    var kridaList = getAvailableKrida();
    var matchedKrida = kridaList.find(function(k) {
      return (k.id === kridaKodeOrId || k.kode === kridaKodeOrId || k.nama.toLowerCase().indexOf(kridaKodeOrId.toLowerCase()) !== -1);
    });
    var kridaNama = matchedKrida ? matchedKrida.nama : 'Krida Bina Wisata';

    var newNoKta = '';
    var qrToken = '';
    var initialStatus = isPublicRegistration ? 'PENDING' : 'ACTIVE';

    if (!isPublicRegistration) {
      // Generate Nomor KTA Format Final hanya jika diizinkan (misal admin onboarding)
      var nextSequence = 1;
      if (levelOrganisasi === 'KWARTIR_NASIONAL') {
        var nationalCount = memberRepo.count({ level_organisasi: 'KWARTIR_NASIONAL' });
        nextSequence = nationalCount + 1;
      } else {
        var regencyCount = memberRepo.count({ kode_kabupaten: kodeKabupaten });
        nextSequence = regencyCount + 1;
      }

      newNoKta = KtaService.generateKtaNumber({
        level: levelOrganisasi,
        kodeKabupaten: kodeKabupaten,
        kodeKecamatan: kodeKecamatan,
        sequence: nextSequence
      });

      var existingKta = memberRepo.findOne({ no_kta: newNoKta });
      if (existingKta) {
        newNoKta = KtaService.generateKtaNumber({
          level: levelOrganisasi,
          kodeKabupaten: kodeKabupaten,
          kodeKecamatan: kodeKecamatan,
          sequence: nextSequence + Math.floor(Math.random() * 50) + 1
        });
      }

      qrToken = KtaService.generateQrToken((payload.id || '') + newNoKta);
    }

    var nowIso = new Date().toISOString();
    var registeredDate = nowIso.slice(0, 10);
    var verificationUrl = qrToken ? KtaService.generateMemberQrUrl(qrToken) : '';
    var telepon = (payload.telepon || payload.nomor_telepon || payload.no_hp || payload.phone || '').toString().trim();
    var email = (payload.email || '').toString().trim();
    var fotoUrl = payload.foto_url || payload.photo_url || payload.foto || '';

    // 5. Siapkan Entitas Anggota Baru dengan pemetaan dwibahasa (Bilingual mapping)
    // Memastikan kecocokan 100% dengan kolom header di Google Spreadsheet (SPWN_DATABASE_SCHEMA)
    var newMember = {
      // Primary Key & ID
      id: (payload.id && payload.id.indexOf('MBR-') === 0) ? payload.id : ('MBR-' + Utilities.getUuid().substring(0, 8)),
      no_kta: newNoKta,
      nomor_kta: newNoKta,
      noKta: newNoKta,
      qr_token: qrToken,
      qr_url: verificationUrl,
      verification_url: verificationUrl,
      qr_status: qrToken ? 'ACTIVE' : 'INACTIVE',
      qr_scan_count: 0,
      nik: nik,

      // Nama
      full_name: nama,
      nama_lengkap: nama,
      nama: nama,

      // Kontak
      email: email,
      phone: telepon,
      telepon: telepon,
      nomor_telepon: telepon,
      no_hp: telepon,

      // Wilayah & Alamat
      province: provinsiNama,
      provinsi: provinsiNama,
      provinsi_nama: provinsiNama,
      provinsi_id: kodeProvinsi,
      kode_provinsi: kodeProvinsi,

      city: kota,
      kabupaten_kota: kota,
      kabupaten_nama: kota,
      kabupaten_id: kodeKabupaten,
      kode_kabupaten: kodeKabupaten,

      district: kecamatanNama,
      kecamatan: kecamatanNama,
      kecamatan_nama: kecamatanNama,
      kecamatan_id: kodeKecamatan,
      kode_kecamatan: kodeKecamatan,
      alamat_domisili: (payload.alamat_domisili || payload.alamat || '').toString().trim(),

      // Organisasi & Krida
      level_organisasi: levelOrganisasi,
      krida_id: matchedKrida ? matchedKrida.id : 'KRIDA_01',
      krida: kridaNama,
      krida_nama: kridaNama,
      position: tingkat,
      tingkat_keanggotaan: tingkat,
      pangkalan: (payload.pangkalan || payload.pangkalan_gudep || '').toString().trim(),
      pangkalan_gudep: (payload.pangkalan_gudep || payload.pangkalan || '').toString().trim(),
      kwartir_cabang: (payload.kwartir_cabang || kota || '').toString().trim(),
      kwartir_ranting: (payload.kwartir_ranting || kecamatanNama || '').toString().trim(),

      // Foto
      photo_url: fotoUrl,
      foto_url: fotoUrl,
      foto: fotoUrl,

      // Status
      status: initialStatus,
      status_anggota: initialStatus,

      // Tanggal & Audit Trail
      registered_at: registeredDate,
      tanggal_bergabung: registeredDate,
      valid_until: 'SEUMUR_HIDUP',
      created_at: nowIso,
      updated_at: nowIso,
      updated_by: isPublicRegistration ? 'SYSTEM_SELF_REGISTER' : (payload.registered_by || 'ADMIN')
    };

    // 6. Simpan ke Repository (Dilindungi executeWithLock)
    var inserted = memberRepo.insert(newMember);

    if (SPWN_SYSTEM.DEBUG_MODE) {
      Logger.log('[MemberService] Sukses mendaftarkan anggota baru: ' + inserted.nama_lengkap + ' [Status: ' + inserted.status + ']');
    }

    // Return sanitized object to caller (Zero NIK exposure)
    var sanitized = Object.assign({}, inserted);
    delete sanitized.nik;
    return sanitized;
  }

  /**
   * Mengambil rincian data anggota berdasarkan ID atau No KTA.
   * Menerapkan Role-Based Data Mapper:
   * - Public: Melewati PublicMemberMapper
   * - Pengurus / Admin: Melewati AdminMemberMapper
   * 
   * @param {string} idOrNoKta 
   * @param {string} [callerRole='PUBLIC'] 
   * @returns {Object|null}
   */
  function getMember(idOrNoKta, callerRole) {
    if (!idOrNoKta) return null;

    var memberRepo = _getMemberRepo();
    var record = memberRepo.findOne(function(item) {
      return (item.no_kta === idOrNoKta || item.id === idOrNoKta || item.qr_token === idOrNoKta);
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
   * Mengambil daftar anggota terpaginasi dengan kriteria pencarian dan filter.
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
      searchColumns: ['nama_lengkap', 'no_kta', 'provinsi', 'kabupaten_kota', 'krida'],
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
    if (queryOptions.kode_kecamatan || queryOptions.kecamatan_id) {
      repoOptions.filter.kode_kecamatan = queryOptions.kode_kecamatan || queryOptions.kecamatan_id;
    }
    if (queryOptions.level_organisasi) {
      repoOptions.filter.level_organisasi = queryOptions.level_organisasi;
    }
    if (queryOptions.krida_id) {
      repoOptions.filter.krida_id = queryOptions.krida_id;
    }
    if (queryOptions.status) {
      repoOptions.filter.status = queryOptions.status;
    }

    var result = memberRepo.findAll(repoOptions);

    // Terapkan Privacy / Security Mapper ke setiap item melalui MemberMapper
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
   * @param {string} noKta 
   * @param {Object} patchData 
   * @returns {Object} Data anggota yang telah diperbarui
   */
  function updateMember(noKtaOrId, patchData) {
    if (!noKtaOrId) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'ID atau Nomor KTA wajib disertakan untuk pembaruan profil');
    }

    // Hindari pembaruan kolom sensitif secara ilegal
    var safePatch = Object.assign({}, patchData);
    delete safePatch.no_kta; // No KTA adalah identitas permanen
    delete safePatch.qr_token; // QR Token permanen
    delete safePatch.created_at;

    var memberRepo = _getMemberRepo();
    var col = (noKtaOrId.toString().indexOf('MBR-') === 0) ? 'id' : 'no_kta';
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
    var col = (noKtaOrId.toString().indexOf('MBR-') === 0) ? 'id' : 'no_kta';
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
