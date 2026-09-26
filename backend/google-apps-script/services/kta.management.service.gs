/**
 * SPWN Apps 2.0 - KTA Management Service
 * Location: backend/google-apps-script/services/kta.management.service.gs
 * ----------------------------------------------------------------------
 * Layanan operasional manajemen KTA digital tingkat admin:
 * 1. Antrean Penerbitan KTA Otomatis.
 * 2. Regenerate KTA dengan Izin Khusus & Audit Log Alasan Peremajaan.
 * 3. KTA Batch Preview & Cetak Massal (data kompatibel LegacyKtaPreview).
 * 4. Thread-Safe Concurrency via LockService.
 * 5. Log Riwayat Penerbitan KTA (KtaLogRepository).
 */

var KtaManagementService = (function() {
  var LOCK_TIMEOUT_MS = 10000;

  var _memberRepo = null;

  function _getMemberRepo() {
    if (!_memberRepo) {
      _memberRepo = SpreadsheetRepository.create('MEMBER', 'ANGGOTA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _memberRepo;
  }

  /**
   * Menghasilkan dan menerbitkan KTA untuk anggota yang telah berstatus ACTIVE atau APPROVED.
   * Dilengkapi LockService untuk mencegah duplikasi nomor urut saat diakses bersamaan.
   */
  function generateKtaForMember(memberId, sessionUser, reason) {
    if (!memberId) {
      throw new Error('[KTA_GENERATE_ERROR] member_id wajib diisi!');
    }

    var lock = LockService.getScriptLock();
    var successLock = lock.tryLock(LOCK_TIMEOUT_MS);
    if (!successLock) {
      throw new Error('[SPWN_LOCK_TIMEOUT] Sistem sedang memproses antrean KTA lain. Silakan coba lagi.');
    }

    try {
      var member = _getMemberRepo().findById(memberId);
      if (!member) {
        throw new Error('[KTA_NOT_FOUND] Data anggota tidak ditemukan: ' + memberId);
      }

      // Otorisasi KTA Generation:
      sessionUser = sessionUser || { role: 'SUPER_ADMIN', email: 'admin@spwn.pramuka.or.id', name: 'Admin Nasional' };
      if (sessionUser.role === 'ADMIN_WILAYAH') {
        throw new Error('[FORBIDDEN_KTA_GENERATE] Penerbitan KTA dan QR Identity resmi merupakan wewenang eksklusif ADMIN_PUSAT dan SUPER_ADMIN.');
      }

      // Tentukan level organisasi
      var level = member.level_organisasi || 'WILAYAH';
      if (member.kwartir_nasional === true || member.provinsi_id === '00') {
        level = 'KWARTIR_NASIONAL';
      }

      // Hitung sequence nomor urut secara thread-safe
      var totalExisting = _getMemberRepo().count({
        filter: function(item) {
          return Boolean(item.nomor_kta && item.nomor_kta.trim().length > 0);
        }
      });
      var nextSeq = totalExisting + 1;

      var regencyCode = member.kabupaten_id || member.wilayah_kabupaten_id || '3201';
      var districtCode = member.wilayah_kecamatan_id || member.kode_kecamatan || '010';

      var nomorKta = KtaService.generateKtaNumber({
        level: level,
        kodeKabupaten: regencyCode,
        kodeKecamatan: districtCode,
        sequence: nextSeq
      });

      var qrToken = KtaService.generateQrToken((member.id || '') + nomorKta);
      var qrUrl = KtaService.generateMemberQrUrl(qrToken);

      var isRegenerate = Boolean(member.nomor_kta && member.nomor_kta.trim().length > 0);
      var actionType = isRegenerate ? 'REGENERATE' : 'INITIAL_ISSUE';

      // Update Member Record dengan seluruh field Dynamic QR Identity
      _getMemberRepo().update(member.id, {
        nomor_kta: nomorKta,
        status_anggota: 'KTA_GENERATED',
        status: 'KTA_GENERATED',
        no_kta: nomorKta,
        qr_token: qrToken,
        qr_url: qrUrl,
        qr_status: 'ACTIVE',
        qr_created_at: member.qr_created_at || new Date().toISOString(),
        qr_updated_at: new Date().toISOString(),
        qr_scan_count: member.qr_scan_count || 0,
        qr_regenerate_reason: isRegenerate ? (reason || 'Regenerasi KTA oleh ' + sessionUser.role) : '',
        masa_berlaku_kta: 'Seumur Hidup / Selama Aktif',
        updated_at: new Date().toISOString()
      });

      // Catat ke KTA_Generation_Log
      KtaLogRepository.logAction({
        member_id: member.id,
        nomor_kta: nomorKta,
        qr_token: qrToken,
        action_type: actionType,
        reason: reason || (isRegenerate ? 'Peremajaan KTA' : 'Aktivasi keanggotaan perdana'),
        generated_by: sessionUser ? sessionUser.name || sessionUser.email : 'SYSTEM'
      });

      return {
        success: true,
        memberId: member.id,
        nomorKta: nomorKta,
        qrToken: qrToken,
        actionType: actionType,
        message: 'KTA Digital berhasil diterbitkan: ' + nomorKta
      };
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Regenerate KTA dengan permission guard khusus dan catatan audit alasan wajib.
   */
  function regenerateKta(memberId, reason, sessionUser) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('[REGENERATE_VALIDATION] Alasan peremajaan KTA wajib diisi minimal 5 karakter!');
    }

    // Role check: SUPER_ADMIN atau ADMIN_PUSAT / ADMIN_NASIONAL
    if (sessionUser && sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT' && sessionUser.role !== 'ADMIN_NASIONAL') {
      throw new Error('[PERMISSION_DENIED] Regenerasi KTA hanya diizinkan untuk Pengurus Tingkat Nasional atau Super Admin!');
    }

    return generateKtaForMember(memberId, sessionUser, reason);
  }

  /**
   * Mengambil data KTA siap render untuk komponen LegacyKtaPreview.tsx.
   */
  function previewKta(nomorKtaOrMemberId) {
    if (!nomorKtaOrMemberId) {
      throw new Error('Nomor KTA atau ID Anggota wajib diisi');
    }

    var member = _getMemberRepo().findOne({
      filter: function(item) {
        return item.nomor_kta === nomorKtaOrMemberId || item.id === nomorKtaOrMemberId;
      }
    });

    if (!member) {
      throw new Error('Anggota dengan identitas ' + nomorKtaOrMemberId + ' tidak ditemukan.');
    }

    var qrToken = KtaService.generateQrToken(member.nomor_kta, member.id || Utilities.getUuid());

    // Format yang siap dikonsumsi LegacyKtaPreview.tsx
    return {
      fullName: member.nama_lengkap,
      noKta: member.nomor_kta,
      membershipLevel: member.tingkat_keanggotaan || 'Penegak Bantara',
      kridaName: member.krida_nama || 'Krida SAKA Pariwisata',
      province: member.provinsi_nama || 'Jawa Barat',
      city: member.kabupaten_nama || '',
      joinedDate: member.tanggal_bergabung || member.tanggal_aktivasi || '2024-01-01',
      photoUrl: member.foto_url || '',
      verificationToken: qrToken,
      status: member.status_anggota || member.status || 'ACTIVE'
    };
  }

  /**
   * Riwayat penerbitan dan regenerasi KTA.
   */
  function getHistory(memberId, page, limit) {
    return KtaLogRepository.listLogs({
      member_id: memberId,
      page: page || 1,
      limit: limit || 20
    });
  }

  return {
    generateKtaForMember: generateKtaForMember,
    regenerateKta: regenerateKta,
    previewKta: previewKta,
    getHistory: getHistory,
    getTemplate: getTemplate,
    saveTemplate: saveTemplate,
    uploadAsset: uploadAsset
  };

  /**
   * Mengambil template KTA dari sheet KTA_TEMPLATE.
   */
  function getTemplate(templateId) {
    var id = templateId || 'TMPL_DEFAULT';
    var repo = _getTemplateRepo();
    var found = null;
    try {
      found = repo.findById(id);
    } catch (e) {
      // Fallback
    }

    if (!found) {
      try {
        var all = repo.findAll({ limit: 1 });
        if (all && all.length > 0) {
          return all[0];
        }
      } catch (e2) {
        // Table may be empty
      }
      return {
        template_id: 'TMPL_DEFAULT',
        template_name: 'Template Resmi KTA Saka Pariwisata',
        front_background_url: '',
        back_background_url: '',
        card_width: 85.6,
        card_height: 53.98,
        elements_json: '',
        qr_position: JSON.stringify({ front: { x: 80, y: 65, visible: true }, back: { x: 74, y: 46, visible: true } }),
        qr_size: 18,
        created_by: 'SUPER_ADMIN',
        updated_at: new Date().toISOString()
      };
    }
    return found;
  }

  var _templateRepo = null;
  function _getTemplateRepo() {
    if (!_templateRepo) {
      _templateRepo = SpreadsheetRepository.create('MEMBER', 'KTA_TEMPLATE', {
        primaryKey: 'template_id',
        statusColumn: 'status'
      });
    }
    return _templateRepo;
  }

  /**
   * Menyimpan atau memperbarui konfigurasi template KTA.
   * RBAC Security: HANYA SUPER_ADMIN yang berhak mengubah desain KTA.
   */
  function saveTemplate(templateData, sessionUser) {
    if (!sessionUser || sessionUser.role !== 'SUPER_ADMIN') {
      throw new Error('[FORBIDDEN_KTA_TEMPLATE] Pengaturan desain KTA hanya diizinkan untuk SUPER_ADMIN.');
    }

    if (!templateData || !templateData.template_id) {
      throw new Error('[VALIDATION_ERROR] template_id wajib disertakan.');
    }

    var lock = LockService.getScriptLock();
    var successLock = lock.tryLock(LOCK_TIMEOUT_MS);
    if (!successLock) {
      throw new Error('[SPWN_LOCK_TIMEOUT] Sistem sedang memperbarui template lain. Silakan coba kembali.');
    }

    try {
      var repo = _getTemplateRepo();
      var existing = null;
      try {
        existing = repo.findById(templateData.template_id);
      } catch (err) {}

      var payload = {
        template_id: templateData.template_id,
        template_name: templateData.template_name || 'Template KTA SPWN',
        front_background_url: templateData.front_background_url || '',
        back_background_url: templateData.back_background_url || '',
        card_width: Number(templateData.card_width) || 85.6,
        card_height: Number(templateData.card_height) || 53.98,
        elements_json: templateData.elements_json || '',
        qr_position: typeof templateData.qr_position === 'object' ? JSON.stringify(templateData.qr_position) : (templateData.qr_position || ''),
        qr_size: Number(templateData.qr_size) || 18,
        created_by: existing ? existing.created_by : (sessionUser.name || sessionUser.email || 'SUPER_ADMIN'),
        updated_at: new Date().toISOString()
      };

      if (existing) {
        repo.update(templateData.template_id, payload);
      } else {
        repo.insert(payload);
      }

      return {
        success: true,
        template: payload,
        message: 'Template KTA berhasil disimpan ke spreadsheet'
      };
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Mengunggah asset KTA (background/logo) ke Google Drive dan mengembalikan direct URL.
   * Spreadsheet hanya menyimpan URL-nya.
   */
  function uploadAsset(base64Data, filename, folderType, sessionUser) {
    if (!sessionUser || sessionUser.role !== 'SUPER_ADMIN') {
      throw new Error('[FORBIDDEN_UPLOAD] Hanya SUPER_ADMIN yang diizinkan mengunggah asset template KTA.');
    }

    if (!base64Data) {
      throw new Error('Data base64 berkas tidak boleh kosong');
    }

    var cleanBase64 = base64Data;
    var contentType = 'image/png';
    if (base64Data.indexOf('data:') === 0) {
      var matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contentType = matches[1];
        cleanBase64 = matches[2];
      }
    }

    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, contentType, filename || ('kta_asset_' + Date.now() + '.png'));

    var folderName = 'SPWN_KTA_ASSETS';
    var folders = DriveApp.getFoldersByName(folderName);
    var targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
    }

    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var directUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return {
      success: true,
      fileId: fileId,
      directUrl: directUrl,
      downloadUrl: file.getDownloadUrl(),
      message: 'Asset berhasil diunggah ke Google Drive'
    };
  }

  return {
    generateKtaForMember: generateKtaForMember,
    regenerateKta: regenerateKta,
    previewKta: previewKta,
    getHistory: getHistory,
    getTemplate: getTemplate,
    saveTemplate: saveTemplate,
    uploadAsset: uploadAsset
  };
})();
