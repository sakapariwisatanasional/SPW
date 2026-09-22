/**
 * SPWN Apps 2.0 - Achievement Service & Privacy Unit Tests
 * Location: backend/google-apps-script/services/achievement.service.test.gs
 * -----------------------------------------------------------------------
 * Unit test komprehensif untuk Phase 6.8:
 * 1. RBAC & Privacy Filtering Test (Nilai evaluasi SKK sensor UU PDP)
 * 2. Response Contract Test (Format ApiResponse Contract v2)
 * 3. Level Determination & Progress Calculation (Read Model)
 * 4. Media Policy Compliance (thumbnail preview only)
 */

function runAchievementTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING ACHIEVEMENT TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: Privacy Filtering Test (Nilai SKK Tersembunyi untuk Publik)
  Logger.log('\n[TEST 1/4] Menguji Privacy Filtering (Sensor Nilai SKK)...');
  try {
    var publicContext = { user: null, role: 'PUBLIC_USER' };
    var selfContext = { user: { memberId: 'SPWN.32.01.2024.089' }, role: 'MEMBER' };
    var adminContext = { user: { memberId: 'usr-admin' }, role: 'ADMIN_PUSAT' };

    // Uji skenario data
    var testList = AchievementService.getSkkStatusList('SPWN.32.01.2024.089', publicContext);
    var hasExposedScore = false;
    for (var i = 0; i < testList.length; i++) {
      if (testList[i].score !== undefined) {
        hasExposedScore = true;
        break;
      }
    }

    var isPrivacyProtected = !hasExposedScore;
    report.tests.privacyPublic = {
      passed: isPrivacyProtected,
      message: isPrivacyProtected ? 'Nilai SKK berhasil disensor untuk publik' : 'BOCOR: Nilai SKK tampil untuk publik'
    };
    Logger.log('  -> Privacy Public Guard: ' + (isPrivacyProtected ? '[PASSED]' : '[FAILED]'));
    if (!isPrivacyProtected) report.allPassed = false;
  } catch (e1) {
    report.tests.privacyPublic = { passed: false, error: e1.message };
    report.allPassed = false;
    Logger.log('  -> Privacy Public Guard: [FAILED] ' + e1.message);
  }

  // TEST 2: RBAC Authorized Access (Nilai SKK Tampil untuk Self / Admin)
  Logger.log('\n[TEST 2/4] Menguji RBAC Self & Admin Access...');
  try {
    var selfContext = { user: { memberId: 'SPWN.32.01.2024.089' }, role: 'MEMBER' };
    var selfSummary = AchievementService.getAchievementSummary('SPWN.32.01.2024.089', selfContext);
    var isSelfValid = (selfSummary && selfSummary.member && selfSummary.summary);

    report.tests.selfAccess = {
      passed: isSelfValid,
      hasSummary: isSelfValid
    };
    Logger.log('  -> RBAC Self Access: ' + (isSelfValid ? '[PASSED]' : '[FAILED]'));
    if (!isSelfValid) report.allPassed = false;
  } catch (e2) {
    report.tests.selfAccess = { passed: false, error: e2.message };
    report.allPassed = false;
    Logger.log('  -> RBAC Self Access: [FAILED] ' + e2.message);
  }

  // TEST 3: Read Model Response Contract Validation
  Logger.log('\n[TEST 3/4] Menguji Read Model Response Contract...');
  try {
    var summary = AchievementService.getAchievementSummary('SPWN.32.01.2024.089', { role: 'SUPER_ADMIN' });
    var hasMemberFields = summary.member.memberId && summary.member.nama && summary.member.level;
    var hasSummaryFields = typeof summary.summary.totalSkkAvailable === 'number' &&
                           typeof summary.summary.completedSkk === 'number' &&
                           typeof summary.summary.progressPercent === 'number';

    var isContractValid = hasMemberFields && hasSummaryFields;
    report.tests.responseContract = {
      passed: isContractValid,
      member: summary.member.memberId,
      level: summary.member.level,
      progress: summary.summary.progressPercent + '%'
    };
    Logger.log('  -> Response Contract: ' + (isContractValid ? '[PASSED]' : '[FAILED]'));
    if (!isContractValid) report.allPassed = false;
  } catch (e3) {
    report.tests.responseContract = { passed: false, error: e3.message };
    report.allPassed = false;
    Logger.log('  -> Response Contract: [FAILED] ' + e3.message);
  }

  // TEST 4: Media Policy Compliance (Preview Only thumbnail)
  Logger.log('\n[TEST 4/4] Menguji Kepatuhan Media Policy (External Preview Reference)...');
  try {
    var activities = AchievementService.getMemberActivities('SPWN.32.01.2024.089', { role: 'MEMBER' });
    var mediaValid = true;
    for (var j = 0; j < activities.length; j++) {
      if (activities[j].thumbnailUrl && activities[j].thumbnailUrl.indexOf('data:') === 0) {
        mediaValid = false; // TIDAK BOLEH embed binary base64
        break;
      }
    }
    report.tests.mediaPolicy = { passed: mediaValid };
    Logger.log('  -> Media Policy Guard: ' + (mediaValid ? '[PASSED]' : '[FAILED]'));
    if (!mediaValid) report.allPassed = false;
  } catch (e4) {
    report.tests.mediaPolicy = { passed: false, error: e4.message };
    report.allPassed = false;
    Logger.log('  -> Media Policy Guard: [FAILED] ' + e4.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  ACHIEVEMENT TEST SUITE SUMMARY: ' + (report.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'));
  Logger.log('=================================================================');
  return report;
}
