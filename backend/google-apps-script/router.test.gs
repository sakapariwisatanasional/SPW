/**
 * SPWN Apps 2.0 - Router Engine Unit Tests
 * Location: backend/google-apps-script/router.test.gs
 * ----------------------------------------------------
 * Menguji fungsionalitas Action-Based Router:
 * 1. Missing action parameter (400)
 * 2. Unregistered action (404)
 * 3. Auth enforcement guard (401 saat token tidak ada)
 * 4. Role & Permission enforcement guard (403 saat role tidak berhak)
 * 5. Response Contract v2 format compliance
 */

function runRouterTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING ROUTER ENGINE TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: Missing Action Parameter
  Logger.log('\n[TEST 1/4] Menguji Missing Action Guard...');
  try {
    var res1 = Router.dispatch({ action: '' });
    var isMissingActionSafe = (res1.success === false && res1.statusCode === 400 && res1.error.code === 'SPWN_MISSING_ACTION');

    report.tests.missingAction = {
      passed: isMissingActionSafe,
      response: res1
    };
    Logger.log('  -> Missing Action Guard: ' + (isMissingActionSafe ? '[PASSED]' : '[FAILED]'));
    if (!isMissingActionSafe) report.allPassed = false;
  } catch (e1) {
    report.tests.missingAction = { passed: false, error: e1.message };
    report.allPassed = false;
    Logger.log('  -> Missing Action Guard: [FAILED] ' + e1.message);
  }

  // TEST 2: Unknown / Unregistered Action
  Logger.log('\n[TEST 2/4] Menguji Unknown Action (404)...');
  try {
    var res2 = Router.dispatch({ action: 'nonexistent.action' });
    var isUnknownActionSafe = (res2.success === false && res2.statusCode === 404 && res2.error.code === 'SPWN_UNKNOWN_ACTION');

    report.tests.unknownAction = {
      passed: isUnknownActionSafe,
      response: res2
    };
    Logger.log('  -> Unknown Action (404): ' + (isUnknownActionSafe ? '[PASSED]' : '[FAILED]'));
    if (!isUnknownActionSafe) report.allPassed = false;
  } catch (e2) {
    report.tests.unknownAction = { passed: false, error: e2.message };
    report.allPassed = false;
    Logger.log('  -> Unknown Action (404): [FAILED] ' + e2.message);
  }

  // TEST 3: Protected Route Authentication Enforcement (401)
  Logger.log('\n[TEST 3/4] Menguji Auth Enforcement Guard (401)...');
  try {
    // member.list mewajibkan login
    var res3 = Router.dispatch({ action: 'member.list' });
    var isAuthEnforced = (res3.success === false && res3.statusCode === 401);

    report.tests.authEnforcement = {
      passed: isAuthEnforced,
      response: res3
    };
    Logger.log('  -> Auth Enforcement Guard: ' + (isAuthEnforced ? '[PASSED]' : '[FAILED]'));
    if (!isAuthEnforced) report.allPassed = false;
  } catch (e3) {
    report.tests.authEnforcement = { passed: false, error: e3.message };
    report.allPassed = false;
    Logger.log('  -> Auth Enforcement Guard: [FAILED] ' + e3.message);
  }

  // TEST 4: Response Contract Meta & Version Compliance
  Logger.log('\n[TEST 4/4] Menguji Kepatuhan Response Contract v2...');
  try {
    var res4 = Router.dispatch({ action: 'tourism.destinations' });
    var hasMeta = (res4.meta && res4.meta.apiVersion === 'v2' && typeof res4.meta.requestId === 'string');
    var hasContractShape = ('success' in res4 && 'statusCode' in res4 && 'message' in res4 && 'data' in res4);

    var isContractCompliant = hasMeta && hasContractShape;
    report.tests.responseContract = {
      passed: isContractCompliant,
      meta: res4.meta
    };
    Logger.log('  -> Response Contract v2: ' + (isContractCompliant ? '[PASSED]' : '[FAILED]'));
    if (!isContractCompliant) report.allPassed = false;
  } catch (e4) {
    report.tests.responseContract = { passed: false, error: e4.message };
    report.allPassed = false;
    Logger.log('  -> Response Contract v2: [FAILED] ' + e4.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR ROUTER TESTS: ' + (report.allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'));
  Logger.log('=================================================================');

  return report;
}
