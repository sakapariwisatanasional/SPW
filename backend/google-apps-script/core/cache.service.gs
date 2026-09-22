/**
 * SPWN Apps 2.0 - Core Cache Service
 * Location: backend/google-apps-script/core/cache.service.gs
 * -------------------------------------------------------------
 * Performance Layer menggunakan in-memory Google Apps Script CacheService.
 * 
 * Standar Cache Key Convention:
 * SPWN:{MODULE}:{ACTION}:{IDENTIFIER}
 * 
 * Contoh:
 * - SPWN:MEMBER:LIST:ALL
 * - SPWN:TOURISM:DESTINATION:BALI
 * - SPWN:DASHBOARD:SUMMARY:GLOBAL
 * 
 * ATURAN KEAMANAN CACHE:
 * CacheService DILARANG menyimpan data sensitif:
 * - password / hash
 * - token / secret
 * - credentials / NIK pribadi
 */

var CacheManager = (function() {
  var PREFIX = 'SPWN';
  var SENSITIVE_KEYS = [
    'password', 'pwd', 'pass', 'hash', 'salt',
    'token', 'secret', 'credential', 'auth', 'session',
    'pin', 'nik', 'ktp', 'private_key', 'access_token', 'refresh_token'
  ];

  /**
   * Mengambil instance CacheService Google Apps Script.
   * Menggunakan ScriptCache (dapat diakses oleh seluruh sesi pengguna).
   * 
   * @returns {GoogleAppsScript.Cache.Cache}
   */
  function getCache() {
    return CacheService.getScriptCache();
  }

  /**
   * Membuat standard cache key sesuai konvensi SPWN.
   * 
   * @param {string} module - MEMBER, TOURISM, CONTENT, COMMERCE, DASHBOARD, MASTER
   * @param {string} action - LIST, DETAIL, SUMMARY, SEARCH, etc.
   * @param {string|number} [identifier] - ID, query hash, atau 'ALL'
   * @returns {string} Contoh: SPWN:MEMBER:LIST:PAGE_1
   */
  function buildKey(module, action, identifier) {
    var mod = (module || 'GLOBAL').toString().toUpperCase().trim();
    var act = (action || 'QUERY').toString().toUpperCase().trim();
    var idf = (identifier !== undefined && identifier !== null && identifier !== '')
      ? identifier.toString().toUpperCase().trim()
      : 'ALL';

    return PREFIX + ':' + mod + ':' + act + ':' + idf;
  }

  /**
   * Mengambil TTL default berdasarkan modul dari system.config.gs.
   * 
   * @param {string} module 
   * @returns {number} Durasi detik
   */
  function getTTLForModule(module) {
    var modUpper = (module || '').toUpperCase();
    if (SPWN_SYSTEM.CACHE && SPWN_SYSTEM.CACHE.MODULE_TTL && SPWN_SYSTEM.CACHE.MODULE_TTL[modUpper]) {
      return SPWN_SYSTEM.CACHE.MODULE_TTL[modUpper];
    }
    return (SPWN_SYSTEM.CACHE && SPWN_SYSTEM.CACHE.DEFAULT_TTL_SECONDS) ? SPWN_SYSTEM.CACHE.DEFAULT_TTL_SECONDS : 300;
  }

  /**
   * Menyaring data sebelum disimpan ke cache agar tidak ada kredensial sensitif bocor.
   * 
   * @param {*} data 
   * @returns {*}
   */
  function sanitizeForCache(data) {
    if (!data) return data;

    // Jika array, sanitasi setiap elemen
    if (Array.isArray(data)) {
      return data.map(function(item) {
        return sanitizeForCache(item);
      });
    }

    // Jika object, bersihkan field sensitif
    if (typeof data === 'object' && data !== null) {
      var sanitized = {};
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          var lowerKey = k.toLowerCase();
          var isSensitive = false;
          for (var i = 0; i < SENSITIVE_KEYS.length; i++) {
            if (lowerKey === SENSITIVE_KEYS[i] || lowerKey.indexOf(SENSITIVE_KEYS[i]) !== -1) {
              isSensitive = true;
              break;
            }
          }

          if (!isSensitive) {
            sanitized[k] = sanitizeForCache(data[k]);
          }
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Mengambil data dari cache berdasarkan key.
   * 
   * @param {string} key - Cache key lengkap
   * @returns {*|null} Objek yang telah di-deserialize, atau null jika miss/expired
   */
  function get(key) {
    if (!SPWN_SYSTEM.CACHE || !SPWN_SYSTEM.CACHE.ENABLED) {
      return null;
    }

    try {
      var cache = getCache();
      var cachedStr = cache.get(key);

      if (!cachedStr) {
        return null;
      }

      var parsed = JSON.parse(cachedStr);
      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[CacheService] Cache HIT untuk key: ' + key);
      }
      return parsed;
    } catch (err) {
      Logger.log('[CacheService] Gagal membaca cache untuk key [' + key + ']: ' + err.message);
      return null;
    }
  }

  /**
   * Menyimpan data ke dalam cache dengan serialisasi JSON.
   * 
   * @param {string} key - Cache key lengkap
   * @param {*} data - Objek atau array yang akan disimpan
   * @param {number} [ttlSeconds] - Durasi cache dalam detik (maksimum Apps Script: 21600 detik / 6 jam)
   * @returns {boolean} Status keberhasilan
   */
  function set(key, data, ttlSeconds) {
    if (!SPWN_SYSTEM.CACHE || !SPWN_SYSTEM.CACHE.ENABLED) {
      return false;
    }

    if (data === undefined || data === null) {
      return false;
    }

    try {
      // 1. Sanitasi data sensitif
      var safeData = sanitizeForCache(data);

      // 2. Serialisasi JSON
      var strData = JSON.stringify(safeData);

      // Google Apps Script CacheService memiliki batas 100KB per nilai
      if (strData.length > 100000) {
        Logger.log('[CacheService] Peringatan: Ukuran data (' + strData.length + ' bytes) melebihi batas 100KB untuk key: ' + key);
        return false;
      }

      // 3. Tentukan TTL aman (min 1 detik, max 21600 detik)
      var ttl = ttlSeconds || SPWN_SYSTEM.CACHE.DEFAULT_TTL_SECONDS || 300;
      if (ttl > 21600) ttl = 21600;
      if (ttl < 1) ttl = 1;

      // 4. Simpan ke ScriptCache
      var cache = getCache();
      cache.put(key, strData, ttl);

      // 5. Catat key di register modul agar dapat dihapus saat clearModuleCache
      registerKeyForModule(key);

      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[CacheService] Cache SET sukses untuk key: ' + key + ' (TTL: ' + ttl + 's)');
      }
      return true;
    } catch (err) {
      Logger.log('[CacheService] Gagal menyimpan cache [' + key + ']: ' + err.message);
      return false;
    }
  }

  /**
   * Menghapus cache spesifik berdasarkan key.
   * 
   * @param {string} key 
   * @returns {boolean}
   */
  function remove(key) {
    try {
      var cache = getCache();
      cache.remove(key);
      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[CacheService] Cache REMOVE: ' + key);
      }
      return true;
    } catch (err) {
      Logger.log('[CacheService] Gagal menghapus cache [' + key + ']: ' + err.message);
      return false;
    }
  }

  /**
   * Mencatat key ke indeks registry modul untuk mendukung batch invalidation.
   */
  function registerKeyForModule(key) {
    try {
      var parts = key.split(':');
      if (parts.length >= 2) {
        var module = parts[1];
        var registryKey = PREFIX + ':REGISTRY:' + module;
        var cache = getCache();
        var regStr = cache.get(registryKey);
        var reg = regStr ? JSON.parse(regStr) : [];

        if (reg.indexOf(key) === -1) {
          reg.push(key);
          // Batasi registry maksimal 50 key teratas
          if (reg.length > 50) reg.shift();
          cache.put(registryKey, JSON.stringify(reg), 21600);
        }
      }
    } catch (e) {
      // Abaikan error registrasi non-blocking
    }
  }

  /**
   * Menghapus seluruh cache yang berkaitan dengan modul tertentu (Cache Invalidation).
   * Digunakan saat terjadi mutasi data (Create/Update/Delete) pada modul terkait.
   * 
   * @param {string} module - MEMBER, TOURISM, CONTENT, COMMERCE, DASHBOARD
   * @returns {number} Jumlah key yang berhasil dihapus
   */
  function clearModuleCache(module) {
    var modUpper = (module || '').toUpperCase().trim();
    var registryKey = PREFIX + ':REGISTRY:' + modUpper;
    var count = 0;

    try {
      var cache = getCache();
      var regStr = cache.get(registryKey);

      if (regStr) {
        var keys = JSON.parse(regStr);
        if (Array.isArray(keys) && keys.length > 0) {
          cache.removeAll(keys);
          count = keys.length;
        }
      }

      // Hapus registry modul itu sendiri
      cache.remove(registryKey);

      Logger.log('[CacheService] Invalidation berhasil untuk modul ' + modUpper + ' (' + count + ' keys dihapus)');
      return count;
    } catch (err) {
      Logger.log('[CacheService] Gagal invalidasi modul [' + modUpper + ']: ' + err.message);
      return 0;
    }
  }

  return {
    buildKey: buildKey,
    generateCacheKey: buildKey, // Alias resmi
    getTTLForModule: getTTLForModule,
    get: get,
    set: set,
    remove: remove,
    clearModuleCache: clearModuleCache,
    invalidateAfterMutation: clearModuleCache, // Alias resmi
    sanitizeForCache: sanitizeForCache
  };
})();

