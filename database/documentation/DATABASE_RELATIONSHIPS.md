# SPWN Apps 2.0 - Database Relationship & Schema Specification
**SPWN_DATABASE Single Source of Truth**

---

## 1. Database Overview (Spreadsheets & Sheets)

SPWN beroperasi menggunakan 4 Google Spreadsheet utama yang saling berelasi melalui kunci unik (UUID / No_KTA / Slug).

```
+---------------------------------------------------------------------------------------+
|                                    SPWN_DATABASE                                      |
+---------------------------+---------------------------+-------------------------------+
| DATABASE: MEMBER          | DATABASE: CONTENT         | DATABASE: TRAVEL & COMMERCE   |
| ├─ Anggota (Core Profile) | ├─ Berita (News)          | [TRAVEL]                      |
| ├─ Users (Auth & RBAC)    | ├─ Artikel (Articles)     | ├─ Destinasi (Destinations)   |
| ├─ KTA_Setting (Config)   | ├─ Agenda_Kegiatan (Event)| ├─ Paket Wisata (Tour Packages|
| ├─ KTA_Template (Layout)  | ├─ Galeri (Media Assets)  | ├─ Mitra_Wisata (Partners)    |
| ├─ KTA_History (Logs)     | └─ Pengumuman (Notices)   | └─ Review (Ratings & Reviews) |
| ├─ Krida_Master (Master)  |                           | [COMMERCE]                    |
| ├─ Role_Master (Master)   |                           | ├─ Products & Categories      |
| ├─ Pengaturan (App Config)|                           | ├─ SKU_Master & Inventory     |
| └─ Password_Reset (Tokens)|                           | └─ Orders & Suppliers         |
+---------------------------+---------------------------+-------------------------------+
```

---

## 2. Detailed Sheet Schema & Relationships

### A. DATABASE: MEMBER
1. **`Users` (Autentikasi & Akun)**
   - `id` (PK, string/uuid): ID unik akun
   - `username` (string, unique): Username login
   - `email` (string, unique): Alamat email terdaftar
   - `password_hash` (string): Hash kata sandi terenkripsi
   - `role_id` (FK -> `Role_Master.id`): Role akses pengguna
   - `member_id` (FK -> `Anggota.id`, nullable): Relasi ke profil keanggotaan SAKA
   - `is_active` (boolean): Status aktif akun (TRUE/FALSE)
   - `last_login_at` (timestamp): Waktu login terakhir
   - `created_at` (timestamp), `updated_at` (timestamp)

2. **`Anggota` (Data Profil Keanggotaan)**
   - `id` (PK, string/uuid): ID entitas anggota
   - `no_kta` (string, unique): Nomor KTA resmi (Format: `SPWN.XX.YY.ZZZZ`)
   - `nama_lengkap` (string): Nama lengkap anggota
   - `nik` (string, private): Nomor Induk Kependudukan (Internal only)
   - `tempat_lahir` (string), `tanggal_lahir` (date)
   - `jenis_kelamin` (enum: L/P)
   - `provinsi_id` (string), `kabupaten_id` (string), `alamat` (string)
   - `krida_id` (FK -> `Krida_Master.id`): Krida SAKA Pariwisata
   - `tingkat_keanggotaan` (string): Siaga / Penggalang / Penegak / Pandega / Pembina
   - `foto_url` (string): URL file foto anggota
   - `status` (enum: ACTIVE, PENDING_VERIFICATION, SUSPENDED, ALUMNI)
   - `verification_token` (string, unique): Token publik untuk QR KTA Verification
   - `tanggal_bergabung` (date): Tanggal resmi bergabung
   - `created_at` (timestamp), `updated_at` (timestamp)

