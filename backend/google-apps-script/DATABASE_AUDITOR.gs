/**
 * ============================================================================
 * SPWN APPS 2.0 - DATABASE AUDITOR TOOL
 * File: backend/google-apps-script/DATABASE_AUDITOR.gs
 * ============================================================================
 * Arsitektur: Google Apps Script Web App & Spreadsheet Database Engine
 * Deskripsi:
 * Alat audit diagnostik read-only untuk memverifikasi keterhubungan
 * dan konsistensi skema database Google Spreadsheet pada SPWN Apps 2.0.
 *
 * Menggunakan konfigurasi resmi dari:
 * - database.config.gs (SPWN_DATABASE, getSpreadsheetIdByDomain, openSpreadsheetByDomain)
 * - spreadsheet.repository.gs
 *
 * Jaminan Keamanan:
 * - 100% Read-Only: TIDAK mengubah, membuat, atau menghapus data/spreadsheet/sheet.
 * - Idempotent: Aman dieksekusi berkali-kali kapan saja.
 * - Non-Destruktif: Hanya membandingkan EXPECTED HEADER vs ACTUAL HEADER.
 *
 * Fungsi Utama:
 * 1. spwnAuditDatabase()    -> Menjalankan audit dan mencetak laporan ke Logger
 * 2. exportAuditReport()     -> Mengembalikan objek/array JSON laporan hasil audit
 * ============================================================================
 */