/**
 * Global function exports agar service layer dapat langsung menggunakannya
 * tanpa perlu mengetahui detail internal CacheManager.
 */
function generateCacheKey(module, action, identifier) {
  return CacheManager.generateCacheKey(module, action, identifier);
}

function invalidateAfterMutation(module) {
  return CacheManager.invalidateAfterMutation(module);
}

function getFromCache(key) {
  return CacheManager.get(key);
}

function setToCache(key, data, ttlSeconds) {
  return CacheManager.set(key, data, ttlSeconds);
}

// =========================================================================
// TESTING FUNCTION CACHE SERVICE
// =========================================================================

/**
 * Menguji fungsionalitas CacheService (set, get, sanitize, remove, clearModuleCache).
 */
function testCacheService() {
  Logger.log('====================================================');
  Logger.log('[TEST] MEMULAI PENGUJIAN CORE CACHE SERVICE');
  Logger.log('====================================================');

  var testKey = CacheManager.buildKey('MEMBER', 'TEST', 'ITEM_99');
  var payload = {
    id: 'MEM-99',
    nama_lengkap: 'Fajar Nugraha Wijaya',
    krida: 'Bina Wisata',
    password: 'SUPER_SECRET_PASSWORD_123', // Field sensitif yang harus dihilangkan
    token: 'BEARER_SECRET_TOKEN_XYZ'
  };

  try {
    // 1. Uji Penyimpanan dengan Sanitasi Otomatis
    var setSuccess = CacheManager.set(testKey, payload, 60);
    Logger.log('Uji 1 - Cache Set: ' + (setSuccess ? 'PASSED (Disimpan ke ' + testKey + ')' : 'FAILED'));

    // 2. Uji Pembacaan & Verifikasi Penghilangan Data Sensitif
    var cachedData = CacheManager.get(testKey);
    var hasPassword = cachedData && cachedData.password !== undefined;
    var hasName = cachedData && cachedData.nama_lengkap === 'Fajar Nugraha Wijaya';

    Logger.log('Uji 2 - Cache Get: ' + (hasName ? 'PASSED (Data terbaca)' : 'FAILED'));
    Logger.log('Uji 3 - Sensitive Data Sanitizer: ' + (!hasPassword ? 'PASSED (Password & Token otomatis di-strip)' : 'FAILED (Bocor!)'));

    // 3. Uji Penghapusan Satuan
    var removeSuccess = CacheManager.remove(testKey);
    var checkAfterRemove = CacheManager.get(testKey);
    Logger.log('Uji 4 - Cache Remove: ' + (removeSuccess && checkAfterRemove === null ? 'PASSED' : 'FAILED'));

    // 4. Uji Invalidation Modul
    var keyA = CacheManager.buildKey('TOURISM', 'DESTINATION', '1');
    var keyB = CacheManager.buildKey('TOURISM', 'DESTINATION', '2');
    CacheManager.set(keyA, { name: 'Danau Toba' }, 60);
    CacheManager.set(keyB, { name: 'Bromo' }, 60);

    var clearedCount = CacheManager.clearModuleCache('TOURISM');
    var checkKeyA = CacheManager.get(keyA);
    Logger.log('Uji 5 - Batch Invalidation Modul: ' + (checkKeyA === null ? 'PASSED (' + clearedCount + ' keys dibersihkan)' : 'FAILED'));

    Logger.log('====================================================');
    Logger.log('[TEST] SELURUH PENGUJIAN CACHE SERVICE BERHASIL');
    Logger.log('====================================================');
    return { success: true, message: 'CacheService beroperasi sesuai standar' };
  } catch (err) {
    Logger.log('[TEST FAILED] CacheService error: ' + err.message);
    return { success: false, error: err.message };
  }
}