3. **`Krida_Master`**
   - `id` (PK, string): Kode Krida (misal: `KRIDA_BINA_WISATA`, `KRIDA_BINA_KULINER`, `KRIDA_BINA_PANDU`, `KRIDA_BINA_PESONA`)
   - `nama_krida` (string): Nama resmi Krida
   - `deskripsi` (string): Penjelasan ruang lingkup Krida
   - `icon_url` (string): Ikon representasi visual Krida
   - `is_active` (boolean)

4. **`Role_Master`**
   - `id` (PK, string): `SUPER_ADMIN`, `ADMIN_PUSAT`, `ADMIN_WILAYAH`, `CONTENT_MANAGER`, `TOURISM_MANAGER`, `COMMERCE_MANAGER`, `MEMBER`
   - `nama_role` (string)
   - `permissions` (json string): Array of permission keys
   - `keterangan` (string)

5. **`KTA_Setting`, `KTA_Template`, `KTA_History` (LOCKED COMPONENT)**
   - Digunakan oleh generator KTA legacy: Template canvas ID, background raster/vector paths, signature URL pimpinan pusat, log pencetakan/unduhan PDF.

---

### B. DATABASE: CONTENT
1. **`Berita` & `Artikel`**
   - `id` (PK, string/uuid)
   - `title` (string)
   - `slug` (string, unique)
   - `category` (string)
   - `summary` (string)
   - `content` (text / markdown)
   - `cover_image_url` (string)
   - `author_id` (FK -> `Users.id`)
   - `krida_id` (FK -> `Krida_Master.id`, nullable)
   - `status` (enum: DRAFT, REVIEW, PUBLISHED, ARCHIVED)
   - `view_count` (number)
   - `published_at` (timestamp)
   - `created_at` (timestamp), `updated_at` (timestamp)

2. **`Agenda_Kegiatan` (Event Calendar)**
   - `id` (PK, string/uuid)
   - `title` (string)
   - `slug` (string, unique)
   - `start_date` (timestamp), `end_date` (timestamp)
   - `location` (string)
   - `provinsi_id` (string)
   - `organizer` (string)
   - `registration_link` (string, nullable)
   - `quota` (number)
   - `status` (enum: UPCOMING, ONGOING, COMPLETED, CANCELLED)
   - `banner_url` (string)

3. **`Galeri` & `Pengumuman`**
   - Media aset pariwisata, dokumentasi jambore/kemah wisata, dan surat edaran resmi.

---

### C. DATABASE: TRAVEL (Pariwisata & Mitra)
1. **`Destinasi`**
   - `id` (PK, string/uuid)
   - `nama_destinasi` (string)
   - `slug` (string, unique)
   - `kategori` (enum: WISATA_ALAM, BUDAYA, KULINER, EDUKASI, BAHARI, BUATAN)
   - `provinsi_id` (string), `kabupaten_id` (string)
   - `deskripsi` (text)
   - `fasilitas` (json string)
   - `harga_tiket_mulai` (number)
   - `rating_avg` (float: 0.0 - 5.0)
   - `thumbnail_url` (string), `gallery_urls` (json string)
   - `mitra_id` (FK -> `Mitra_Wisata.id`, nullable)
   - `latitude` (float), `longitude` (float)

2. **`Paket Wisata`**
   - `id` (PK, string/uuid)
   - `nama_paket` (string)
   - `destinasi_ids` (json string -> array of `Destinasi.id`)
   - `durasi_hari` (number)
   - `harga` (number)
   - `itinerary` (json string)
   - `mitra_id` (FK -> `Mitra_Wisata.id`)
   - `kuota_min` (number), `kuota_max` (number)
   - `is_available` (boolean)

3. **`Mitra_Wisata` & `Review`**
   - Mitra (Homestay, Tour Guide binaan SAKA, Desa Wisata, Transportasi).
   - Review berelasi ke `Destinasi.id` atau `Paket.id` dan reviewer (`Users.id` / public guest).

---

