/**
 * SPWN Apps 2.0 - Controller Layer Unit Tests
 * Location: backend/google-apps-script/controllers/controller.test.gs
 * ------------------------------------------------------------------
 * Menguji fungsionalitas HTTP Controller layer:
 * 1. AuthController (Missing credentials guard & contract shape)
 * 2. VerificationController (Missing token guard & error response)
 * 3. TourismController (List & Review validation)
 * 4. ContentController (Draft & Workflow validation)
 * 5. CommerceController (Cart validation & Response contract v2)
 */

function runControllerTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING CONTROLLER LAYER TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: AuthController Input Guard & Response Contract
  Logger.log('\n[TEST 1/5] Menguji AuthController Guard...');
  try {
    var ctxAuth = RequestContext.create({
      action: 'auth.login',
      body: {} // Missing identifier & password
    });
    var authRes = AuthController.login(ctxAuth);
    var isAuthSafe = (authRes.success === false && authRes.statusCode === 400 && authRes.meta.apiVersion === 'v2');

    report.tests.authController = {
      passed: isAuthSafe,
      response: authRes
    };
    Logger.log('  -> AuthController: ' + (isAuthSafe ? '[PASSED]' : '[FAILED]'));
    if (!isAuthSafe) report.allPassed = false;
  } catch (e1) {
    report.tests.authController = { passed: false, error: e1.message };
    report.allPassed = false;
    Logger.log('  -> AuthController: [FAILED] ' + e1.message);
  }

  // TEST 2: VerificationController Missing Token Guard
  Logger.log('\n[TEST 2/5] Menguji VerificationController Guard...');
  try {
    var ctxVerify = RequestContext.create({
      action: 'verify.kta',
      query: {}
    });
    var verifyRes = VerificationController.verify(ctxVerify);
    var isVerifySafe = (verifyRes.success === false && verifyRes.statusCode === 400);

    report.tests.verificationController = {
      passed: isVerifySafe,
      response: verifyRes
    };
    Logger.log('  -> VerificationController: ' + (isVerifySafe ? '[PASSED]' : '[FAILED]'));
    if (!isVerifySafe) report.allPassed = false;
  } catch (e2) {
    report.tests.verificationController = { passed: false, error: e2.message };
    report.allPassed = false;
    Logger.log('  -> VerificationController: [FAILED] ' + e2.message);
  }

  // TEST 3: TourismController Review Guard
  Logger.log('\n[TEST 3/5] Menguji TourismController Review Guard...');
  try {
    var ctxTourism = RequestContext.create({
      action: 'tourism.review',
      body: { destinasi_id: '' }
    });
    var tourismRes = TourismController.submitReview(ctxTourism);
    var isTourismSafe = (tourismRes.success === false && tourismRes.statusCode === 400);

    report.tests.tourismController = {
      passed: isTourismSafe,
      response: tourismRes
    };
    Logger.log('  -> TourismController: ' + (isTourismSafe ? '[PASSED]' : '[FAILED]'));
    if (!isTourismSafe) report.allPassed = false;
  } catch (e3) {
    report.tests.tourismController = { passed: false, error: e3.message };
    report.allPassed = false;
    Logger.log('  -> TourismController: [FAILED] ' + e3.message);
  }

  // TEST 4: ContentController Draft Title Guard
  Logger.log('\n[TEST 4/5] Menguji ContentController Draft Guard...');
  try {
    var ctxContent = RequestContext.create({
      action: 'content.draft',
      body: { judul: '' }
    });
    var contentRes = ContentController.createDraft(ctxContent);
    var isContentSafe = (contentRes.success === false && contentRes.statusCode === 400);

    report.tests.contentController = {
      passed: isContentSafe,
      response: contentRes
    };
    Logger.log('  -> ContentController: ' + (isContentSafe ? '[PASSED]' : '[FAILED]'));
    if (!isContentSafe) report.allPassed = false;
  } catch (e4) {
    report.tests.contentController = { passed: false, error: e4.message };
    report.allPassed = false;
    Logger.log('  -> ContentController: [FAILED] ' + e4.message);
  }

  // TEST 5: CommerceController Empty Cart Guard
  Logger.log('\n[TEST 5/5] Menguji CommerceController Empty Cart Guard...');
  try {
    var ctxCommerce = RequestContext.create({
      action: 'commerce.order',
      body: { items: [] }
    });
    var commerceRes = CommerceController.checkout(ctxCommerce);
    var isCommerceSafe = (commerceRes.success === false && commerceRes.statusCode === 400);

    report.tests.commerceController = {
      passed: isCommerceSafe,
      response: commerceRes
    };
    Logger.log('  -> CommerceController: ' + (isCommerceSafe ? '[PASSED]' : '[FAILED]'));
    if (!isCommerceSafe) report.allPassed = false;
  } catch (e5) {
    report.tests.commerceController = { passed: false, error: e5.message };
    report.allPassed = false;
    Logger.log('  -> CommerceController: [FAILED] ' + e5.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR CONTROLLER TESTS: ' + (report.allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'));
  Logger.log('=================================================================');

  return report;
}
