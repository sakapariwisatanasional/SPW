# SPWN Apps 2.0 - Final API Reference Documentation

Selamat datang di dokumentasi resmi RESTful Web App API **SPWN Apps 2.0** (SAKA Pariwisata Network Indonesia). API ini ditenagai oleh Google Apps Script Web App Engine terdistribusi berbasis Action-Based Router dengan arsitektur multi-spreadsheet terisolasi.

- **Base URL:** `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`
- **Format Parameter Action:** `?action={domain}.{operation}`
- **Format Header Otentikasi:** `Authorization: Bearer <SESSION_TOKEN>` (atau fallback via payload/query `token=<SESSION_TOKEN>`)
- **API Version:** `v2`

---

## 1. Response Contract (v2)

Seluruh endpoint API mengembalikan struktur JSON konsisten:

### Standard Success Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operasi berhasil diproses",
  "action": "member.list",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 12
  },
  "meta": {
    "requestId": "REQ-m3f9d1-7x2q",
    "timestamp": "2026-09-21T09:30:00.000Z",
    "apiVersion": "v2"
  }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Anda tidak memiliki izin [CONTENT_PUBLISH] untuk melakukan aksi ini.",
  "action": "content.publish",
  "data": null,
  "pagination": null,
  "error": {
    "code": "SPWN_FORBIDDEN",
    "details": null
  },
  "meta": {
    "requestId": "REQ-m3f9d1-7x2q",
    "timestamp": "2026-09-21T09:30:00.000Z",
    "apiVersion": "v2"
  }
}
```

---

## 2. Error Code Directory

| Error Code | HTTP Status | Keterangan | Rekomendasi Solusi Frontend |
|---|:---:|---|---|
| `SPWN_MISSING_CREDENTIALS` | 400 | Kredensial login belum diisi | Validasi form login (no_kta / username dan password) |
| `SPWN_VALIDATION_ERROR` | 400 | Parameter atau format data tidak valid | Periksa validasi input field pada form |
| `SPWN_MISSING_PARAM` | 400 | Parameter wajib (id, token, dll) kosong | Sertakan parameter yang diminta |
| `SPWN_INVALID_CREDENTIALS` | 401 | Nomor KTA atau password salah | Tampilkan peringatan salah kredensial |
| `SPWN_UNAUTHORIZED` | 401 | Token tidak disertakan atau telah expired | Arahkan pengguna kembali ke halaman Login |
| `SPWN_SESSION_EXPIRED` | 401 | Sesi token telah kedaluwarsa | Hapus sesi lokal dan minta login ulang |
| `SPWN_FORBIDDEN` | 403 | Peran akun tidak memiliki izin akses | Tampilkan halaman peringatan 403 Akses Ditolak |
| `SPWN_NOT_FOUND` | 404 | Data yang dicari tidak ditemukan | Tampilkan pesan data tidak ada |
| `SPWN_RATE_LIMITED` | 429 | Batas frekuensi permintaan terlampaui | Minta pengguna menunggu periode jeda |
| `SPWN_OUT_OF_STOCK` | 409 | Stok produk tidak mencukupi checkout | Minta kurangi kuantitas pesanan |
| `SPWN_DATABASE_ERROR` | 500 | Gangguan I/O Google Spreadsheet | Tampilkan pesan fallback "Layanan sibuk, coba lagi" |
| `SPWN_CONTROLLER_CRASH` | 500 | Kesalahan internal script | Laporkan ID Request ke tim teknis |

---

## 3. Detailed Endpoint Reference

### A. Authentication Domain (`auth.*`)

#### 1. `auth.login`
- **Method:** `POST`
- **Authentication:** Public (Rate Limited: maks. 5 kegagalan per 5 menit)
- **Request Body:**
  ```json
  {
    "username": "1234567890", // atau no_kta atau email
    "password": "secretPassword"
  }
  ```
- **Response Data:**
  ```json
  {
    "token": "SPWN-SES-m3f9d1-8a7c2b",
    "user": {
      "id": "USR-101",
      "no_kta": "32.04.26.0001",
      "nama": "Kak Budi Santoso",
      "email": "budi@sakapariwisata.id",
      "role": "MEMBER",
      "tingkatan": "PENEGAK",
      "krida": "Pemandu Wisata",
      "provinsi_id": "32",
      "permissions": ["MEMBER_READ", "COMMERCE_BUY"]
    },
    "expiresAt": "2026-09-22T09:30:00.000Z"
  }
  ```

#### 2. `auth.me`
- **Method:** `GET`
- **Authentication:** `Required` (Bearer Token)
- **Request Parameters:** `?action=auth.me`
- **Response Data:** Detail profil user sesi aktif, peran, dan daftar permissions.

#### 3. `auth.logout`
- **Method:** `POST`
- **Authentication:** `Required` (Bearer Token)
- **Request Body:** `{}`
- **Response Data:** `{ "loggedOut": true }`

---

### B. Member & Verification Domain (`member.*`, `verify.*`)

#### 1. `verify.kta`
- **Method:** `GET` / `POST`
- **Authentication:** Public (Rate Limited: maks. 30 req/menit)
- **Request Parameters:** `?action=verify.kta&token=SPWN-KTA-SIGN-XYZ123`
- **Response Data:**
  ```json
  {
    "isValid": true,
    "no_kta": "32.04.26.0001",
    "nama": "Kak Budi Santoso",
    "tingkatan": "PENEGAK",
    "krida": "Pemandu Wisata",
    "kwartir_daerah": "Jawa Barat",
    "status": "ACTIVE",
    "verifiedAt": "2026-09-21T09:30:00.000Z"
  }
  ```

#### 2. `verify.internal`
- **Method:** `GET`
- **Authentication:** `Required` (Permission: `VERIFY_KTA_INTERNAL`)
- **Request Parameters:** `?action=verify.internal&no_kta=32.04.26.0001`
- **Response Data:** Profil anggota lengkap untuk kebutuhan verifikasi internal pengurus.

#### 3. `member.list`
- **Method:** `GET`
- **Authentication:** `Required` (Permission: `MEMBER_READ`)
- **Request Parameters:** `?action=member.list&page=1&limit=10&search=Budi&provinsi_id=32`
- **Response Data:** Array data anggota terpaginasi (data NIK/kontak disanitasi sesuai role).

#### 4. `member.detail`
- **Method:** `GET`
- **Authentication:** `Required` (Permission: `MEMBER_READ`)
- **Request Parameters:** `?action=member.detail&id=USR-101` (atau `no_kta`)
- **Response Data:** Detail profil anggota.

#### 5. `member.register`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `MEMBER_CREATE`)
- **Request Body:**
  ```json
  {
    "nama_lengkap": "Rian Anggara",
    "nik": "3204123456780001",
    "email": "rian@example.com",
    "telepon": "08123456789",
    "provinsi_id": "32",
    "tingkatan": "PENEGAK",
    "krida": "Pemandu Wisata"
  }
  ```

#### 6. `member.update`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `MEMBER_UPDATE`)
- **Request Body:** `{ "id": "USR-101", "telepon": "081299998888", "alamat": "Jl. Pramuka No. 1" }`

#### 7. `member.deactivate`
- **Method:** `POST`
- **Authentication:** `Required` (Roles: `SUPER_ADMIN`, `ADMIN_PUSAT`)
- **Request Body:** `{ "id": "USR-101", "reason": "Pindah domisili / mutasi" }`

---

### C. Tourism Domain (`tourism.*`)

#### 1. `tourism.destinations`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=tourism.destinations&page=1&limit=12&search=kawah&provinsi_id=32`
- **Response Data:** Daftar destinasi wisata binaan aktif terpaginasi.

