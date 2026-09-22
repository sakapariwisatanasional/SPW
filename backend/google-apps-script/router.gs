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
    if (!action || !config || typeof config.handler !== 'function') {
      throw new Error('[ROUTER_CONFIG_ERROR] Definisi rute tidak valid untuk action: ' + action);
    }
    _routes[action] = {
      handler: config.handler,
      requireAuth: config.requireAuth === true,
      roles: config.roles || null,
      permission: config.permission || null
    };
  }

  /**
   * Inisialisasi dan pendaftaran seluruh endpoint SPWN Apps 2.0.
   */
  function _initializeRoutes() {
    // -----------------------------------------------------------------
    // 1. AUTH DOMAIN
    // -----------------------------------------------------------------
    register('auth.login', {
      handler: AuthController.login,
      requireAuth: false
    });
    register('auth.me', {
      handler: AuthController.me,
      requireAuth: true
    });
    register('auth.logout', {
      handler: AuthController.logout,
      requireAuth: true
    });

    // -----------------------------------------------------------------
    // 2. VERIFICATION DOMAIN
    // -----------------------------------------------------------------
    register('verify.kta', {
      handler: VerificationController.verify,
      requireAuth: false
    });
    register('verify.internal', {
      handler: VerificationController.internalVerify,
      requireAuth: true,
      permission: 'VERIFY_KTA_INTERNAL'
    });

    // -----------------------------------------------------------------
    // 3. MEMBER DOMAIN
    // -----------------------------------------------------------------
    register('member.list', {
      handler: MemberController.list,
      requireAuth: true,
      permission: 'MEMBER_READ'
    });
    register('member.detail', {
      handler: MemberController.detail,
      requireAuth: true,
      permission: 'MEMBER_READ'
    });
    register('member.register', {
      handler: MemberController.register,
      requireAuth: true,
      permission: 'MEMBER_CREATE'
    });
    register('public.member.register', {
      handler: MemberController.register,
      requireAuth: false
    });
    register('member.update', {
      handler: MemberController.update,
      requireAuth: true,
      permission: 'MEMBER_UPDATE'
    });
    register('member.deactivate', {
      handler: MemberController.deactivate,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });

    // Sub-domain: Member Achievement & Read Model
    register('member.achievement', {
      handler: AchievementController.getAchievement,
      requireAuth: true
    });
    register('member.skk.status', {
      handler: AchievementController.getSkkStatus,
      requireAuth: true
    });
    register('member.badges', {
      handler: AchievementController.getBadges,
      requireAuth: true
    });
    register('member.activities', {
      handler: AchievementController.getActivities,
      requireAuth: true
    });

    // -----------------------------------------------------------------
    // 4. TOURISM DOMAIN
    // -----------------------------------------------------------------
    register('tourism.destinations', {
      handler: TourismController.listDestinations,
      requireAuth: false
    });
    register('tourism.destination', {
      handler: TourismController.getDestination,
      requireAuth: false
    });
    register('tourism.createDestination', {
      handler: TourismController.createDestination,
      requireAuth: true,
      permission: 'TOURISM_MANAGE'
    });
    register('tourism.packages', {
      handler: TourismController.listPackages,
      requireAuth: false
    });
    register('tourism.review', {
      handler: TourismController.submitReview,
      requireAuth: false // Public dual-gate (dengan rate limit) atau authenticated
    });
    register('tourism.partners', {
      handler: TourismController.listPartners,
      requireAuth: false
    });

    // -----------------------------------------------------------------
    // 5. CONTENT DOMAIN
    // -----------------------------------------------------------------
    register('content.articles', {
      handler: ContentController.listArticles,
      requireAuth: false
    });
    register('content.article', {
      handler: ContentController.getArticle,
      requireAuth: false
    });
    register('content.draft', {
      handler: ContentController.createDraft,
      requireAuth: true,
      permission: 'CONTENT_CREATE'
    });
    register('content.submitReview', {
      handler: ContentController.submitReview,
      requireAuth: true,
      permission: 'CONTENT_CREATE'
    });
    register('content.publish', {
      handler: ContentController.publish,
      requireAuth: true,
      permission: 'CONTENT_PUBLISH'
    });
    register('content.events', {
      handler: ContentController.listEvents,
      requireAuth: false
    });
    register('content.gallery', {
      handler: ContentController.listGallery,
      requireAuth: false
    });
    register('content.announcements', {
      handler: ContentController.listAnnouncements,
      requireAuth: false
    });

    // -----------------------------------------------------------------
    // 6. COMMERCE DOMAIN
    // -----------------------------------------------------------------
    register('commerce.products', {
      handler: CommerceController.listProducts,
      requireAuth: false
    });
    register('commerce.product', {
      handler: CommerceController.getProduct,
      requireAuth: false
    });
    register('commerce.createProduct', {
      handler: CommerceController.createProduct,
      requireAuth: true,
      permission: 'COMMERCE_MANAGE'
    });
    register('commerce.categories', {
      handler: CommerceController.listCategories,
      requireAuth: false
    });
    register('commerce.order', {
      handler: CommerceController.checkout,
      requireAuth: true,
      permission: 'COMMERCE_BUY'
    });
    register('commerce.orderDetail', {
      handler: CommerceController.getOrderDetail,
      requireAuth: true
    });
    register('commerce.updateOrder', {
      handler: CommerceController.updateOrderStatus,
      requireAuth: true,
      permission: 'COMMERCE_MANAGE'
    });

    // -----------------------------------------------------------------
    // 7. ADMIN MEMBER DOMAIN (RBAC & Regional Scoping)
    // -----------------------------------------------------------------
    register('admin.member.list', {
      handler: AdminMemberController.list,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.detail', {
      handler: AdminMemberController.detail,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.update', {
      handler: AdminMemberController.update,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.review', {
      handler: AdminMemberController.review,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.approve', {
      handler: AdminMemberController.approve,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.member.activate', {
      handler: AdminMemberController.activate,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.member.reject', {
      handler: AdminMemberController.reject,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.member.resetPassword', {
      handler: AdminMemberController.resetPassword,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });

    // -----------------------------------------------------------------
    // 7b. ADMIN ASSIGNMENT DOMAIN (Super Admin Hierarchical Appointment)
    // -----------------------------------------------------------------
    register('admin.assignment.list', {
      handler: AdminMemberController.listAppointments,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.assignment.create', {
      handler: AdminMemberController.assignAdmin,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });
    register('admin.assignment.revoke', {
      handler: AdminMemberController.revokeAdmin,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });
    register('admin.assignment.resetPassword', {
      handler: AdminMemberController.resetAdminPassword,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT']
    });

    // -----------------------------------------------------------------
    // 8. ADMIN KTA MANAGEMENT DOMAIN (RBAC: ADMIN_PUSAT & SUPER_ADMIN)
    // -----------------------------------------------------------------
    register('admin.kta.generate', {
      handler: AdminKtaController.generate,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.kta.regenerate', {
      handler: AdminKtaController.regenerate,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('admin.kta.preview', {
      handler: AdminKtaController.preview,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.history', {
      handler: AdminKtaController.history,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.batch', {
      handler: AdminKtaController.batch,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.template.get', {
      handler: AdminKtaController.getTemplate,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL', 'ADMIN_WILAYAH']
    });
    register('admin.kta.template.save', {
      handler: AdminKtaController.saveTemplate,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('admin.kta.template.uploadAsset', {
      handler: AdminKtaController.uploadAsset,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });

    // -----------------------------------------------------------------
    // 9. REGION & SEEDER DOMAIN
    // -----------------------------------------------------------------
    register('region.provinces', {
      handler: RegionController.provinces,
      requireAuth: false
    });
    register('region.regencies', {
      handler: RegionController.regencies,
      requireAuth: false
    });
    register('region.districts', {
      handler: RegionController.districts,
      requireAuth: false
    });
    register('region.villages', {
      handler: RegionController.villages,
      requireAuth: false
    });
    register('region.seedStatus', {
      handler: RegionController.seedStatus,
      requireAuth: true,
      roles: ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_NASIONAL']
    });
    register('region.runSeed', {
      handler: RegionController.runSeed,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });

    // -----------------------------------------------------------------
    // 10. DEVELOPER CODE REGISTRY DOMAIN (Phase 7.1 - SUPER_ADMIN Only)
    // -----------------------------------------------------------------
    register('developer.code.list', {
      handler: DeveloperController.list,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.detail', {
      handler: DeveloperController.detail,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.copy', {
      handler: DeveloperController.copy,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.history', {
      handler: DeveloperController.history,
      requireAuth: true,
      roles: ['SUPER_ADMIN']
    });
    register('developer.code.approve', {
      handler: DeveloperController.approve,
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

  // Muat daftar rute saat modul diinisialisasi
  _initializeRoutes();

  return {
    register: register,
    dispatch: dispatch,
    getRoutes: function() { return Object.keys(_routes); }
  };
})();
