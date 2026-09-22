/**
 * SPWN Apps 2.0 - Database Configuration & Provider Abstraction
 * Location: backend/google-apps-script/config/database.config.gs
 * -------------------------------------------------------------------------
 * Modul konfigurasi basis data terpusat.
 * 
 * Desain Abstraksi Migrasi Masa Depan:
 * SPWN_DATABASE
 *       │
 *       ▼
 * Database Provider Layer (Active: GOOGLE_SPREADSHEET, Future: SUPABASE_POSTGRES)
 *       │
 *       ▼
 * Target Physical Database Engine
 * -------------------------------------------------------------------------
 * TIDAK BOLEH menuliskan Spreadsheet ID di file service, controller, atau repository.
 * Semua akses database wajib melewati helper function di file ini.
 */

var SPWN_DATABASE = {
  // Provider yang sedang aktif: 'GOOGLE_SPREADSHEET' | 'POSTGRESQL_SUPABASE'
  ACTIVE_PROVIDER: 'GOOGLE_SPREADSHEET',

  // Master Web App Gateway Deployment
  GATEWAY: {
    DEPLOYMENT_ID: 'AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg',
    EXEC_URL: 'https://script.google.com/macros/s/AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg/exec'
  },

  // Konfigurasi Database Provider: Google Spreadsheet Existing
  PROVIDERS: {
    GOOGLE_SPREADSHEET: {
      DOMAINS: {
        // Domain 1: Database Keanggotaan & Akun
        MEMBER: {
          key: 'MEMBER',
          name: 'MEMBER DATABASE',
          description: 'Pusat data anggota SAKA Pariwisata, akun user, dan master krida',
          // ID dibaca dari ScriptProperties secara dinamis; fallback jika running di spreadsheet aktif
          propertyKey: 'MEMBER_SPREADSHEET_ID',
          fallbackId: '', // Jika kosong, gunakan SpreadsheetApp.getActiveSpreadsheet().getId()
          sheets: {
            ANGGOTA: 'Anggota',
            USERS: 'Users',
            KRIDA_MASTER: 'Krida_Master',
            ROLE_MASTER: 'Role_Master',
            LOG_VERIFIKASI: 'Log_Verifikasi',
            KTA_SETTING: 'KTA_Setting',
            SESSIONS: 'Sessions',
            SKK_MASTER: 'SKK_Master',
            MEMBER_SKILL_STATUS: 'Member_Skill_Status',
            MEMBER_BADGE: 'Member_Badge',
            MEMBER_ACTIVITY: 'Member_Activity_History',
            WILAYAH_PROVINSI: 'Wilayah_Provinsi',
            WILAYAH_KABUPATEN: 'Wilayah_Kabupaten',
            WILAYAH_KECAMATAN: 'Wilayah_Kecamatan',
            WILAYAH_DESA: 'Wilayah_Desa',
            KTA_GENERATION_LOG: 'KTA_Generation_Log',
            MEMBER_APPROVAL: 'Member_Approval',
            MEMBER_CHANGE_HISTORY: 'Member_Change_History',
            KTA_TEMPLATE: 'KTA_Template',
            KTA_TEMPLATE_HISTORY: 'KTA_Template_History',
            QR_VERIFICATION_LOG: 'QR_Verification_Log'
          }
        },

        // Domain 2: Database Berita, Agenda & Konten
        CONTENT: {
          key: 'CONTENT',
          name: 'CONTENT DATABASE',
          description: 'Pusat publikasi berita, artikel, agenda kegiatan, galeri dan pengumuman',
          propertyKey: 'CONTENT_SPREADSHEET_ID',
          fallbackId: '',
          sheets: {
            BERITA: 'Berita',
            ARTIKEL: 'Artikel',
            AGENDA: 'Agenda_Kegiatan',
            AGENDA_KEGIATAN: 'Agenda_Kegiatan',
            GALERI: 'Galeri',
            PENGUMUMAN: 'Pengumuman',
            KATEGORI_KONTEN: 'Kategori_Konten'
          }
        },

        // Domain 3: Database Pariwisata & Destinasi
        TRAVEL: {
          key: 'TRAVEL',
          name: 'TRAVEL DATABASE',
          description: 'Katalog destinasi wisata binaan, paket tur, mitra dan ulasan wisatawan',
          propertyKey: 'TRAVEL_SPREADSHEET_ID',
          fallbackId: '',
          sheets: {
            DESTINASI: 'Destinasi',
            PAKET: 'Paket Wisata',
            PAKET_WISATA: 'Paket Wisata',
            MITRA: 'Mitra_Wisata',
            REVIEW: 'Review',
            ULASAN: 'Review',
            KEMITRAAN: 'Mitra_Wisata'
          }
        },

        // Domain 4: Database Pasar & UMKM
        COMMERCE: {
          key: 'COMMERCE',
          name: 'COMMERCE DATABASE',
          description: 'Katalog produk UMKM, kategori, SKU, inventori, pesanan dan supplier',
          propertyKey: 'COMMERCE_SPREADSHEET_ID',
          fallbackId: '',
          sheets: {
            PRODUCTS: 'Products',
            CATEGORIES: 'Categories',
            SKU: 'SKU_Master',
            INVENTORY: 'Inventory',
            ORDERS: 'Orders',
            SUPPLIERS: 'Suppliers'
          }
        },

        // Domain 5: Database Sistem & Code Registry (Phase 7.1)
        SYSTEM: {
          key: 'SYSTEM',
          name: 'SPWN_SYSTEM_DATABASE',
          description: 'Pusat registry Google Apps Script, version history dan developer audit logging',
          propertyKey: 'SYSTEM_SPREADSHEET_ID',
          fallbackId: '',
          sheets: {
            CODE_REGISTRY: 'Code_Registry',
            CODE_VERSION_HISTORY: 'Code_Version_History',
            DEVELOPER_AUDIT_LOG: 'Developer_Audit_Log'
          }
        }
      }
    },

    // Abstraksi persiapan migrasi masa depan (Hybrid / PostgreSQL / Supabase)
    POSTGRESQL_SUPABASE: {
      REST_ENDPOINT_URL: '',
      ANON_KEY: '',
      SERVICE_ROLE_KEY: '',
      ENABLED: false
    }
  }
};

