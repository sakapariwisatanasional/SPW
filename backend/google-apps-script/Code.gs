/**
 * SPWN Apps 2.0 - Google Apps Script HTTP Web App Entry Point
 * Location: backend/google-apps-script/Code.gs
 *
 * Perbaikan:
 * - Memastikan seluruh response selalu JSON
 * - Menangkap error gateway tanpa menghasilkan HTML error Google
 * - Menghapus blok kode di luar fungsi yang menyebabkan masalah deployment
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}


function doPost(e) {
  return handleRequest(e, 'POST');
}


function handleRequest(e, method) {

  e = e || {};

  var query = e.parameter || {};
  var body = {};


  if (e.postData && e.postData.contents) {

    try {

      body = JSON.parse(
        e.postData.contents
      );

    } catch(parseErr) {

      body = e.parameter || {};

    }

  }


  var action =
    (
      query.action ||
      body.action ||
      ''
    ).trim();


  var headers = {};


  if (query.token) {

    headers.authorization =
      'Bearer ' + query.token;

  }


  if (body.token) {

    headers.authorization =
      'Bearer ' + body.token;

  }


  var rawRequest = {

    action: action,

    method: method,

    query: query,

    body: body,

    headers: headers,

    ip:
      (e.parameter && e.parameter.client_ip)
      || 'gas-client',

    rawEvent: e

  };


  try {

    var responseData =
      Router.dispatch(rawRequest);


    return jsonResponse(responseData);


  } catch(error) {


    Logger.log(
      '[SPWN ERROR] ' +
      error.message
    );


    return jsonResponse({

      success:false,

      error_code:
        'INTERNAL_SERVER_ERROR',

      message:
        error.message,

      stack:
        error.stack || ''

    });

  }

}



function jsonResponse(data) {

  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}
