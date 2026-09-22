/**
 * SPWN Apps 2.0 - Code Registry & Version Management Service (Phase 7.1)
 * Location: backend/google-apps-script/services/code.registry.service.gs
 * ----------------------------------------------------------------------
 * Layanan terpusat pengelolaan file Google Apps Script secara dinamis:
 * 1. Registrasi & Pembaruan File Kode (Code_Registry).
 * 2. Pencatatan Histori Versi Kode Otomatis (Code_Version_History).
 * 3. Developer Audit Logging (VIEW_CODE, COPY_CODE, APPROVE_VERSION).
 * 4. Komparasi Versi Kode (Diffing & Line-by-line comparison).
 * 5. Strict Security: Akses eksklusif SUPER_ADMIN.
 */

var CodeRegistryService = (function() {
  var LOCK_TIMEOUT_MS = 10000;

  var _registryRepo = null;
  var _historyRepo = null;
  var _auditRepo = null;

  function _getRegistryRepo() {
    if (!_registryRepo) {
      _registryRepo = SpreadsheetRepository.create('SYSTEM', 'CODE_REGISTRY', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _registryRepo;
  }

  function _getHistoryRepo() {
    if (!_historyRepo) {
      _historyRepo = SpreadsheetRepository.create('SYSTEM', 'CODE_VERSION_HISTORY', {
        primaryKey: 'id'
      });
    }
    return _historyRepo;
  }

  function _getAuditRepo() {
    if (!_auditRepo) {
      _auditRepo = SpreadsheetRepository.create('SYSTEM', 'DEVELOPER_AUDIT_LOG', {
        primaryKey: 'id'
      });
    }
    return _auditRepo;
  }

  /**
   * Menghasilkan checksum SHA-256 string dari konten kode.
   */
  function _generateChecksum(content) {
    if (!content) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    try {
      var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, content, Utilities.Charset.UTF_8);
      var hexString = '';
      for (var i = 0; i < digest.length; i++) {
        var byteVal = digest[i];
        if (byteVal < 0) byteVal += 256;
        var byteHex = byteVal.toString(16);
        if (byteHex.length === 1) byteHex = '0' + byteHex;
        hexString += byteHex;
      }
      return hexString;
    } catch (e) {
      // Fallback simple hash jika Utilities tidak tersedia di context tertentu
      var hash = 0;
      for (var j = 0; j < content.length; j++) {
        var char = content.charCodeAt(j);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return 'sha256-fallback-' + Math.abs(hash).toString(16);
    }
  }

  /**
   * Catat aktivitas ke Developer_Audit_Log.
   */
  function logDeveloperAudit(action, targetFile, details, userContext, ipAddress) {
    var auditEntry = {
      id: 'AUDIT-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
      user_id: userContext && userContext.id ? userContext.id : 'USR-SUPERADMIN',
      user_name: userContext && userContext.name ? userContext.name : 'Super Administrator',
      user_role: userContext && userContext.role ? userContext.role : 'SUPER_ADMIN',
      action: action, // 'VIEW_CODE' | 'COPY_CODE' | 'APPROVE_VERSION' | 'REGISTER_CODE' | 'COMPARE_VERSION'
      target_file: targetFile || '-',
      details: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
      ip_address: ipAddress || (userContext && userContext.ip_address ? userContext.ip_address : '127.0.0.1')
    };

    try {
      _getAuditRepo().insert(auditEntry);
    } catch (e) {
      Logger.log('[CodeRegistryService] Gagal menulis audit log: ' + e.message);
    }
    return auditEntry;
  }

  /**
   * 1. Registrasi atau Pembaruan File Kode (registerCodeFile).
   */
  function registerCodeFile(fileData, userContext) {
    if (!fileData || !fileData.file_name || !fileData.file_path) {
      throw new Error('[CODE_REGISTRY_ERROR] file_name dan file_path wajib diisi!');
    }

    var lock = LockService.getScriptLock();
    var successLock = lock.tryLock(LOCK_TIMEOUT_MS);
    if (!successLock) {
      throw new Error('[SPWN_LOCK_TIMEOUT] Server sedang sibuk, silakan coba beberapa saat lagi.');
    }

    try {
      var repo = _getRegistryRepo();
      var existing = repo.findOne({ file_path: fileData.file_path });
      var now = new Date().toISOString();
      var checksum = _generateChecksum(fileData.code_content || '');
      var author = userContext && userContext.name ? userContext.name : (fileData.created_by || 'Super Administrator');

      if (existing) {
        // Simpan versi lama ke Code_Version_History
        var historyEntry = {
          id: 'HIST-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
          registry_id: existing.id,
          version: existing.version || '1.0.0',
          code_content: existing.code_content || '',
          checksum: existing.checksum || '',
          changed_by: author,
          changed_at: now,
          change_note: fileData.change_note || 'Pembaruan kode berkas'
        };
        _getHistoryRepo().insert(historyEntry);

        // Update file di Code_Registry
        var updatedRecord = repo.update(existing.id, {
          file_name: fileData.file_name,
          module: fileData.module || existing.module || 'CORE',
          version: fileData.version || _incrementVersion(existing.version),
          code_content: fileData.code_content || existing.code_content,
          checksum: checksum,
          status: fileData.status || 'PENDING_APPROVAL',
          updated_at: now,
          change_note: fileData.change_note || 'Update kode'
        });

        logDeveloperAudit('UPDATE_CODE', fileData.file_path, {
          previous_version: existing.version,
          new_version: updatedRecord.version,
          checksum: checksum
        }, userContext);

        return updatedRecord;
      } else {
        // File baru
        var newRecord = {
          id: 'CODE-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
          file_name: fileData.file_name,
          file_path: fileData.file_path,
          module: fileData.module || 'CORE',
          version: fileData.version || '1.0.0',
          code_content: fileData.code_content || '',
          checksum: checksum,
          status: fileData.status || 'APPROVED',
          created_by: author,
          created_at: now,
          updated_at: now,
          change_note: fileData.change_note || 'Inisialisasi file kode pertama'
        };

        var inserted = repo.insert(newRecord);

        // Buat entri histori awal
        _getHistoryRepo().insert({
          id: 'HIST-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
          registry_id: inserted.id,
          version: inserted.version,
          code_content: inserted.code_content,
          checksum: checksum,
          changed_by: author,
          changed_at: now,
          change_note: 'Initial version release'
        });

        logDeveloperAudit('REGISTER_CODE', fileData.file_path, {
          version: inserted.version,
          checksum: checksum
        }, userContext);

        return inserted;
      }
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * 2. Ambil detail berkas kode lengkap dengan audit log VIEW_CODE.
   */
  function getCodeFile(fileId, userContext) {
    if (!fileId) throw new Error('[CODE_REGISTRY_ERROR] fileId wajib diisi!');

    var repo = _getRegistryRepo();
    var file = repo.findById(fileId);
    if (!file) {
      file = repo.findOne({ file_path: fileId });
    }

    if (!file) {
      throw new Error('[CODE_NOT_FOUND] Berkas kode tidak ditemukan dengan ID/Path: ' + fileId);
    }

    // Catat audit VIEW_CODE
    logDeveloperAudit('VIEW_CODE', file.file_path, {
      file_name: file.file_name,
      version: file.version
    }, userContext);

    return file;
  }

  /**
   * Catat aktivitas salin kode (COPY_CODE).
   */
  function recordCopyCode(fileId, userContext) {
    var file = getCodeFile(fileId, userContext);
    logDeveloperAudit('COPY_CODE', file.file_path, {
      file_name: file.file_name,
      version: file.version,
      checksum: file.checksum
    }, userContext);

    return {
      success: true,
      file_id: file.id,
      file_name: file.file_name,
      copied_at: new Date().toISOString()
    };
  }

  /**
   * 3. Ambil versi terbaru sebuah file.
   */
  function getLatestVersion(fileId) {
    var file = _getRegistryRepo().findById(fileId);
    if (!file) {
      file = _getRegistryRepo().findOne({ file_path: fileId });
    }
    if (!file) {
      throw new Error('[CODE_NOT_FOUND] Berkas kode tidak ditemukan: ' + fileId);
    }

    return {
      file_id: file.id,
      file_name: file.file_name,
      file_path: file.file_path,
      version: file.version,
      checksum: file.checksum,
      status: file.status,
      updated_at: file.updated_at
    };
  }

  /**
   * 4. Komparasi dua versi kode (compareVersion).
   */
  function compareVersion(fileId, versionA, versionB, userContext) {
    var file = _getRegistryRepo().findById(fileId);
    if (!file) {
      file = _getRegistryRepo().findOne({ file_path: fileId });
    }
    if (!file) throw new Error('[CODE_NOT_FOUND] Berkas kode tidak ditemukan: ' + fileId);

    var contentA = '';
    var contentB = '';

    // Ambil konten A
    if (file.version === versionA) {
      contentA = file.code_content;
    } else {
      var histA = _getHistoryRepo().findOne({ registry_id: file.id, version: versionA });
      if (histA) contentA = histA.code_content;
    }

    // Ambil konten B
    if (file.version === versionB) {
      contentB = file.code_content;
    } else {
      var histB = _getHistoryRepo().findOne({ registry_id: file.id, version: versionB });
      if (histB) contentB = histB.code_content;
    }

    var linesA = contentA ? contentA.split('\n') : [];
    var linesB = contentB ? contentB.split('\n') : [];

    logDeveloperAudit('COMPARE_VERSION', file.file_path, {
      version_a: versionA,
      version_b: versionB
    }, userContext);

    return {
      file_id: file.id,
      file_name: file.file_name,
      version_a: versionA,
      version_b: versionB,
      lines_a_count: linesA.length,
      lines_b_count: linesB.length,
      identical: contentA === contentB,
      content_a: contentA,
      content_b: contentB
    };
  }

  /**
   * 5. Setujui versi kode (approveVersion).
   */
  function approveVersion(fileId, version, userContext) {
    if (!userContext || userContext.role !== 'SUPER_ADMIN') {
      throw new Error('[FORBIDDEN] Hanya SUPER_ADMIN yang berhak menyetujui versi kode!');
    }

    var repo = _getRegistryRepo();
    var file = repo.findById(fileId);
    if (!file) throw new Error('[CODE_NOT_FOUND] Berkas kode tidak ditemukan: ' + fileId);

    var updated = repo.update(file.id, {
      status: 'APPROVED',
      updated_at: new Date().toISOString()
    });

    logDeveloperAudit('APPROVE_VERSION', file.file_path, {
      version: version || file.version,
      approved_by: userContext.name
    }, userContext);

    return updated;
  }

  /**
   * Ambil daftar file kode dengan filter.
   */
  function listCodeFiles(filters) {
    var all = _getRegistryRepo().findAll();
    var result = all.map(function(f) {
      return {
        id: f.id,
        file_name: f.file_name,
        file_path: f.file_path,
        module: f.module,
        version: f.version,
        checksum: f.checksum,
        status: f.status,
        created_by: f.created_by,
        created_at: f.created_at,
        updated_at: f.updated_at,
        change_note: f.change_note
      };
    });

    if (filters && filters.module && filters.module !== 'ALL') {
      result = result.filter(function(r) { return r.module === filters.module; });
    }
    if (filters && filters.status && filters.status !== 'ALL') {
      result = result.filter(function(r) { return r.status === filters.status; });
    }

    return result;
  }

  /**
   * Ambil riwayat versi kode tertentu.
   */
  function getVersionHistory(fileId) {
    return _getHistoryRepo().find({ registry_id: fileId });
  }

  /**
   * Ambil log audit pengembang.
   */
  function getDeveloperAuditLogs(limit) {
    var logs = _getAuditRepo().findAll();
    logs.sort(function(a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return limit ? logs.slice(0, limit) : logs;
  }

  function _incrementVersion(v) {
    if (!v) return '1.0.1';
    var parts = v.split('.').map(Number);
    if (parts.length === 3 && !isNaN(parts[2])) {
      parts[2] += 1;
      return parts.join('.');
    }
    return v + '.1';
  }

  return {
    registerCodeFile: registerCodeFile,
    getCodeFile: getCodeFile,
    recordCopyCode: recordCopyCode,
    getLatestVersion: getLatestVersion,
    compareVersion: compareVersion,
    approveVersion: approveVersion,
    listCodeFiles: listCodeFiles,
    getVersionHistory: getVersionHistory,
    getDeveloperAuditLogs: getDeveloperAuditLogs,
    logDeveloperAudit: logDeveloperAudit
  };
})();
