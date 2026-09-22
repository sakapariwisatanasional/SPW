/**
 * SPWN Apps 2.0 - KTA Generation Log Repository Layer
 * Location: backend/google-apps-script/repositories/kta.log.repository.gs
 * ----------------------------------------------------------------------
 * Repository pencatat riwayat audit penerbitan, regenerasi, dan pencetakan
 * Kartu Tanda Anggota (KTA) Digital SPWN Apps 2.0.
 * 
 * Headers: ["id", "member_id", "nomor_kta", "qr_token", "action_type", "reason", "generated_by", "generated_at"]
 */

var KtaLogRepository = (function() {
  var _repo = null;

  function getRepo() {
    if (!_repo) {
      _repo = SpreadsheetRepository.create('MEMBER', 'KTA_GENERATION_LOG', {
        primaryKey: 'id',
        enableCache: false // Always fresh audit records
      });
    }
    return _repo;
  }

  /**
   * Menulis entri log baru untuk aksi KTA.
   * 
   * @param {Object} entry
   * @param {string} entry.member_id
   * @param {string} entry.nomor_kta
   * @param {string} [entry.qr_token]
   * @param {string} entry.action_type - 'INITIAL_ISSUE' | 'REGENERATE' | 'REPRINT' | 'CORRECTION'
   * @param {string} [entry.reason]
   * @param {string} entry.generated_by
   * @returns {Object} Log yang berhasil ditulis
   */
  function logAction(entry) {
    if (!entry.member_id || !entry.nomor_kta) {
      throw new Error('[KtaLogRepository] member_id dan nomor_kta wajib ada!');
    }

    var logId = 'KLOG-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    var record = {
      id: logId,
      member_id: entry.member_id,
      nomor_kta: entry.nomor_kta,
      qr_token: entry.qr_token || '',
      action_type: entry.action_type || 'INITIAL_ISSUE',
      reason: entry.reason || 'Penerbitan otomatis status ACTIVE',
      generated_by: entry.generated_by || 'SYSTEM',
      generated_at: new Date().toISOString()
    };

    return getRepo().insert(record);
  }

  /**
   * Mengambil riwayat log untuk member tertentu atau seluruh sistem.
   */
  function findByMemberId(memberId) {
    if (!memberId) return [];
    return getRepo().findAll({
      filter: function(item) {
        return item.member_id === memberId;
      }
    });
  }

  /**
   * Mengambil daftar log terbaru dengan pagination.
   */
  function listLogs(options) {
    var opts = options || {};
    var page = parseInt(opts.page || 1, 10);
    var limit = parseInt(opts.limit || 20, 10);
    var memberId = opts.member_id;
    var actionType = opts.action_type;

    var logs = getRepo().findAll({
      filter: function(item) {
        var matchMember = !memberId || item.member_id === memberId || item.nomor_kta === memberId;
        var matchAction = !actionType || item.action_type === actionType;
        return matchMember && matchAction;
      }
    });

    // Urutkan dari yang terbaru
    logs.sort(function(a, b) {
      var dateA = new Date(a.generated_at || 0).getTime();
      var dateB = new Date(b.generated_at || 0).getTime();
      return dateB - dateA;
    });

    var total = logs.length;
    var startIndex = (page - 1) * limit;
    var pagedData = logs.slice(startIndex, startIndex + limit);

    return {
      data: pagedData,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  return {
    logAction: logAction,
    findByMemberId: findByMemberId,
    listLogs: listLogs,
    getRepo: getRepo
  };
})();
