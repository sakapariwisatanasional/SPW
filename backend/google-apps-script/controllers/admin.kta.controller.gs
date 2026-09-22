/**
 * SPWN Apps 2.0 - Admin KTA Controller
 * Location: backend/google-apps-script/controllers/admin.kta.controller.gs
 * -----------------------------------------------------------------------
 * Menangani HTTP request untuk manajemen KTA Digital:
 * - admin.kta.generate (POST)
 * - admin.kta.regenerate (POST)
 * - admin.kta.preview (GET/POST)
 * - admin.kta.history (GET/POST)
 * - admin.kta.batch (POST)
 */

var AdminKtaController = (function() {

  function generate(context) {
    try {
      var body = context.body || {};
      var memberId = body.member_id || body.id;
      var reason = body.reason || 'Penerbitan KTA Otomatis';

      var result = KtaManagementService.generateKtaForMember(memberId, context.user, reason);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_GENERATE_ERROR' },
        context.requestId
      );
    }
  }

  function regenerate(context) {
    try {
      var body = context.body || {};
      var memberId = body.member_id || body.id;
      var reason = body.reason || '';

      var result = KtaManagementService.regenerateKta(memberId, reason, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Alasan') !== -1 ? 400 : (err.message.indexOf('Otorisasi') !== -1 ? 403 : 500),
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_REGENERATE_ERROR' },
        context.requestId
      );
    }
  }

  function preview(context) {
    try {
      var identifier = (context.query && (context.query.nomor_kta || context.query.member_id || context.query.id)) ||
                       (context.body && (context.body.nomor_kta || context.body.member_id || context.body.id));

      var result = KtaManagementService.previewKta(identifier);

      return ApiResponseFormatter.success(
        context.action,
        result,
        'Data KTA siap render LegacyKtaPreview berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        404,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_PREVIEW_ERROR' },
        context.requestId
      );
    }
  }

  function history(context) {
    try {
      var memberId = (context.query && context.query.member_id) || (context.body && context.body.member_id);
      var page = parseInt((context.query && context.query.page) || (context.body && context.body.page) || 1, 10);
      var limit = parseInt((context.query && context.query.limit) || (context.body && context.body.limit) || 20, 10);

      var result = KtaManagementService.getHistory(memberId, page, limit);

      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Log riwayat penerbitan KTA berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_HISTORY_ERROR' },
        context.requestId
      );
    }
  }

  function batch(context) {
    try {
      var body = context.body || {};
      var memberIds = body.member_ids || [];
      var reason = body.reason || 'Penerbitan Batch Cetak Massal';

      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        throw new Error('Daftar member_ids tidak boleh kosong');
      }

      var results = [];
      for (var i = 0; i < memberIds.length; i++) {
        try {
          var res = KtaManagementService.generateKtaForMember(memberIds[i], context.user, reason);
          results.push(res);
        } catch (e) {
          results.push({
            memberId: memberIds[i],
            success: false,
            error: e.message
          });
        }
      }

      return ApiResponseFormatter.success(
        context.action,
        results,
        'Batch penerbitan KTA selesai diproses',
        { count: results.length },
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_BATCH_ERROR' },
        context.requestId
      );
    }
  }

  function getTemplate(context) {
    try {
      var templateId = (context.query && context.query.template_id) || (context.body && context.body.template_id);
      var result = KtaManagementService.getTemplate(templateId);

      return ApiResponseFormatter.success(
        context.action,
        result,
        'Template KTA berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_GET_TEMPLATE_ERROR' },
        context.requestId
      );
    }
  }

  function saveTemplate(context) {
    try {
      var body = context.body || {};
      var result = KtaManagementService.saveTemplate(body, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message || 'Template KTA berhasil disimpan',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('FORBIDDEN') !== -1 ? 403 : 500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_SAVE_TEMPLATE_ERROR' },
        context.requestId
      );
    }
  }

  function uploadAsset(context) {
    try {
      var body = context.body || {};
      var base64Data = body.base64Data;
      var filename = body.filename;
      var folderType = body.folderType || 'background';

      var result = KtaManagementService.uploadAsset(base64Data, filename, folderType, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message || 'Asset KTA berhasil diunggah ke Google Drive',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('FORBIDDEN') !== -1 ? 403 : 500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_KTA_UPLOAD_ASSET_ERROR' },
        context.requestId
      );
    }
  }

  return {
    generate: generate,
    regenerate: regenerate,
    preview: preview,
    history: history,
    batch: batch,
    getTemplate: getTemplate,
    saveTemplate: saveTemplate,
    uploadAsset: uploadAsset
  };
})();
