/**
 * SPWN Apps 2.0 - Core Response Standardizer
 * Location: backend/google-apps-script/core/response.gs
 * -------------------------------------------------------------
 * Standarisasi output HTTP Response berbasis format JSend.
 * 
 * Format Standar Sukses:
 * {
 *   "success": true,
 *   "data": {},
 *   "message": ""
 * }
 * 
 * Format Standar Gagal / Error:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "",
 *     "message": ""
 *   }
 * }
 */

var ResponseFormatter = (function() {
  /**
   * Membungkus payload ke dalam TextOutput JSON Google Apps Script.
   * 
   * @param {Object} responseBody - Objek response standar
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function toTextOutput(responseBody) {
    var jsonString = JSON.stringify(responseBody);
    return ContentService.createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
  }

  /**
   * Helper internal untuk membangun metadata standar response
   * 
   * @param {Object} [customMeta] 
   * @returns {Object}
   */
  function buildMeta(customMeta) {
    var meta = {
      requestId: (typeof Utilities !== 'undefined' && Utilities.getUuid) 
        ? Utilities.getUuid() 
        : 'req_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      apiVersion: (typeof SPWN_SYSTEM !== 'undefined' && SPWN_SYSTEM.API_VERSION) ? SPWN_SYSTEM.API_VERSION : 'v2'
    };

    if (customMeta && typeof customMeta === 'object') {
      for (var k in customMeta) {
        if (customMeta.hasOwnProperty(k)) {
          meta[k] = customMeta[k];
        }
      }
    }

    return meta;
  }

  /**
   * Menghasilkan response sukses.
   * 
   * @param {*} [data] - Payload data yang dikembalikan ke client
   * @param {string} [message] - Pesan konfirmasi
   * @param {Object} [meta] - Metadata kustom opsional (pagination, dsb)
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function successResponse(data, message, meta) {
    var body = {
      success: true,
      data: (data !== undefined && data !== null) ? data : {},
      message: message || 'Permintaan berhasil diproses',
      meta: buildMeta(meta)
    };

    return toTextOutput(body);
  }

  /**
   * Menghasilkan response error umum.
   * Mendukung deteksi otomatis error timeout lock (SPWN_LOCK_TIMEOUT).
   * 
   * @param {string} code - Kode error sistem (contoh: 'SERVER_ERROR', 'BAD_REQUEST', 'SPWN_LOCK_TIMEOUT')
   * @param {string} message - Pesan penjelasan error
   * @param {*} [details] - Rincian error opsional (stack trace saat debug atau info teknis)
   * @param {Object} [meta] - Metadata kustom opsional
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function errorResponse(code, message, details, meta) {
    var resolvedCode = code || 'UNKNOWN_ERROR';
    var resolvedMessage = message || 'Terjadi kesalahan pada server';

    // Deteksi jika message mengandung error lock timeout
    if (resolvedMessage.indexOf('SPWN_LOCK_TIMEOUT') !== -1 || resolvedCode === 'SPWN_LOCK_TIMEOUT') {
      resolvedCode = 'SPWN_LOCK_TIMEOUT';
      if (!message || message === 'Terjadi kesalahan pada server') {
        resolvedMessage = 'Sistem sedang sibuk memproses antrean transaksi. Silakan ulangi sesaat lagi.';
      }
    }

    var errorObj = {
      code: resolvedCode,
      message: resolvedMessage
    };

    if (details && (typeof SPWN_SYSTEM !== 'undefined' && (SPWN_SYSTEM.DEBUG_MODE || SPWN_SYSTEM.ENVIRONMENT !== 'production'))) {
      errorObj.details = details;
    }

    var body = {
      success: false,
      error: errorObj,
      meta: buildMeta(meta)
    };

    return toTextOutput(body);
  }

  /**
   * Menghasilkan response validasi formulir/payload tidak lolos (HTTP 422 equivalent).
   * 
   * @param {Object|Array} validationErrors - Daftar field bermasalah
   * @param {string} [message]
   * @param {Object} [meta]
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function validationErrorResponse(validationErrors, message, meta) {
    var body = {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: message || 'Data yang dikirimkan tidak valid atau tidak lengkap',
        fields: validationErrors || {}
      },
      meta: buildMeta(meta)
    };

    return toTextOutput(body);
  }

  /**
   * Menghasilkan response akses ditolak / token tidak sah (HTTP 401 equivalent).
   * 
   * @param {string} [message]
   * @param {Object} [meta]
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function unauthorizedResponse(message, meta) {
    var body = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: message || 'Akses ditolak. Kredensial tidak valid atau sesi telah berakhir.'
      },
      meta: buildMeta(meta)
    };

    return toTextOutput(body);
  }

  /**
   * Menghasilkan response data tidak ditemukan (HTTP 404 equivalent).
   * 
   * @param {string} resourceName - Nama entitas (contoh: 'Anggota', 'Destinasi')
   * @param {Object} [meta]
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  function notFoundResponse(resourceName, meta) {
    var res = resourceName || 'Data';
    var body = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: res + ' yang Anda cari tidak ditemukan atau telah dihapus.'
      },
      meta: buildMeta(meta)
    };

    return toTextOutput(body);
  }

  return {
    toTextOutput: toTextOutput,
    successResponse: successResponse,
    errorResponse: errorResponse,
    validationErrorResponse: validationErrorResponse,
    unauthorizedResponse: unauthorizedResponse,
    notFoundResponse: notFoundResponse
  };
})();

// =========================================================================
// GLOBAL SHORTCUT ALIASES UNTUK CONTROLLER LAYER
// =========================================================================

function successResponse(data, message, meta) {
  return ResponseFormatter.successResponse(data, message, meta);
}

function errorResponse(code, message, details) {
  return ResponseFormatter.errorResponse(code, message, details);
}

function validationErrorResponse(validationErrors, message) {
  return ResponseFormatter.validationErrorResponse(validationErrors, message);
}

function unauthorizedResponse(message) {
  return ResponseFormatter.unauthorizedResponse(message);
}

function notFoundResponse(resourceName) {
  return ResponseFormatter.notFoundResponse(resourceName);
}

// =========================================================================
// TESTING FUNCTION RESPONSE FORMATTER
// =========================================================================

/**
 * Menguji standarisasi format response JSend.
 */
function testResponseFormat() {
  Logger.log('====================================================');
  Logger.log('[TEST] MEMULAI PENGUJIAN RESPONSE FORMATTER');
  Logger.log('====================================================');

  try {
    // 1. Test successResponse
    var outSuccess = successResponse({ id: 'MEM-01', name: 'Fajar' }, 'Data ditemukan');
    var strSuccess = outSuccess.getContent();
    var objSuccess = JSON.parse(strSuccess);

    var test1Passed = (objSuccess.success === true && objSuccess.data.id === 'MEM-01' && objSuccess.message === 'Data ditemukan');
    Logger.log('Uji 1 - successResponse(): ' + (test1Passed ? 'PASSED' : 'FAILED'));
    Logger.log('Output: ' + strSuccess);

    // 2. Test errorResponse
    var outError = errorResponse('INTERNAL_ERROR', 'Terjadi gangguan database');
    var strError = outError.getContent();
    var objError = JSON.parse(strError);

    var test2Passed = (objError.success === false && objError.error.code === 'INTERNAL_ERROR');
    Logger.log('Uji 2 - errorResponse(): ' + (test2Passed ? 'PASSED' : 'FAILED'));
    Logger.log('Output: ' + strError);

    // 3. Test validationErrorResponse
    var outVal = validationErrorResponse({ noKta: 'No KTA harus diisi' }, 'Validasi gagal');
    var strVal = outVal.getContent();
    var objVal = JSON.parse(strVal);

    var test3Passed = (objVal.success === false && objVal.error.code === 'VALIDATION_FAILED' && objVal.error.fields.noKta !== undefined);
    Logger.log('Uji 3 - validationErrorResponse(): ' + (test3Passed ? 'PASSED' : 'FAILED'));
    Logger.log('Output: ' + strVal);

    // 4. Test unauthorizedResponse
    var outAuth = unauthorizedResponse('Token kedaluwarsa');
    var strAuth = outAuth.getContent();
    var objAuth = JSON.parse(strAuth);
    var test4Passed = (objAuth.success === false && objAuth.error.code === 'UNAUTHORIZED');
    Logger.log('Uji 4 - unauthorizedResponse(): ' + (test4Passed ? 'PASSED' : 'FAILED'));

    // 5. Test notFoundResponse
    var outNotFound = notFoundResponse('Anggota KTA');
    var strNotFound = outNotFound.getContent();
    var objNotFound = JSON.parse(strNotFound);
    var test5Passed = (objNotFound.success === false && objNotFound.error.code === 'NOT_FOUND');
    Logger.log('Uji 5 - notFoundResponse(): ' + (test5Passed ? 'PASSED' : 'FAILED'));

    Logger.log('====================================================');
    Logger.log('[TEST] SELURUH PENGUJIAN RESPONSE FORMATTER BERHASIL');
    Logger.log('====================================================');
    return { success: true, message: 'ResponseFormatter beroperasi sesuai standar JSend' };
  } catch (err) {
    Logger.log('[TEST FAILED] ResponseFormatter error: ' + err.message);
    return { success: false, error: err.message };
  }
}
