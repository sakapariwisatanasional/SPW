/**
 * SPWN Apps 2.0 - Admin Member Controller
 * Location: backend/google-apps-script/controllers/admin.member.controller.gs
 * --------------------------------------------------------------------------
 * Menangani HTTP request untuk manajemen administrasi anggota:
 * - admin.member.list (GET/POST)
 * - admin.member.detail (GET/POST)
 * - admin.member.update (POST)
 * - admin.member.activate (POST)
 * - admin.member.approve (POST)
 * - admin.member.reject (POST)
 * - admin.member.resetPassword (POST)
 */

var AdminMemberController = (function() {

  function pending(context) {
    try {
      var params = context.query || context.body || {};
      var user = context.user || { id: 'ADM-PUSAT', email: 'admin@spwn.pramuka.or.id', role: 'SUPER_ADMIN' };
      // Jika status tidak didefinisikan secara eksplisit, ambil data pipeline keanggotaan
      var result = MemberAdminService.listMembers(params, user);

      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar antrean anggota pending berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Akses ditolak') !== -1 ? 403 : 500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_PENDING_ERROR' },
        context.requestId
      );
    }
  }

  function list(context) {
    try {
      var params = context.query || context.body || {};
      var result = MemberAdminService.listMembers(params, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar administrasi anggota berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Akses ditolak') !== -1 ? 403 : 500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_LIST_ERROR' },
        context.requestId
      );
    }
  }

  function detail(context) {
    try {
      var memberId = (context.query && (context.query.member_id || context.query.id)) ||
                     (context.body && (context.body.member_id || context.body.id));

      var result = MemberAdminService.getMemberDetail(memberId, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        'Rincian administrasi anggota berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Akses ditolak') !== -1 ? 403 : 404,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_DETAIL_ERROR' },
        context.requestId
      );
    }
  }

  function update(context) {
    try {
      var body = context.body || {};
      var memberId = body.member_id || body.id;
      var updates = body.updates || {};
      var reason = body.reason || '';

      var result = MemberAdminService.updateMember(memberId, updates, reason, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Alasan') !== -1 ? 400 : 500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_UPDATE_ERROR' },
        context.requestId
      );
    }
  }

  function activate(context) {
    try {
      var body = context.body || {};
      var query = context.query || {};
      var memberId = body.member_id || body.id || query.member_id || query.id;
      var notes = body.notes || body.reason || query.notes || 'Aktivasi resmi keanggotaan';
      var user = context.user || { role: 'SUPER_ADMIN', email: 'admin@spwn.pramuka.or.id', name: 'Admin Pusat' };

      var result = MemberAdminService.activateMember(memberId, notes, user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_ACTIVATE_ERROR' },
        context.requestId
      );
    }
  }

  function review(context) {
    try {
      var body = context.body || {};
      var query = context.query || {};
      var memberId = body.member_id || body.id || query.member_id || query.id;
      var notes = body.notes || query.notes || 'Berkas telah ditinjau dan diverifikasi';
      var decision = body.decision || query.decision || (body.verified !== false ? 'REVIEWED_VERIFIED' : 'PENDING');
      var user = context.user || { role: 'SUPER_ADMIN', email: 'admin@spwn.pramuka.or.id', name: 'Admin Wilayah' };

      var result = MemberAdminService.processReview(memberId, decision, notes, user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_REVIEW_ERROR' },
        context.requestId
      );
    }
  }

  function approve(context) {
    try {
      var body = context.body || {};
      var query = context.query || {};
      var memberId = body.member_id || body.id || query.member_id || query.id;
      var notes = body.notes || query.notes || 'Berkas diverifikasi sah';
      var user = context.user || { role: 'SUPER_ADMIN', email: 'admin@spwn.pramuka.or.id', name: 'Admin Pusat' };

      var result = MemberAdminService.processApproval(memberId, 'APPROVED', notes, user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_APPROVE_ERROR' },
        context.requestId
      );
    }
  }

  function reject(context) {
    try {
      var body = context.body || {};
      var query = context.query || {};
      var memberId = body.member_id || body.id || query.member_id || query.id;
      var notes = body.notes || query.notes || 'Perlu perbaikan berkas';
      var user = context.user || { role: 'SUPER_ADMIN', email: 'admin@spwn.pramuka.or.id', name: 'Admin' };

      var result = MemberAdminService.processApproval(memberId, 'REJECTED', notes, user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_REJECT_ERROR' },
        context.requestId
      );
    }
  }

  function resetPassword(context) {
    try {
      var body = context.body || {};
      var memberId = body.member_id || body.id;
      var temporaryPassword = body.temporary_password;
      var reason = body.reason;

      var result = MemberAdminService.resetPassword(memberId, temporaryPassword, reason, context.user);

      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: err.code || 'SPWN_ADMIN_MEMBER_RESET_PASS_ERROR' },
        context.requestId
      );
    }
  }

  function listAppointments(context) {
    try {
      var params = context.query || context.body || {};
      var result = MemberAdminService.listAdminAppointments(params, context.user);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar penunjukan admin berjenjang berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message,
        { code: 'SPWN_ADMIN_APPOINTMENT_LIST_ERROR' },
        context.requestId
      );
    }
  }

  function assignAdmin(context) {
    try {
      var body = context.body || {};
      var result = MemberAdminService.assignAdminAppointment(body, context.user);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Hanya Super') !== -1 ? 403 : 400,
        err.message,
        { code: 'SPWN_ADMIN_ASSIGNMENT_ERROR' },
        context.requestId
      );
    }
  }

  function revokeAdmin(context) {
    try {
      var body = context.body || {};
      var appointmentId = body.appointment_id || body.id;
      var reason = body.reason || 'Pencabutan SK';
      var result = MemberAdminService.revokeAdminAppointment(appointmentId, reason, context.user);
      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Hanya Super') !== -1 ? 403 : 400,
        err.message,
        { code: 'SPWN_ADMIN_REVOKE_ERROR' },
        context.requestId
      );
    }
  }

  function resetAdminPassword(context) {
    try {
      var body = context.body || {};
      var appointmentId = body.appointment_id || body.id;
      var tempPassword = body.temporary_password;
      var reason = body.reason;
      var result = MemberAdminService.resetAdminAppointmentPassword(appointmentId, tempPassword, reason, context.user);
      return ApiResponseFormatter.success(
        context.action,
        result,
        result.message,
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        err.message.indexOf('Hanya Super') !== -1 ? 403 : 400,
        err.message,
        { code: 'SPWN_ADMIN_RESET_PASS_ERROR' },
        context.requestId
      );
    }
  }

  return {
    pending: pending,
    list: list,
    detail: detail,
    update: update,
    activate: activate,
    review: review,
    approve: approve,
    reject: reject,
    resetPassword: resetPassword,
    listAppointments: listAppointments,
    assignAdmin: assignAdmin,
    revokeAdmin: revokeAdmin,
    resetAdminPassword: resetAdminPassword
  };
})();
