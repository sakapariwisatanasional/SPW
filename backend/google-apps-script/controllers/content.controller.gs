/**
 * SPWN Apps 2.0 - Content Controller
 * Location: backend/google-apps-script/controllers/content.controller.gs
 * --------------------------------------------------------------------
 * Menangani HTTP request untuk domain Konten, Berita & Publikasi:
 * - content.articles (GET)
 * - content.article (GET)
 * - content.draft (POST - RequireAuth: CONTENT_CREATE)
 * - content.submitReview (POST - RequireAuth: CONTENT_CREATE)
 * - content.publish (POST - RequireAuth: CONTENT_PUBLISH + Audited)
 * - content.events (GET)
 * - content.gallery (GET)
 * - content.announcements (GET)
 */

var ContentController = (function() {

  /**
   * Mengambil daftar warta / artikel terpaginasi.
   * Publik hanya dapat melihat status 'PUBLISHED'.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listArticles(context) {
    var query = context.query || {};

    var queryOptions = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      search: query.search || '',
      kategori: query.kategori || '',
      status: query.status || ''
    };

    try {
      var result = ContentService.listArticles(queryOptions, context.role);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Daftar artikel berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal mengambil daftar artikel',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil rincian artikel berdasarkan Slug SEO atau ID.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function getArticle(context) {
    var key = (context.query && (context.query.slug || context.query.id)) || (context.body && (context.body.slug || context.body.id));

    if (!key) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Slug atau ID artikel wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var article = ContentService.getArticleBySlugOrId(key, context.role);
      if (!article) {
        return ApiResponseFormatter.error(
          context.action,
          404,
          'Artikel tidak ditemukan atau belum dipublikasikan',
          { code: 'SPWN_NOT_FOUND' },
          context.requestId
        );
      }

      return ApiResponseFormatter.success(
        context.action,
        article,
        'Detail artikel berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat artikel',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Membuat draf warta / artikel baru (RequireAuth: CONTENT_CREATE).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function createDraft(context) {
    var body = context.body || {};

    if (!body.judul) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Judul artikel wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var draft = ContentService.createArticleDraft(body, context.user);
      return ApiResponseFormatter.success(
        context.action,
        draft,
        'Draf artikel berhasil disimpan',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        err.message || 'Gagal membuat draf artikel',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengajukan artikel ke antrean peninjauan editor (DRAFT -> REVIEW).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function submitReview(context) {
    var articleId = (context.body && context.body.id) || (context.query && context.query.id);

    if (!articleId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID artikel wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var submitted = ContentService.submitForReview(articleId, context.user);
      return ApiResponseFormatter.success(
        context.action,
        submitted,
        'Artikel berhasil diajukan untuk peninjauan editor',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        err.message || 'Gagal mengajukan artikel',
        { code: err.code || 'SPWN_WORKFLOW_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Menyetujui dan menerbitkan artikel resmi (REVIEW -> PUBLISHED).
   * Dicatat dalam Audit Trail (AuditMiddleware).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function publish(context) {
    var articleId = (context.body && context.body.id) || (context.query && context.query.id);

    if (!articleId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID artikel wajib disertakan untuk publikasi',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var published = ContentService.approveAndPublish(articleId, context.user);
      AuditMiddleware.log(context, articleId, 'SUCCESS', { judul: published.judul, publisher: context.user.nama });

      return ApiResponseFormatter.success(
        context.action,
        published,
        'Artikel resmi berhasil diterbitkan ke publik',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, articleId, 'FAILED', { error: err.message });
      var status = (err.code === 'SPWN_WORKFLOW_INVALID') ? 422 : 400;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal mempublikasikan artikel',
        { code: err.code || 'SPWN_WORKFLOW_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil kalender agenda kegiatan kepramukaan (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listEvents(context) {
    var query = context.query || {};

    try {
      var result = ContentService.listEvents({
        page: parseInt(query.page, 10) || 1,
        limit: parseInt(query.limit, 10) || 15,
        search: query.search || '',
        provinsi_id: query.provinsi_id || query.provinsiId || ''
      });

      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Agenda kegiatan berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat agenda kegiatan',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil dokumentasi galeri (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listGallery(context) {
    var query = context.query || {};

    try {
      var items = ContentService.listGallery({
        page: parseInt(query.page, 10) || 1,
        limit: parseInt(query.limit, 10) || 24
      });

      return ApiResponseFormatter.success(
        context.action,
        items,
        'Galeri dokumentasi berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat galeri',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil pengumuman resmi pimpinan SAKA (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listAnnouncements(context) {
    try {
      var list = ContentService.listAnnouncements();
      return ApiResponseFormatter.success(
        context.action,
        list,
        'Pengumuman resmi berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat pengumuman',
        { code: err.code || 'SPWN_CONTENT_ERROR' },
        context.requestId
      );
    }
  }

  return {
    listArticles: listArticles,
    getArticle: getArticle,
    createDraft: createDraft,
    submitReview: submitReview,
    publish: publish,
    listEvents: listEvents,
    listGallery: listGallery,
    listAnnouncements: listAnnouncements
  };
})();
