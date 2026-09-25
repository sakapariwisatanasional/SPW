/**
 * SPWN Apps 2.0 - Member Controller
 * Location: backend/google-apps-script/controllers/member.controller.gs
 * --------------------------------------------------------------------
 * Menangani HTTP request untuk domain Keanggotaan:
 * - member.list (GET)
 * - member.detail (GET)
 * - member.register (POST)
 * - member.update (POST)
 * - member.deactivate (POST)
 */

var MemberController = (function() {

  /**
   * Mengambil daftar anggota terpaginasi dengan filter.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function list(context) {
    var query = context.query || {};
    var callerRole = context.role;

    var queryOptions = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      search: query.search || '',
      provinsi_id: query.provinsi_id || query.provinsiId || '',
      tingkatan: query.tingkatan || '',
      status: query.status || ''
    };

    // Wilayah guard: Jika admin wilayah, batasi query hanya provinsinya
    if (callerRole === 'ADMIN_WILAYAH' && context.user && context.user.provinsi_id) {
      queryOptions.provinsi_id = context.user.provinsi_id;
    }

    try {
      var result = MemberService.findAll(queryOptions, callerRole);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar anggota berhasil diambil',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal mengambil data anggota',
        { code: err.code || 'SPWN_MEMBER_LIST_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil rincian profil anggota berdasarkan ID / no_kta.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function detail(context) {
    var query = context.query || {};
    var id = query.id || query.no_kta || context.body.id;

    if (!id) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter ID atau No KTA wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var member = MemberService.findById(id, context.role);
      if (!member) {
        return ApiResponseFormatter.error(
          context.action,
          404,
          'Data anggota tidak ditemukan: ' + id,
          { code: 'SPWN_NOT_FOUND' },
          context.requestId
        );
      }

      return ApiResponseFormatter.success(
        context.action,
        member,
        'Detail profil anggota berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat profil anggota',
        { code: err.code || 'SPWN_MEMBER_DETAIL_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mendaftarkan anggota baru ke sistem SPWN 2.0.
   * Memvalidasi input wajib, format email, nomor telepon, dan keamanan password.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function register(context) {
    var body = context.body || {};
    var nama = (body.full_name || body.nama_lengkap || body.nama || '').toString().trim();
    var email = (body.email || '').toString().trim();
    var phone = (body.phone || body.telepon || body.nomor_telepon || body.no_hp || '').toString().trim();
    var password = (body.password || '').toString();

    // 1. Validasi Input Wajib
    if (!nama) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nama lengkap wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    if (!email || email.indexOf('@') === -1) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Alamat email aktif wajib diisi dengan benar',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    if (!phone || phone.length < 8) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nomor telepon / WhatsApp aktif wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    if (password && password.length < 8) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Kata sandi minimal 8 karakter',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var registerFn = MemberService.register || MemberService.registerMember;
      var registered = registerFn(body);

      // Sanitasi data sensitif dari response
      if (registered) {
        if (registered.nik) delete registered.nik;
        if (registered.password) delete registered.password;
        if (registered.password_hash) delete registered.password_hash;
      }

      AuditMiddleware.log(
        context,
        registered.no_kta || registered.id,
        'SUCCESS',
        { nama: registered.full_name || registered.nama_lengkap, email: registered.email }
      );

      return ApiResponseFormatter.success(
        context.action,
        registered,
        'Pendaftaran anggota berhasil',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, 'MEMBER_REGISTRATION_ATTEMPT', 'FAILED', { error: err.message });
      var status = 500;
      if (
        err.code === 'SPWN_DUPLICATE_MEMBER' ||
        err.code === 'SPWN_VALIDATION_ERROR' ||
        err.code === 'SPWN_INVALID_NIK'
      ) {
        status = 400;
      }

      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal mendaftarkan anggota',
        { code: err.code || 'SPWN_REGISTER_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Memperbarui data profil anggota.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function update(context) {
    var body = context.body || {};
    var targetId = body.id || body.no_kta;

    if (!targetId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID atau No KTA anggota wajib disertakan untuk pembaruan data',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    // Role check: Member hanya boleh mengupdate profilnya sendiri
    if (context.role === 'MEMBER' && context.user) {
      if (context.user.id !== targetId && context.user.no_kta !== targetId) {
        return ApiResponseFormatter.error(
          context.action,
          403,
          'Anda hanya diperkenankan memperbarui profil Anda sendiri',
          { code: 'SPWN_FORBIDDEN' },
          context.requestId
        );
      }
    }

    try {
      var updated = MemberService.update(targetId, body);
      AuditMiddleware.log(context, targetId, 'SUCCESS', { updatedFields: Object.keys(body) });

      return ApiResponseFormatter.success(
        context.action,
        updated,
        'Profil anggota berhasil diperbarui',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, targetId, 'FAILED', { error: err.message });
      var status = (err.code === 'SPWN_NOT_FOUND') ? 404 : 400;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal memperbarui data anggota',
        { code: err.code || 'SPWN_UPDATE_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Menonaktifkan status keanggotaan (Soft Delete / Deactivate).
   * Wajib hak akses SUPER_ADMIN / ADMIN_PUSAT.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function deactivate(context) {
    var body = context.body || {};
    var targetId = body.id || body.no_kta;
    var reason = body.reason || 'Deaktivasi oleh administrator';

    if (!targetId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID atau No KTA anggota wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var deactivated = MemberService.deactivate(targetId, reason);
      AuditMiddleware.log(context, targetId, 'SUCCESS', { reason: reason });

      return ApiResponseFormatter.success(
        context.action,
        deactivated,
        'Status anggota berhasil dinonaktifkan',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, targetId, 'FAILED', { error: err.message });
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal menonaktifkan status anggota',
        { code: err.code || 'SPWN_DEACTIVATE_ERROR' },
        context.requestId
      );
    }
  }

  return {
    list: list,
    detail: detail,
    register: register,
    update: update,
    deactivate: deactivate
  };
})();
