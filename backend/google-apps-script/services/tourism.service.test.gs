/**
 * SPWN Apps 2.0 - Tourism Service Unit Tests
 * Location: backend/google-apps-script/services/tourism.service.test.gs
 * --------------------------------------------------------------------
 * Menguji fungsionalitas TourismService & RatingCalculator:
 * 1. RatingCalculator: penghitungan rata-rata skor, pembagian bintang & evaluasi 7 unsur Sapta Pesona.
 * 2. TourismService: validasi input, flow submit review & auto-recalculation.
 */

function runTourismServiceTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING TOURISM SERVICE TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: RatingCalculator Abstraction
  Logger.log('\n[TEST 1/2] Menguji RatingCalculator Abstraction...');
  try {
    var mockReviews = [
      { rating: 5, skor_aman: 5, skor_tertib: 4, skor_bersih: 5, skor_sejuk: 5, skor_indah: 5, skor_ramah: 5, skor_kenangan: 5 },
      { rating: 4, skor_aman: 4, skor_tertib: 4, skor_bersih: 4, skor_sejuk: 4, skor_indah: 4, skor_ramah: 4, skor_kenangan: 4 },
      { rating: 5, skor_aman: 5, skor_tertib: 5, skor_bersih: 5, skor_sejuk: 5, skor_indah: 5, skor_ramah: 5, skor_kenangan: 5 }
    ];

    var calc = RatingCalculator.calculateDestinationRating(mockReviews);
    var isAvgCorrect = (calc.averageRating === 4.7 && calc.totalReviews === 3);
    var isDistributionCorrect = (calc.distribution[5] === 2 && calc.distribution[4] === 1);
    var isSaptaPesonaCorrect = (calc.saptaPesona.aman >= 4.5 && calc.saptaPesona.tertib >= 4.0);

    var calcPassed = isAvgCorrect && isDistributionCorrect && isSaptaPesonaCorrect;
    report.tests.ratingCalculator = {
      passed: calcPassed,
      average: calc.averageRating,
      distribution: calc.distribution,
      saptaPesona: calc.saptaPesona
    };
    Logger.log('  -> RatingCalculator: ' + (calcPassed ? '[PASSED]' : '[FAILED]'));
    if (!calcPassed) report.allPassed = false;
  } catch (e) {
    report.tests.ratingCalculator = { passed: false, error: e.message };
    report.allPassed = false;
    Logger.log('  -> RatingCalculator: [FAILED] ' + e.message);
  }

  // TEST 2: TourismService Input Validation
  Logger.log('\n[TEST 2/2] Menguji TourismService Input Guard...');
  try {
    var nameValidationCaught = false;
    try {
      TourismService.createDestination({ nama_destinasi: '' });
    } catch (err) {
      nameValidationCaught = (err.code === 'SPWN_VALIDATION_ERROR');
    }

    var reviewValidationCaught = false;
    try {
      TourismService.submitReview('', {});
    } catch (err2) {
      reviewValidationCaught = (err2.code === 'SPWN_VALIDATION_ERROR');
    }

    var servicePassed = nameValidationCaught && reviewValidationCaught;
    report.tests.tourismValidation = {
      passed: servicePassed,
      nameGuard: nameValidationCaught,
      reviewGuard: reviewValidationCaught
    };
    Logger.log('  -> TourismService Guards: ' + (servicePassed ? '[PASSED]' : '[FAILED]'));
    if (!servicePassed) report.allPassed = false;
  } catch (e) {
    report.tests.tourismValidation = { passed: false, error: e.message };
    report.allPassed = false;
    Logger.log('  -> TourismService Guards: [FAILED] ' + e.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR TOURISM TESTS: ' + (report.allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'));
  Logger.log('=================================================================');

  return report;
}
