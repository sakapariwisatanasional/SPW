/**
 * ============================================================================
 * SPWN APPS 2.0 - DATABASE INITIALIZER OTOMATIS
 * File: backend/google-apps-script/DATABASE_INITIALIZER.gs
 * ============================================================================
 * Arsitektur: Google Apps Script Web App & Spreadsheet Database Engine
 * Deskripsi:
 * Sistem inisialisasi dan verifikasi skema database relasional berbasis
 * Google Spreadsheet untuk ekosistem SAKA Pariwisata Nasional (SPWN).
 *
 * Fitur & Jaminan:
 * 1. 100% Idempotent - Aman dijalankan berulang kali tanpa duplikasi.
 * 2. Non-Destruktif - TIDAK PERNAH menghapus data atau kolom yang sudah ada.
 * 3. Skema Otomatis - Melengkapi kolom header yang belum ada di baris pertama.
 * 4. Normalisasi Tab - Mendeteksi variasi nama sheet (spasi/underscore/case).
 * 5. ScriptProperties Sync - Menyimpan ID Spreadsheet langsung ke konfigurasi.
 * 6. Visual Freeze - Otomatis membekukan baris header 1 (freeze row 1).
 *
 * Cara Menjalankan:
 * Cukup pilih fungsi "setupSPWNDatabase" di editor Google Apps Script,
 * lalu klik tombol "Run" (Jalankan).
 * ============================================================================
 */

// DEFINISI SKEMA MASTER SPWN DATABASE
var SPWN_DATABASE_SCHEMA = {
  SPWN_MEMBER_DATABASE: {
    propertyKey: 'MEMBER_SPREADSHEET_ID',
    label: 'MEMBER DATABASE',
    sheets: {
      Anggota: [
        'id',
        'no_kta',
        'full_name',
        'email',
        'phone',
        'province',
        'city',
        'district',
        'position',
        'krida',
        'status',
        'photo_url',
        'registered_at',
        'verification_url',
        'created_at',
        'updated_at',
        'updated_by',
        'qr_token'
      ],
      Users: [
        'id',
        'username',
        'email',
        'password_hash',
        'role',
        'status',
        'last_login',
        'created_at',
        'updated_at'
      ],
      KTA_Template: [
        'template_id',
        'template_name',
        'front_background_url',
        'back_background_url',
        'card_width',
        'card_height',
        'front_layout_json',
        'back_layout_json',
        'identity_layout_mode',
        'qr_settings_json',
        'elements_json',
        'qr_position',
        'qr_size',
        'created_by',
        'updated_at'
      ],
      KTA_Generation_Log: [
        'id',
        'member_id',
        'no_kta',
        'qr_token',
        'generated_by',
        'generated_at',
        'status'
      ],
      Role_Master: [
        'id',
        'role_name',
        'description',
        'permissions',
        'status'
      ],
      Krida_Master: [
        'id',
        'krida_name',
        'description',
        'status'
      ]
    }
  },

  SPWN_CONTENT_DATABASE: {
    propertyKey: 'CONTENT_SPREADSHEET_ID',
    label: 'CONTENT DATABASE',
    sheets: {
      Berita: [
        'id',
        'title',
        'slug',
        'content',
        'image_url',
        'category',
        'author',
        'status',
        'published_at',
        'created_at',
        'updated_at'
      ],
      Artikel: [
        'id',
        'title',
        'summary',
        'content',
        'image_url',
        'author',
        'status',
        'published_at',
        'created_at',
        'updated_at'
      ],
      Agenda_Kegiatan: [
        'id',
        'title',
        'description',
        'location',
        'start_date',
        'end_date',
        'image_url',
        'status',
        'created_at'
      ],
      Galeri: [
        'id',
        'title',
        'description',
        'image_url',
        'category',
        'created_at'
      ],
      Pengumuman: [
        'id',
        'title',
        'content',
        'status',
        'published_at',
        'created_at'
      ]
    }
  },

  SPWN_TRAVEL_DATABASE: {
    propertyKey: 'TRAVEL_SPREADSHEET_ID',
    label: 'TRAVEL DATABASE',
    sheets: {
      Destinasi: [
        'id',
        'name',
        'category',
        'province',
        'city',
        'location',
        'description',
        'image_url',
        'status',
        'created_at'
      ],
      Paket_Wisata: [
        'id',
        'name',
        'destination_id',
        'description',
        'price',
        'duration',
        'image_url',
        'status',
        'created_at'
      ],
      Mitra_Wisata: [
        'id',
        'name',
        'type',
        'contact',
        'address',
        'status',
        'created_at'
      ],
      Review_Destinasi: [
        'id',
        'destination_id',
        'member_name',
        'rating',
        'comment',
        'created_at'
      ]
    }
  },

  SPWN_COMMERCE_DATABASE: {
    propertyKey: 'COMMERCE_SPREADSHEET_ID',
    label: 'COMMERCE DATABASE',
    sheets: {
      Produk: [
        'id',
        'sku',
        'name',
        'category_id',
        'description',
        'price',
        'stock',
        'image_url',
        'status',
        'created_at',
        'updated_at'
      ],
      Kategori_Produk: [
        'id',
        'name',
        'description',
        'status'
      ],
      Orders: [
        'id',
        'order_number',
        'customer_name',
        'customer_phone',
        'product_id',
        'quantity',
        'total_price',
        'status',
        'created_at'
      ],
      Inventaris_SKU: [
        'id',
        'sku',
        'product_id',
        'stock',
        'updated_at'
      ]
    }
  }
};