#### 2. `tourism.destination`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=tourism.destination&id=DEST-01`
- **Response Data:** Detail destinasi, galeri foto, rincian skor Sapta Pesona, dan ulasan.

#### 3. `tourism.createDestination`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `TOURISM_MANAGE`)
- **Request Body:**
  ```json
  {
    "nama_destinasi": "Desa Wisata Saung Angklung Udjo",
    "kategori": "Budaya & Edukasi",
    "deskripsi": "Pusat pelestarian dan pertunjukan seni angklung tradisional Sunda.",
    "provinsi_id": "32",
    "lokasi": "Bandung, Jawa Barat",
    "koordinat": "-6.8986, 107.6543",
    "foto_utama": "https://images.unsplash.com/..."
  }
  ```

#### 4. `tourism.packages`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=tourism.packages&destinasi_id=DEST-01`

#### 5. `tourism.review`
- **Method:** `POST`
- **Authentication:** Public (Rate limited maks. 3 ulasan/jam) / Member Terverifikasi
- **Request Body:**
  ```json
  {
    "destinasi_id": "DEST-01",
    "rating": 5,
    "komentar": "Lokasi sangat asri, edukatif, dan ramah wisatawan.",
    "aman": 5,
    "tertib": 5,
    "bersih": 5,
    "sejuk": 4,
    "indah": 5,
    "ramah": 5,
    "kenangan": 5
  }
  ```

