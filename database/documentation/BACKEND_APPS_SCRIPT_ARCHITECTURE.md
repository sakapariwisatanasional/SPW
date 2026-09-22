# SPWN Apps 2.0 - Google Apps Script Backend Architecture
**Enterprise-Grade GAS Engine for Hybrid Spreadsheet Gateway**

---

## 1. Architectural Mindset
Google Apps Script (GAS) sering kali diperlakukan sebagai skrip prosedural sederhana. Pada SPWN Apps 2.0, GAS direkayasa menjadi **arsitektur berlapis (Layered Enterprise Architecture)** dengan pola:
`Controller -> Service -> Repository -> Spreadsheet Engine`.

---

## 2. Directory & Component Breakdown

```
backend/google-apps-script/
├── config/
│   └── database.config.gs       # Pemetaan Spreadsheet ID, Sheet Names, dan App Secrets
├── controllers/
│   ├── member.controller.gs     # Handler request keanggotaan & KTA
│   ├── tourism.controller.gs    # Handler destinasi wisata & paket wisata
│   ├── content.controller.gs    # Handler artikel, berita, agenda, pengumuman
│   ├── commerce.controller.gs   # Handler katalog produk UMKM & pemesanan
│   └── verification.controller.gs # Public KTA Verification handler (Data Filtered)
├── services/
│   ├── member.service.gs        # Aturan bisnis keanggotaan, validasi no KTA, hashing
│   ├── tourism.service.gs       # Kalkulasi rating destinasi, kurasi mitra
│   ├── content.service.gs       # Workflow publish konten (Draft -> Review -> Published)
│   └── commerce.service.gs      # Manajemen stok SKU & validasi kuantitas order
├── repositories/
│   └── spreadsheet.repository.gs# Generic CRUD, batch read/write, LockService, Cache
└── utils/
    ├── response.gs              # Serialisasi JSON JSend standard & CORS Headers
    ├── validator.gs             # Validasi payload & regex sanitasian data
    └── error.gs                 # AppError, NotFoundError, ForbiddenError & logging
```

---

## 3. Layer Responsibilities

### A. Repositories (`spreadsheet.repository.gs`)
- Mengabstraksi Google Sheet API (`SpreadsheetApp.openById`).
- Menggunakan `LockService.getScriptLock()` pada operasi penulisan/pembaruan (mutasi) untuk mencegah *race conditions* saat banyak admin melakukan pembaruan data secara bersamaan.
- Menggunakan `CacheService.getScriptCache()` untuk data master (`Krida_Master`, `Role_Master`, `Kategori`) dengan TTL 10-30 menit untuk mereduksi I/O spreadsheet.
- Mendukung pemetaan baris otomatis: Header row diubah menjadi objek JSON berbasis key.

### B. Services Layer
- Menangani seluruh logika bisnis murni.
- Tidak berinteraksi langsung dengan UI atau HTTP request/response objek.
- Contoh: `verification.service.gs` mengambil record dari repository, memverifikasi status keaktifan anggota, dan memfilter data privat (membuang `nik`, `password_hash`, `email`, dll.) sebelum dikembalikan ke controller.

### C. Controllers Layer
- Menerima parameter dari `doGet(e)` dan `doPost(e)`.
- Memvalidasi parameter via `validator.gs`.
- Memanggil service yang sesuai.
- Membungkus hasil dalam `response.success()` atau meneruskannya ke `response.error()`.

### D. Main Web App Dispatcher (`Code.gs`)
```javascript
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var action = e.parameter.action || (e.postData && JSON.parse(e.postData.contents).action);
    var dispatcher = getActionRoute(action, method);
    return dispatcher.controller(e);
  } catch (err) {
    return ResponseUtils.createErrorResponse(err);
  }
}
```

---

## 4. Concurrency & Performance Safeguards
1. **ScriptLock**: Setiap operasi `INSERT` atau `UPDATE` wajib membungkus mutasi dalam `lock.waitLock(10000)` dan melepaskannya dalam blok `finally { lock.releaseLock(); }`.
2. **Batch Range Reads**: Menghindari pemanggilan `sheet.getRange(row, col)` berulang kali. Menggunakan `sheet.getDataRange().getValues()` untuk membaca seluruh dataset ke dalam memory buffer sekali baca.
3. **Data Sanitization Rule**: Controller verifikasi KTA tidak memiliki akses ke properti sensitif akun pengguna.
