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
   * Mendaftarkan anggota baru.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function register(context) {
    var body = context.body || {};

    if (!body.nama_lengkap || !body.nik) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nama lengkap dan NIK wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var registered = MemberService.register(body);
      delete registered.nik; // Strict Privacy: Zero NIK in API response
      AuditMiddleware.log(context, registered.no_kta || registered.id, 'SUCCESS', { nama: registered.nama_lengkap });

      return ApiResponseFormatter.success(
        context.action,
        registered,
        'Pendaftaran anggota berhasil',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, 'MEMBER_REGISTRATION_ATTEMPT', 'FAILED', { error: err.message });
      var status = (err.code === 'SPWN_VALIDATION_ERROR') ? 400 : 500;
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
