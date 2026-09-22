/**
 * SPWN Apps 2.0 - Request Context & Response Contract
 * Location: backend/google-apps-script/core/request.context.gs
 * -----------------------------------------------------------
 * Menyediakan:
 * 1. RequestContext: Wadah data kontekstual per siklus request (requestId, user, role, permissions, client).
 * 2. ApiResponseFormatter: Standarisasi format respons JSON v2 sesuai Response Contract.
 */

var RequestContext = (function() {
  /**
   * Membuat objek RequestContext baru untuk setiap HTTP incoming request.
   * 
   * @param {Object} rawRequest - Objek dari Code.gs (parameter, body, headers)
   * @returns {Object} Instans RequestContext
   */
  function create(rawRequest) {
    rawRequest = rawRequest || {};
    
    var timeHex = new Date().getTime().toString(36);
    var rand = Math.floor(Math.random() * 10000).toString(36);
    var reqId = 'REQ-' + timeHex + '-' + rand;

    var clientIp = rawRequest.ip || (rawRequest.headers && rawRequest.headers['x-forwarded-for']) || 'unknown';
    var userAgent = (rawRequest.headers && rawRequest.headers['user-agent']) || 'unknown';

    return {
      requestId: reqId,
      action: rawRequest.action || '',
      method: rawRequest.method || 'GET',
      query: rawRequest.query || {},
      body: rawRequest.body || {},
      headers: rawRequest.headers || {},
      client: {
        ip: clientIp,
        userAgent: userAgent
      },
      // Data terisi setelah AuthMiddleware
      user: null,
      role: 'PUBLIC',
      permissions: [],
      isAuthenticated: false,
      timestamp: new Date().toISOString()
    };
  }

  return {
    create: create
  };
})();

var ApiResponseFormatter = (function() {
  var API_VERSION = 'v2';

  /**
   * Menghasilkan struktur Response sukses sesuai Response Contract SPWN.
   * 
   * @param {string} action - Nama aksi (contoh: 'member.list')
   * @param {*} data - Payload data respons
   * @param {string} [message='Success'] - Pesan ringkas
   * @param {Object|null} [pagination=null] - Informasi paginasi
   * @param {string} [requestId=''] - ID Request
   * @returns {Object} JSON Response Contract
   */
  function success(action, data, message, pagination, requestId) {
    return {
      success: true,
      statusCode: 200,
      message: message || 'Operasi berhasil diproses',
      action: action || '',
      data: data !== undefined ? data : null,
      pagination: pagination || null,
      meta: {
        requestId: requestId || ('REQ-' + new Date().getTime().toString(36)),
        timestamp: new Date().toISOString(),
        apiVersion: API_VERSION
      }
    };
  }

  /**
   * Menghasilkan struktur Response error sesuai Response Contract SPWN.
   * 
   * @param {string} action - Nama aksi
   * @param {number} statusCode - Kode status HTTP (400, 401, 403, 404, 429, 500)
   * @param {string} message - Pesan kesalahan yang ramah
   * @param {*} [errorDetails=null] - Detail teknis kesalahan
   * @param {string} [requestId=''] - ID Request
   * @returns {Object} JSON Response Contract
   */
  function error(action, statusCode, message, errorDetails, requestId) {
    return {
      success: false,
      statusCode: statusCode || 500,
      message: message || 'Terjadi kesalahan sistem internal',
      action: action || '',
      data: null,
      pagination: null,
      error: {
        code: (errorDetails && errorDetails.code) || 'SPWN_ERROR',
        details: errorDetails || null
      },
      meta: {
        requestId: requestId || ('REQ-' + new Date().getTime().toString(36)),
        timestamp: new Date().toISOString(),
        apiVersion: API_VERSION
      }
    };
  }

  return {
    API_VERSION: API_VERSION,
    success: success,
    error: error
  };
})();
