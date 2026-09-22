/**
 * SPWN Apps 2.0 - Content & Media Publishing Domain Service
 * Location: backend/google-apps-script/services/content.service.gs
 * ---------------------------------------------------------------
 * Layanan publikasi Warta, Berita, Artikel, Agenda Kegiatan Pramuka,
 * Galeri Dokumentasi, dan Pengumuman Resmi SAKA Pariwisata.
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - core/cache.service.gs (CacheManager, generateCacheKey)
 * - config/database.config.gs (CONTENT Database Domain)
 * - config/system.config.gs (SPWN_SYSTEM)
 * 
 * ATURAN WORKFLOW KONTEN (STRICT):
 * Status resmi konten: DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED.
 * Dilarang mengubah status langsung ke PUBLISHED tanpa melalui tahap validasi alur kerja (workflow).
 */

// =========================================================================
// INTERNAL ABSTRACTION: CONTENT WORKFLOW ENGINE
// =========================================================================
var ContentWorkflow = (function() {
  var STATUS = {
    DRAFT: 'DRAFT',
    REVIEW: 'REVIEW',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
  };

  // Matriks Transisi Status yang Sah
  var ALLOWED_TRANSITIONS = {
    DRAFT: ['REVIEW'],
    REVIEW: ['PUBLISHED', 'DRAFT'], // DRAFT jika ditolak (reject) untuk revisi
    PUBLISHED: ['ARCHIVED'],
    ARCHIVED: ['DRAFT', 'PUBLISHED'] // Restore
  };

  /**
   * Memvalidasi apakah transisi dari status awal ke status target diperbolehkan.
   * 
   * @param {string} fromStatus 
   * @param {string} toStatus 
   * @returns {boolean}
   */
  function isValidTransition(fromStatus, toStatus) {
    fromStatus = (fromStatus || '').toUpperCase();
    toStatus = (toStatus || '').toUpperCase();

    if (!ALLOWED_TRANSITIONS[fromStatus]) return false;
    return ALLOWED_TRANSITIONS[fromStatus].indexOf(toStatus) !== -1;
  }

  /**
   * Helper pembuat slug ramah SEO dari judul artikel.
   * 
   * @param {string} title 
   * @returns {string} Contoh: 'diklat-krida-bina-wisata-jabar-2026'
   */
  function generateSlug(title) {
    if (!title) return 'konten-' + new Date().getTime();
    var clean = title.toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return clean || ('konten-' + new Date().getTime());
  }

  return {
    STATUS: STATUS,
    isValidTransition: isValidTransition,
    generateSlug: generateSlug
  };
})();


