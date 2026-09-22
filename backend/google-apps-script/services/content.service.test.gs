/**
 * SPWN Apps 2.0 - Content Service Unit Tests
 * Location: backend/google-apps-script/services/content.service.test.gs
 * --------------------------------------------------------------------
 * Menguji fungsionalitas ContentService & ContentWorkflow:
 * 1. ContentWorkflow: Validasi matrik transisi status resmi (DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED).
 * 2. Pencegahan penerbitan langsung (Direct Publish Guard).
 * 3. SEO Slug generation.
 */

function runContentServiceTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING CONTENT SERVICE TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: ContentWorkflow Transition Rules
  Logger.log('\n[TEST 1/2] Menguji ContentWorkflow Transition Matriks...');
  try {
    // Transisi Sah:
    var draftToReview = ContentWorkflow.isValidTransition('DRAFT', 'REVIEW');
    var reviewToPublished = ContentWorkflow.isValidTransition('REVIEW', 'PUBLISHED');
    var publishedToArchived = ContentWorkflow.isValidTransition('PUBLISHED', 'ARCHIVED');
    var reviewToDraft = ContentWorkflow.isValidTransition('REVIEW', 'DRAFT'); // Rejection

    // Transisi Ilegal (Harus Ditolak):
    var draftDirectPublish = ContentWorkflow.isValidTransition('DRAFT', 'PUBLISHED'); // DILARANG
    var draftDirectArchive = ContentWorkflow.isValidTransition('DRAFT', 'ARCHIVED'); // DILARANG
    var invalidStatus = ContentWorkflow.isValidTransition('UNKNOWN', 'PUBLISHED');

    var workflowOk = draftToReview && reviewToPublished && publishedToArchived && reviewToDraft &&
                     !draftDirectPublish && !draftDirectArchive && !invalidStatus;

    report.tests.workflowEngine = {
      passed: workflowOk,
      draftToReview: draftToReview,
      reviewToPublished: reviewToPublished,
      draftDirectPublishBlocked: !draftDirectPublish
    };
    Logger.log('  -> ContentWorkflow: ' + (workflowOk ? '[PASSED]' : '[FAILED]'));
    if (!workflowOk) report.allPassed = false;
  } catch (e) {
    report.tests.workflowEngine = { passed: false, error: e.message };
    report.allPassed = false;
    Logger.log('  -> ContentWorkflow: [FAILED] ' + e.message);
  }

  // TEST 2: Slug Generator
  Logger.log('\n[TEST 2/2] Menguji SEO Slug Generator...');
  try {
    var rawTitle = 'Kemah Bakti Saka Pariwisata & Pelantikan Krida Jabar 2026!';
    var slug = ContentWorkflow.generateSlug(rawTitle);
    var isSlugClean = (slug === 'kemah-bakti-saka-pariwisata-pelantikan-krida-jabar-2026');

    report.tests.slugGenerator = {
      passed: isSlugClean,
      slug: slug
    };
    Logger.log('  -> Slug Generator: ' + (isSlugClean ? '[PASSED]' : '[FAILED]'));
    if (!isSlugClean) report.allPassed = false;
  } catch (e2) {
    report.tests.slugGenerator = { passed: false, error: e2.message };
    report.allPassed = false;
    Logger.log('  -> Slug Generator: [FAILED] ' + e2.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR CONTENT TESTS: ' + (report.allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'));
  Logger.log('=================================================================');

  return report;
}
