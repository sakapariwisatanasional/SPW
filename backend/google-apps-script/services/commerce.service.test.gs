/**
 * SPWN Apps 2.0 - Commerce, Inventory & Order Service Unit Tests
 * Location: backend/google-apps-script/services/commerce.service.test.gs
 * ---------------------------------------------------------------------
 * Menguji integrasi:
 * 1. InventoryService: checkStock logic, penanganan out-of-stock guard.
 * 2. CommerceService: validasi pendaftaran produk (harga negatif ditolak).
 * 3. OrderService: alur checkout, invoice format & validasi keranjang kosong.
 */

function runCommerceServiceTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING COMMERCE SERVICE TEST SUITE');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // TEST 1: InventoryService Stock Check
  Logger.log('\n[TEST 1/3] Menguji InventoryService Check Guard...');
  try {
    var checkResult = InventoryService.checkStock('NON_EXISTENT_PRD', 10);
    var isCheckSafe = (checkResult.isAvailable === false && checkResult.currentStock === 0);

    report.tests.inventoryGuard = {
      passed: isCheckSafe,
      result: checkResult
    };
    Logger.log('  -> InventoryService: ' + (isCheckSafe ? '[PASSED]' : '[FAILED]'));
    if (!isCheckSafe) report.allPassed = false;
  } catch (e) {
    report.tests.inventoryGuard = { passed: false, error: e.message };
    report.allPassed = false;
    Logger.log('  -> InventoryService: [FAILED] ' + e.message);
  }

  // TEST 2: CommerceService Product Validation
  Logger.log('\n[TEST 2/3] Menguji CommerceService Price & Input Guard...');
  try {
    var priceValidationCaught = false;
    try {
      CommerceService.createProduct({
        nama_produk: 'Stiker SAKA',
        harga: -5000 // Harga negatif dilarang
      });
    } catch (errPrice) {
      priceValidationCaught = (errPrice.code === 'SPWN_VALIDATION_ERROR');
    }

    var emptyNameCaught = false;
    try {
      CommerceService.createProduct({
        nama_produk: '',
        harga: 25000
      });
    } catch (errName) {
      emptyNameCaught = (errName.code === 'SPWN_VALIDATION_ERROR');
    }

    var commercePassed = priceValidationCaught && emptyNameCaught;
    report.tests.commerceValidation = {
      passed: commercePassed,
      negativePriceGuard: priceValidationCaught,
      emptyNameGuard: emptyNameCaught
    };
    Logger.log('  -> CommerceService Guards: ' + (commercePassed ? '[PASSED]' : '[FAILED]'));
    if (!commercePassed) report.allPassed = false;
  } catch (e2) {
    report.tests.commerceValidation = { passed: false, error: e2.message };
    report.allPassed = false;
    Logger.log('  -> CommerceService Guards: [FAILED] ' + e2.message);
  }

  // TEST 3: OrderService Checkout & Cart Validation
  Logger.log('\n[TEST 3/3] Menguji OrderService Empty Cart Guard & Status Lifecycle...');
  try {
    var emptyCartCaught = false;
    try {
      OrderService.createOrder({ items: [] });
    } catch (errCart) {
      emptyCartCaught = (errCart.code === 'SPWN_VALIDATION_ERROR');
    }

    var hasValidStatuses = (
      OrderService.ORDER_STATUS.PENDING === 'PENDING' &&
      OrderService.ORDER_STATUS.PAID === 'PAID' &&
      OrderService.ORDER_STATUS.SHIPPED === 'SHIPPED' &&
      OrderService.ORDER_STATUS.COMPLETED === 'COMPLETED' &&
      OrderService.ORDER_STATUS.CANCELLED === 'CANCELLED'
    );

    var orderPassed = emptyCartCaught && hasValidStatuses;
    report.tests.orderService = {
      passed: orderPassed,
      emptyCartGuard: emptyCartCaught,
      statusLifecycle: hasValidStatuses
    };
    Logger.log('  -> OrderService Guards: ' + (orderPassed ? '[PASSED]' : '[FAILED]'));
    if (!orderPassed) report.allPassed = false;
  } catch (e3) {
    report.tests.orderService = { passed: false, error: e3.message };
    report.allPassed = false;
    Logger.log('  -> OrderService Guards: [FAILED] ' + e3.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR COMMERCE TESTS: ' + (report.allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'));
  Logger.log('=================================================================');

  return report;
}