// =========================================================================
// MAIN SERVICE: CONTENT SERVICE
// =========================================================================
var ContentService = (function() {
  var _beritaRepo = null;
  var _agendaRepo = null;
  var _galeriRepo = null;
  var _pengumumanRepo = null;

  function _getBeritaRepo() {
    if (!_beritaRepo) {
      _beritaRepo = SpreadsheetRepository.create('CONTENT', 'BERITA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _beritaRepo;
  }

  function _getAgendaRepo() {
    if (!_agendaRepo) {
      _agendaRepo = SpreadsheetRepository.create('CONTENT', 'AGENDA', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _agendaRepo;
  }

  function _getGaleriRepo() {
    if (!_galeriRepo) {
      _galeriRepo = SpreadsheetRepository.create('CONTENT', 'GALERI', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _galeriRepo;
  }

  function _getPengumumanRepo() {
    if (!_pengumumanRepo) {
      _pengumumanRepo = SpreadsheetRepository.create('CONTENT', 'PENGUMUMAN', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _pengumumanRepo;
  }

  function _createServiceError(code, message, details) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    if (details) err.details = details;
    return err;
  }

  // -----------------------------------------------------------------------
  // 1. BERITA & ARTIKEL
  // -----------------------------------------------------------------------

  /**
   * Menampilkan warta/berita terpaginasi.
   * Publik hanya dapat melihat artikel berstatus 'PUBLISHED'.
   * 
   * @param {Object} queryOptions 
   * @param {string} [callerRole='PUBLIC']
   * @returns {{ data: Array<Object>, pagination: Object }}
   */
  function listArticles(queryOptions, callerRole) {
    queryOptions = queryOptions || {};
    var beritaRepo = _getBeritaRepo();

    var repoOptions = {
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 10,
      search: queryOptions.search,
      searchColumns: ['judul', 'ringkasan', 'kategori', 'penulis'],
      sortBy: queryOptions.sortBy || 'published_at',
      sortOrder: queryOptions.sortOrder || 'desc',
      filter: {}
    };

    // Filter status berdasarkan peran
    var isAdmin = callerRole && (callerRole.indexOf('ADMIN') !== -1 || callerRole.indexOf('EDITOR') !== -1);
    if (!isAdmin) {
      repoOptions.filter.status = ContentWorkflow.STATUS.PUBLISHED;
    } else if (queryOptions.status) {
      repoOptions.filter.status = queryOptions.status;
    }

    if (queryOptions.kategori) {
      repoOptions.filter.kategori = queryOptions.kategori;
    }

    return beritaRepo.findAll(repoOptions);
  }

  /**
   * Mengambil rincian artikel berdasarkan ID atau Slug SEO.
   * 
   * @param {string} slugOrId 
   * @param {string} [callerRole='PUBLIC']
   * @returns {Object|null}
   */
  function getArticleBySlugOrId(slugOrId, callerRole) {
    if (!slugOrId) return null;

    var cleanKey = slugOrId.toString().trim();
    var beritaRepo = _getBeritaRepo();

    var article = beritaRepo.findOne(function(item) {
      return (item.id === cleanKey || item.slug === cleanKey);
    });

    if (!article) return null;

    var isAdmin = callerRole && (callerRole.indexOf('ADMIN') !== -1 || callerRole.indexOf('EDITOR') !== -1);
    if (!isAdmin && article.status !== ContentWorkflow.STATUS.PUBLISHED) {
      return null; // Publik dilarang mengakses draft/review
    }

    // Naikkan pembaca (views_count) secara asinkron
    try {
      var currentViews = parseInt(article.views_count, 10) || 0;
      beritaRepo.update(article.id, { views_count: currentViews + 1 });
    } catch (e) {
      // Abaikan bila log views gagal
    }

    return article;
  }

  /**
   * Membuat draf warta/artikel baru. Status awal selalu 'DRAFT'.
   * 
   * @param {Object} payload 
   * @param {Object} author 
   * @returns {Object}
   */
  function createArticleDraft(payload, author) {
    if (!payload || !payload.judul) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Judul artikel wajib diisi');
    }

    author = author || {};
    var beritaRepo = _getBeritaRepo();

    var newId = 'ART-' + new Date().getTime().toString(36).toUpperCase();
    var baseSlug = ContentWorkflow.generateSlug(payload.judul);
    var uniqueSlug = baseSlug + '-' + newId.toLowerCase();

    var articleRecord = {
      id: newId,
      judul: payload.judul.trim(),
      slug: uniqueSlug,
      kategori: payload.kategori || 'Warta Kepariwisataan',
      ringkasan: payload.ringkasan || '',
      isi_konten: payload.isi_konten || payload.konten || '',
      gambar_sampul: payload.gambar_sampul || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop',
      penulis: author.nama || author.nama_lengkap || 'Kontributor SAKA',
      penulis_id: author.userId || author.id || '',
      no_kta: author.no_kta || '',
      views_count: 0,
      status: ContentWorkflow.STATUS.DRAFT,
      created_at: new Date().toISOString()
    };

    return beritaRepo.insert(articleRecord);
  }

  /**
   * Mengajukan artikel ke tahap peninjauan editor (DRAFT -> REVIEW).
   * 
   * @param {string} articleId 
   * @param {Object} author 
   * @returns {Object}
   */
  function submitForReview(articleId, author) {
    var beritaRepo = _getBeritaRepo();
    var article = beritaRepo.findById(articleId);
    if (!article) {
      throw _createServiceError('SPWN_NOT_FOUND', 'Artikel tidak ditemukan: ' + articleId);
    }

    var currentStatus = article.status || ContentWorkflow.STATUS.DRAFT;
    if (!ContentWorkflow.isValidTransition(currentStatus, ContentWorkflow.STATUS.REVIEW)) {
      throw _createServiceError(
        'SPWN_WORKFLOW_INVALID',
        'Transisi status tidak diizinkan: dari ' + currentStatus + ' ke ' + ContentWorkflow.STATUS.REVIEW
      );
    }

    return beritaRepo.update(articleId, {
      status: ContentWorkflow.STATUS.REVIEW,
      submitted_at: new Date().toISOString()
    });
  }

  /**
   * Menyetujui dan mempublikasikan artikel resmi (REVIEW -> PUBLISHED).
   * 
   * @param {string} articleId 
   * @param {Object} reviewer - Akun editor/admin berwenang
   * @returns {Object}
   */
  function approveAndPublish(articleId, reviewer) {
    var beritaRepo = _getBeritaRepo();
    var article = beritaRepo.findById(articleId);
    if (!article) {
      throw _createServiceError('SPWN_NOT_FOUND', 'Artikel tidak ditemukan: ' + articleId);
    }

    var currentStatus = article.status || ContentWorkflow.STATUS.DRAFT;
    if (!ContentWorkflow.isValidTransition(currentStatus, ContentWorkflow.STATUS.PUBLISHED)) {
      throw _createServiceError(
        'SPWN_WORKFLOW_INVALID',
        'DILARANG langsung menerbitkan artikel dari status ' + currentStatus + '. Artikel harus melewati status REVIEW terlebih dahulu.'
      );
    }

    reviewer = reviewer || {};
    return beritaRepo.update(articleId, {
      status: ContentWorkflow.STATUS.PUBLISHED,
      published_at: new Date().toISOString(),
      published_by: reviewer.nama || reviewer.userId || 'Editor SAKA'
    });
  }

  /**
   * Menolak artikel peninjauan dan mengembalikannya ke DRAFT untuk revisi (REVIEW -> DRAFT).
   * 
   * @param {string} articleId 
   * @param {Object} reviewer 
   * @param {string} reason 
   * @returns {Object}
   */
  function rejectToDraft(articleId, reviewer, reason) {
    var beritaRepo = _getBeritaRepo();
    var article = beritaRepo.findById(articleId);
    if (!article) {
      throw _createServiceError('SPWN_NOT_FOUND', 'Artikel tidak ditemukan');
    }

    var currentStatus = article.status || ContentWorkflow.STATUS.DRAFT;
    if (!ContentWorkflow.isValidTransition(currentStatus, ContentWorkflow.STATUS.DRAFT)) {
      throw _createServiceError('SPWN_WORKFLOW_INVALID', 'Hanya artikel status REVIEW yang dapat ditolak ke DRAFT');
    }

    return beritaRepo.update(articleId, {
      status: ContentWorkflow.STATUS.DRAFT,
      rejection_reason: reason || 'Memerlukan perbaikan isi materi',
      reviewed_by: (reviewer && reviewer.nama) || 'Editor SAKA'
    });
  }

  /**
   * Mengarsipkan artikel yang sudah tidak relevan (PUBLISHED -> ARCHIVED).
   * 
   * @param {string} articleId 
   * @returns {Object}
   */
  function archiveArticle(articleId) {
    var beritaRepo = _getBeritaRepo();
    var article = beritaRepo.findById(articleId);
    if (!article) {
      throw _createServiceError('SPWN_NOT_FOUND', 'Artikel tidak ditemukan');
    }

    var currentStatus = article.status || ContentWorkflow.STATUS.DRAFT;
    if (!ContentWorkflow.isValidTransition(currentStatus, ContentWorkflow.STATUS.ARCHIVED)) {
      throw _createServiceError('SPWN_WORKFLOW_INVALID', 'Hanya artikel terbit (PUBLISHED) yang dapat diarsipkan');
    }

    return beritaRepo.update(articleId, {
      status: ContentWorkflow.STATUS.ARCHIVED,
      archived_at: new Date().toISOString()
    });
  }

  // -----------------------------------------------------------------------
  // 2. AGENDA KEGIATAN
  // -----------------------------------------------------------------------

  /**
   * Menampilkan agenda kegiatan terpaginasi.
   * 
   * @param {Object} queryOptions 
   * @returns {{ data: Array<Object>, pagination: Object }}
   */
  function listEvents(queryOptions) {
    queryOptions = queryOptions || {};
    var agendaRepo = _getAgendaRepo();

    var repoOptions = {
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 15,
      search: queryOptions.search,
      searchColumns: ['nama_kegiatan', 'lokasi', 'provinsi', 'tingkat'],
      sortBy: queryOptions.sortBy || 'tanggal_mulai',
      sortOrder: queryOptions.sortOrder || 'asc',
      filter: { status: 'ACTIVE' }
    };

    if (queryOptions.provinsi_id) {
      repoOptions.filter.provinsi_id = queryOptions.provinsi_id;
    }

    return agendaRepo.findAll(repoOptions);
  }

  /**
   * Mendaftarkan agenda kegiatan baru.
   * 
   * @param {Object} payload 
   * @param {Object} organizer 
   * @returns {Object}
   */
  function createEvent(payload, organizer) {
    if (!payload || !payload.nama_kegiatan) {
      throw _createServiceError('SPWN_VALIDATION_ERROR', 'Nama kegiatan wajib diisi');
    }

    var agendaRepo = _getAgendaRepo();
    var eventId = 'EVT-' + new Date().getTime().toString(36).toUpperCase();

    var eventRecord = {
      id: eventId,
      nama_kegiatan: payload.nama_kegiatan.trim(),
      tingkat: payload.tingkat || 'Kwartir Cabang',
      tanggal_mulai: payload.tanggal_mulai || new Date().toISOString().slice(0, 10),
      tanggal_selesai: payload.tanggal_selesai || '',
      lokasi: payload.lokasi || 'Bumi Perkemahan / Destinasi Wisata',
      provinsi_id: payload.provinsi_id || '32',
      provinsi: payload.provinsi || 'Jawa Barat',
      deskripsi: payload.deskripsi || '',
      biaya_partisipasi: parseFloat(payload.biaya_partisipasi) || 0,
      narahubung: payload.narahubung || '',
      penyelenggara: (organizer && organizer.nama) || 'SAKA Pariwisata',
      status: 'ACTIVE'
    };

    return agendaRepo.insert(eventRecord);
  }

  // -----------------------------------------------------------------------
  // 3. GALERI DOKUMENTASI
  // -----------------------------------------------------------------------

  /**
   * Menampilkan dokumentasi galeri.
   * 
   * @param {Object} queryOptions 
   * @returns {Array<Object>}
   */
  function listGallery(queryOptions) {
    queryOptions = queryOptions || {};
    var galeriRepo = _getGaleriRepo();

    var result = galeriRepo.findAll({
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 24,
      filter: { status: 'ACTIVE' },
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    return result.data;
  }

  // -----------------------------------------------------------------------
  // 4. PENGUMUMAN RESMI
  // -----------------------------------------------------------------------

  /**
   * Menampilkan pengumuman resmi pimpinan SAKA Pariwisata.
   * 
   * @returns {Array<Object>}
   */
  function listAnnouncements() {
    var repo = _getPengumumanRepo();
    var result = repo.findAll({
      page: 1,
      limit: 10,
      filter: { status: 'ACTIVE' },
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    return result.data;
  }

  return {
    // Berita & Workflow
    listArticles: listArticles,
    getArticleBySlugOrId: getArticleBySlugOrId,
    createArticleDraft: createArticleDraft,
    submitForReview: submitForReview,
    approveAndPublish: approveAndPublish,
    rejectToDraft: rejectToDraft,
    archiveArticle: archiveArticle,
    // Agenda
    listEvents: listEvents,
    createEvent: createEvent,
    // Galeri & Pengumuman
    listGallery: listGallery,
    listAnnouncements: listAnnouncements
  };
})();