// DEFINISI SKEMA MASTER HEADER EKSPEKTASI SPWN APPS 2.0
var SPWN_EXPECTED_SCHEMA = {
  MEMBER: {
    domainKey: 'MEMBER',
    configName: 'SPWN_MEMBER_DATABASE',
    propertyKey: 'MEMBER_SPREADSHEET_ID',
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

  CONTENT: {
    domainKey: 'CONTENT',
    configName: 'SPWN_CONTENT_DATABASE',
    propertyKey: 'CONTENT_SPREADSHEET_ID',
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

  TRAVEL: {
    domainKey: 'TRAVEL',
    configName: 'SPWN_TRAVEL_DATABASE',
    propertyKey: 'TRAVEL_SPREADSHEET_ID',
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

  COMMERCE: {
    domainKey: 'COMMERCE',
    configName: 'SPWN_COMMERCE_DATABASE',
    propertyKey: 'COMMERCE_SPREADSHEET_ID',
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
 * Normalisasi nama header untuk perbandingan non-sensitif (abaikan case, spasi, underscore, titik).
 * Contoh: "Nomor KTA", "no_kta", "No. KTA" -> "no_kta"
 *
 * @param {string} name
 * @returns {string}
 */
function _auditorNormalizeHeader(name) {
  if (name === null || name === undefined) return '';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '_');
}

/**
 * Normalisasi nama sheet untuk pencocokan toleran.
 *
 * @param {string} name
 * @returns {string}
 */
function _auditorNormalizeSheet(name) {
  if (name === null || name === undefined) return '';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]/g, '');
}

/**
 * Menemukan objek sheet di spreadsheet dengan toleransi variasi penamaan.
 * (Contoh: "Paket_Wisata" vs "Paket Wisata")
 *
 * @param {Spreadsheet} ss
 * @param {string} targetSheetName
 * @returns {Sheet|null}
 */
function _auditorFindSheet(ss, targetSheetName) {
  if (!ss) return null;
  var exact = ss.getSheetByName(targetSheetName);
  if (exact) return exact;

  var sheets = ss.getSheets();
  var normalizedTarget = _auditorNormalizeSheet(targetSheetName);
  for (var i = 0; i < sheets.length; i++) {
    if (_auditorNormalizeSheet(sheets[i].getName()) === normalizedTarget) {
      return sheets[i];
    }
  }
  return null;
}

/**
 * Mengambil nama spreadsheet yang terkonfigurasi pada database.config.gs
 *
 * @param {string} domainKey
 * @returns {string}
 */
function _auditorGetConfiguredSsName(domainKey) {
  try {
    if (typeof SPWN_DATABASE !== 'undefined' &&
        SPWN_DATABASE.PROVIDERS &&
        SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET &&
        SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS &&
        SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS[domainKey]) {
      var d = SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS[domainKey];
      return d.name || ('SPWN_' + domainKey + '_DATABASE');
    }
  } catch (e) {}
  return 'SPWN_' + domainKey + '_DATABASE';
}

/**
 * Membuka spreadsheet domain menggunakan konfigurasi existing database.config.gs
 * tanpa membuat file baru bila belum ada.
 *
 * @param {string} domainKey
 * @returns {{ ss: Spreadsheet|null, id: string, name: string, error: string|null }}
 */
function _auditorOpenDomainSpreadsheet(domainKey) {
  var configuredName = _auditorGetConfiguredSsName(domainKey);
  var ssId = '';
  var error = null;

  // 1. Coba ambil ID dari konfigurasi resmi
  try {
    if (typeof getSpreadsheetIdByDomain === 'function') {
      ssId = getSpreadsheetIdByDomain(domainKey);
    }
  } catch (e) {
    // getSpreadsheetIdByDomain melempar error jika belum di-set di ScriptProperties
  }

  // 2. Jika ID ditemukan, buka langsung
  if (ssId && ssId.trim() !== '') {
    try {
      var ss = SpreadsheetApp.openById(ssId.trim());
      return {
        ss: ss,
        id: ss.getId(),
        name: ss.getName(),
        error: null
      };
    } catch (openErr) {
      error = 'Spreadsheet ID [' + ssId + '] ditemukan di konfigurasi namun gagal dibuka: ' + openErr.message;
    }
  }

  // 3. Jika tidak ada di ScriptProperties, cari read-only via DriveApp berdasarkan nama file
  try {
    var searchName = 'SPWN_' + domainKey + '_DATABASE';
    var files = DriveApp.getFilesByName(searchName);
    var foundFile = null;

    while (files.hasNext()) {
      var file = files.next();
      if (!file.isTrashed()) {
        foundFile = file;
        break;
      }
    }

    if (foundFile) {
      var driveSs = SpreadsheetApp.open(foundFile);
      return {
        ss: driveSs,
        id: driveSs.getId(),
        name: driveSs.getName(),
        error: null
      };
    }
  } catch (driveErr) {
    if (!error) error = driveErr.message;
  }

  // 4. Cek fallback container-bound jika ada
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) {
      return {
        ss: activeSs,
        id: activeSs.getId(),
        name: activeSs.getName() + ' (Container-Bound Active)',
        error: null
      };
    }
  } catch (activeErr) {}

  return {
    ss: null,
    id: ssId || '-',
    name: configuredName,
    error: error || 'Spreadsheet tidak ditemukan di ScriptProperties maupun Google Drive'
  };
}

/**
 * ============================================================================
 * FUNGSI UTAMA: spwnAuditDatabase()
 * ============================================================================
 * Melakukan audit menyeluruh pada 4 domain (MEMBER, CONTENT, TRAVEL, COMMERCE),
 * membandingkan EXPECTED HEADER vs ACTUAL HEADER, dan menampilkan laporan rapi di Logger.
 */
