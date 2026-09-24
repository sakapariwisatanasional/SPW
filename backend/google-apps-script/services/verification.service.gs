/**
 * SPWN Apps 2.0 - KTA Verification & Public Identity Service
 * Location: backend/google-apps-script/services/verification.service.gs
 * -------------------------------------------------------------------
 * Layanan verifikasi keabsahan KTA Digital publik dengan perlindungan privasi ketat (UU PDP).
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - services/kta.service.gs (KtaService)
 * - core/cache.service.gs (CacheManager, generateCacheKey)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * FUNGSI UTAMA:
 * 1. verifyKtaToken(tokenOrNoKta, clientMeta) -> Verifikasi token QR / No KTA dengan proteksi rate limit
 * 2. PublicMemberMapper(member) -> Filter data publik (menghilangkan NIK, Password, Kontak Privat)
 * 3. AdminMemberMapper(member, role) -> Mapper data internal untuk pengurus berwenang
 * 4. getVerificationStats() -> Metrik agregat verifikasi KTA
 */

var VerificationService = (function() {
  var _memberRepo = null;
  var _logRepo = null;
  var _qrLogRepo = null;

  function _getMemberRepo() {
    if (!_memberRepo) {
      _memberRepo = SpreadsheetRepository.create('MEMBER', 'ANGGOTA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _memberRepo;
  }

  function _getLogRepo() {
    if (!_logRepo) {
      _logRepo = SpreadsheetRepository.create('MEMBER', 'LOG_VERIFIKASI', {
        primaryKey: 'id'
      });
    }
    return _logRepo;
  }

  function _getQrLogRepo() {
    if (!_qrLogRepo) {
      _qrLogRepo = SpreadsheetRepository.create('MEMBER', 'QR_VERIFICATION_LOG', {
        primaryKey: 'id'
      });
    }
    return _qrLogRepo;
  }

  /**
   * Data Protection Mapper untuk Tampilan Publik (Mendelegasikan ke MemberMapper)
   */
  function PublicMemberMapper(rawMember) {
    return MemberMapper.toPublic(rawMember);
  }

  /**
   * Data Mapper untuk Admin / Pengurus dengan Izin Khusus (Mendelegasikan ke MemberMapper)
   */
  function AdminMemberMapper(rawMember, role) {
    return MemberMapper.toAdmin(rawMember, role);
  }

  /**
   * Pemeriksaan Rate Limit Verifikasi untuk mencegah brute-force scanning token.
   * Maksimal 30 permintaan per menit per IP / Client Identifier.
   * 
   * @param {string} clientIdentifier 
   * @returns {boolean} true jika diizinkan, false jika limit terlampaui
   */
  function _checkRateLimit(clientIdentifier) {
    if (!clientIdentifier) clientIdentifier = 'ANON_CLIENT';

    var rateLimitKey = 'SPWN:RATELIMIT:VERIFY:' + clientIdentifier;
    var currentCount = getFromCache(rateLimitKey);

    if (currentCount === null) {
      setToCache(rateLimitKey, 1, 60); // 1 menit window
      return true;
    }

    if (currentCount >= 30) {
      return false; // Limit terlampaui
    }

    setToCache(rateLimitKey, currentCount + 1, 60);
    return true;
  }

  /**
   * Mencatat riwayat pemindaian ke sheet QR_Verification_Log dengan SHA-256 Hashing.
   * Token asli DILARANG disimpan pada log audit demi keamanan.
   * 
   * @param {string} queryToken 
   * @param {string} memberId 
   * @param {string} statusResult 
   * @param {Object} [clientMeta] 
   */
  function _logVerificationAttempt(queryToken, memberId, statusResult, clientMeta) {
    try {
      clientMeta = clientMeta || {};
      
      // Hitung SHA-256 hash dari token (Zero Raw Token Storage)
      var hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, queryToken || '', Utilities.Charset.UTF_8);
      var tokenHash = '';
      for (var i = 0; i < hashBytes.length; i++) {
        var byteVal = (hashBytes[i] < 0) ? (hashBytes[i] + 256) : hashBytes[i];
        tokenHash += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
      }

      _getQrLogRepo().insert({
        id: 'QLOG-' + Utilities.getUuid().substring(0, 8),
        member_id: memberId || '',
        qr_token_hash: tokenHash,
        scan_time: new Date().toISOString(),
        device: clientMeta.userAgent || clientMeta.device || 'BROWSER',
        ip: clientMeta.ip || '0.0.0.0',
        result: statusResult
      });
    } catch (e) {
      if (SPWN_SYSTEM.DEBUG_MODE) {
        Logger.log('[VerificationService] Gagal menulis QR_Verification_Log: ' + e.message);
      }
    }
  }

  /**
   * Verifikasi Keabsahan KTA Digital.
   * 
   * KEBIJAKAN KEAMANAN:
   * 1. Public Endpoint: QR Token adalah identitas primer wajib (mencegah enumerasi/tebakan nomor KTA).
   * 2. Internal / Admin Fallback: Verifikasi nomor KTA hanya diizinkan bila isInternal === true.
   * 
   * @param {string} tokenOrNoKta - QR Token atau Nomor KTA yang dipindai
   * @param {Object} [clientMeta] - Metadata klien (ip, userAgent) untuk rate limit & audit log
   * @param {boolean} [isInternal=false] - Flag hak akses internal/admin
   * @returns {{ isValid: boolean, status: string, member: Object|null, message: string, verifiedAt: string }}
   */
   function verifyKtaToken(tokenOrNoKta, clientMeta, isInternal) {
     var nowIso = new Date().toISOString();
     clientMeta = clientMeta || {};
     isInternal = (isInternal === true);

     if (!tokenOrNoKta || typeof tokenOrNoKta !== 'string') {
       return {
         isValid: false,
         status: 'INVALID_INPUT',
         member: null,
         message: 'Token verifikasi KTA wajib disertakan.',
         verifiedAt: nowIso
       };
     }

     var cleanInput = tokenOrNoKta.trim();

     // 1. Periksa Rate Limit Klien
     var clientId = clientMeta.ip || clientMeta.deviceId || 'PUBLIC_DEVICE';
     if (!_checkRateLimit(clientId)) {
       return {
         isValid: false,
         status: 'RATE_LIMIT_EXCEEDED',
         member: null,
         message: 'Terlalu banyak permintaan verifikasi. Silakan tunggu 1 menit.',
         verifiedAt: nowIso
       };
     }

     var memberRepo = _getMemberRepo();
     var matchedMember = null;
     var searchMethod = '';

     // 2. PRIORITAS UTAMA (PUBLIC & INTERNAL): Pencarian berdasarkan QR Token
     matchedMember = memberRepo.findOne(function(item) {
       var qrVal = item.qr_token || item.verification_token;
       return (qrVal && qrVal.toString().trim() === cleanInput);
     });

     if (matchedMember) {
       searchMethod = 'QR_TOKEN';
     } else if (isInternal) {
       // 3. INTERNAL FALLBACK ONLY: Pencarian No KTA hanya untuk admin/internal
       var ktaValidation = KtaService.validateKta(cleanInput);
       if (ktaValidation.isValid) {
         matchedMember = memberRepo.findOne(function(item) {
           var ktaVal = item.no_kta || item.nomor_anggota;
           return (ktaVal && ktaVal.toString().trim() === cleanInput);
         });
         if (matchedMember) {
           searchMethod = 'NO_KTA_INTERNAL';
         }
       }
     }

    // 4. Kasus: Data Anggota Tidak Ditemukan
    if (!matchedMember) {
      _logVerificationAttempt(cleanInput, '', 'NOT_FOUND', clientMeta);
      return {
        isValid: false,
        status: 'MEMBER_NOT_FOUND',
        member: null,
        message: 'Identitas Anggota tidak terdaftar dalam sistem resmi SAKA Pariwisata.',
        verifiedAt: nowIso
      };
    }

    // 5. Kasus: Anggota Ditemukan Namun Status Tidak Aktif / Dikeluarkan
    var memberStatus = (matchedMember.status || 'ACTIVE').toUpperCase();
    if (memberStatus !== 'ACTIVE') {
      _logVerificationAttempt(cleanInput, matchedMember.no_kta, memberStatus, clientMeta);
      return {
        isValid: false,
        status: 'MEMBER_' + memberStatus,
        member: PublicMemberMapper(matchedMember),
        message: 'Kartu Tanda Anggota ditemukan, namun status saat ini adalah: ' + memberStatus,
        verifiedAt: nowIso
      };
    }

    // 6. Kasus: Pengecekan Masa Berlaku (Jika Berlaku Tanggal Kadaluarsa)
    if (matchedMember.valid_until && matchedMember.valid_until !== 'SEUMUR_HIDUP') {
      var expDate = new Date(matchedMember.valid_until);
      if (!isNaN(expDate.getTime()) && expDate < new Date()) {
        _logVerificationAttempt(cleanInput, matchedMember.no_kta, 'EXPIRED', clientMeta);
        return {
          isValid: false,
          status: 'KTA_EXPIRED',
          member: PublicMemberMapper(matchedMember),
          message: 'Masa berlaku KTA telah habis pada ' + matchedMember.valid_until,
          verifiedAt: nowIso
        };
      }
    }

    // 7. Kasus: Verifikasi Berhasil (Valid & Aktif)
    _logVerificationAttempt(cleanInput, matchedMember.id || matchedMember.no_kta, 'VALID_ACTIVE', clientMeta);

    // Update scan count dan qr_last_verified_at pada data anggota
    try {
      var currentScanCount = parseInt(matchedMember.qr_scan_count || 0, 10);
      _getMemberRepo().update(matchedMember.id, {
        qr_scan_count: currentScanCount + 1,
        qr_last_verified_at: nowIso
      });
    } catch (e) {
      // Non-blocking jika update statistik scan gagal
    }

    return {
      isValid: true,
      status: 'VERIFIED',
      member: PublicMemberMapper(matchedMember),
      verificationMethod: searchMethod,
      message: 'KTA Resmi dan Aktif di SAKA Pariwisata Network.',
      verifiedAt: nowIso
    };
  }

  function verifyQrToken(token, clientMeta) {
    return verifyKtaToken(token, clientMeta, false);
  }

  function verifyByNoKta(noKta, role, clientMeta) {
    return verifyKtaToken(noKta, clientMeta, true);
  }

  return {
    PublicMemberMapper: PublicMemberMapper,
    AdminMemberMapper: AdminMemberMapper,
    verifyKtaToken: verifyKtaToken,
    verifyQrToken: verifyQrToken,
    verifyByNoKta: verifyByNoKta
  };
})();
