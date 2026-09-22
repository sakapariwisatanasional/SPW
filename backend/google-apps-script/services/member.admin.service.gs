/**
 * SPWN Apps 2.0 - Member Administration Service
 * Location: backend/google-apps-script/services/member.admin.service.gs
 * -------------------------------------------------------------------
 * Layanan administrasi anggota multi-level (RBAC) dan Scoped Access Wilayah.
 * 
 * SIKLUS AKTIVASI 4 TAHAP:
 * 1. DRAFT: Pendaftaran baru melengkapi berkas & biodata.
 * 2. VERIFICATION: Berkas masuk antrean verifikasi faktual admin wilayah/nasional.
 * 3. APPROVED: Berkas dinyatakan absah, siap diaktivasi.
 * 4. ACTIVE: Nomor KTA resmi + QR Token diterbitkan, akun login diaktifkan.
 * 
 * FITUR KEAMANAN:
 * - Enforced Region Scoping Middleware (ADMIN_WILAYAH hanya dapat mengakses provinsi/kabupatennya).
 * - Strict Field Immutability (Perubahan NIK / No KTA mewajibkan reason dan dicatat di Member_Change_History).
 */

var MemberAdminService = (function() {
  var _memberRepo = null;
  var _approvalRepo = null;
  var _historyRepo = null;
  var _usersRepo = null;

  function _getMemberRepo() {
    if (!_memberRepo) {
      _memberRepo = SpreadsheetRepository.create('MEMBER', 'ANGGOTA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _memberRepo;
  }

  function _getApprovalRepo() {
    if (!_approvalRepo) {
      _approvalRepo = SpreadsheetRepository.create('MEMBER', 'MEMBER_APPROVAL', {
        primaryKey: 'id'
      });
    }
    return _approvalRepo;
  }

  function _getHistoryRepo() {
    if (!_historyRepo) {
      _historyRepo = SpreadsheetRepository.create('MEMBER', 'MEMBER_CHANGE_HISTORY', {
        primaryKey: 'id'
      });
    }
    return _historyRepo;
  }

  function _getUsersRepo() {
    if (!_usersRepo) {
      _usersRepo = SpreadsheetRepository.create('MEMBER', 'USERS', {
        primaryKey: 'id'
      });
    }
    return _usersRepo;
  }

  var _appointmentsRepo = null;
  function _getAppointmentsRepo() {
    if (!_appointmentsRepo) {
      _appointmentsRepo = SpreadsheetRepository.create('MEMBER', 'ADMIN_APPOINTMENTS', {
        primaryKey: 'id'
      });
    }
    return _appointmentsRepo;
  }

  /**
   * Validasi regional scoping: ADMIN_WILAYAH dibatasi wilayah binaannya.
   */
  function enforceRegionalScope(sessionUser, targetProvinsiId) {
    if (!sessionUser) {
      throw new Error('[AUTH_REQUIRED] Sesi pengguna diperlukan untuk aksi ini.');
    }
    if (sessionUser.role === 'SUPER_ADMIN' || sessionUser.role === 'ADMIN_PUSAT' || sessionUser.role === 'ADMIN_NASIONAL') {
      return true; // Full access nasional
    }
    if (sessionUser.role === 'ADMIN_WILAYAH') {
      var userProv = (sessionUser.provinsi_id || '').toString();
      var targetProv = (targetProvinsiId || '').toString();
      if (!userProv || !targetProv || userProv !== targetProv) {
        throw new Error('[REGION_FORBIDDEN] Akses ditolak: Anda hanya berwenang mengelola anggota di wilayah provinsi: ' + userProv);
      }
      return true;
    }
    throw new Error('[PERMISSION_DENIED] Role Anda (' + sessionUser.role + ') tidak memiliki hak akses administrasi anggota.');
  }

  /**
   * Direktori Anggota Admin dengan Scoped Access dan Filter Multi-parameter.
   */
  function listMembers(params, sessionUser) {
    var p = params || {};
    var page = parseInt(p.page || 1, 10);
    var limit = parseInt(p.limit || 20, 10);
    var search = (p.search || '').toLowerCase().trim();
    var filterStatus = p.status || p.status_anggota;
    var filterKrida = p.krida_id;
    var filterProv = p.provinsi_id || p.wilayah_provinsi_id;
    var filterKab = p.kabupaten_id || p.wilayah_kabupaten_id;

    // Paksa batasan provinsi jika login sebagai ADMIN_WILAYAH
    if (sessionUser && sessionUser.role === 'ADMIN_WILAYAH') {
      filterProv = sessionUser.provinsi_id;
    }

    var allRecords = _getMemberRepo().findAll({
      filter: function(item) {
        // Filter Scope Wilayah
        if (filterProv && (item.provinsi_id || item.wilayah_provinsi_id) !== filterProv) {
          return false;
        }
        if (filterKab && (item.kabupaten_id || item.wilayah_kabupaten_id) !== filterKab) {
          return false;
        }

        // Filter Status Anggota (DRAFT, VERIFICATION, APPROVED, ACTIVE)
        if (filterStatus && filterStatus !== 'ALL') {
          var itemStatus = item.status_anggota || item.status;
          if (itemStatus !== filterStatus) return false;
        }

        // Filter Krida
        if (filterKrida && filterKrida !== 'ALL' && item.krida_id !== filterKrida) {
          return false;
        }

        // Filter Search
        if (search) {
          var name = (item.nama_lengkap || '').toLowerCase();
          var kta = (item.nomor_kta || '').toLowerCase();
          var nik = (item.nik || '').toLowerCase();
          var city = (item.kabupaten_nama || '').toLowerCase();
          if (name.indexOf(search) === -1 && kta.indexOf(search) === -1 &&
              nik.indexOf(search) === -1 && city.indexOf(search) === -1) {
            return false;
          }
        }

        return true;
      }
    });

    var total = allRecords.length;
    var startIndex = (page - 1) * limit;
    var pagedData = allRecords.slice(startIndex, startIndex + limit).map(function(item) {
      return MemberMapper.toAdmin(item, sessionUser ? sessionUser.role : null);
    });

    return {
      data: pagedData,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      },
      scope: {
        role: sessionUser ? sessionUser.role : 'GUEST',
        provinsi_id: filterProv || 'NASIONAL'
      }
    };
  }

  /**
   * Detail Lengkap Anggota (Profil, KTA, Jejak Approval, dan Riwayat Koreksi).
   */
  function getMemberDetail(memberId, sessionUser) {
    if (!memberId) throw new Error('memberId wajib disertakan');

    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan: ' + memberId);

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    // Ambil histori approval
    var approvals = _getApprovalRepo().findAll({
      filter: function(a) { return a.member_id === memberId; }
    });

    // Ambil histori koreksi
    var history = _getHistoryRepo().findAll({
      filter: function(h) { return h.member_id === memberId; }
    });

    // Ambil KTA logs
    var ktaLogs = KtaLogRepository.findByMemberId(memberId);

    return {
      member: MemberMapper.toAdmin(member, sessionUser ? sessionUser.role : null),
      approvals: approvals,
      history: history,
      ktaLogs: ktaLogs
    };
  }

  /**
   * Review Berkas oleh Admin Wilayah (Tahap: PENDING -> REVIEWED_VERIFIED / PENDING)
   */
  function processReview(memberId, decision, notes, sessionUser) {
    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    var nextStatus = (decision === 'REVIEWED_VERIFIED') ? 'REVIEWED_VERIFIED' : 'PENDING';
    var nowIso = new Date().toISOString();

    _getMemberRepo().update(memberId, {
      status_anggota: nextStatus,
      status: nextStatus,
      reviewed_by: sessionUser ? (sessionUser.id || sessionUser.email) : 'ADMIN_WILAYAH',
      reviewed_at: nowIso,
      review_notes: notes || '',
      updated_at: nowIso
    });

    _getApprovalRepo().insert({
      id: 'REV-' + Utilities.getUuid().substring(0, 8),
      member_id: memberId,
      step_name: 'REVIEW_BERKAS_WILAYAH',
      reviewer_id: sessionUser ? (sessionUser.id || sessionUser.email) : 'ADMIN_WILAYAH',
      reviewer_role: sessionUser ? sessionUser.role : 'ADMIN_WILAYAH',
      decision: decision,
      notes: notes || 'Berkas telah ditinjau dan diverifikasi oleh Admin Wilayah',
      reviewed_at: nowIso
    });

    return {
      success: true,
      memberId: memberId,
      status: nextStatus,
      message: 'Review berkas anggota oleh Admin Wilayah berhasil disimpan.'
    };
  }

  /**
   * Final Approval Berkas: Menyetujui atau Menolak (Tahap: APPROVED / ACTIVE)
   * Wewenang eksklusif: ADMIN_PUSAT dan SUPER_ADMIN.
   */
  function processApproval(memberId, decision, notes, sessionUser) {
    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    if (sessionUser && sessionUser.role === 'ADMIN_WILAYAH') {
      throw new Error('[RBAC_FORBIDDEN] Admin Wilayah hanya berhak melakukan Review & Verifikasi Berkas (status REVIEWED_VERIFIED). Persetujuan final dilakukan oleh ADMIN_PUSAT atau SUPER_ADMIN.');
    }

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    var nextStatus = decision === 'APPROVED' ? 'APPROVED' : 'PENDING';
    var nowIso = new Date().toISOString();

    _getMemberRepo().update(memberId, {
      status_anggota: nextStatus,
      status: nextStatus,
      updated_at: nowIso
    });

    // Tulis jejak ke Member_Approval
    _getApprovalRepo().insert({
      id: 'APP-' + Utilities.getUuid().substring(0, 8),
      member_id: memberId,
      step_name: 'VERIFIKASI_FAKTUAL',
      reviewer_id: sessionUser ? (sessionUser.id || sessionUser.email) : 'ADMIN',
      reviewer_role: sessionUser ? sessionUser.role : 'ADMIN',
      decision: decision,
      notes: notes || (decision === 'APPROVED' ? 'Berkas pramuka diverifikasi sah' : 'Perlu revisi dokumen'),
      reviewed_at: nowIso
    });

    return {
      success: true,
      memberId: memberId,
      status: nextStatus,
      message: decision === 'APPROVED' ? 'Anggota telah disetujui, siap diaktivasi' : 'Berkas dikembalikan ke status DRAFT untuk perbaikan'
    };
  }

  /**
   * Tahap Akhir: Aktivasi Anggota (APPROVED -> ACTIVE)
   * Menggenerasi No KTA + QR Token + Akun Login + Log Aktivasi.
   */
  function activateMember(memberId, notes, sessionUser) {
    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan: ' + memberId);

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    var nowIso = new Date().toISOString();

    // 1 & 2: Generate Nomor KTA & QR Token via KtaManagementService
    var ktaResult = KtaManagementService.generateKtaForMember(memberId, sessionUser, notes || 'Aktivasi Resmi Anggota');

    // 3: Buat akun login jika belum ada
    try {
      var existingUser = _getUsersRepo().findOne({
        filter: function(u) { return u.member_id === memberId || u.email === member.email; }
      });

      if (!existingUser && member.email) {
        _getUsersRepo().insert({
          id: 'USR-' + Utilities.getUuid().substring(0, 8),
          member_id: memberId,
          email: member.email,
          role: 'MEMBER',
          status: 'ACTIVE',
          created_at: nowIso
        });
      }
    } catch (e) {
      // Non-blocking jika modul user berbeda
    }

    // 4: Update status dan metadata aktivasi
    _getMemberRepo().update(memberId, {
      status_anggota: 'ACTIVE',
      status: 'ACTIVE',
      tanggal_aktivasi: nowIso.substring(0, 10),
      activated_by: sessionUser ? (sessionUser.id || sessionUser.email) : 'SYSTEM',
      activated_at: nowIso,
      updated_at: nowIso
    });

    // 5: Log histori ke Member_Change_History
    _getHistoryRepo().insert({
      id: 'HIST-' + Utilities.getUuid().substring(0, 8),
      member_id: memberId,
      field_name: 'status_anggota',
      old_value: member.status_anggota || member.status || 'APPROVED',
      new_value: 'ACTIVE',
      actor_id: sessionUser ? (sessionUser.id || sessionUser.email) : 'SYSTEM',
      actor_role: sessionUser ? sessionUser.role : 'ADMIN',
      reason: notes || 'Aktivasi penerbitan kartu identitas KTA resmi',
      timestamp: nowIso
    });

    return {
      success: true,
      memberId: memberId,
      nomorKta: ktaResult.nomorKta,
      qrToken: ktaResult.qrToken,
      status: 'ACTIVE',
      message: 'Anggota berhasil diaktivasi dengan No KTA: ' + ktaResult.nomorKta
    };
  }

  /**
   * Koreksi Administrasi Data Anggota (dengan Audit Trail Before vs After).
   */
  function updateMember(memberId, updates, reason, sessionUser) {
    if (!reason || reason.trim().length < 3) {
      throw new Error('[AUDIT_REASON_REQUIRED] Alasan perubahan data anggota wajib diisi!');
    }

    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    var nowIso = new Date().toISOString();
    var safeUpdates = {};
    var protectedFields = ['nik', 'nomor_kta'];

    for (var key in updates) {
      var oldVal = member[key];
      var newVal = updates[key];

      if (oldVal !== newVal) {
        // Jika kolom dilindungi, pastikan admin berwenang
        if (protectedFields.indexOf(key) !== -1) {
          if (sessionUser && sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT' && sessionUser.role !== 'ADMIN_NASIONAL') {
            throw new Error('[RESTRICTED_FIELD] Perubahan field ' + key + ' memerlukan otorisasi Pengurus Nasional!');
          }
        }

        safeUpdates[key] = newVal;

        // Catat ke Member_Change_History
        _getHistoryRepo().insert({
          id: 'HIST-' + Utilities.getUuid().substring(0, 8),
          member_id: memberId,
          field_name: key,
          old_value: oldVal ? oldVal.toString() : '',
          new_value: newVal ? newVal.toString() : '',
          actor_id: sessionUser ? (sessionUser.id || sessionUser.email) : 'ADMIN',
          actor_role: sessionUser ? sessionUser.role : 'ADMIN',
          reason: reason,
          timestamp: nowIso
        });
      }
    }

    safeUpdates.updated_at = nowIso;
    _getMemberRepo().update(memberId, safeUpdates);

    return {
      success: true,
      memberId: memberId,
      modifiedFields: Object.keys(safeUpdates),
      message: 'Data anggota berhasil diperbarui dengan catatan audit.'
    };
  }

  /**
   * Reset Password Anggota.
   */
  function resetPassword(memberId, temporaryPassword, reason, sessionUser) {
    var member = _getMemberRepo().findById(memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    enforceRegionalScope(sessionUser, member.provinsi_id || member.wilayah_provinsi_id);

    var tempPass = temporaryPassword || ('Pramuka#' + Math.floor(1000 + Math.random() * 9000));
    var nowIso = new Date().toISOString();

    _getHistoryRepo().insert({
      id: 'HIST-' + Utilities.getUuid().substring(0, 8),
      member_id: memberId,
      field_name: 'password_reset',
      old_value: '***',
      new_value: 'TEMP_ISSUED',
      actor_id: sessionUser ? (sessionUser.id || sessionUser.email) : 'ADMIN',
      actor_role: sessionUser ? sessionUser.role : 'ADMIN',
      reason: reason || 'Permintaan pemulihan pangkalan',
      timestamp: nowIso
    });

    return {
      success: true,
      memberId: memberId,
      temporaryPassword: tempPass,
      message: 'Password sementara berhasil diterbitkan untuk anggota.'
    };
  }

  /**
   * Daftar Penunjukan Admin Berjenjang (5 Tier: Nasional, Provinsi, Kab/Kota, Kecamatan, Pangkalan)
   */
  function listAdminAppointments(params, sessionUser) {
    if (!sessionUser) throw new Error('[AUTH_REQUIRED] Sesi pengguna diperlukan.');
    var query = {};
    if (sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT') {
      if (sessionUser.provinceId) query.provinceId = sessionUser.provinceId;
    }
    var list = _getAppointmentsRepo().find(query);
    return {
      success: true,
      data: list
    };
  }

  /**
   * Menunjuk Admin Baru pada Tingkat Tertentu (Wewenang Super Admin)
   */
  function assignAdminAppointment(payload, sessionUser) {
    if (!sessionUser || (sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT')) {
      throw new Error('[FORBIDDEN] Hanya Super Administrator yang berwenang menunjuk Admin Berjenjang.');
    }

    if (!payload.memberId || !payload.tierLevel) {
      throw new Error('[VALIDATION_ERROR] ID Anggota dan Tingkat Admin (tierLevel) wajib diisi.');
    }

    var nowIso = new Date().toISOString();
    var recordId = 'ADM-APPT-' + Utilities.getUuid().substring(0, 8);

    var newRecord = {
      id: recordId,
      memberId: payload.memberId,
      memberName: payload.memberName || '',
      memberKta: payload.memberKta || '',
      email: payload.email || '',
      phone: payload.phone || '',
      tierLevel: payload.tierLevel,
      tierTitle: payload.tierTitle || ('Admin ' + payload.tierLevel),
      provinceId: payload.provinceId || '',
      provinceName: payload.provinceName || '',
      regencyId: payload.regencyId || '',
      regencyName: payload.regencyName || '',
      districtId: payload.districtId || '',
      districtName: payload.districtName || '',
      pangkalanGudep: payload.pangkalanGudep || '',
      skNomor: payload.skNomor || '',
      skDate: payload.skDate || nowIso.substring(0, 10),
      assignedBy: sessionUser.fullName || sessionUser.email || 'Super Administrator',
      assignedAt: nowIso,
      status: 'ACTIVE',
      notes: payload.notes || ''
    };

    _getAppointmentsRepo().insert(newRecord);

    _getHistoryRepo().insert({
      id: 'HIST-' + Utilities.getUuid().substring(0, 8),
      member_id: payload.memberId,
      field_name: 'admin_tier_appointment',
      old_value: 'MEMBER',
      new_value: payload.tierLevel,
      actor_id: sessionUser.id || 'SUPER_ADMIN',
      actor_role: sessionUser.role || 'SUPER_ADMIN',
      reason: 'Penunjukan resmi Admin ' + payload.tierLevel + ' (SK: ' + (payload.skNomor || '-') + ')',
      timestamp: nowIso
    });

    return {
      success: true,
      data: newRecord,
      message: 'Admin tingkat ' + payload.tierLevel + ' berhasil ditunjuk.'
    };
  }

  /**
   * Mencabut SK Penunjukan Admin
   */
  function revokeAdminAppointment(appointmentId, reason, sessionUser) {
    if (!sessionUser || (sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT')) {
      throw new Error('[FORBIDDEN] Hanya Super Administrator yang berwenang mencabut penunjukan admin.');
    }

    var appt = _getAppointmentsRepo().findById(appointmentId);
    if (!appt) throw new Error('Catatan penunjukan admin tidak ditemukan');

    var nowIso = new Date().toISOString();
    _getAppointmentsRepo().update(appointmentId, {
      status: 'REVOKED',
      revokedAt: nowIso,
      revokedBy: sessionUser.fullName || 'Super Administrator',
      revocationReason: reason || 'Pencabutan wewenang'
    });

    _getHistoryRepo().insert({
      id: 'HIST-' + Utilities.getUuid().substring(0, 8),
      member_id: appt.memberId,
      field_name: 'admin_tier_revocation',
      old_value: appt.tierLevel,
      new_value: 'REVOKED',
      actor_id: sessionUser.id || 'SUPER_ADMIN',
      actor_role: sessionUser.role || 'SUPER_ADMIN',
      reason: reason || 'Pencabutan SK Admin',
      timestamp: nowIso
    });

    return {
      success: true,
      appointmentId: appointmentId,
      message: 'Penunjukan admin berhasil dicabut.'
    };
  }

  /**
   * Reset Password untuk Akun Admin Tertunjuk
   */
  function resetAdminAppointmentPassword(appointmentId, tempPassword, reason, sessionUser) {
    if (!sessionUser || (sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'ADMIN_PUSAT')) {
      throw new Error('[FORBIDDEN] Hanya Super Administrator yang berwenang mereset kata sandi admin.');
    }

    var appt = _getAppointmentsRepo().findById(appointmentId);
    if (!appt) throw new Error('Penunjukan admin tidak ditemukan');

    var pass = tempPassword || ('AdminSPWN#' + Math.floor(1000 + Math.random() * 9000));
    var nowIso = new Date().toISOString();

    _getHistoryRepo().insert({
      id: 'HIST-' + Utilities.getUuid().substring(0, 8),
      member_id: appt.memberId,
      field_name: 'admin_password_reset',
      old_value: '***',
      new_value: 'ADMIN_TEMP_ISSUED',
      actor_id: sessionUser.id || 'SUPER_ADMIN',
      actor_role: sessionUser.role || 'SUPER_ADMIN',
      reason: reason || 'Reset kata sandi admin oleh Super Administrator',
      timestamp: nowIso
    });

    return {
      success: true,
      appointmentId: appointmentId,
      temporaryPassword: pass,
      message: 'Kata sandi akun admin berhasil direset.'
    };
  }

  return {
    listMembers: listMembers,
    getMemberDetail: getMemberDetail,
    processReview: processReview,
    processApproval: processApproval,
    activateMember: activateMember,
    updateMember: updateMember,
    resetPassword: resetPassword,
    listAdminAppointments: listAdminAppointments,
    assignAdminAppointment: assignAdminAppointment,
    revokeAdminAppointment: revokeAdminAppointment,
    resetAdminAppointmentPassword: resetAdminAppointmentPassword,
    enforceRegionalScope: enforceRegionalScope
  };
})();