#### 6. `tourism.partners`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=tourism.partners&provinsi_id=32`

---

### D. Content & Publication Domain (`content.*`)

#### 1. `content.articles`
- **Method:** `GET`
- **Authentication:** Public (Publik hanya melihat `PUBLISHED`)
- **Request Parameters:** `?action=content.articles&page=1&limit=10&kategori=Kegiatan`

#### 2. `content.article`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=content.article&slug=kemah-bakti-saka-pariwisata-2026` (atau `id`)

#### 3. `content.draft`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `CONTENT_CREATE`)
- **Request Body:**
  ```json
  {
    "judul": "Kemah Bakti Saka Pariwisata 2026",
    "kategori": "Kegiatan",
    "konten": "Isi warta lengkap...",
    "foto_sampul": "https://..."
  }
  ```

#### 4. `content.submitReview`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `CONTENT_CREATE`)
- **Request Body:** `{ "id": "ART-01" }` (Transisi: DRAFT -> REVIEW)

#### 5. `content.publish`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `CONTENT_PUBLISH` + Audited)
- **Request Body:** `{ "id": "ART-01" }` (Transisi: REVIEW -> PUBLISHED)

#### 6. `content.events`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=content.events&page=1&limit=10`

#### 7. `content.gallery` & `content.announcements`
- **Method:** `GET`
- **Authentication:** Public

---

### E. Commerce Domain (`commerce.*`)

#### 1. `commerce.products`
- **Method:** `GET`
- **Authentication:** Public (Hanya status `ACTIVE` & stok tersedia)
- **Request Parameters:** `?action=commerce.products&page=1&limit=16&kategori=Suvenir`

#### 2. `commerce.product`
- **Method:** `GET`
- **Authentication:** Public
- **Request Parameters:** `?action=commerce.product&id=PRD-01`

#### 3. `commerce.createProduct`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `COMMERCE_MANAGE`)
- **Request Body:**
  ```json
  {
    "nama_produk": "Scarf Bordir Resmi Saka Pariwisata",
    "kategori": "Merchandise Resmi SAKA",
    "harga": 65000,
    "stok": 50,
    "berat_gram": 150,
    "foto_utama": "https://..."
  }
  ```

#### 4. `commerce.categories`
- **Method:** `GET`
- **Authentication:** Public

#### 5. `commerce.order` (Checkout)
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `COMMERCE_BUY`)
- **Request Body:**
  ```json
  {
    "items": [
      { "product_id": "PRD-01", "quantity": 2 },
      { "product_id": "PRD-02", "quantity": 1 }
    ],
    "alamat_pengiriman": "Gedung Kwarnas Pramuka Jl. Medan Merdeka Timur No. 6",
    "telepon": "08123456789",
    "ongkos_kirim": 15000,
    "catatan": "Tolong packing rapi"
  }
  ```
- **Response Data:**
  ```json
  {
    "invoiceNumber": "SPWN-INV-M3F9D1-4821",
    "grandTotal": 145000,
    "status": "PENDING",
    "items": [ ... ]
  }
  ```

#### 6. `commerce.orderDetail`
- **Method:** `GET`
- **Authentication:** `Required` (Pemilik Pesanan / Admin)
- **Request Parameters:** `?action=commerce.orderDetail&order_id=SPWN-INV-M3F9D1-4821`

#### 7. `commerce.updateOrder`
- **Method:** `POST`
- **Authentication:** `Required` (Permission: `COMMERCE_MANAGE` + Audited)
- **Request Body:** `{ "order_id": "SPWN-INV-M3F9D1-4821", "status": "PAID" }`
