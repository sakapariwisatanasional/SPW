/**
 * SPWN Apps 2.0 - Unified Core Infrastructure Smoke Tests
 * Location: backend/google-apps-script/core/core.test.gs
 * -------------------------------------------------------------
 * Smoke test terpadu untuk memverifikasi kesiapan seluruh komponen inti:
 * 1. LockService (Atomic Concurrency & Error Release)
 * 2. CacheService (Buffer Store, Sensitive Sanitizer & Invalidation)
 * 3. ResponseFormatter (JSend Structure, Meta Metadata & Timeout Mapping)
 */

function runAllCoreTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING CORE INFRASTRUCTURE SMOKE TESTS');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // -----------------------------------------------------------------
  // TEST 1: LOCK SERVICE
  // -----------------------------------------------------------------
  Logger.log('\n[SMOKE TEST 1/3] Menguji LockService Protection Layer...');
  try {
    var counter = 0;
    var lockResult = executeWithLock(function() {
      counter += 1;
      return 'OK';
    }, { lockContext: 'SMOKE_TEST_MUTATION' });

    var lockAcquiredAndRun = (lockResult === 'OK' && counter === 1);

    // Test error auto-release
    var caught = false;
    try {
      executeWithLock(function() {
        throw new Error('SPWN_SIMULATED_ERROR');
      }, { lockContext: 'SMOKE_TEST_ERROR_RELEASE' });
    } catch (e) {
      caught = (e.message === 'SPWN_SIMULATED_ERROR');
    }

    // Verify lock is immediately re-acquirable
    var reuseResult = executeWithLock(function() {
      return 'REUSED';
    }, { lockContext: 'SMOKE_TEST_REUSE' });

    var lockSuccess = lockAcquiredAndRun && caught && (reuseResult === 'REUSED');
    report.tests.lockService = {
      passed: lockSuccess,
      message: lockSuccess ? 'Acquire, auto-release, and re-acquire verified' : 'Lock failure detected'
    };
    Logger.log('  -> LockService Test: ' + (lockSuccess ? '[PASSED]' : '[FAILED]'));
    if (!lockSuccess) report.allPassed = false;
  } catch (errLock) {
    report.tests.lockService = { passed: false, error: errLock.message };
    report.allPassed = false;
    Logger.log('  -> LockService Test: [FAILED] ' + errLock.message);
  }

  // -----------------------------------------------------------------
  // TEST 2: CACHE SERVICE
  // -----------------------------------------------------------------
  Logger.log('\n[SMOKE TEST 2/3] Menguji CacheService Performance Layer...');
  try {
    var testKey = generateCacheKey('MEMBER', 'SMOKE_TEST', '999');
    var rawData = {
      id: 'MEM-999',
      nama: 'Uji Coba Anggota',
      password: 'SENSITIVE_SECRET_PWD',
      token: 'SESSION_TOKEN_XYZ',
      pin: '123456'
    };

    // 1. Simpan & Sanitasi
    setToCache(testKey, rawData, 60);

    // 2. Baca kembali
    var cached = getFromCache(testKey);
    var isCached = (cached !== null && cached.id === 'MEM-999');
    var isSanitized = (cached && cached.password === undefined && cached.token === undefined && cached.pin === undefined);

    // 3. Test Invalidation Module
    var invalidationCount = invalidateAfterMutation('MEMBER');
    var cachedAfterInvalidation = getFromCache(testKey);
    var isInvalidated = (cachedAfterInvalidation === null);

    var cacheSuccess = isCached && isSanitized && isInvalidated;
    report.tests.cacheService = {
      passed: cacheSuccess,
      details: {
        writeAndRead: isCached,
        sensitiveDataSanitized: isSanitized,
        moduleInvalidation: isInvalidated
      }
    };
    Logger.log('  -> CacheService Test: ' + (cacheSuccess ? '[PASSED]' : '[FAILED]'));
    if (!cacheSuccess) report.allPassed = false;
  } catch (errCache) {
    report.tests.cacheService = { passed: false, error: errCache.message };
    report.allPassed = false;
    Logger.log('  -> CacheService Test: [FAILED] ' + errCache.message);
  }

  // -----------------------------------------------------------------
  // TEST 3: RESPONSE LAYER
  // -----------------------------------------------------------------
  Logger.log('\n[SMOKE TEST 3/3] Menguji Response Standardizer (JSend & Meta)...');
  try {
    // 1. Test success response
    var resSuccess = successResponse({ user: 'Admin' }, 'Data berhasil dimuat');
    var jsonSuccess = JSON.parse(resSuccess.getContent());

    var hasSuccessStructure = (
      jsonSuccess.success === true &&
      jsonSuccess.data.user === 'Admin' &&
      jsonSuccess.meta &&
      jsonSuccess.meta.requestId &&
      jsonSuccess.meta.timestamp &&
      jsonSuccess.meta.apiVersion
    );

    // 2. Test error response with lock timeout mapping
    var resError = errorResponse('SPWN_LOCK_TIMEOUT', 'SPWN_LOCK_TIMEOUT: Sedang sibuk');
    var jsonError = JSON.parse(resError.getContent());

    var hasErrorStructure = (
      jsonError.success === false &&
      jsonError.error.code === 'SPWN_LOCK_TIMEOUT' &&
      jsonError.meta &&
      jsonError.meta.requestId
    );

    var responseSuccess = hasSuccessStructure && hasErrorStructure;
    report.tests.responseService = {
      passed: responseSuccess,
      details: {
        successJSendWithMeta: hasSuccessStructure,
        errorMappingWithMeta: hasErrorStructure
      }
    };
    Logger.log('  -> ResponseService Test: ' + (responseSuccess ? '[PASSED]' : '[FAILED]'));
    if (!responseSuccess) report.allPassed = false;
  } catch (errRes) {
    report.tests.responseService = { passed: false, error: errRes.message };
    report.allPassed = false;
    Logger.log('  -> ResponseService Test: [FAILED] ' + errRes.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR SMOKE TEST: ' + (report.allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED'));
  Logger.log('=================================================================');

  return report;
}
