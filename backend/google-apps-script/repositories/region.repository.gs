/**
 * SPWN Apps 2.0 - Region Repository Layer
 * Location: backend/google-apps-script/repositories/region.repository.gs
 * ----------------------------------------------------------------------
 * Repository pembacaan dan pengelolaan Master Wilayah Indonesia
 * (Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan)
 * Terstandarisasi BPS / Kemendagri.
 * 
 * Menggunakan SpreadsheetRepository engine dengan akselerasi CacheService.
 */

var RegionRepository = (function() {
  var _provRepo = null;
  var _kabRepo = null;
  var _kecRepo = null;
  var _desaRepo = null;

  function getProvRepo() {
    if (!_provRepo) {
      _provRepo = SpreadsheetRepository.create('MEMBER', 'WILAYAH_PROVINSI', {
        primaryKey: 'kode_provinsi',
        enableCache: true
      });
    }
    return _provRepo;
  }

  function getKabRepo() {
    if (!_kabRepo) {
      _kabRepo = SpreadsheetRepository.create('MEMBER', 'WILAYAH_KABUPATEN', {
        primaryKey: 'kode_kabupaten',
        enableCache: true
      });
    }
    return _kabRepo;
  }

  function getKecRepo() {
    if (!_kecRepo) {
      _kecRepo = SpreadsheetRepository.create('MEMBER', 'WILAYAH_KECAMATAN', {
        primaryKey: 'kode_kecamatan',
        enableCache: true
      });
    }
    return _kecRepo;
  }

  function getDesaRepo() {
    if (!_desaRepo) {
      _desaRepo = SpreadsheetRepository.create('MEMBER', 'WILAYAH_DESA', {
        primaryKey: 'kode_desa',
        enableCache: true
      });
    }
    return _desaRepo;
  }

  /**
   * Mengambil semua 38 provinsi aktif.
   */
  function getAllProvinces() {
    return getProvRepo().findAll({
      filter: function(item) {
        return item.status !== 'DELETED' && item.status !== 'INACTIVE';
      }
    });
  }

  /**
   * Mengambil satu provinsi berdasarkan kode provinsi.
   */
  function getProvinceByCode(code) {
    if (!code) return null;
    return getProvRepo().findById(code.toString());
  }

  /**
   * Mengambil daftar kabupaten berdasarkan kode provinsi.
   */
  function getRegenciesByProvince(provinceId) {
    if (!provinceId) return [];
    var pId = provinceId.toString();
    return getKabRepo().findAll({
      filter: function(item) {
        return (item.provinsi_id === pId || item.kode_kabupaten.substring(0, 2) === pId) &&
               item.status !== 'DELETED';
      }
    });
  }

  /**
   * Mengambil satu kabupaten berdasarkan kode kabupaten.
   */
  function getRegencyByCode(code) {
    if (!code) return null;
    return getKabRepo().findById(code.toString());
  }

  /**
   * Mengambil daftar kecamatan berdasarkan kode kabupaten.
   */
  function getDistrictsByRegency(regencyId) {
    if (!regencyId) return [];
    var rId = regencyId.toString();
    return getKecRepo().findAll({
      filter: function(item) {
        return (item.kabupaten_id === rId || item.kode_kecamatan.substring(0, 4) === rId.replace('.', '')) &&
               item.status !== 'DELETED';
      }
    });
  }

  /**
   * Mengambil satu kecamatan berdasarkan kode kecamatan.
   */
  function getDistrictByCode(code) {
    if (!code) return null;
    return getKecRepo().findById(code.toString());
  }

  /**
   * Mengambil daftar desa berdasarkan kode kecamatan.
   */
  function getVillagesByDistrict(districtId) {
    if (!districtId) return [];
    var dId = districtId.toString();
    return getDesaRepo().findAll({
      filter: function(item) {
        return (item.kecamatan_id === dId || item.kode_desa.substring(0, dId.length) === dId) &&
               item.status !== 'DELETED';
      }
    });
  }

  /**
   * Batch insert untuk seeder wilayah chunked.
   */
  function batchInsert(level, items) {
    if (!items || items.length === 0) return 0;
    var repo = null;
    if (level === 'PROVINCE') repo = getProvRepo();
    else if (level === 'REGENCY') repo = getKabRepo();
    else if (level === 'DISTRICT') repo = getKecRepo();
    else if (level === 'VILLAGE') repo = getDesaRepo();
    else throw new Error('Level seeder tidak valid: ' + level);

    var count = 0;
    for (var i = 0; i < items.length; i++) {
      try {
        repo.insert(items[i]);
        count++;
      } catch (e) {
        // Skip duplicate ID on idempotent seed
      }
    }
    return count;
  }

  return {
    getAllProvinces: getAllProvinces,
    getProvinceByCode: getProvinceByCode,
    getRegenciesByProvince: getRegenciesByProvince,
    getRegencyByCode: getRegencyByCode,
    getDistrictsByRegency: getDistrictsByRegency,
    getDistrictByCode: getDistrictByCode,
    getVillagesByDistrict: getVillagesByDistrict,
    batchInsert: batchInsert,
    getProvRepo: getProvRepo,
    getKabRepo: getKabRepo,
    getKecRepo: getKecRepo,
    getDesaRepo: getDesaRepo
  };
})();
