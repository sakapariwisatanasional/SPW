# SPWN Apps 2.0 - Checklist Pengujian Integrasi API (Frontend ke Backend)

Dokumen ini memuat panduan verifikasi fungsional dan pengujian integrasi alur data antara **Frontend Client (`src/services/api/`)** dengan **Google Apps Script Web App Engine (`Code.gs / router.gs`)**.

---

## 1. Matrix Alur Pengujian Utama

| ID | Alur Integrasi | Skenario Pengujian | Hasil yang Diharapkan | Status |
|:---:|:---|:---|:---|:---:|
| **TC-01** | **Login & Session Issuance** | `authApi.login({ username, password })` | Mengembalikan HTTP 200, JWT/Session Token `SPWN-SES-...`, objek profil pengguna, dan permissions role. Token tersimpan di `localStorage`. |  Siap Diuji |
| **TC-02** | **Session Validation (`auth.me`)** | `authApi.me()` dengan header `Authorization: Bearer <TOKEN>` | Mengembalikan HTTP 200 dengan profil pengguna terverifikasi. Jika token kedaluwarsa, mengembalikan HTTP 401 `SPWN_SESSION_EXPIRED`. |  Siap Diuji |
| **TC-03** | **Public KTA QR Verification** | `verificationApi.verifyQr(token)` tanpa header otentikasi | Mengembalikan status `isValid: true`, nama, nomor KTA, kwartir, status `ACTIVE`, data privasi (NIK, HP) disanitasi. Rate limit 30 req/min terjaga. |  Siap Diuji |
| **TC-04** | **Member Directory & RBAC** | `memberApi.list({ page: 1, limit: 10 })` | Pengguna dengan role MEMBER/ADMIN menerima daftar anggota terpaginasi. Pengguna publik tanpa token ditolak dengan HTTP 401 `SPWN_UNAUTHORIZED`. |  Siap Diuji |
| **TC-05** | **Tourism Destination Listing** | `tourismApi.listDestinations({ provinsi_id: '32' })` | Mengembalikan daftar destinasi binaan Jawa Barat lengkap dengan skor agregasi Sapta Pesona dan ulasan. Endpoint dapat diakses publik. |  Siap Diuji |
| **TC-06** | **Dual-Gate Tourism Review** | `tourismApi.submitReview(payload)` | Member mengirim ulasan langsung tersimpan; Pengunjung publik dibatasi maksimal 3 ulasan per jam melalui `RateLimiter`. |  Siap Diuji |
| **TC-07** | **Content Publishing Workflow** | `contentApi.createDraft` -> `submitReview` -> `publish` | Draft warta transisi dari DRAFT ke REVIEW ke PUBLISHED. Aksi `content.publish` diverifikasi hak akses `CONTENT_PUBLISH` dan dicatat ke `audit.middleware.gs`. |  Siap Diuji |
| **TC-08** | **Kedai SAKA Commerce & Checkout** | `commerceApi.checkout(items)` | Memeriksa ketersediaan stok fisik di sheet `Inventory`. Jika cukup: nomor invoice `SPWN-INV-...` diterbitkan dan stok berkurang. Jika kurang: mengembalikan `SPWN_OUT_OF_STOCK`. |  Siap Diuji |
| **TC-09** | **Error Handler & Fallback** | Simulasi server mati / spreadsheet error | `SpwnApiError` menangkap error, memetakan ke kode `SPWN_DATABASE_ERROR` atau `SPWN_NETWORK_ERROR`, dan memberikan pesan instruktif kepada pengguna. |  Siap Diuji |

---

## 2. Prosedur Uji Lapangan via Browser Console / Runner

Saat aplikasi frontend aktif, pengujian kontrak API dapat diverifikasi secara instan melalui snippet berikut:

```typescript
import { authApi, verificationApi, tourismApi, commerceApi } from '@/services/api';

// 1. Uji Verifikasi Publik QR
const qrResult = await verificationApi.verifyQr("SPWN-KTA-SIGN-TEST123");
console.log("QR Result:", qrResult.data);

// 2. Uji Login Akun
const loginResult = await authApi.login({
  username: "32.04.26.0001",
  password: "PasswordRahasia123"
});
console.log("Login Token:", loginResult.data.token);

// 3. Uji Destinasi Wisata
const destinations = await tourismApi.listDestinations({ limit: 5 });
console.log("Destinasi:", destinations.data);

// 4. Uji Etalase Produk Kedai
const products = await commerceApi.listProducts({ limit: 5 });
console.log("Produk Kedai:", products.data);
```

---

## 3. Kriteria Keberhasilan (Acceptance Criteria)
1. Seluruh payload permintaan menyertakan `action` yang sesuai dengan `router.gs`.
2. Semua respons mengembalikan format standar `ApiResponse` v2 dengan field `meta.requestId`, `meta.timestamp`, dan `meta.apiVersion`.
3. Error kode backend terpetakan secara otomatis dan tidak memicu unhandled rejection pada UI React.
