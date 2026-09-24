/**
 * SPWN Apps 2.0
 * Frontend API Client
 *
 * Function:
 * - Connect Frontend Web to Google Apps Script API Gateway (/api/spwn)
 * - Authenticated: Member List (member.list)
 * - Authenticated: Member Detail (member.detail)
 * - Public: QR KTA Verification (verify.kta)
 * - Public/Internal: KTA Number Verification (verify.kta / verify.internal)
 */

const SPWN_API_URL = "/api/spwn";

/**
 * Universal SPWN API Request Dispatcher
 * @param {string} action - Nama aksi (misal: 'verify.kta', 'member.list')
 * @param {Object} [payload] - Parameter query & body
 * @param {string} [authToken] - Bearer token untuk autentikasi RBAC
 */
async function spwnRequest(action, payload = {}, authToken = null) {
  const headers = {
    "Content-Type": "application/json"
  };

  // Support auth token passed via parameter or payload
  const token = authToken || (payload && (payload.token || payload.authToken || payload.auth_token));
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestBody = {
    action: action,
    ...(payload || {})
  };

  // Jika token tersedia, sertakan juga di body untuk kompatibilitas Google Apps Script
  if (token && !requestBody.token) {
    requestBody.token = token;
  }

  const response = await fetch(SPWN_API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();

  if (!result.success) {
    const error = new Error(result.message || "API Request Failed");
    error.code = result.error_code || (result.meta && result.meta.code) || "SPWN_API_ERROR";
    error.meta = result.meta;
    throw error;
  }

  return result;
}

/**
 * MEMBER LIST
 * Memerlukan autentikasi (requireAuth: true) dengan permission 'MEMBER_READ'
 * @param {string} [authToken] - Token sesi admin / pengurus
 * @param {Object} [queryOptions] - Filter query (wilayah, limit, offset, search)
 */
async function getMembers(authToken, queryOptions = {}) {
  const result = await spwnRequest(
    "member.list",
    {
      query: queryOptions
    },
    authToken
  );

  return (result.data && result.data.items) ? result.data.items : result.data;
}

/**
 * MEMBER DETAIL
 * Memerlukan autentikasi (requireAuth: true) dengan permission 'MEMBER_READ'
 * @param {string} id - ID anggota
 * @param {string} [authToken] - Token sesi admin / pengurus
 */
async function getMemberDetail(id, authToken) {
  const result = await spwnRequest(
    "member.detail",
    {
      query: {
        id: id
      }
    },
    authToken
  );

  return result.data;
}

/**
 * QR VERIFICATION (Publik)
 * Memverifikasi keabsahan KTA via token QR terenkripsi.
 * Sesuai dengan route router.gs: 'verify.kta' (requireAuth: false).
 * @param {string} token - Token QR dari KTA
 */
async function verifyQR(token) {
  const cleanToken = (token || "").trim();

  const result = await spwnRequest(
    "verify.kta",
    {
      query: {
        token: cleanToken
      },
      body: {
        token: cleanToken
      }
    }
  );

  return result.data;
}

/**
 * KTA VERIFICATION
 * Verifikasi berdasarkan Nomor KTA Resmi (misal: 00.3201.010.000089).
 * Menggunakan route 'verify.kta' (fallback publik/internal) atau 'verify.internal' jika ada token admin.
 * @param {string} nomorKTA - Nomor KTA lengkap
 * @param {string} [authToken] - Opsional token admin jika menggunakan verify.internal
 */
async function verifyKTA(nomorKTA, authToken) {
  const cleanNoKta = (nomorKTA || "").trim();

  // Jika admin menyertakan token auth, gunakan endpoint internal berizin
  const actionName = authToken ? "verify.internal" : "verify.kta";

  const result = await spwnRequest(
    actionName,
    {
      query: {
        token: cleanNoKta,
        no_kta: cleanNoKta,
        nomor_kta: cleanNoKta
      },
      body: {
        token: cleanNoKta,
        no_kta: cleanNoKta,
        nomor_kta: cleanNoKta
      }
    },
    authToken
  );

  return result.data;
}

// Alias untuk kompatibilitas ke belakang (Backward Compatibility)
const verificationQR = verifyQR;
const verificationKTA = verifyKTA;

// Universal Export
if (typeof window !== "undefined") {
  window.spwnApi = {
    spwnRequest,
    getMembers,
    getMemberDetail,
    verifyQR,
    verifyKTA,
    verificationQR,
    verificationKTA
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    spwnRequest,
    getMembers,
    getMemberDetail,
    verifyQR,
    verifyKTA,
    verificationQR,
    verificationKTA
  };
}