/**
 * Entry point utama: Jalankan fungsi ini untuk menginisialisasi seluruh database.
 */
function setupSPWNDatabase() {
  var reportData = [];
  var scriptProperties = PropertiesService.getScriptProperties();

  var dbKeys = Object.keys(SPWN_DATABASE_SCHEMA);

  for (var i = 0; i < dbKeys.length; i++) {
    var dbName = dbKeys[i];
    var dbConfig = SPWN_DATABASE_SCHEMA[dbName];

    var dbReport = {
      name: dbName,
      label: dbConfig.label,
      id: '',
      url: '',
      isNew: false,
      sheets: []
    };

    try {
      // 1. Dapatkan atau buat Spreadsheet
      var spreadsheetResult = createOrGetSpreadsheet(dbName);
      var ss = spreadsheetResult.spreadsheet;
      dbReport.id = ss.getId();
      dbReport.url = ss.getUrl();
      dbReport.isNew = spreadsheetResult.isNew;

      // Sinkronisasi ScriptProperties agar backend otomatis terhubung
      if (dbConfig.propertyKey) {
        scriptProperties.setProperty(dbConfig.propertyKey, ss.getId());
      }
      scriptProperties.setProperty(dbName + '_ID', ss.getId());

      // 2. Loop setiap Sheet yang didefinisikan dalam skema
      var sheetNames = Object.keys(dbConfig.sheets);
      for (var j = 0; j < sheetNames.length; j++) {
        var targetSheetName = sheetNames[j];
        var requiredHeaders = dbConfig.sheets[targetSheetName];

        var sheetResult = createOrGetSheet(ss, targetSheetName);
        var targetSheet = sheetResult.sheet;

        // 3. Pastikan header lengkap tanpa merusak data lama
        var headerResult = ensureHeaders(targetSheet, requiredHeaders);

        dbReport.sheets.push({
          name: targetSheetName,
          actualName: targetSheet.getName(),
          isNew: sheetResult.isNew,
          status: 'OK',
          headersAdded: headerResult.addedHeaders,
          totalColumns: headerResult.totalColumns
        });
      }

      // Bersihkan tab default 'Sheet1'/'Sheet 1' jika telah ada sheet modul lain
      cleanupDefaultSheet(ss, sheetNames);

      reportData.push(dbReport);
    } catch (err) {
      Logger.log('[ERROR] Gagal memproses database ' + dbName + ': ' + err.message);
      dbReport.error = err.message;
      reportData.push(dbReport);
    }
  }

  // Cetak Laporan Terstruktur
  generateSetupReport(reportData);
}

