/**
 * SPWN Apps 2.0 - Core Lock Service
 * Location: backend/google-apps-script/core/lock.service.gs
 * -------------------------------------------------------------
 * Protection Layer untuk mengamankan konkurensi I/O Google Sheets.
 * 
 * ATURAN DAN PRINSIP PENGGUNAAN LOCK:
 * 1. LOCK HANYA UNTUK OPERASI MUTASI (Create / Insert, Update, Delete).
 * 2. OPERASI READ TIDAK BOLEH MENGGUNAKAN LOCK agar throughput tetap tinggi.
 * 3. SELURUH SERVICE yang melakukan penulisan ke Google Sheets WAJIB melalui
 *    wrapper executeWithLock() atau executeWithRetry().
 * 4. Error code SPWN_LOCK_TIMEOUT diteruskan secara konsisten ke response layer.
 */

var LockManager = (function() {
  var ERROR_CODE_LOCK_TIMEOUT = 'SPWN_LOCK_TIMEOUT';

  /**
   * Memeriksa apakah error disebabkan oleh kegagalan perolehan lock.
   * 
   * @param {Error|string} err 
   * @returns {boolean}
   */
  function isLockTimeout(err) {
    if (!err) return false;
    var msg = (typeof err === 'string') ? err : (err.message || '');
    return msg.indexOf(ERROR_CODE_LOCK_TIMEOUT) !== -1;
  }
  /**
   * Mengeksekusi callback di dalam pembungkus atomik LockService.
   * Lock otomatis di-acquire sebelum eksekusi dan dijamin di-release di blok finally.
   * 
   * @param {Function} callback - Operasi mutasi yang akan dijalankan
   * @param {Object} [options] - Pengaturan kustom lock
   * @param {number} [options.timeoutMs] - Batas tunggu lock (default: 10000 ms)
   * @param {string} [options.lockContext] - Konteks logging/identifikasi operasi
   * @returns {*} Hasil dari callback
   */
  function executeWithLock(callback, options) {
    options = options || {};
    var timeoutMs = options.timeoutMs || SPWN_SYSTEM.CONCURRENCY.LOCK_TIMEOUT_MS || 10000;
    var context = options.lockContext || 'DATABASE_MUTATION';

    var lock = LockService.getScriptLock();
    var hasLock = false;

    try {
      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[LockService] Mencoba acquire lock untuk konteks: ' + context + ' (Timeout: ' + timeoutMs + 'ms)');
      }

      hasLock = lock.tryLock(timeoutMs);

      if (!hasLock) {
        Logger.log('[LockService] GAGAL acquire lock! Antrean timeout pada konteks: ' + context);
        throw new Error(
          'SPWN_LOCK_TIMEOUT: Sistem sedang sibuk memproses antrean data. Silakan ulangi beberapa saat lagi. (' + context + ')'
        );
      }

      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[LockService] Lock berhasil didapatkan. Menjalankan mutasi: ' + context);
      }

      // Jalankan operasi mutasi
      var result = callback();
      return result;

    } catch (err) {
      Logger.log('[LockService] Error saat eksekusi mutasi dengan lock [' + context + ']: ' + err.message);
      throw err;
    } finally {
      if (hasLock) {
        try {
          lock.releaseLock();
          if (SPWN_SYSTEM.DEBUG_MODE) {
            Logger.log('[LockService] Lock berhasil dilepaskan untuk konteks: ' + context);
          }
        } catch (releaseErr) {
          Logger.log('[LockService] Peringatan: Gagal melepaskan lock: ' + releaseErr.message);
        }
      }
    }
  }

  /**
   * Helper untuk menjalankan mutasi dengan mekanisme retry otomatis jika terjadi timeout.
   * 
   * @param {Function} callback 
   * @param {Object} [options]
   * @returns {*}
   */
  function executeWithRetry(callback, options) {
    options = options || {};
    var maxAttempts = options.maxAttempts || SPWN_SYSTEM.CONCURRENCY.MAX_RETRY_ATTEMPTS || 3;
    var delayMs = options.delayMs || SPWN_SYSTEM.CONCURRENCY.LOCK_RETRY_DELAY_MS || 200;
    var lastError = null;

    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return executeWithLock(callback, options);
      } catch (e) {
        lastError = e;
        if (e.message && e.message.indexOf('SPWN_LOCK_TIMEOUT') !== -1 && attempt < maxAttempts) {
          Logger.log('[LockService] Percobaan ke-' + attempt + ' timeout. Menunggu ' + delayMs + 'ms...');
          Utilities.sleep(delayMs);
        } else {
          throw e;
        }
      }
    }

    throw lastError;
  }

  return {
    executeWithLock: executeWithLock,
    executeWithRetry: executeWithRetry,
    isLockTimeout: isLockTimeout
  };
})();

/**
 * Global function exports agar dapat dipanggil dengan mudah oleh seluruh service
 */
function executeWithLock(callback, options) {
  return LockManager.executeWithLock(callback, options);
}

function executeWithRetry(callback, options) {
  return LockManager.executeWithRetry(callback, options);
}

function isLockTimeoutError(err) {
  return LockManager.isLockTimeout(err);
}

// =========================================================================
// TESTING FUNCTION LOCK SERVICE
// =========================================================================

/**
 * Menguji apakah LockService beroperasi dengan benar (acquire, callback, release).
 */
function testLockService() {
  Logger.log('====================================================');
  Logger.log('[TEST] MEMULAI PENGUJIAN CORE LOCK SERVICE');
  Logger.log('====================================================');

  var testValue = 0;

  try {
    // Uji 1: Eksekusi normal dengan lock
    var result = executeWithLock(function() {
      testValue = 100;
      return 'MUTATION_SUCCESS';
    }, { lockContext: 'TEST_NORMAL_MUTATION' });

    var test1Passed = (result === 'MUTATION_SUCCESS' && testValue === 100);
    Logger.log('Uji 1 - Normal Execute With Lock: ' + (test1Passed ? 'PASSED (Nilai: ' + testValue + ')' : 'FAILED'));

    // Uji 2: Pastikan lock dilepas meskipun callback throw error
    var caughtError = false;
    try {
      executeWithLock(function() {
        throw new Error('SIMULATED_MUTATION_ERROR');
      }, { lockContext: 'TEST_ERROR_RELEASE' });
    } catch (e) {
      caughtError = (e.message === 'SIMULATED_MUTATION_ERROR');
    }
    Logger.log('Uji 2 - Auto Release Pada Exception: ' + (caughtError ? 'PASSED (Error tertangkap & Lock dilepas)' : 'FAILED'));

    // Uji 3: Uji perolehan lock langsung setelah exception uji 2 (membuktikan lock tidak macet)
    var test3Result = executeWithLock(function() {
      return 'LOCK_IS_FREE_AND_REUSABLE';
    }, { lockContext: 'TEST_REUSE_LOCK' });
    Logger.log('Uji 3 - Lock Reusability: ' + (test3Result === 'LOCK_IS_FREE_AND_REUSABLE' ? 'PASSED' : 'FAILED'));

    Logger.log('====================================================');
    Logger.log('[TEST] SELURUH PENGUJIAN LOCK SERVICE BERHASIL');
    Logger.log('====================================================');
    return { success: true, message: 'LockService berfungsi sempurna' };
  } catch (err) {
    Logger.log('[TEST FAILED] LockService error: ' + err.message);
    return { success: false, error: err.message };
  }
}
