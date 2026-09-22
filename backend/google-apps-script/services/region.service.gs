/**
 * SPWN Apps 2.0 - Region Service
 * Location: backend/google-apps-script/services/region.service.gs
 * -------------------------------------------------------------
 * Layanan data wilayah hirarkis 38 Provinsi, 514 Kab/Kota, Kecamatan & Desa.
 * Dilengkapi dengan akselerasi CacheService (TTL 6 jam = 21600 detik).
 */

var RegionService = (function() {
  var CACHE_TTL_SECONDS = 21600; // 6 jam
  var CACHE_PREFIX = 'SPWN_REGION_CACHE_';

  function _getCache() {
    try {
      return CacheService.getScriptCache();
    } catch (e) {
      return null;
    }
  }

  /**
   * Mengambil 38 data provinsi aktif (di-cache).
   */
  function getProvinces() {
    var cache = _getCache();
    var cacheKey = CACHE_PREFIX + 'PROVINCES';
    if (cache) {
      var cached = cache.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }

    var data = RegionRepository.getAllProvinces();
    if (cache && data && data.length > 0) {
      try {
        cache.put(cacheKey, JSON.stringify(data), CACHE_TTL_SECONDS);
      } catch (e) {}
    }
    return data;
  }

  /**
   * Mengambil daftar kabupaten/kota untuk provinsi tertentu (di-cache).
   * @param {string} provinsiId - Contoh: '32'
   */
  function getRegencies(provinsiId) {
    if (!provinsiId) return [];
    var cleanId = provinsiId.toString();
    var cache = _getCache();
    var cacheKey = CACHE_PREFIX + 'REGENCIES_' + cleanId;
    if (cache) {
      var cached = cache.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }

    var data = RegionRepository.getRegenciesByProvince(cleanId);
    if (cache && data && data.length > 0) {
      try {
        cache.put(cacheKey, JSON.stringify(data), CACHE_TTL_SECONDS);
      } catch (e) {}
    }
    return data;
  }

  /**
   * Mengambil daftar kecamatan untuk kabupaten tertentu (di-cache).
   * @param {string} kabupatenId - Contoh: '3201' atau '32.01'
   */
  function getDistricts(kabupatenId) {
    if (!kabupatenId) return [];
    var cleanId = kabupatenId.toString().replace('.', '');
    var cache = _getCache();
    var cacheKey = CACHE_PREFIX + 'DISTRICTS_' + cleanId;
    if (cache) {
      var cached = cache.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }

    var data = RegionRepository.getDistrictsByRegency(cleanId);
    if (cache && data && data.length > 0) {
      try {
        cache.put(cacheKey, JSON.stringify(data), CACHE_TTL_SECONDS);
      } catch (e) {}
    }
    return data;
  }

  /**
   * Mengambil daftar desa/kelurahan untuk kecamatan tertentu (di-cache).
   * @param {string} kecamatanId - Contoh: '320101' atau '32.01.01'
   */
  function getVillages(kecamatanId) {
    if (!kecamatanId) return [];
    var cleanId = kecamatanId.toString().replace(/\./g, '');
    var cache = _getCache();
    var cacheKey = CACHE_PREFIX + 'VILLAGES_' + cleanId;
    if (cache) {
      var cached = cache.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }

    var data = RegionRepository.getVillagesByDistrict(cleanId);
    if (cache && data && data.length > 0) {
      try {
        cache.put(cacheKey, JSON.stringify(data), CACHE_TTL_SECONDS);
      } catch (e) {}
    }
    return data;
  }

  /**
   * Bersihkan cache wilayah jika terjadi update data seeder.
   */
  function clearCache() {
    var cache = _getCache();
    if (cache) {
      cache.remove(CACHE_PREFIX + 'PROVINCES');
    }
  }

  return {
    getProvinces: getProvinces,
    getRegencies: getRegencies,
    getDistricts: getDistricts,
    getVillages: getVillages,
    clearCache: clearCache
  };
})();
