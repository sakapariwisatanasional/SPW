/**
 * SPWN Apps 2.0 - Member Achievement Service (Read Model)
 * Location: backend/google-apps-script/services/achievement.service.gs
 * -------------------------------------------------------------------
 * Layanan Read Model untuk Profil Pencapaian Anggota SAKA Pariwisata.
 * 
 * Tanggung Jawab:
 * 1. Menghitung progress kecakapan SKK secara dinamis dari sumber primer
 * 2. Menentukan tingkatan level (Purwa, Madya, Utama) berdasarkan aturan SKK
 * 3. Mengagregasi lencana digital (Badges) dan riwayat aktivitas pariwisata
 * 4. Membangun Achievement Response DTO terstandarisasi API Contract v2
 * 5. Menjamin perlindungan privasi (UU PDP): Nilai SKK hanya tampil untuk anggota sendiri atau pengurus berwenang, tanpa mengekspos PII (NIK, alamat).
 */

var AchievementService = (function() {
  var _skillRepo = null;
  var _badgeRepo = null;
  var _activityRepo = null;

  function _getSkillRepo() {
    if (!_skillRepo) {
      _skillRepo = SpreadsheetRepository.create('MEMBER', 'MEMBER_SKILL_STATUS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _skillRepo;
  }

  function _getBadgeRepo() {
    if (!_badgeRepo) {
      _badgeRepo = SpreadsheetRepository.create('MEMBER', 'MEMBER_BADGE', {
        primaryKey: 'id'
      });
    }
    return _badgeRepo;
  }

  function _getActivityRepo() {
    if (!_activityRepo) {
      _activityRepo = SpreadsheetRepository.create('MEMBER', 'MEMBER_ACTIVITY', {
        primaryKey: 'id'
      });
    }
    return _activityRepo;
  }

  /**
   * Memeriksa apakah pemanggil adalah anggota pemilik profil atau pengurus dengan hak akses.
   * 
   * @param {string} targetMemberId 
   * @param {Object} context 
   * @returns {boolean}
   */
  function _isSelfOrAuthorized(targetMemberId, context) {
    if (!context || !context.user) return false;
    
    // Periksa apakah user yang login adalah pemilik profil
    var callerId = context.user.memberId || context.user.member_id || context.user.no_kta || context.user.id;
    if (callerId && targetMemberId && callerId.toLowerCase() === targetMemberId.toLowerCase()) {
      return true;
    }

    // Role yang diizinkan menginspeksi nilai evaluasi anggota
    var authorizedRoles = [
      'SUPER_ADMIN',
      'ADMIN_PUSAT',
      'ADMIN_WILAYAH',
      'PEMBINA',
      'TOURISM_MANAGER'
    ];
    return authorizedRoles.indexOf(context.role) !== -1;
  }

  /**
   * Menghitung tingkatan kecakapan anggota berdasarkan jumlah SKK yang diselesaikan.
   * 
   * @param {number} completedCount 
   * @param {string} [currentLevel]
   * @returns {string} 'PURWA' | 'MADYA' | 'UTAMA'
   */
  function _determineLevel(completedCount, currentLevel) {
    if (currentLevel && ['PURWA', 'MADYA', 'UTAMA'].indexOf(currentLevel.toUpperCase()) !== -1) {
      return currentLevel.toUpperCase();
    }
    if (completedCount >= 8) return 'UTAMA';
    if (completedCount >= 3) return 'MADYA';
    return 'PURWA';
  }

  /**
   * Mengambil ringkasan profil pencapaian anggota (Read Model).
   * 
   * @param {string} memberId 
   * @param {Object} context 
   * @returns {Object}
   */
  function getAchievementSummary(memberId, context) {
    if (!memberId) {
      throw new Error('[SPWN_MISSING_PARAM] Member ID atau No KTA wajib disertakan');
    }

    // Ambil data dasar anggota dari MemberService
    var member = MemberService.findById(memberId, context ? context.role : 'MEMBER');
    if (!member) {
      throw new Error('[SPWN_NOT_FOUND] Data anggota tidak ditemukan: ' + memberId);
    }

    // Ambil status seluruh SKK untuk anggota ini
    var skillStatuses = getSkkStatusList(memberId, context);
    
    var completedCount = 0;
    var inProgressCount = 0;
    var notStartedCount = 0;
    var totalAvailable = 23; // Standar 23 SKK Nasional

    for (var i = 0; i < skillStatuses.length; i++) {
      var item = skillStatuses[i];
      if (item.status === 'COMPLETED') {
        completedCount++;
      } else if (item.status === 'IN_PROGRESS') {
        inProgressCount++;
      } else {
        notStartedCount++;
      }
    }

    // Jika record yang tersimpan kurang dari total SKK, sisa dianggap NOT_STARTED
    if (skillStatuses.length < totalAvailable) {
      notStartedCount += (totalAvailable - skillStatuses.length);
    }

    var progressPercent = Math.round((completedCount / totalAvailable) * 1000) / 10;
    var calculatedLevel = _determineLevel(completedCount, member.tingkat_keanggotaan || member.tingkat);

    var badges = getMemberBadges(memberId, context);
    var activities = getMemberActivities(memberId, context);

    // Bangun Read Model DTO (tanpa data sensitif NIK / nomor kontak)
    return {
      member: {
        memberId: member.no_kta || member.id,
        nama: member.nama_lengkap || member.nama,
        nomorKta: member.no_kta,
        fotoUrl: member.foto_url || member.foto || '',
        pangkalan: member.pangkalan || 'Gugus Depan SAKA Pariwisata',
        kwarcab: member.kabupaten_kota || member.kwartir_cabang || '',
        kwarda: member.provinsi || member.kwarda || '',
        kridaUtamaId: (member.krida || 'pemandu').toLowerCase().replace(/\s+/g, '-'),
        kridaUtamaNama: member.krida || 'Krida Pemandu Wisata',
        level: calculatedLevel,
        statusKta: member.status || 'ACTIVE',
        tanggalBergabung: member.tanggal_bergabung || member.created_at || ''
      },
      summary: {
        totalSkkAvailable: totalAvailable,
        completedSkk: completedCount,
        inProgressSkk: inProgressCount,
        notStartedSkk: notStartedCount,
        progressPercent: progressPercent,
        totalBadges: badges.length,
        totalActivities: activities.length
      }
    };
  }

  /**
   * Mengambil daftar status kecakapan SKK anggota dengan filter privasi nilai.
   * 
   * @param {string} memberId 
   * @param {Object} context 
   * @param {string} [filterKridaId]
   * @returns {Array<Object>}
   */
  function getSkkStatusList(memberId, context, filterKridaId) {
    var allowScores = _isSelfOrAuthorized(memberId, context);
    var records = [];

    try {
      var repo = _getSkillRepo();
      records = repo.findWhere({ member_id: memberId }) || [];
    } catch (e) {
      Logger.log('[AchievementService] Menggunakan fallback skill status: ' + e.message);
    }

    // Mapping DTO dan terapkan sensor nilai evaluasi jika tidak berwenang
    var result = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (filterKridaId && filterKridaId !== 'all' && r.krida_id !== filterKridaId) {
        continue;
      }

      var item = {
        skkCode: r.skk_code,
        nama: r.skk_nama || r.nama || r.skk_code,
        kridaId: r.krida_id,
        status: r.status || 'NOT_STARTED',
        levelAchieved: r.level_achieved || 'PURWA',
        startedAt: r.started_at || null,
        completedAt: r.completed_at || null,
        progressPercent: r.progress_percent || (r.status === 'COMPLETED' ? 100 : (r.status === 'IN_PROGRESS' ? 50 : 0))
      };

      // PRIVACY RULE: Nilai evaluasi HANYA ditampilkan untuk diri sendiri atau pengurus berwenang
      if (allowScores && r.score !== undefined && r.score !== null && r.score !== '') {
        item.score = Number(r.score);
      }

      result.push(item);
    }

    return result;
  }

  /**
   * Mengambil lencana digital (Badges) yang telah diraih anggota.
   * 
   * @param {string} memberId 
   * @param {Object} context 
   * @returns {Array<Object>}
   */
  function getMemberBadges(memberId, context) {
    var records = [];
    try {
      var repo = _getBadgeRepo();
      records = repo.findWhere({ member_id: memberId }) || [];
    } catch (e) {
      Logger.log('[AchievementService] Menggunakan fallback badges: ' + e.message);
    }

    var badges = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      badges.push({
        id: r.id || ('BG-' + (i + 1)),
        badgeCode: r.badge_code,
        badgeName: r.badge_name,
        category: r.category || 'Kepariwisataan',
        description: r.description || '',
        icon: r.icon_name || r.icon || 'Award',
        color: r.color_hex || r.color || '#0066B3',
        earnedAt: r.earned_at || ''
      });
    }

    return badges;
  }

  /**
   * Mengambil riwayat aktivitas kepariwisataan anggota.
   * MEDIA POLICY: thumbnail_url hanya berupa URL referensi preview, tidak mengunduh berkas.
   * 
   * @param {string} memberId 
   * @param {Object} context 
   * @returns {Array<Object>}
   */
  function getMemberActivities(memberId, context) {
    var records = [];
    try {
      var repo = _getActivityRepo();
      records = repo.findWhere({ member_id: memberId }) || [];
    } catch (e) {
      Logger.log('[AchievementService] Menggunakan fallback activities: ' + e.message);
    }

    var activities = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      activities.push({
        id: r.id || ('ACT-' + (i + 1)),
        activityName: r.activity_name,
        date: r.date,
        location: r.location || '',
        role: r.role || 'Peserta',
        // Media Policy: Preview-only URL reference
        thumbnailUrl: r.thumbnail_url || ''
      });
    }

    return activities;
  }

  return {
    getAchievementSummary: getAchievementSummary,
    getSkkStatusList: getSkkStatusList,
    getMemberBadges: getMemberBadges,
    getMemberActivities: getMemberActivities
  };
})();