// =========================================================================
// HELPER FUNCTIONS DATABASE ACCESS LAYER
// =========================================================================

/**
 * Mengambil ID Spreadsheet untuk domain tertentu secara aman.
 * Urutan resolusi:
 * 1. ScriptProperties (Environment variable aman di Apps Script)
 * 2. Fallback ID pada konfigurasi
 * 3. Active Spreadsheet ID (bila skrip ter-bind pada salah satu sheet)
 * 
 * @param {string} domainKey - 'MEMBER' | 'CONTENT' | 'TRAVEL' | 'COMMERCE'
 * @returns {string} Spreadsheet ID
 */
function getSpreadsheetIdByDomain(domainKey) {
  var domain = SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS[domainKey];
  if (!domain) {
    throw new Error('[database.config.gs] Domain database tidak valid: ' + domainKey);
  }

  // 1. Cek ScriptProperties
  try {
    var scriptProps = PropertiesService.getScriptProperties();
    var customId = scriptProps.getProperty(domain.propertyKey);
    if (customId && customId.trim() !== '') {
      return customId.trim();
    }
  } catch (e) {
    Logger.log('[database.config.gs] Peringatan: Gagal membaca ScriptProperties: ' + e.message);
  }

  // 2. Cek fallback ID konfigurasi
  if (domain.fallbackId && domain.fallbackId.trim() !== '') {
    return domain.fallbackId.trim();
  }

  // 3. Fallback ke Container-Bound Active Spreadsheet jika tersedia
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) {
      return activeSs.getId();
    }
  } catch (e) {
    // Skrip berjalan standalone
  }

  throw new Error(
    '[database.config.gs] Spreadsheet ID untuk ' + domain.name + 
    ' (' + domain.propertyKey + ') belum dikonfigurasi di ScriptProperties!'
  );
}

/**
 * Membuka spreadsheet objek resmi berdasarkan domain database.
 * Service dan Repository HANYA memanggil fungsi ini, tidak pernah memanggil
 * SpreadsheetApp.openById("xxx-hardcoded-id") secara langsung.
 * 
 * @param {string} domainKey - 'MEMBER' | 'CONTENT' | 'TRAVEL' | 'COMMERCE'
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Objek Spreadsheet
 */
function openSpreadsheetByDomain(domainKey) {
  var ssId = getSpreadsheetIdByDomain(domainKey);
  try {
    return SpreadsheetApp.openById(ssId);
  } catch (err) {
    throw new Error(
      '[database.config.gs] Gagal membuka spreadsheet domain ' + domainKey + 
      ' [ID: ' + ssId + ']: ' + err.message
    );
  }
}

