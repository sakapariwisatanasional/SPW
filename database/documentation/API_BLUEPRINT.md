# SPWN Apps 2.0 - API Endpoint Blueprint
**Google Apps Script API Gateway & Future REST Specification**

---

## 1. Response Standard (JSend Compliant)

Semua respons API SPWN Apps 2.0 mengikuti format terstandarisasi:

### Success Response:
```json
{
  "status": "success",
  "code": 200,
  "data": { ... },
  "message": "Operasi berhasil diselesaikan",
  "timestamp": "2026-09-21T08:40:00.000Z"
}
```

### Error Response:
```json
{
  "status": "error",
  "code": 403,
  "message": "Akses ditolak: Memerlukan hak akses ADMIN_PUSAT",
  "errors": [
    { "field": "role", "issue": "Insufficient privileges" }
  ],
  "timestamp": "2026-09-21T08:40:00.000Z"
}
```

---

## 2. Google Apps Script Web App Dispatcher (`doGet` & `doPost`)

Karena Google Apps Script beroperasi sebagai single-endpoint Web App (`/exec`), request diarahkan menggunakan parameter `action` atau path proxy:

```typescript
// GET https://script.google.com/macros/s/.../exec?action={domain}.{method}&...
// POST https://script.google.com/macros/s/.../exec (body: { action: "...", payload: { ... }, token: "..." })
```

Dalam aplikasi frontend, `GASApiClient` mengabstraksi pemanggilan ini sehingga developer memanggil endpoint seperti REST API standar: `apiClient.get('/members')` atau `apiClient.post('/auth/login')`.

---

## 3. Detailed Endpoint Matrix

### A. Authentication & Session Module (`/api/auth`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `POST` | `auth.login` | Public | Login via email/username & password. Return JWT/Session token + user profile. |
| `POST` | `auth.register` | Public | Pendaftaran calon anggota baru SAKA Pariwisata. |
| `GET`  | `auth.me` | Authenticated | Mendapatkan profil akun dan role aktif dari bearer token. |
| `POST` | `auth.forgotPassword` | Public | Mengirimkan kode reset password ke email terdaftar. |
| `POST` | `auth.resetPassword` | Public | Reset password menggunakan verifikasi token reset. |
| `POST` | `auth.logout` | Authenticated | Invalidate session token di cache/storage. |

---

### B. Public KTA Verification Module (`/api/verification`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `verification.verifyKTA` (`/verify/:token`) | **PUBLIC** | **Verifikasi KTA Publik.** Input: `token`. Mengembalikan payload publik terfilter: nama, no_kta, status, foto, provinsi, krida, tanggal_bergabung. Data privat (NIK, email, password) dijamin dibuang di layer backend. |

---

### C. Membership & Krida Module (`/api/members`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `member.list` | Member / Admin | List anggota dengan filter: provinsi, krida, status, pencarian keyword, pagination. |
| `GET` | `member.getById` | Member / Admin | Detail anggota berdasarkan ID / No_KTA. |
| `POST` | `member.create` | Admin Wilayah/Pusat | Registrasi anggota baru dan generate `verification_token` & draft KTA. |
| `PUT` | `member.update` | Member (self) / Admin | Update profil anggota. Member hanya dapat mengedit field personal non-krida. |
| `PUT` | `member.updateStatus`| Admin Pusat | Verifikasi / aktivasi status anggota (ACTIVE, SUSPENDED, ALUMNI). |
| `GET` | `krida.list` | Public / Member | Mengambil daftar master Krida (Bina Wisata, Bina Kuliner, Bina Pandu, dll.). |
| `GET` | `member.ktaData` | Member / Admin | Mengambil data raw KTA untuk locked KTA renderer component. |

---

### D. Tourism Module (`/api/tourism`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `tourism.destinations` | Public | Daftar destinasi wisata, filter by kategori, provinsi, rating, harga. |
| `GET` | `tourism.destinationDetail` | Public | Detail destinasi, galeri foto, fasilitas, ulasan, koordinat peta. |
| `POST`| `tourism.createDestination` | Tourism Mgr/Admin | Tambah destinasi wisata binaan SAKA Pariwisata. |
| `GET` | `tourism.packages` | Public | Katalog paket wisata binaan dan mitra. |
| `GET` | `tourism.partners` | Public / Member | Direktori mitra pariwisata (Homestay, Guide, Desa Wisata). |
| `POST`| `tourism.submitReview` | Authenticated | Memberi ulasan dan rating pada destinasi atau paket wisata. |

---

### E. Content Management Module (`/api/content`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `content.feed` | Public | Feed gabungan berita, agenda, dan artikel terbaru. |
| `GET` | `content.news` | Public / Manager | Berita SAKA Pariwisata. Mendukung filter status (`PUBLISHED` untuk publik, `DRAFT`/`REVIEW` untuk manager). |
| `POST`| `content.createNews` | Content Mgr/Admin | Publikasi berita baru. |
| `GET` | `content.events` | Public | Agenda kegiatan (kemah, pelatihan krida, jambore pariwisata). |
| `GET` | `content.gallery` | Public | Dokumentasi kegiatan dan keindahan nusantara. |
| `GET` | `content.announcements`| Public / Member | Pengumuman resmi organisasi. |

---

### F. Commerce Marketplace Module (`/api/commerce`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `commerce.products` | Public | Katalog produk UMKM mitra SAKA & merchandise resmi. |
| `GET` | `commerce.productDetail`| Public | Spesifikasi produk, foto, stok SKU, identitas supplier. |
| `POST`| `commerce.createOrder` | Authenticated | Checkout pesanan produk. |
| `GET` | `commerce.orders` | Member / Mgr | Riwayat pemesanan member / dashboard order commerce manager. |
| `PUT` | `commerce.updateStock` | Commerce Mgr | Pembaruan inventaris dan SKU master. |

---

### G. Dashboard & Analytics Module (`/api/dashboard`)
| Method | Endpoint / Action | Access | Deskripsi & Payload |
|---|---|---|---|
| `GET` | `dashboard.summary` | Authenticated | Ringkasan metrik: total anggota per wilayah, sebaran krida, statistik kunjungan destinasi, pesanan commerce, timeline kegiatan. |
| `GET` | `dashboard.mapData` | Authenticated | Geo-data sebaran anggota dan destinasi wisata di 38 provinsi Indonesia. |