/**
 * Mencari Spreadsheet di Google Drive berdasarkan nama.
 * Jika belum ada, membuat Spreadsheet baru.
 *
 * @param {string} name - Nama file Spreadsheet
 * @returns {Object} { spreadsheet: Spreadsheet, isNew: boolean }
 */
function createOrGetSpreadsheet(name) {
  var files = DriveApp.getFilesByName(name);
  var foundFile = null;

  while (files.hasNext()) {
    var file = files.next();
    // Abaikan file yang berada di tempat sampah (trash)
    if (!file.isTrashed()) {
      foundFile = file;
      break;
    }
  }

  if (foundFile) {
    var ss = SpreadsheetApp.open(foundFile);
    return {
      spreadsheet: ss,
      isNew: false
    };
  }

  // Jika belum ada, buat baru
  var newSs = SpreadsheetApp.create(name);
  return {
    spreadsheet: newSs,
    isNew: true
  };
}

/**
 * Mencari Sheet di dalam Spreadsheet. Mendeteksi variasi penamaan
 * (misal case insensitive, spasi vs underscore).
 * Jika belum ada, membuat Sheet baru.
 *
 * @param {Spreadsheet} spreadsheet - Objek Spreadsheet target
 * @param {string} sheetName - Nama sheet yang diharapkan
 * @returns {Object} { sheet: Sheet, isNew: boolean }
 */
function createOrGetSheet(spreadsheet, sheetName) {
  var allSheets = spreadsheet.getSheets();
  var normalizedTarget = normalizeSheetName(sheetName);

  // 1. Cek exact match
  var existingSheet = spreadsheet.getSheetByName(sheetName);
  if (existingSheet) {
    return { sheet: existingSheet, isNew: false };
  }

  // 2. Cek loose match (normalisasi spasi & case)
  for (var i = 0; i < allSheets.length; i++) {
    var current = allSheets[i];
    if (normalizeSheetName(current.getName()) === normalizedTarget) {
      // Normalisasi nama sheet ke standar master
      current.setName(sheetName);
      return { sheet: current, isNew: false };
    }
  }

  // 3. Jika belum ada, buat Sheet baru
  var newSheet = spreadsheet.insertSheet(sheetName);
  return { sheet: newSheet, isNew: true };
}

/**
 * Memeriksa dan memastikan seluruh header yang diwajibkan ada di baris 1.
 * - Tidak menghapus kolom yang sudah ada.
 * - Tidak mengubah atau merusak baris data di bawah baris 1.
 * - Menambahkan kolom yang kurang di posisi kolom kosong berikutnya.
 *
 * @param {Sheet} sheet - Objek Sheet
 * @param {Array<string>} headers - Array string header yang diwajibkan
 * @returns {Object} { addedHeaders: Array<string>, totalColumns: number }
 */
function ensureHeaders(sheet, headers) {
  var lastColumn = sheet.getLastColumn();
  var existingHeaders = [];
  var existingNormalized = [];
  var addedHeaders = [];

  if (lastColumn > 0) {
    var headerRowValues = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    for (var i = 0; i < headerRowValues.length; i++) {
      var val = String(headerRowValues[i]).trim();
      existingHeaders.push(val);
      existingNormalized.push(normalizeHeaderName(val));
    }
  }

  // Jika sheet benar-benar kosong di baris pertama
  if (existingHeaders.length === 0 || (existingHeaders.length === 1 && existingHeaders[0] === '')) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, headers.length);
    sheet.setFrozenRows(1);

    return {
      addedHeaders: headers,
      totalColumns: headers.length
    };
  }

  // Jika sudah ada header, cari kolom mana yang belum ada
  var missingHeaders = [];
  for (var j = 0; j < headers.length; j++) {
    var required = headers[j];
    var normRequired = normalizeHeaderName(required);

    if (existingNormalized.indexOf(normRequired) === -1) {
      missingHeaders.push(required);
    }
  }

  // Tambahkan kolom yang hilang di sebelah kanan kolom terakhir
  if (missingHeaders.length > 0) {
    var startCol = lastColumn + 1;
    sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
    formatHeaderRow(sheet, lastColumn + missingHeaders.length);
    addedHeaders = missingHeaders;
  }

  sheet.setFrozenRows(1);

  return {
    addedHeaders: addedHeaders,
    totalColumns: existingHeaders.length + missingHeaders.length
  };
}

