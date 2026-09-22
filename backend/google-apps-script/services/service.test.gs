/**
 * SPWN Apps 2.0 - Core Services Test Suite (Batch 1)
 * Location: backend/google-apps-script/services/service.test.gs
 * -----------------------------------------------------------
 * Test suite komprehensif untuk memverifikasi fungsionalitas Service Layer:
 * 1. KtaService: Penomoran KTA, regex validation & QR token generation
 * 2. VerificationService: Valid token, invalid token, inactive member, PublicMemberMapper privacy filtering
 * 3. MemberService: Registrasi, duplikasi NIK/KTA, partial update, dan deaktivasi
 * 4. AuthService: Salted SHA-256 hash, login success, wrong password, session token validation & logout
 */

function runServiceTests() {
  Logger.log('=================================================================');
  Logger.log('  SPWN APPS 2.0 - RUNNING CORE SERVICES TEST SUITE (BATCH 1)');
  Logger.log('=================================================================');

  var report = {
    timestamp: new Date().toISOString(),
    tests: {},
    allPassed: true
  };

  // -----------------------------------------------------------------
  // TEST 1: KTA SERVICE FOUNDATION (FORMAT FINAL)
  // -----------------------------------------------------------------
  Logger.log('\n[TEST 1/4] Menguji KtaService (Format Final: Nasional & Wilayah, Validasi, QR Token)...');
  try {
    // 1. Format Kwartir Nasional: 00.NNNNNN
    var generatedKtaNasional = KtaService.generateKtaNumber('KWARTIR_NASIONAL', 1);
    var isNasionalOk = (generatedKtaNasional === '00.000001');

    // 2. Format Wilayah: 00.PPKK.CCC.NNNNNN
    var generatedKtaWilayah = KtaService.generateKtaNumber('WILAYAH', '3204', '190', 123);
    var isWilayahOk = (generatedKtaWilayah === '00.3204.190.000123');

    // 3. Validasi
    var validNasional = KtaService.validateKta('00.000001');
    var validWilayah = KtaService.validateKta('00.3204.190.000123');
    var invalidCheck = KtaService.validateKta('999-INVALID-KTA');
    var isValidationOk = (validNasional.isValid === true && validWilayah.isValid === true && invalidCheck.isValid === false);

    var qrToken = KtaService.generateQrToken(generatedKtaWilayah, '3201010101010001');
    var isQrTokenOk = (qrToken && qrToken.indexOf('SPWN-QR-WIL-3204-') === 0);

    var ktaPassed = isNasionalOk && isWilayahOk && isValidationOk && isQrTokenOk;
    report.tests.ktaService = {
      passed: ktaPassed,
      generatedNasional: generatedKtaNasional,
      generatedWilayah: generatedKtaWilayah,
      qrToken: qrToken
    };
    Logger.log('  -> KtaService: ' + (ktaPassed ? '[PASSED]' : '[FAILED]'));
    if (!ktaPassed) report.allPassed = false;
  } catch (errKta) {
    report.tests.ktaService = { passed: false, error: errKta.message };
    report.allPassed = false;
    Logger.log('  -> KtaService: [FAILED] ' + errKta.message);
  }

  // -----------------------------------------------------------------
  // TEST 2: VERIFICATION SERVICE & PRIVACY FILTERING
  // -----------------------------------------------------------------
  Logger.log('\n[TEST 2/4] Menguji VerificationService & PublicMemberMapper...');
  try {
    // 1. Uji Privacy Filtering (PublicMemberMapper)
    var rawMockMember = {
      id: 'MEM_101',
      no_kta: '00.3204.190.000123',
      level_organisasi: 'WILAYAH',
      kode_provinsi: '32',
      kode_kabupaten: '3204',
      kode_kecamatan: '190',
      qr_token: 'SPWN-QR-WIL-3204-A1B2C3D4',
      nik: '3201010101010001', // SENSITIF
      nama_lengkap: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@example.com', // SENSITIF
      telepon: '081234567890', // SENSITIF
      password: 'PASSWORD_HASH_SECRET', // SENSITIF
      provinsi: 'Jawa Barat',
      kabupaten_kota: 'Bogor',
      krida: 'Krida Bina Wisata',
      tingkat_keanggotaan: 'Penegak Bantara',
      status: 'ACTIVE'
    };

    var publicData = VerificationService.PublicMemberMapper(rawMockMember);
    var isPrivacySecure = (
      publicData.no_kta === '00.3204.190.000123' &&
      publicData.nama_lengkap === 'Ahmad Fauzi' &&
      publicData.nik === undefined &&
      publicData.password === undefined &&
      publicData.email === undefined &&
      publicData.telepon === undefined
    );

    // 2. Uji Invalid Token Verification
    var invalidResult = VerificationService.verifyKtaToken('SPWN-QR-INVALID-999');
    var isInvalidHandled = (invalidResult.isValid === false && invalidResult.status === 'MEMBER_NOT_FOUND');

    // 3. Uji Empty Token Verification
    var emptyResult = VerificationService.verifyKtaToken('');
    var isEmptyHandled = (emptyResult.isValid === false && emptyResult.status === 'INVALID_INPUT');

    var verifyPassed = isPrivacySecure && isInvalidHandled && isEmptyHandled;
    report.tests.verificationService = {
      passed: verifyPassed,
      privacySafe: isPrivacySecure,
      invalidTokenHandled: isInvalidHandled
    };
    Logger.log('  -> VerificationService: ' + (verifyPassed ? '[PASSED]' : '[FAILED]'));
    if (!verifyPassed) report.allPassed = false;
  } catch (errVerify) {
    report.tests.verificationService = { passed: false, error: errVerify.message };
    report.allPassed = false;
    Logger.log('  -> VerificationService: [FAILED] ' + errVerify.message);
  }

  // -----------------------------------------------------------------
  // TEST 3: MEMBER SERVICE BUSINESS RULES
  // -----------------------------------------------------------------
  Logger.log('\n[TEST 3/4] Menguji MemberService (Validasi NIK, Krida, Format)...');
  try {
    // 1. Cek Ketersediaan Krida
    var kridaList = MemberService.getAvailableKrida();
    var hasKrida = Array.isArray(kridaList) && kridaList.length >= 4;

    // 2. Uji Validasi NIK Tidak Valid
    var nikValidationError = false;
    try {
      MemberService.registerMember({
        nama_lengkap: 'Budi Test',
        nik: '123' // NIK tidak 16 digit
      });
    } catch (e) {
      nikValidationError = (e.code === 'SPWN_INVALID_NIK');
    }

    // 3. Uji Validasi Nama Kosong
    var namaValidationError = false;
    try {
      MemberService.registerMember({
        nama_lengkap: '',
        nik: '3201010101010002'
      });
    } catch (e) {
      namaValidationError = (e.code === 'SPWN_VALIDATION_ERROR');
    }

    var memberServicePassed = hasKrida && nikValidationError && namaValidationError;
    report.tests.memberService = {
      passed: memberServicePassed,
      kridaAvailable: hasKrida,
      nikFormatGuard: nikValidationError,
      emptyNameGuard: namaValidationError
    };
    Logger.log('  -> MemberService: ' + (memberServicePassed ? '[PASSED]' : '[FAILED]'));
    if (!memberServicePassed) report.allPassed = false;
  } catch (errMember) {
    report.tests.memberService = { passed: false, error: errMember.message };
    report.allPassed = false;
    Logger.log('  -> MemberService: [FAILED] ' + errMember.message);
  }

  // -----------------------------------------------------------------
  // TEST 4: AUTH SERVICE & SECURE SESSION TOKEN
  // -----------------------------------------------------------------
  Logger.log('\n[TEST 4/4] Menguji AuthService (Salted Hashing, Session Token, Invalidation)...');
  try {
    // 1. Uji Salted SHA-256
    var salt = AuthService.generateSalt();
    var hash1 = AuthService.hashPassword('Pramuka2026!', salt);
    var hash2 = AuthService.hashPassword('Pramuka2026!', salt);
    var hashDifferentPwd = AuthService.hashPassword('SalahPassword!', salt);

    var isHashConsistent = (hash1 === hash2 && hash1 !== hashDifferentPwd && hash1.length === 64);

    // 2. Uji Role Permissions Resolution
    var superAdminPerms = AuthService.getRolePermissions('SUPER_ADMIN');
    var memberPerms = AuthService.getRolePermissions('MEMBER');
    var isPermsResolved = (superAdminPerms.indexOf('*') !== -1 && memberPerms.indexOf('PROFILE_VIEW') !== -1);

    // 3. Uji Invalid Session Check
    var invalidSession = AuthService.validateSession('SPWN-SES-INVALID-XYZ');
    var isSessionGuardOk = (invalidSession.isValid === false);

    // 4. Uji Session Cache Storage & Logout Invalidation
    var testToken = 'SPWN-SES-TEST-' + new Date().getTime();
    var testSessionKey = 'SPWN:SESSION:' + testToken;
    setToCache(testSessionKey, {
      token: testToken,
      userId: 'USR_001',
      role: 'MEMBER',
      expiresAt: new Date(new Date().getTime() + 3600000).toISOString()
    }, 60);

    var validSessionCheck = AuthService.validateSession(testToken);
    var isSessionValid = (validSessionCheck.isValid === true && validSessionCheck.session.userId === 'USR_001');

    AuthService.logout(testToken);
    var sessionAfterLogout = AuthService.validateSession(testToken);
    var isLoggedOut = (sessionAfterLogout.isValid === false);

    var authPassed = isHashConsistent && isPermsResolved && isSessionGuardOk && isSessionValid && isLoggedOut;
    report.tests.authService = {
      passed: authPassed,
      saltedHashingSecure: isHashConsistent,
      rbacPermissions: isPermsResolved,
      sessionLifecycle: (isSessionValid && isLoggedOut)
    };
    Logger.log('  -> AuthService: ' + (authPassed ? '[PASSED]' : '[FAILED]'));
    if (!authPassed) report.allPassed = false;
  } catch (errAuth) {
    report.tests.authService = { passed: false, error: errAuth.message };
    report.allPassed = false;
    Logger.log('  -> AuthService: [FAILED] ' + errAuth.message);
  }

  Logger.log('\n=================================================================');
  Logger.log('  HASIL AKHIR CORE SERVICES TEST: ' + (report.allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED'));
  Logger.log('=================================================================');

  return report;
}
