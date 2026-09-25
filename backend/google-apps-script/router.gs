/**
 * SPWN Apps 2.0 - Action-Based Router Engine
 * Location: backend/google-apps-script/router.gs
 * -----------------------------------------------
 * Tanggung Jawab:
 * 1. Pendaftaran Route (Action Registry Table).
 * 2. Eksekusi Middleware Chain (Rate Limit -> Auth -> RBAC -> Audit).
 * 3. Dispatching RequestContext ke target Controller.
 * 4. Penanganan Catch-all Route & Error Handling Sentral.
 */

var Router = (function() {
  var _routes = {};
  var _routesInitialized = false;

  /**
   * Mendaftarkan rute action ke registry tabel.
   * 
   * @param {string} action - Nama aksi unik (misal: 'member.list')
   * @param {Object} config
   * @param {Function} config.handler - Controller method
   * @param {boolean} [config.requireAuth=false] - Wajib login
   * @param {Array<string>} [config.roles] - Daftar role yang diizinkan
   * @param {string} [config.permission] - Permission spesifik yang diwajibkan
   */
  function register(action, config) {
    if (!action || !config) {
      throw new Error('[ROUTER_CONFIG_ERROR] Definisi rute tidak valid untuk action: ' + action);
    }
    _routes[action] = {
      handler: config.handler,
      requireAuth: config.requireAuth === true,
      roles: config.roles || null,
      permission: config.permission || null
    };
  }

  var _routesInitialized = false;

  function _ensureRoutesInitialized() {
    if (_routesInitialized) return;
    _initializeRoutes();
    _routesInitialized = true;
  }

  /**
   * Inisialisasi dan pendaftaran seluruh endpoint SPWN Apps 2.0.
   */
  function _initializeRoutes() {
    // -----------------------------------------------------------------
    // 1. AUTH DOMAIN
    // -----------------------------------------------------------------
    register('auth.login', {
      handler: function(ctx) { return AuthController.login(ctx); },
      requireAuth: false
    });
    register('auth.me', {
      handler: function(ctx) { return AuthController.me(ctx); },
      requireAuth: true
    });
    register('auth.logout', {
      handler: function(ctx) { return AuthController.logout(ctx); },
      requireAuth: true
    });

    // -----------------------------------------------------------------
    // 2. VERIFICATION DOMAIN
    // -----------------------------------------------------------------
    register('verify.kta', {
      handler: function(ctx) { return VerificationController.verify(ctx); },
      requireAuth: false
    });
    // Rute alias untuk kompatibilitas frontend & eksternal client
    register('verification.kta', {
      handler: function(ctx) { return VerificationController.verify(ctx); },
      requireAuth: false
    });
    register('verify.qr', {
      handler: function(ctx) { return VerificationController.verify(ctx); },
      requireAuth: false
    });
    register('verification.qr', {
      handler: function(ctx) { return VerificationController.verify(ctx); },
      requireAuth: false
    });
    register('verify.internal', {
      handler: function(ctx) { return VerificationController.internalVerify(ctx); },
      requireAuth: true,
      permission: 'VERIFY_KTA_INTERNAL'
    });

    // -----------------------------------------------------------------
    // 3. MEMBER DOMAIN
    // -----------------------------------------------------------------
    register('member.list', {
      handler: function(ctx) { return MemberController.list(ctx); },
      requireAuth: true,
      permission: 'MEMBER_READ'
    });
    register('member.detail', {
      handler: function(ctx) { return MemberController.detail(ctx); },
      requireAuth: true,
      permission: 'MEMBER_READ'
    });
    register('member.register', {
      handler: function(ctx) { return MemberController.register(ctx); },
      requireAuth: false
    });
    register('public.member.register', {
      handler: function(ctx) { return MemberController.register(ctx); },
      requireAuth: false
    });
    register('member.update', {
      handler: function(ctx) { return MemberController.update(ctx); },
      requireAuth: true,
      permission: 'MEMBER_UPDATE'
    });
    register('member.deactivate', {
      handler: function(ctx) { return MemberController.deactivate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });

    // Sub-domain: Member Achievement & Read Model
    register('member.achievement', {
      handler: function(ctx) { return AchievementController.getAchievement(ctx); },
      requireAuth: true
    });
    register('member.skk.status', {
      handler: function(ctx) { return AchievementController.getSkkStatus(ctx); },
      requireAuth: true
    });
    register('member.badges', {
      handler: function(ctx) { return AchievementController.getBadges(ctx); },
      requireAuth: true
    });
    register('member.activities', {
      handler: function(ctx) { return AchievementController.getActivities(ctx); },
      requireAuth: true
    });

    // -----------------------------------------------------------------
    // 4. TOURISM DOMAIN
    // -----------------------------------------------------------------
    register('tourism.destinations', {
      handler: function(ctx) { return TourismController.listDestinations(ctx); },
      requireAuth: false
    });
    register('tourism.destination', {
      handler: function(ctx) { return TourismController.getDestination(ctx); },
      requireAuth: false
    });
    register('tourism.createDestination', {
      handler: function(ctx) { return TourismController.createDestination(ctx); },
      requireAuth: true,
      permission: 'TOURISM_MANAGE'
    });
    register('tourism.packages', {
      handler: function(ctx) { return TourismController.listPackages(ctx); },
      requireAuth: false
    });
    register('tourism.review', {
      handler: function(ctx) { return TourismController.submitReview(ctx); },
      requireAuth: false // Public dual-gate (dengan rate limit) atau authenticated
    });
    register('tourism.partners', {
      handler: function(ctx) { return TourismController.listPartners(ctx); },
      requireAuth: false
    });

    // -----------------------------------------------------------------
    // 5. CONTENT DOMAIN
    // -----------------------------------------------------------------
    register('content.articles', {
      handler: function(ctx) { return ContentController.listArticles(ctx); },
      requireAuth: false
    });
    register('content.article', {
      handler: function(ctx) { return ContentController.getArticle(ctx); },
      requireAuth: false
    });
    register('content.draft', {
      handler: function(ctx) { return ContentController.createDraft(ctx); },
      requireAuth: true,
      permission: 'CONTENT_CREATE'
    });
    register('content.submitReview', {
      handler: function(ctx) { return ContentController.submitReview(ctx); },
      requireAuth: true,
      permission: 'CONTENT_CREATE'
    });
    register('content.publish', {
      handler: function(ctx) { return ContentController.publish(ctx); },
      requireAuth: true,
      permission: 'CONTENT_PUBLISH'
    });
    register('content.events', {
      handler: function(ctx) { return ContentController.listEvents(ctx); },
      requireAuth: false
    });
    register('content.gallery', {
      handler: function(ctx) { return ContentController.listGallery(ctx); },
      requireAuth: false
    });
    register('content.announcements', {
      handler: function(ctx) { return ContentController.listAnnouncements(ctx); },
      requireAuth: false
    });

    // -----------------------------------------------------------------
    // 6. COMMERCE DOMAIN
    // -----------------------------------------------------------------
    register('commerce.products', {
      handler: function(ctx) { return CommerceController.listProducts(ctx); },
      requireAuth: false
    });
    register('commerce.product', {
      handler: function(ctx) { return CommerceController.getProduct(ctx); },
      requireAuth: false
    });
    register('commerce.createProduct', {
      handler: function(ctx) { return CommerceController.createProduct(ctx); },
      requireAuth: true,
      permission: 'COMMERCE_MANAGE'
    });
    register('commerce.categories', {
      handler: function(ctx) { return CommerceController.listCategories(ctx); },
      requireAuth: false
    });
    register('commerce.order', {
      handler: function(ctx) { return CommerceController.checkout(ctx); },
      requireAuth: true,
      permission: 'COMMERCE_BUY'
    });
    register('commerce.orderDetail', {
      handler: function(ctx) { return CommerceController.getOrderDetail(ctx); },
      requireAuth: true
    });
    register('commerce.updateOrder', {
      handler: function(ctx) { return CommerceController.updateOrderStatus(ctx); },
      requireAuth: true,
      permission: 'COMMERCE_MANAGE'
    });

    // -----------------------------------------------------------------
    // 7. ADMIN MEMBER DOMAIN (RBAC & Regional Scoping)
    // -----------------------------------------------------------------
    register('admin.member.list', {
      handler: function(ctx) { return AdminMemberController.list(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.detail', {
      handler: function(ctx) { return AdminMemberController.detail(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.update', {
      handler: function(ctx) { return AdminMemberController.update(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.review', {
      handler: function(ctx) { return AdminMemberController.review(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.approve', {
      handler: function(ctx) { return AdminMemberController.approve(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.member.activate', {
      handler: function(ctx) { return AdminMemberController.activate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.member.reject', {
      handler: function(ctx) { return AdminMemberController.reject(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.resetPassword', {
      handler: function(ctx) { return AdminMemberController.resetPassword(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });

    // -----------------------------------------------------------------
    // 7b. ADMIN ASSIGNMENT DOMAIN (Super Admin Hierarchical Appointment)
    // -----------------------------------------------------------------
    register('admin.assignment.list', {
      handler: function(ctx) { return AdminMemberController.listAppointments(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.assignment.create', {
      handler: function(ctx) { return AdminMemberController.assignAdmin(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });
    register('admin.assignment.revoke', {
      handler: function(ctx) { return AdminMemberController.revokeAdmin(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });
    register('admin.assignment.resetPassword', {
      handler: function(ctx) { return AdminMemberController.resetAdminPassword(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });

    // -----------------------------------------------------------------
    // 8. ADMIN KTA MANAGEMENT DOMAIN (RBAC: ADMIN_PUSAT & SUPER_ADMIN)
    // -----------------------------------------------------------------
    register('admin.kta.generate', {
      handler: function(ctx) { return AdminKtaController.generate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.kta.regenerate', {
      handler: function(ctx) { return AdminKtaController.regenerate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.kta.preview', {
      handler: function(ctx) { return AdminKtaController.preview(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.history', {
      handler: function(ctx) { return AdminKtaController.history(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.batch', {
      handler: function(ctx) { return AdminKtaController.batch(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.template.get', {
      handler: function(ctx) { return AdminKtaController.getTemplate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.template.save', {
      handler: function(ctx) { return AdminKtaController.saveTemplate(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('admin.kta.template.uploadAsset', {
      handler: function(ctx) { return AdminKtaController.uploadAsset(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });

    // -----------------------------------------------------------------
    // 9. REGION & SEEDER DOMAIN
    // -----------------------------------------------------------------
    register('region.provinces', {
      handler: function(ctx) { return RegionController.provinces(ctx); },
      requireAuth: false
    });
    register('region.regencies', {
      handler: function(ctx) { return RegionController.regencies(ctx); },
      requireAuth: false
    });
    register('region.districts', {
      handler: function(ctx) { return RegionController.districts(ctx); },
      requireAuth: false
    });
    register('region.villages', {
      handler: function(ctx) { return RegionController.villages(ctx); },
      requireAuth: false
    });
    register('region.seedStatus', {
      handler: function(ctx) { return RegionController.seedStatus(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('region.runSeed', {
      handler: function(ctx) { return RegionController.runSeed(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });

    // -----------------------------------------------------------------
    // 10. DEVELOPER CODE REGISTRY DOMAIN (Phase 7.1 - SUPER_ADMIN Only)
    // -----------------------------------------------------------------
    register('developer.code.list', {
      handler: function(ctx) { return DeveloperController.list(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.detail', {
      handler: function(ctx) { return DeveloperController.detail(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.copy', {
      handler: function(ctx) { return DeveloperController.copy(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.history', {
      handler: function(ctx) { return DeveloperController.history(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.approve', {
      handler: function(ctx) { return DeveloperController.approve(ctx); },
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
  }

  /**
   * Mengeksekusi permintaan HTTP yang masuk sesuai Action yang diminta.
   * 
   * @param {Object} rawRequest - Objek request ternormalisasi dari Code.gs
   * @returns {Object} JSON Response Contract
   */
  function dispatch(rawRequest) {
    // Pastikan seluruh rute terdaftar setelah seluruh berkas controller selesai dimuat Apps Script
    _ensureRoutesInitialized();

    // Bangun RequestContext
    var context = RequestContext.create(rawRequest);
    var action = context.action;

    if (!action) {
      return ApiResponseFormatter.error(
        '',
        400,
        'Parameter [action] tidak ditemukan dalam request',
        { code: 'SPWN_MISSING_ACTION' },
        context.requestId
      );
    }

    var route = _routes[action];
    if (!route) {
      return ApiResponseFormatter.error(
        action,
        404,
        'Aksi [ ' + action + ' ] tidak terdaftar dalam router',
        { code: 'SPWN_UNKNOWN_ACTION' },
        context.requestId
      );
    }

    // 1. TAHAP AUTHENTICATION MIDDLEWARE
    var authRes = AuthMiddleware.authenticate(context, route.requireAuth);
    if (!authRes.success) {
      return ApiResponseFormatter.error(
        action,
        authRes.error.statusCode,
        authRes.error.message,
        { code: authRes.error.code },
        context.requestId
      );
    }

    // 2. TAHAP ROLE AUTHORIZATION MIDDLEWARE (jika route menentukan roles)
    if (route.roles && route.roles.length > 0) {
      var roleRes = AuthMiddleware.authorizeRole(context, route.roles);
      if (!roleRes.success) {
        return ApiResponseFormatter.error(
          action,
          roleRes.error.statusCode,
          roleRes.error.message,
          { code: roleRes.error.code },
          context.requestId
        );
      }
    }

    // 3. TAHAP PERMISSION AUTHORIZATION MIDDLEWARE (jika route menentukan permission)
    if (route.permission) {
      var permRes = AuthMiddleware.authorizePermission(context, route.permission);
      if (!permRes.success) {
        return ApiResponseFormatter.error(
          action,
          permRes.error.statusCode,
          permRes.error.message,
          { code: permRes.error.code },
          context.requestId
        );
      }
    }

    // 4. TAHAP CONTROLLER EXECUTION
    try {
      return route.handler(context);
    } catch (controllerErr) {
      Logger.log('[ROUTER ERROR] ' + action + ': ' + controllerErr.message + '\n' + (controllerErr.stack || ''));
      return ApiResponseFormatter.error(
        action,
        500,
        controllerErr.message || 'Terjadi kesalahan sistem internal pada controller',
        { code: controllerErr.code || 'SPWN_CONTROLLER_CRASH', stack: controllerErr.stack },
        context.requestId
      );
    }
  }

  return {
    register: register,
    dispatch: dispatch,
    getRoutes: function() {
      _ensureRoutesInitialized();
      return Object.keys(_routes);
    }
  };
})();