/**
 * Mengambil nama sheet yang valid berdasarkan konfigurasi domain dan table key.
 * Mencegah hardcode string nama tab sheet di service.
 * 
 * @param {string} domainKey - 'MEMBER' | 'CONTENT' | 'TRAVEL' | 'COMMERCE'
 * @param {string} tableKey  - Contoh: 'ANGGOTA', 'USERS', 'BERITA', 'PRODUCTS'
 * @returns {string} Nama fisik sheet (contoh: 'Anggota', 'Users')
 */
function getSheetName(domainKey, tableKey) {
  var domain = SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS[domainKey];
  if (!domain) {
    throw new Error('[database.config.gs] Domain database tidak ditemukan: ' + domainKey);
  }

  var sheetName = domain.sheets[tableKey];
  if (!sheetName) {
    throw new Error(
      '[database.config.gs] Tabel ' + tableKey + ' tidak terdaftar pada domain ' + domainKey
    );
  }

  return sheetName;
}

/**
 * Membuka sheet spesifik secara langsung berdasarkan domain dan table key.
 * 
 * @param {string} domainKey - 'MEMBER' | 'CONTENT' | 'TRAVEL' | 'COMMERCE'
 * @param {string} tableKey  - Contoh: 'ANGGOTA', 'USERS', 'BERITA'
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function openSheet(domainKey, tableKey) {
  var ss = openSpreadsheetByDomain(domainKey);
  var sheetName = getSheetName(domainKey, tableKey);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(
      '[database.config.gs] Tab sheet "' + sheetName + '" tidak ditemukan di dalam spreadsheet domain ' + domainKey
    );
  }

  return sheet;
}

/**
 * Memvalidasi kesiapan seluruh konfigurasi database saat deployment atau startup.
 * Memeriksa keterhubungan ke seluruh domain tanpa memodifikasi data.
 * 
 * @returns {Object} Hasil diagnosa status koneksi setiap domain
 */
function validateDatabaseConfiguration() {
  var results = {
    timestamp: new Date().toISOString(),
    gatewayDeploymentId: SPWN_DATABASE.GATEWAY.DEPLOYMENT_ID,
    activeProvider: SPWN_DATABASE.ACTIVE_PROVIDER,
    domains: {}
  };

  var domains = SPWN_DATABASE.PROVIDERS.GOOGLE_SPREADSHEET.DOMAINS;

  for (var key in domains) {
    var domain = domains[key];
    var status = {
      name: domain.name,
      propertyKey: domain.propertyKey,
      spreadsheetId: null,
      isConnected: false,
      sheetList: [],
      error: null
    };

    try {
      var ssId = getSpreadsheetIdByDomain(key);
      status.spreadsheetId = ssId;
      var ss = SpreadsheetApp.openById(ssId);
      var availableSheets = ss.getSheets().map(function(s) { return s.getName(); });
      status.sheetList = availableSheets;
      status.isConnected = true;
    } catch (e) {
      status.error = e.message;
      status.isConnected = false;
    }

    results.domains[key] = status;
  }

  return results;
}

/**
 * Fungsi Pengujian Eksekusi Konfigurasi (Function Testing)
 * Jalankan fungsi ini langsung di editor Google Apps Script untuk
 * memverifikasi apakah konfigurasi terpasang dengan benar.
 */
function testDatabaseConfiguration() {
  Logger.log('=== MEMULAI TEST KONFIGURASI DATABASE SPWN APPS 2.0 ===');
  Logger.log('Deployment Gateway ID: ' + SPWN_DATABASE.GATEWAY.DEPLOYMENT_ID);
  Logger.log('Deployment URL: ' + SPWN_DATABASE.GATEWAY.EXEC_URL);

  var validation = validateDatabaseConfiguration();
  Logger.log('Hasil Validasi: ' + JSON.stringify(validation, null, 2));

  for (var domainKey in validation.domains) {
    var d = validation.domains[domainKey];
    if (d.isConnected) {
      Logger.log('[OK] Domain ' + d.name + ' terhubung. Sheets: ' + d.sheetList.join(', '));
    } else {
      Logger.log('[PERINGATAN] Domain ' + d.name + ' belum terhubung: ' + d.error);
    }
  }

  Logger.log('=== TEST KONFIGURASI SELESAI ===');
  return validation;
}
