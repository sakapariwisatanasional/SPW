/**
 * SPWN Apps 2.0 - Google Apps Script HTTP Web App Entry Point
 * Location: backend/google-apps-script/Code.gs
 * -----------------------------------------------------------
 * Menyediakan listener utama doGet(e) dan doPost(e):
 * - Normalisasi parameter (Query Parameter & Post Body JSON / Form-Data)
 * - Meneruskan ke Router.dispatch(rawRequest)
 * - Mengembalikan output JSON dengan header CORS & ContentService.MimeType.JSON
 */

/**
 * HTTP GET Request Handler
 * @param {Object} e - Event parameter dari Google Apps Script Web App
 * @returns {TextOutput} JSON Response
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * HTTP POST Request Handler
 * @param {Object} e - Event parameter dari Google Apps Script Web App
 * @returns {TextOutput} JSON Response
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Pemroses sentral HTTP Request
 * 
 * @param {Object} e - Event request
 * @param {string} method - 'GET' | 'POST'
 * @returns {TextOutput} JSON ContentService Output
 */
function handleRequest(e, method) {
  e = e || {};
  var query = e.parameter || {};
  var body = {};

  // 1. Parsing Body Payload (jika POST)
  if (e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Jika bukan JSON murni, gunakan form-urlencoded query
      body = e.parameter || {};
    }
  }

  // 2. Ekstraksi nama Action (?action=... atau body.action)
  var action = (query.action || body.action || '').trim();

  // 3. Normalisasi Header
  var headers = {};
  // Pada Google Apps Script, headers yang diteruskan terbatas, fallback ke query/body
  if (query.token) headers['authorization'] = 'Bearer ' + query.token;
  if (body.token) headers['authorization'] = 'Bearer ' + body.token;

  var rawRequest = {
    action: action,
    method: method,
    query: query,
    body: body,
    headers: headers,
    ip: (e.parameter && e.parameter.client_ip) || 'gas-client',
    rawEvent: e
  };

  // 4. Dispatch ke Router Engine
  var responseData;
  try {
    responseData = Router.dispatch(rawRequest);
  } catch (criticalErr) {
    Logger.log('[CRITICAL GATEWAY ERROR] ' + criticalErr.message);
    responseData = ApiResponseFormatter.error(
      action,
      500,
      'Internal Server Gateway Error: ' + criticalErr.message,
      { stack: criticalErr.stack }
    );
  }

  // 5. Render Response sebagai JSON
  var jsonString = JSON.stringify(responseData);
  return ContentService
    .createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}