function spwnAuditDatabase() {
  Logger.log('');
  Logger.log('=================================');
  Logger.log('SPWN DATABASE AUDIT');
  Logger.log('=================================');
  Logger.log('');

  var domains = ['MEMBER', 'CONTENT', 'TRAVEL', 'COMMERCE'];
  var overallPassed = true;

  for (var d = 0; d < domains.length; d++) {
    var domainKey = domains[d];
    var schema = SPWN_EXPECTED_SCHEMA[domainKey];
    var ssInfo = _auditorOpenDomainSpreadsheet(domainKey);

    Logger.log('DATABASE : ' + domainKey);
    Logger.log('');
    Logger.log('Spreadsheet:');
    Logger.log(ssInfo.ss ? ssInfo.name : schema.configName);
    Logger.log('');
    Logger.log('ID:');
    Logger.log(ssInfo.id);
    Logger.log('');
    Logger.log('STATUS:');

    if (!ssInfo.ss) {
      Logger.log('DISCONNECTED');
      Logger.log('❌ ' + ssInfo.error);
      Logger.log('');
      Logger.log('=================================');
      Logger.log('');
      overallPassed = false;
      continue;
    }

    Logger.log('CONNECTED');
    Logger.log('');

    // Audit setiap sheet dalam skema
    var sheetKeys = Object.keys(schema.sheets);
    for (var s = 0; s < sheetKeys.length; s++) {
      var expectedSheetName = sheetKeys[s];
      var expectedHeaders = schema.sheets[expectedSheetName];

      Logger.log('SHEET:');
      Logger.log(expectedSheetName);
      Logger.log('');

      var sheetObj = _auditorFindSheet(ssInfo.ss, expectedSheetName);
      if (!sheetObj) {
        Logger.log('❌ Sheet ' + expectedSheetName + ' tidak ditemukan');
        Logger.log('');
        Logger.log('HASIL:');
        Logger.log('INVALID');
        Logger.log('');
        Logger.log('---------------------------------');
        Logger.log('');
        overallPassed = false;
        continue;
      }

      // Ambil actual header dari baris 1
      var lastCol = sheetObj.getLastColumn();
      var actualHeaders = [];
      var actualNormalizedMap = {};

      if (lastCol > 0) {
        var rawRow = sheetObj.getRange(1, 1, 1, lastCol).getValues()[0];
        for (var c = 0; c < rawRow.length; c++) {
          var hName = String(rawRow[c]).trim();
          if (hName !== '') {
            actualHeaders.push(hName);
            actualNormalizedMap[_auditorNormalizeHeader(hName)] = hName;
          }
        }
      }

      Logger.log('HEADER CHECK:');
      var sheetValid = true;
      var missingInSheet = [];

      for (var h = 0; h < expectedHeaders.length; h++) {
        var expH = expectedHeaders[h];
        var normExpH = _auditorNormalizeHeader(expH);

        if (actualNormalizedMap.hasOwnProperty(normExpH)) {
          Logger.log('✅ ' + expH);
        } else {
          Logger.log('❌ Header ' + expH + ' tidak ditemukan');
          missingInSheet.push(expH);
          sheetValid = false;
          overallPassed = false;
        }
      }

      // Identifikasi kolom tambahan di luar spesifikasi master
      var extraInSheet = [];
      var expectedNormSet = {};
      for (var eh = 0; eh < expectedHeaders.length; eh++) {
        expectedNormSet[_auditorNormalizeHeader(expectedHeaders[eh])] = true;
      }
      for (var ah = 0; ah < actualHeaders.length; ah++) {
        var normActH = _auditorNormalizeHeader(actualHeaders[ah]);
        if (!expectedNormSet[normActH]) {
          extraInSheet.push(actualHeaders[ah]);
        }
      }

      if (extraInSheet.length > 0) {
        Logger.log('');
        Logger.log('ℹ️ Kolom Tambahan (Custom/Legacy): ' + extraInSheet.join(', '));
      }

      Logger.log('');
      Logger.log('HASIL:');
      Logger.log(sheetValid ? 'VALID' : 'INVALID');
      Logger.log('');
      Logger.log('---------------------------------');
      Logger.log('');
    }

    Logger.log('=================================');
    Logger.log('');
  }

  Logger.log('RINGKASAN AUDIT KESELURUHAN:');
  Logger.log(overallPassed ? 'STATUS: SEMUA SKEMA DATABASE VALID & TERHUBUNG' : 'STATUS: PERLU PENYESUAIAN SKEMA PADA BEBERAPA TAB/KOLOM');
  Logger.log('=================================');
  Logger.log('');
}

