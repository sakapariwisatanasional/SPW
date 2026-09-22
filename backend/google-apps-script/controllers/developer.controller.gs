/**
 * SPWN Apps 2.0 - Developer Controller (Phase 7.1)
 * Location: backend/google-apps-script/controllers/developer.controller.gs
 * -----------------------------------------------------------------------
 * Menangani HTTP request untuk manajemen SPWN Code Registry:
 * - developer.code.list (GET/POST)
 * - developer.code.detail (GET/POST)
 * - developer.code.copy (POST)
 * - developer.code.history (GET/POST)
 * - developer.code.approve (POST)
 * 
 * Strict Security: Hanya dapat diakses oleh SUPER_ADMIN.
 */

var DeveloperController = (function() {

  /**
   * Endpoint: developer.code.list
   * Mengambil daftar seluruh berkas Google Apps Script yang terdaftar di Code_Registry.
   */
  function list(context) {
    try {
      var query = context.query || {};
      var body = context.body || {};
      var filters = {
        module: query.module || body.module || 'ALL',
        status: query.status || body.status || 'ALL'
      };

      var files = CodeRegistryService.listCodeFiles(filters);

      return ApiResponseFormatter.success(
        context.action,
        {
          total: files.length,
          files: files
        },
        'Daftar berkas kode SPWN Apps 2.0 berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_DEVELOPER_CODE_LIST_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Endpoint: developer.code.detail
   * Mengambil konten dan metadata lengkap file kode (otomatis mencatat audit log VIEW_CODE).
   */
  function detail(context) {
    try {
      var query = context.query || {};
      var body = context.body || {};
      var fileId = query.file_id || query.id || body.file_id || body.id;

      if (!fileId) {
        return ApiResponseFormatter.error(
          context.action,
          400,
          'Parameter file_id atau id wajib disertakan',
          { code: 'VALIDATION_ERROR' },
          context.requestId
        );
      }

      var file = CodeRegistryService.getCodeFile(fileId, context.user);

      return ApiResponseFormatter.success(
        context.action,
        file,
        'Detail kode ' + file.file_name + ' berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        404,
        err.message,
        { code: err.code || 'SPWN_DEVELOPER_CODE_DETAIL_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Endpoint: developer.code.copy
   * Mencatat log audit saat developer/Super Admin menyalin kode (COPY_CODE).
   */
  function copy(context) {
    try {
      var body = context.body || {};
      var fileId = body.file_id || body.id;

      if (!fileId) {
        return ApiResponseFormatter.error(
          context.action,
          400,
          'Parameter file_id wajib disertakan',
          { code: 'VALIDATION_ERROR' },
          context.requestId
        );
      }

      var result = CodeRegistryService.recordCopyCode(fileId, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        'Aktivitas penyalinan kode berhasil dicatat ke Developer_Audit_Log',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_DEVELOPER_CODE_COPY_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Endpoint: developer.code.history
   * Mengambil riwayat perubahan versi kode sebuah berkas dari Code_Version_History.
   */
  function history(context) {
    try {
      var query = context.query || {};
      var body = context.body || {};
      var fileId = query.file_id || query.id || body.file_id || body.id;

      if (!fileId) {
        return ApiResponseFormatter.error(
          context.action,
          400,
          'Parameter file_id wajib disertakan',
          { code: 'VALIDATION_ERROR' },
          context.requestId
        );
      }

      var histories = CodeRegistryService.getVersionHistory(fileId);

      return ApiResponseFormatter.success(
        context.action,
        {
          file_id: fileId,
          total_revisions: histories.length,
          history: histories
        },
        'Riwayat versi kode berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_DEVELOPER_CODE_HISTORY_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Endpoint: developer.code.approve
   * Menyetujui versi kode baru menjadi status APPROVED (akses SUPER_ADMIN saja).
   */
  function approve(context) {
    try {
      var body = context.body || {};
      var fileId = body.file_id || body.id;
      var version = body.version;

      if (!fileId) {
        return ApiResponseFormatter.error(
          context.action,
          400,
          'Parameter file_id wajib disertakan',
          { code: 'VALIDATION_ERROR' },
          context.requestId
        );
      }

      var updated = CodeRegistryService.approveVersion(fileId, version, context.user);

      return ApiResponseFormatter.success(
        context.action,
        updated,
        'Versi kode berhasil disetujui (APPROVED)',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        403,
        err.message,
        { code: err.code || 'SPWN_DEVELOPER_CODE_APPROVE_ERROR' },
        context.requestId
      );
    }
  }

  return {
    list: list,
    detail: detail,
    copy: copy,
    history: history,
    approve: approve
  };
})();
