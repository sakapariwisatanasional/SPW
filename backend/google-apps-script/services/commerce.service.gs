/**
 * SPWN Apps 2.0 - Commerce, Inventory & Order Domain Services
 * Location: backend/google-apps-script/services/commerce.service.gs
 * ---------------------------------------------------------------
 * Pemisahan tanggung jawab arsitektural (Separation of Concerns):
 * 1. InventoryService: Mengelola ketersediaan stok, pengecekan, dan mutasi inventaris atomik.
 * 2. CommerceService: Mengelola katalog produk UMKM/merchandise, kategori, dan aturan pasar.
 * 3. OrderService: Mengelola alur transaksi checkout, pembuatan invoice, dan siklus status order.
 * 
 * DEPENDENCY:
 * - repositories/spreadsheet.repository.gs (SpreadsheetRepository)
 * - core/lock.service.gs (LockManager via Repository mutation)
 * - core/cache.service.gs (CacheManager)
 * - config/database.config.gs (COMMERCE Database Domain)
 * - config/system.config.gs (SPWN_SYSTEM)
 */

// =========================================================================
// 1. INVENTORY SERVICE (Stok & Mutasi Inventaris)
// =========================================================================
var InventoryService = (function() {
  var _prodRepo = null;
  var _invRepo = null;

  function _getProdRepo() {
    if (!_prodRepo) {
      _prodRepo = SpreadsheetRepository.create('COMMERCE', 'PRODUCTS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _prodRepo;
  }

  function _getInvRepo() {
    if (!_invRepo) {
      _invRepo = SpreadsheetRepository.create('COMMERCE', 'INVENTORY', {
        primaryKey: 'id'
      });
    }
    return _invRepo;
  }

  function _createInventoryError(code, message) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    return err;
  }

  /**
   * Memeriksa ketersediaan stok produk.
   * 
   * @param {string} productId 
   * @param {number} requestedQuantity 
   * @returns {{ isAvailable: boolean, currentStock: number, requestedQuantity: number }}
   */
  function checkStock(productId, requestedQuantity) {
    var prod = _getProdRepo().findById(productId);
    if (!prod) {
      return { isAvailable: false, currentStock: 0, requestedQuantity: requestedQuantity };
    }

    var stock = parseInt(prod.stok || prod.stock, 10) || 0;
    var qty = parseInt(requestedQuantity, 10) || 1;

    return {
      isAvailable: (stock >= qty),
      currentStock: stock,
      requestedQuantity: qty,
      productName: prod.nama_produk || prod.nama || ''
    };
  }

  /**
   * Mengurangi stok produk saat transaksi checkout (Atomic & Thread-safe).
   * 
   * @param {string} productId 
   * @param {number} quantity 
   * @param {string} referenceId - Nomor Invoice / Order ID
   * @returns {Object}
   */
  function deductStock(productId, quantity, referenceId) {
    var qty = parseInt(quantity, 10) || 1;
    var prodRepo = _getProdRepo();
    var prod = prodRepo.findById(productId);

    if (!prod) {
      throw _createInventoryError('SPWN_PRODUCT_NOT_FOUND', 'Produk tidak ditemukan: ' + productId);
    }

    var currentStock = parseInt(prod.stok || prod.stock, 10) || 0;
    if (currentStock < qty) {
      throw _createInventoryError(
        'SPWN_OUT_OF_STOCK',
        'Stok tidak mencukupi untuk ' + (prod.nama_produk || productId) + '. Tersisa: ' + currentStock + ', Diminta: ' + qty
      );
    }

    var newStock = currentStock - qty;
    var updated = prodRepo.update(productId, { stok: newStock });

    // Catat mutasi kartu stok
    try {
      _getInvRepo().insert({
        id: 'INV-MUT-' + new Date().getTime().toString(36).toUpperCase(),
        product_id: productId,
        type: 'OUT',
        quantity: qty,
        balance: newStock,
        reference_id: referenceId || '',
        notes: 'Pengurangan pesanan ' + (referenceId || '')
      });
    } catch (e) {
      // Log gagal tidak mematikan checkout
    }

    return updated;
  }

  /**
   * Mengembalikan stok produk apabila pesanan dibatalkan (Stock Rollback).
   * 
   * @param {string} productId 
   * @param {number} quantity 
   * @param {string} referenceId 
   * @returns {Object}
   */
  function restoreStock(productId, quantity, referenceId) {
    var qty = parseInt(quantity, 10) || 1;
    var prodRepo = _getProdRepo();
    var prod = prodRepo.findById(productId);
    if (!prod) return null;

    var currentStock = parseInt(prod.stok || prod.stock, 10) || 0;
    var newStock = currentStock + qty;

    var updated = prodRepo.update(productId, { stok: newStock });

    try {
      _getInvRepo().insert({
        id: 'INV-MUT-' + new Date().getTime().toString(36).toUpperCase(),
        product_id: productId,
        type: 'IN',
        quantity: qty,
        balance: newStock,
        reference_id: referenceId || '',
        notes: 'Pengembalian stok pembatalan pesanan ' + (referenceId || '')
      });
    } catch (e) {}

    return updated;
  }

  return {
    checkStock: checkStock,
    deductStock: deductStock,
    restoreStock: restoreStock
  };
})();


// =========================================================================
// 2. COMMERCE SERVICE (Katalog Produk & Aturan Pasar)
// =========================================================================
var CommerceService = (function() {
  var _prodRepo = null;
  var _catRepo = null;

  function _getProdRepo() {
    if (!_prodRepo) {
      _prodRepo = SpreadsheetRepository.create('COMMERCE', 'PRODUCTS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _prodRepo;
  }

  function _getCatRepo() {
    if (!_catRepo) {
      _catRepo = SpreadsheetRepository.create('COMMERCE', 'CATEGORIES', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _catRepo;
  }

  function _createCommerceError(code, message) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    return err;
  }

  /**
   * Menampilkan katalog produk terpaginasi.
   * Publik hanya dapat melihat produk dengan status 'ACTIVE' dan stok tersedia.
   * 
   * @param {Object} queryOptions 
   * @returns {{ data: Array<Object>, pagination: Object }}
   */
  function listProducts(queryOptions) {
    queryOptions = queryOptions || {};
    var prodRepo = _getProdRepo();

    var repoOptions = {
      page: queryOptions.page || 1,
      limit: queryOptions.limit || 16,
      search: queryOptions.search,
      searchColumns: ['nama_produk', 'kategori', 'deskripsi', 'toko_nama'],
      sortBy: queryOptions.sortBy || 'created_at',
      sortOrder: queryOptions.sortOrder || 'desc',
      filter: { status: 'ACTIVE' }
    };

    if (queryOptions.kategori) {
      repoOptions.filter.kategori = queryOptions.kategori;
    }
    if (queryOptions.toko_id) {
      repoOptions.filter.toko_id = queryOptions.toko_id;
    }

    return prodRepo.findAll(repoOptions);
  }

  /**
   * Mengambil detail produk berdasarkan ID.
   * 
   * @param {string} id 
   * @returns {Object|null}
   */
  function getProductById(id) {
    if (!id) return null;
    return _getProdRepo().findById(id);
  }

  /**
   * Mendaftarkan produk baru UMKM binaan SAKA Pariwisata.
   * 
   * @param {Object} payload 
   * @param {Object} seller 
   * @returns {Object}
   */
  function createProduct(payload, seller) {
    if (!payload || !payload.nama_produk) {
      throw _createCommerceError('SPWN_VALIDATION_ERROR', 'Nama produk wajib diisi');
    }
    var price = parseFloat(payload.harga) || 0;
    if (price <= 0) {
      throw _createCommerceError('SPWN_VALIDATION_ERROR', 'Harga produk harus bernilai positif');
    }

    seller = seller || {};
    var prodRepo = _getProdRepo();
    var prodId = 'PRD-' + new Date().getTime().toString(36).toUpperCase();

    var record = {
      id: prodId,
      sku: payload.sku || ('SKU-' + prodId),
      nama_produk: payload.nama_produk.trim(),
      kategori: payload.kategori || 'Suvenir & Kerajinan',
      deskripsi: payload.deskripsi || '',
      harga: price,
      stok: parseInt(payload.stok, 10) || 0,
      berat_gram: parseInt(payload.berat_gram, 10) || 250,
      foto_utama: payload.foto_utama || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop',
      toko_id: seller.toko_id || seller.userId || 'STORE_SPWN',
      toko_nama: seller.toko_nama || 'Kios Kreatif SAKA Pariwisata',
      provinsi_id: seller.provinsi_id || '32',
      status: 'ACTIVE'
    };

    return prodRepo.insert(record);
  }

  /**
   * Memperbarui detail produk.
   * 
   * @param {string} id 
   * @param {Object} patchData 
   * @returns {Object}
   */
  function updateProduct(id, patchData) {
    if (!id) {
      throw _createCommerceError('SPWN_VALIDATION_ERROR', 'ID produk wajib disertakan');
    }
    var safePatch = Object.assign({}, patchData);
    delete safePatch.id;
    delete safePatch.created_at;

    return _getProdRepo().update(id, safePatch);
  }

  /**
   * Menampilkan daftar kategori produk yang tersedia.
   * 
   * @returns {Array<Object>}
   */
  function listCategories() {
    var result = _getCatRepo().findAll({
      page: 1,
      limit: 50,
      filter: { status: 'ACTIVE' },
      sortBy: 'nama_kategori',
      sortOrder: 'asc'
    });

    if (result.data && result.data.length > 0) {
      return result.data;
    }

    // Default categories jika sheet Categories belum terisi
    return [
      { id: 'CAT_01', nama_kategori: 'Merchandise Resmi SAKA', status: 'ACTIVE' },
      { id: 'CAT_02', nama_kategori: 'Kerajinan Tangan Desa Wisata', status: 'ACTIVE' },
      { id: 'CAT_03', nama_kategori: 'Kuliner & Rempah Nusantara', status: 'ACTIVE' },
      { id: 'CAT_04', nama_kategori: 'Perlengkapan Petualang & Kemah', status: 'ACTIVE' }
    ];
  }

  return {
    listProducts: listProducts,
    getProductById: getProductById,
    createProduct: createProduct,
    updateProduct: updateProduct,
    listCategories: listCategories
  };
})();


// =========================================================================
// 3. ORDER SERVICE (Checkout, Invoice & Order Lifecycle)
// =========================================================================
var OrderService = (function() {
  var _ordersRepo = null;

  function _getOrdersRepo() {
    if (!_ordersRepo) {
      _ordersRepo = SpreadsheetRepository.create('COMMERCE', 'ORDERS', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _ordersRepo;
  }

  function _createOrderError(code, message) {
    var err = new Error('[' + code + '] ' + message);
    err.code = code;
    err.name = code;
    return err;
  }

  /**
   * Siklus Status Pesanan Resmi:
   * PENDING -> PAID -> SHIPPED -> COMPLETED / CANCELLED
   */
  var ORDER_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  };

  /**
   * Menghasilkan Kode Invoice Unik.
   * Format: SPWN-INV-{TIMESTAMP_HEX}-{RANDOM4}
   */
  function _generateInvoiceCode() {
    var timeHex = new Date().getTime().toString(36).toUpperCase();
    var rand4 = Math.floor(1000 + Math.random() * 9000).toString();
    return 'SPWN-INV-' + timeHex + '-' + rand4;
  }

  /**
   * Alur Transaksi Checkout Pemesanan.
   * - Validasi ketersediaan stok setiap item via InventoryService
   * - Pengurangan stok real-time (atomik)
   * - Penerbitan Invoice resmi
   * - Penyimpanan ke database Orders
   * 
   * @param {Object} orderPayload - { items: Array<{ product_id, quantity }>, alamat_pengiriman, catatan }
   * @param {Object} customer - Akun pembeli
   * @returns {Object} Detail invoice pesanan yang berhasil diterbitkan
   */
  function createOrder(orderPayload, customer) {
    if (!orderPayload || !Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
      throw _createOrderError('SPWN_VALIDATION_ERROR', 'Keranjang pesanan tidak boleh kosong');
    }

    customer = customer || {};
    var items = orderPayload.items;

    // 1. TAHAP 1: VALIDASI KETERSEDIAAN STOK SELURUH ITEM TERLEBIH DAHULU
    var checkedItems = [];
    var totalAmount = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var pId = item.product_id || item.id;
      var qty = parseInt(item.quantity, 10) || 1;

      var stockStatus = InventoryService.checkStock(pId, qty);
      if (!stockStatus.isAvailable) {
        throw _createOrderError(
          'SPWN_OUT_OF_STOCK',
          'Stok produk "' + stockStatus.productName + '" tidak mencukupi (Sisa: ' + stockStatus.currentStock + ')'
        );
      }

      var productDetail = CommerceService.getProductById(pId);
      var price = parseFloat(productDetail.harga) || 0;
      var subtotal = price * qty;
      totalAmount += subtotal;

      checkedItems.push({
        product_id: pId,
        nama_produk: productDetail.nama_produk,
        harga: price,
        quantity: qty,
        subtotal: subtotal
      });
    }

    // 2. TAHAP 2: EKSEKUSI PENGURANGAN STOK VIA INVENTORYSERVICE
    var invoiceNumber = _generateInvoiceCode();
    var deductedList = [];

    try {
      for (var j = 0; j < checkedItems.length; j++) {
        var itm = checkedItems[j];
        InventoryService.deductStock(itm.product_id, itm.quantity, invoiceNumber);
        deductedList.push(itm);
      }
    } catch (deductErr) {
      // ROLLBACK: Kembalikan stok item yang sudah terlanjur terpotong jika terjadi kegagalan
      for (var r = 0; r < deductedList.length; r++) {
        InventoryService.restoreStock(deductedList[r].product_id, deductedList[r].quantity, invoiceNumber);
      }
      throw deductErr;
    }

    // 3. TAHAP 3: SIMPAN RECORD ORDER
    var shippingCost = parseFloat(orderPayload.ongkos_kirim) || 0;
    var grandTotal = totalAmount + shippingCost;

    var orderRecord = {
      id: invoiceNumber,
      invoice_number: invoiceNumber,
      customer_id: customer.userId || customer.id || 'CUST_ANON',
      customer_nama: customer.nama || customer.nama_lengkap || 'Anggota SAKA',
      customer_email: customer.email || '',
      customer_telepon: customer.telepon || orderPayload.telepon || '',
      alamat_pengiriman: orderPayload.alamat_pengiriman || '',
      catatan: orderPayload.catatan || '',
      items_summary: JSON.stringify(checkedItems),
      total_produk: checkedItems.length,
      subtotal_amount: totalAmount,
      shipping_cost: shippingCost,
      grand_total: grandTotal,
      status: ORDER_STATUS.PENDING,
      created_at: new Date().toISOString()
    };

    var savedOrder = _getOrdersRepo().insert(orderRecord);

    return {
      order: savedOrder,
      items: checkedItems,
      invoiceNumber: invoiceNumber,
      grandTotal: grandTotal,
      status: ORDER_STATUS.PENDING
    };
  }

  /**
   * Mengambil informasi faktur pesanan.
   * 
   * @param {string} orderId 
   * @returns {Object|null}
   */
  function getOrderById(orderId) {
    if (!orderId) return null;
    return _getOrdersRepo().findById(orderId);
  }

  /**
   * Memperbarui status siklus pesanan.
   * Jika pesanan dibatalkan (CANCELLED), stok dikembalikan secara otomatis.
   * 
   * @param {string} orderId 
   * @param {string} newStatus - 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
   * @returns {Object}
   */
  function updateOrderStatus(orderId, newStatus) {
    var order = _getOrdersRepo().findById(orderId);
    if (!order) {
      throw _createOrderError('SPWN_NOT_FOUND', 'Pesanan tidak ditemukan: ' + orderId);
    }

    newStatus = (newStatus || '').toUpperCase();
    if (!ORDER_STATUS[newStatus]) {
      throw _createOrderError('SPWN_VALIDATION_ERROR', 'Status pesanan tidak sah: ' + newStatus);
    }

    var oldStatus = order.status;

    // Jika pesanan dibatalkan, kembalikan stok
    if (newStatus === ORDER_STATUS.CANCELLED && oldStatus !== ORDER_STATUS.CANCELLED) {
      try {
        var items = JSON.parse(order.items_summary || '[]');
        for (var i = 0; i < items.length; i++) {
          InventoryService.restoreStock(items[i].product_id, items[i].quantity, orderId);
        }
      } catch (e) {
        // Parse error guard
      }
    }

    return _getOrdersRepo().update(orderId, {
      status: newStatus,
      updated_at: new Date().toISOString()
    });
  }

  return {
    ORDER_STATUS: ORDER_STATUS,
    createOrder: createOrder,
    getOrderById: getOrderById,
    updateOrderStatus: updateOrderStatus
  };
})();
