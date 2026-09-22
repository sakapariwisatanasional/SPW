/**
 * SPWN Apps 2.0 - System Configuration
 * Location: backend/google-apps-script/config/system.config.gs
 * -------------------------------------------------------------
 * Menyimpan konfigurasi global platform, metadata aplikasi,
 * timezone resmi, batas waktu eksekusi (timeout), TTL cache,
 * serta mode debugging.
 */

var SPWN_SYSTEM = {
  APP_NAME: 'SPWN Apps 2.0 (SAKA Pariwisata Network)',
  VERSION: '2.0.0',
  API_VERSION: 'v2',
  ENVIRONMENT: 'production', // 'development' | 'staging' | 'production'
  TIMEZONE: 'Asia/Jakarta',  // Waktu Indonesia Barat (WIB)
  DEBUG_MODE: false,

  // Konfigurasi URL Utama Platform (Dynamic QR & Public Verification Domain)
  PUBLIC_URL: 'https://ais-dev-kpcsufjvxrvm25tv5c5n5m-74565716531.asia-southeast1.run.app',

  // Konfigurasi Web App Deployment Existing
  DEPLOYMENT: {
    DEPLOYMENT_ID: 'AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg',
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg/exec'
  },

  // Konfigurasi Keamanan & Lock Concurrency
  CONCURRENCY: {
    LOCK_TIMEOUT_MS: 10000,      // 10 detik batas maksimum LockService
    LOCK_RETRY_DELAY_MS: 200,    // Jeda polling antar percobaan acquire lock
    MAX_RETRY_ATTEMPTS: 3
  },

  // Konfigurasi In-Memory Cache (CacheService)
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL_SECONDS: 300,
    MODULE_TTL: {
      DASHBOARD: 300, // 300 detik
      MEMBER: 300,    // 300 detik
      TOURISM: 600,   // 600 detik
      CONTENT: 600,   // 600 detik
      COMMERCE: 300,  // 300 detik
      MASTER: 1800    // 1800 detik (30 Menit untuk data statis Krida/Role)
    }
  },

  // Konfigurasi Standar CORS & Response Header
  SECURITY: {
    CORS_ALLOW_ORIGIN: '*',
    ENABLE_STRICT_PRIVACY_FILTER: true // Memastikan NIK & password terbuang di API publik
  }
};

/**
 * Helper untuk mengambil nilai environment secara dinamis
 * dari ScriptProperties jika tersedia, dengan fallback ke default object.
 * 
 * @param {string} key 
 * @param {*} defaultValue 
 * @returns {*}
 */
function getSystemProperty(key, defaultValue) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var val = scriptProperties.getProperty(key);
    if (val !== null && val !== undefined) {
      return val;
    }
  } catch (e) {
    // Log error hanya jika DEBUG_MODE aktif
    if (SPWN_SYSTEM.DEBUG_MODE) {
      Logger.log('[system.config.gs] Gagal membaca ScriptProperties: ' + e.message);
    }
  }
  return defaultValue;
}

/**
 * Menginisialisasi sistem dan menyelaraskan nilai konfigurasi dinamis.
 */
function initSystemConfig() {
  SPWN_SYSTEM.ENVIRONMENT = getSystemProperty('SPWN_ENV', SPWN_SYSTEM.ENVIRONMENT);
  SPWN_SYSTEM.PUBLIC_URL = getSystemProperty('SPWN_PUBLIC_URL', SPWN_SYSTEM.PUBLIC_URL);
  SPWN_SYSTEM.DEBUG_MODE = getSystemProperty('SPWN_DEBUG', SPWN_SYSTEM.DEBUG_MODE) === 'true' || SPWN_SYSTEM.DEBUG_MODE === true;
  return SPWN_SYSTEM;
}