### D. DATABASE: COMMERCE (Tourism Marketplace & UMKM)
1. **`Categories` & `Products`**
   - Kategori: Cinderamata SAKA, Kriya Lokal, Kuliner Tradisional, Perlengkapan Petualang.
   - `Products`: `id`, `name`, `category_id`, `description`, `price`, `stock`, `images`, `supplier_id`, `is_active`.
2. **`SKU_Master`, `Inventory`, `Orders`, `Suppliers`**
   - Order tracking (`PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`).

---

### E. DATABASE: SPWN_SYSTEM_DATABASE (Phase 7.1 - Developer Code Registry)
1. **`Code_Registry` (Daftar Berkas Google Apps Script)**
   - `id` (PK, string): Identitas unik berkas (misal `CODE-A8F2`)
   - `file_name` (string): Nama berkas fisik (contoh: `code.registry.service.gs`)
   - `file_path` (string, unique): Jalur berkas repository (contoh: `backend/google-apps-script/services/code.registry.service.gs`)
   - `module` (string): Kategori arsitektur (`CORE`, `SERVICES`, `CONTROLLERS`, `CONFIG`, `REPOSITORIES`)
   - `version` (string): Nomor versi semantik rilis aktif (contoh: `1.0.0`)
   - `code_content` (text): Isi kode sumber lengkap Google Apps Script
   - `checksum` (string): Hash SHA-256 integritas kode
   - `status` (enum: `APPROVED`, `PENDING_APPROVAL`, `DRAFT`)
   - `created_by` (string), `created_at` (timestamp), `updated_at` (timestamp)
   - `change_note` (string): Catatan perubahan rilis

2. **`Code_Version_History` (Histori Revisi Kode)**
   - `id` (PK, string): Identitas unik revisi (misal `HIST-B41E`)
   - `registry_id` (FK -> `Code_Registry.id`): Relasi ke berkas kode utama
   - `version` (string): Versi historis
   - `code_content` (text): Arsip kode sumber pada versi tersebut
   - `checksum` (string): Hash SHA-256 versi historis
   - `changed_by` (string): Pengembang yang melakukan mutasi
   - `changed_at` (timestamp): Waktu commit revisi
   - `change_note` (string): Catatan commit revisi

3. **`Developer_Audit_Log` (Audit Trail Akses & Mutasi Pengembang)**
   - `id` (PK, string): Identitas log
   - `timestamp` (timestamp): Waktu akses tepat
   - `user_id` (string): ID akun pengembang
   - `user_name` (string): Nama lengkap pengembang
   - `user_role` (string): Role pengembang (`SUPER_ADMIN`)
   - `action` (enum: `VIEW_CODE`, `COPY_CODE`, `APPROVE_VERSION`, `REGISTER_CODE`, `UPDATE_CODE`, `COMPARE_VERSION`)
   - `target_file` (string): Jalur berkas yang diakses/dimutasi
   - `details` (text/json): Metadata rincian aksi
   - `ip_address` (string): Alamat IP origin

---

## 3. Entity Relationship Diagram (ERD Concept)

```
[Users] 1──────1 [Anggota] 1──────N [KTA_History]
   │                 │
   │ N:1             │ N:1
   ▼                 ▼
[Role_Master]   [Krida_Master] 1──────N [Artikel / Berita]
                     │
                     │ (relasi tematik)
                     ▼
             [Destinasi Wisata] 1──────N [Review]
                     │
                     │ N:M (via Paket_Destinasi)
                     ▼
             [Paket Wisata] 1──────N [Orders]
                     │
                     │ N:1
                     ▼
             [Mitra_Wisata] 1──────N [Products (UMKM)]
```

---

## 4. Hybrid Migration Mapping Strategy
Untuk transisi masa depan ke Supabase/PostgreSQL:
- Kolom Sheet diformat dalam schema JSON deklaratif (`database/migration/schema.json`).
- `SpreadsheetMigrationAdapter` memetakan baris Google Sheet (2D Array) ke Typed DTO tanpa manipulasi manual di kode bisnis.
