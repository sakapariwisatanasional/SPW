/**
 * SPWN Apps 2.0 - Region Controller
 * Location: backend/google-apps-script/controllers/region.controller.gs
 * --------------------------------------------------------------------
 * Menangani HTTP request untuk master wilayah hirarkis & seeder:
 * - region.provinces (GET/POST)
 * - region.regencies (GET/POST)
 * - region.districts (GET/POST)
 * - region.villages (GET/POST)
 * - region.seedStatus (GET/POST)
 * - region.runSeed (POST)
 */

var RegionController = (function() {

  function provinces(context) {
    try {
      var data = RegionService.getProvinces();
      return ApiResponseFormatter.success(
        context.action,
        data,
        'Daftar 38 provinsi berhasil dimuat',
        { count: data.length },
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_REGION_PROV_ERROR' },
        context.requestId
      );
    }
  }

  function regencies(context) {
    try {
      var provId = (context.query && (context.query.provinsi_id || context.query.provinsiId)) ||
                   (context.body && (context.body.provinsi_id || context.body.provinsiId));

      var data = RegionService.getRegencies(provId);
      return ApiResponseFormatter.success(
        context.action,
        data,
        'Daftar kabupaten/kota berhasil dimuat',
        { count: data.length, provinsi_id: provId },
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_REGION_REGENCY_ERROR' },
        context.requestId
      );
    }
  }

  function districts(context) {
    try {
      var kabId = (context.query && (context.query.kabupaten_id || context.query.kabupatenId)) ||
                  (context.body && (context.body.kabupaten_id || context.body.kabupatenId));

      var data = RegionService.getDistricts(kabId);
      return ApiResponseFormatter.success(
        context.action,
        data,
        'Daftar kecamatan berhasil dimuat',
        { count: data.length, kabupaten_id: kabId },
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_REGION_DISTRICT_ERROR' },
        context.requestId
      );
    }
  }

  function villages(context) {
    try {
      var kecId = (context.query && (context.query.kecamatan_id || context.query.kecamatanId)) ||
                  (context.body && (context.body.kecamatan_id || context.body.kecamatanId));

      var data = RegionService.getVillages(kecId);
      return ApiResponseFormatter.success(
        context.action,
        data,
        'Daftar desa/kelurahan berhasil dimuat',
        { count: data.length, kecamatan_id: kecId },
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_REGION_VILLAGE_ERROR' },
        context.requestId
      );
    }
  }

  function seedStatus(context) {
    try {
      var status = ImportService.getSeederStatus();
      return ApiResponseFormatter.success(
        context.action,
        status,
        'Status seeder wilayah nasional berhasil dicek',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_REGION_SEED_STATUS_ERROR' },
        context.requestId
      );
    }
  }

  function runSeed(context) {
    try {
      var force = context.body && context.body.force === true;
      var result = ImportService.seedMasterRegions(force);

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
        { code: 'SPWN_REGION_SEED_RUN_ERROR' },
        context.requestId
      );
    }
  }

  return {
    provinces: provinces,
    regencies: regencies,
    districts: districts,
    villages: villages,
    seedStatus: seedStatus,
    runSeed: runSeed
  };
})();
