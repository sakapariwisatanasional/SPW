/**
 * SPWN Apps 2.0 - Achievement Controller
 * Location: backend/google-apps-script/controllers/achievement.controller.gs
 * -------------------------------------------------------------------------
 * Menangani HTTP request untuk Action-Based Router domain Pencapaian Anggota:
 * - member.achievement (GET/POST)
 * - member.skk.status (GET/POST)
 * - member.badges (GET/POST)
 * - member.activities (GET/POST)
 */

var AchievementController = (function() {

  /**
   * Helper untuk mengekstrak target memberId dari request atau sesi pengguna aktif.
   */
  function _resolveTargetMemberId(context) {
    var query = context.query || {};
    var body = context.body || {};
    var requestedId = query.member_id || query.memberId || query.id || query.no_kta || body.member_id || body.memberId;

    if (requestedId) {
      return requestedId;
    }

    // Default ke memberId akun yang sedang login jika tidak disertakan
    if (context.user) {
      return context.user.memberId || context.user.member_id || context.user.no_kta || context.user.id;
    }

    return null;
  }

  /**
   * Action: member.achievement
   * Mengambil rangkuman profil pencapaian anggota (Read Model).
   */
  function getAchievement(context) {
    var memberId = _resolveTargetMemberId(context);

    if (!memberId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter member_id atau no_kta wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var summary = AchievementService.getAchievementSummary(memberId, context);
      return ApiResponseFormatter.success(
        context.action,
        summary,
        'Profil pencapaian anggota berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      var statusCode = (err.message && err.message.indexOf('SPWN_NOT_FOUND') !== -1) ? 404 : 500;
      return ApiResponseFormatter.error(
        context.action,
        statusCode,
        err.message || 'Gagal memuat profil pencapaian',
        { code: err.code || 'SPWN_ACHIEVEMENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Action: member.skk.status
   * Mengambil daftar rincian status kecakapan SKK anggota.
   */
  function getSkkStatus(context) {
    var memberId = _resolveTargetMemberId(context);
    var query = context.query || {};
    var kridaId = query.krida_id || query.kridaId || '';

    if (!memberId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter member_id atau no_kta wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var list = AchievementService.getSkkStatusList(memberId, context, kridaId);
      return ApiResponseFormatter.success(
        context.action,
        list,
        'Daftar status SKK berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat status SKK',
        { code: err.code || 'SPWN_SKK_STATUS_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Action: member.badges
   * Mengambil daftar lencana kehormatan / kecakapan digital anggota.
   */
  function getBadges(context) {
    var memberId = _resolveTargetMemberId(context);

    if (!memberId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter member_id atau no_kta wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var badges = AchievementService.getMemberBadges(memberId, context);
      return ApiResponseFormatter.success(
        context.action,
        badges,
        'Daftar lencana anggota berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat lencana anggota',
        { code: err.code || 'SPWN_BADGES_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Action: member.activities
   * Mengambil riwayat kegiatan pariwisata yang telah diikuti anggota.
   */
  function getActivities(context) {
    var memberId = _resolveTargetMemberId(context);

    if (!memberId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Parameter member_id atau no_kta wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var activities = AchievementService.getMemberActivities(memberId, context);
      return ApiResponseFormatter.success(
        context.action,
        activities,
        'Riwayat aktivitas kepariwisataan anggota berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat aktivitas anggota',
        { code: err.code || 'SPWN_ACTIVITIES_ERROR' },
        context.requestId
      );
    }
  }

  return {
    getAchievement: getAchievement,
    getSkkStatus: getSkkStatus,
    getBadges: getBadges,
    getActivities: getActivities
  };
})();