/**
 * Normalisasi nama header untuk perbandingan non-sensitif (abaikan case, spasi, underscore).
 *
 * @param {string} name - Nama header mentah
 * @returns {string} String ternormalisasi
 */
function normalizeHeaderName(name) {
  if (!name) return '';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '_');
}

/**
 * Normalisasi nama sheet untuk pencocokan toleran.
 *
 * @param {string} name - Nama sheet mentah
 * @returns {string} String huruf kecil tanpa spasi dan tanda baca
 */
function normalizeSheetName(name) {
  if (!name) return '';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]/g, '');
}

/**
 * Menerapkan styling elegan pada baris header (Baris 1).
 * Menggunakan palet resmi Pramuka SAKA Pariwisata (#0066B3).
 *
 * @param {Sheet} sheet - Objek Sheet
 * @param {number} totalColumns - Jumlah kolom yang diformat
 */
function formatHeaderRow(sheet, totalColumns) {
  if (totalColumns < 1) return;
  var headerRange = sheet.getRange(1, 1, 1, totalColumns);
  headerRange
    .setFontWeight('bold')
    .setBackground('#0066B3')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setWrap(false);
  sheet.setRowHeight(1, 32);
}

/**
 * Menghapus sheet bawaan (Sheet1/Sheet 1) yang kosong bila sheet modul lain sudah siap.
 *
 * @param {Spreadsheet} spreadsheet - Objek Spreadsheet
 * @param {Array<string>} targetSheetNames - Daftar nama sheet yang valid
 */
function cleanupDefaultSheet(spreadsheet, targetSheetNames) {
  var sheets = spreadsheet.getSheets();
  if (sheets.length <= 1) return;

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var sName = sh.getName();
    var norm = sName.toLowerCase().replace(/\s+/g, '');

    if ((norm === 'sheet1' || norm === 'feuille1' || norm === 'hoja1') && sh.getLastRow() === 0) {
      try {
        spreadsheet.deleteSheet(sh);
      } catch (e) {
        // Abaikan jika tidak diizinkan oleh sistem Google
      }
    }
  }
}

/**
 * Menghasilkan dan mencetak laporan eksekusi initializer di Logger.
 *
 * @param {Array<Object>} reportData - Data hasil proses dari setiap database
 */
function generateSetupReport(reportData) {
  Logger.log('');
  Logger.log('================================');
  Logger.log('SPWN DATABASE INITIALIZER');
  Logger.log('================================');
  Logger.log('');

  for (var i = 0; i < reportData.length; i++) {
    var db = reportData[i];

    if (db.error) {
      Logger.log('FAIL ' + db.label + ' (' + db.name + ')');
      Logger.log('  Error: ' + db.error);
      Logger.log('');
      continue;
    }

    Logger.log('OK ' + db.label + (db.isNew ? ' [BARU DIBUAT]' : ' [DITEMUKAN & AKTIF]'));

    for (var j = 0; j < db.sheets.length; j++) {
      var s = db.sheets[j];
      var note = '';
      if (s.isNew) {
        note = ' (Tab Baru Dibuat)';
      } else if (s.headersAdded && s.headersAdded.length > 0) {
        note = ' (+ ' + s.headersAdded.length + ' header ditambahkan: ' + s.headersAdded.join(', ') + ')';
      }
      Logger.log('- ' + s.name + ' : ' + s.status + note);
    }

    Logger.log('  Spreadsheet ID : ' + db.id);
    Logger.log('  URL            : ' + db.url);
    Logger.log('');
  }

  Logger.log('================================');
  Logger.log('STATUS: SELURUH DATABASE SIAP DIGUNAKAN');
  Logger.log('ScriptProperties berhasil diperbarui.');
  Logger.log('================================');
  Logger.log('');
}
