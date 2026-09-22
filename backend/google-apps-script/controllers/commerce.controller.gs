/**
 * SPWN Apps 2.0 - Commerce Controller
 * Location: backend/google-apps-script/controllers/commerce.controller.gs
 * ----------------------------------------------------------------------
 * Menangani HTTP request untuk domain UMKM, Inventori & Transaksi:
 * - commerce.products (GET - Publik)
 * - commerce.product (GET - Publik)
 * - commerce.createProduct (POST - RequireAuth: COMMERCE_MANAGE)
 * - commerce.categories (GET - Publik)
 * - commerce.order (POST - RequireAuth: COMMERCE_BUY)
 * - commerce.orderDetail (GET - RequireAuth)
 * - commerce.updateOrder (POST - RequireAuth: COMMERCE_MANAGE + Audited)
 */

var CommerceController = (function() {

  /**
   * Mengambil katalog produk UMKM binaan (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listProducts(context) {
    var query = context.query || {};

    var queryOptions = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 16,
      search: query.search || '',
      kategori: query.kategori || '',
      toko_id: query.toko_id || ''
    };

    try {
      var result = CommerceService.listProducts(queryOptions);
      return ApiResponseFormatter.success(
        context.action,
        result.data,
        'Katalog produk berhasil dimuat',
        result.pagination,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat katalog produk',
        { code: err.code || 'SPWN_COMMERCE_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil detail produk UMKM (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function getProduct(context) {
    var id = (context.query && context.query.id) || (context.body && context.body.id);

    if (!id) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'ID produk wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var product = CommerceService.getProductById(id);
      if (!product) {
        return ApiResponseFormatter.error(
          context.action,
          404,
          'Produk tidak ditemukan: ' + id,
          { code: 'SPWN_NOT_FOUND' },
          context.requestId
        );
      }

      return ApiResponseFormatter.success(
        context.action,
        product,
        'Detail produk berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat detail produk',
        { code: err.code || 'SPWN_COMMERCE_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Pendaftaran produk baru (RequireAuth: COMMERCE_MANAGE).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function createProduct(context) {
    var body = context.body || {};

    if (!body.nama_produk || !body.harga) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nama produk dan harga wajib diisi',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var created = CommerceService.createProduct(body, context.user);
      return ApiResponseFormatter.success(
        context.action,
        created,
        'Produk berhasil didaftarkan ke katalog UMKM',
        null,
        context.requestId
      );
    } catch (err) {
      var status = (err.code === 'SPWN_VALIDATION_ERROR') ? 400 : 500;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal mendaftarkan produk',
        { code: err.code || 'SPWN_COMMERCE_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil daftar kategori produk (Publik).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function listCategories(context) {
    try {
      var categories = CommerceService.listCategories();
      return ApiResponseFormatter.success(
        context.action,
        categories,
        'Kategori produk berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat kategori',
        { code: err.code || 'SPWN_COMMERCE_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Transaksi Pemesanan / Checkout Produk (RequireAuth: COMMERCE_BUY).
   * Melakukan validasi stok dan pemotongan stok otomatis secara atomik.
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function checkout(context) {
    var body = context.body || {};

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Keranjang belanja kosong. Harap sertakan item produk.',
        { code: 'SPWN_VALIDATION_ERROR' },
        context.requestId
      );
    }

    try {
      var orderResult = OrderService.createOrder(body, context.user);
      AuditMiddleware.log(context, orderResult.invoiceNumber, 'SUCCESS', {
        grandTotal: orderResult.grandTotal,
        totalItems: orderResult.items.length
      });

      return ApiResponseFormatter.success(
        context.action,
        orderResult,
        'Pesanan berhasil dibuat. Faktur invoice telah diterbitkan.',
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, 'CHECKOUT_FAIL', 'FAILED', { error: err.message });
      var status = (err.code === 'SPWN_OUT_OF_STOCK') ? 409 : 400;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal memproses pesanan',
        { code: err.code || 'SPWN_CHECKOUT_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Mengambil rincian faktur invoice pesanan (RequireAuth).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function getOrderDetail(context) {
    var orderId = (context.query && (context.query.order_id || context.query.id)) || (context.body && context.body.order_id);

    if (!orderId) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nomor pesanan / invoice wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var order = OrderService.getOrderById(orderId);
      if (!order) {
        return ApiResponseFormatter.error(
          context.action,
          404,
          'Pesanan tidak ditemukan: ' + orderId,
          { code: 'SPWN_NOT_FOUND' },
          context.requestId
        );
      }

      // Security check: Hanya pemilik pesanan atau admin/seller yang boleh melihat
      var isOwner = (context.user && context.user.id === order.customer_id);
      var isAdmin = (context.role && (context.role.indexOf('ADMIN') !== -1 || context.role === 'SUPER_ADMIN'));

      if (!isOwner && !isAdmin) {
        return ApiResponseFormatter.error(
          context.action,
          403,
          'Anda tidak berhak melihat faktur pesanan ini',
          { code: 'SPWN_FORBIDDEN' },
          context.requestId
        );
      }

      return ApiResponseFormatter.success(
        context.action,
        order,
        'Detail pesanan berhasil dimuat',
        null,
        context.requestId
      );
    } catch (err) {
      return ApiResponseFormatter.error(
        context.action,
        500,
        err.message || 'Gagal memuat detail pesanan',
        { code: err.code || 'SPWN_ORDER_ERROR' },
        context.requestId
      );
    }
  }

  /**
   * Memperbarui status pesanan (RequireAuth: COMMERCE_MANAGE).
   * Dicatat dalam Audit Trail (AuditMiddleware).
   * 
   * @param {Object} context 
   * @returns {Object} ApiResponseFormatter
   */
  function updateOrderStatus(context) {
    var body = context.body || {};
    var orderId = body.order_id || body.id;
    var newStatus = body.status;

    if (!orderId || !newStatus) {
      return ApiResponseFormatter.error(
        context.action,
        400,
        'Nomor pesanan dan target status baru wajib disertakan',
        { code: 'SPWN_MISSING_PARAM' },
        context.requestId
      );
    }

    try {
      var updated = OrderService.updateOrderStatus(orderId, newStatus);
      AuditMiddleware.log(context, orderId, 'SUCCESS', { newStatus: newStatus });

      return ApiResponseFormatter.success(
        context.action,
        updated,
        'Status pesanan berhasil diperbarui menjadi: ' + newStatus,
        null,
        context.requestId
      );
    } catch (err) {
      AuditMiddleware.log(context, orderId, 'FAILED', { error: err.message, status: newStatus });
      var status = (err.code === 'SPWN_NOT_FOUND') ? 404 : 400;
      return ApiResponseFormatter.error(
        context.action,
        status,
        err.message || 'Gagal memperbarui status pesanan',
        { code: err.code || 'SPWN_ORDER_UPDATE_ERROR' },
        context.requestId
      );
    }
  }

  return {
    listProducts: listProducts,
    getProduct: getProduct,
    createProduct: createProduct,
    listCategories: listCategories,
    checkout: checkout,
    getOrderDetail: getOrderDetail,
    updateOrderStatus: updateOrderStatus
  };
})();