/**
 * ============================================================================
 * FUNGSI EXPORT: exportAuditReport()
 * ============================================================================
 * Menghasilkan struktur array of objects JSON:
 * [
 *   {
 *     database: "MEMBER",
 *     spreadsheet: "SPWN_MEMBER_DATABASE",
 *     sheet: "Anggota",
 *     missingHeaders: [],
 *     extraHeaders: [],
 *     status: "VALID" | "MISSING_SHEET" | "MISSING_HEADERS" | "DISCONNECTED"
 *   },
 *   ...
 * ]
 *
 * @returns {Array<Object>}
 */
function exportAuditReport() {
  var report = [];
  var domains = ['MEMBER', 'CONTENT', 'TRAVEL', 'COMMERCE'];

  for (var d = 0; d < domains.length; d++) {
    var domainKey = domains[d];
    var schema = SPWN_EXPECTED_SCHEMA[domainKey];
    var ssInfo = _auditorOpenDomainSpreadsheet(domainKey);
    var configuredName = ssInfo.ss ? ssInfo.name : schema.configName;

    // Jika spreadsheet tidak dapat dibuka
    if (!ssInfo.ss) {
      var sheetNames = Object.keys(schema.sheets);
      for (var sn = 0; sn < sheetNames.length; sn++) {
        report.push({
          database: domainKey,
          spreadsheet: configuredName,
          sheet: sheetNames[sn],
          missingHeaders: schema.sheets[sheetNames[sn]],
          extraHeaders: [],
          status: 'DISCONNECTED'
        });
      }
      continue;
    }

    // Periksa setiap sheet
    var sheetKeys = Object.keys(schema.sheets);
    for (var s = 0; s < sheetKeys.length; s++) {
      var expectedSheetName = sheetKeys[s];
      var expectedHeaders = schema.sheets[expectedSheetName];
      var sheetObj = _auditorFindSheet(ssInfo.ss, expectedSheetName);

      if (!sheetObj) {
        report.push({
          database: domainKey,
          spreadsheet: configuredName,
          sheet: expectedSheetName,
          missingHeaders: expectedHeaders,
          extraHeaders: [],
          status: 'MISSING_SHEET'
        });
        continue;
      }

      // Ambil actual headers
      var lastCol = sheetObj.getLastColumn();
      var actualHeaders = [];
      var actualNormalizedMap = {};

      if (lastCol > 0) {
        var rawRow = sheetObj.getRange(1, 1, 1, lastCol).getValues()[0];
        for (var c = 0; c < rawRow.length; c++) {
          var hName = String(rawRow[c]).trim();
          if (hName !== '') {
            actualHeaders.push(hName);
            actualNormalizedMap[_auditorNormalizeHeader(hName)] = hName;
          }
        }
      }

      var missingHeaders = [];
      var expectedNormSet = {};

      for (var h = 0; h < expectedHeaders.length; h++) {
        var expH = expectedHeaders[h];
        var normExpH = _auditorNormalizeHeader(expH);
        expectedNormSet[normExpH] = true;

        if (!actualNormalizedMap.hasOwnProperty(normExpH)) {
          missingHeaders.push(expH);
        }
      }

      var extraHeaders = [];
      for (var ah = 0; ah < actualHeaders.length; ah++) {
        var normActH = _auditorNormalizeHeader(actualHeaders[ah]);
        if (!expectedNormSet[normActH]) {
          extraHeaders.push(actualHeaders[ah]);
        }
      }

      report.push({
        database: domainKey,
        spreadsheet: configuredName,
        sheet: expectedSheetName,
        missingHeaders: missingHeaders,
        extraHeaders: extraHeaders,
        status: missingHeaders.length === 0 ? 'VALID' : 'MISSING_HEADERS'
      });
    }
  }

  return report;
}
