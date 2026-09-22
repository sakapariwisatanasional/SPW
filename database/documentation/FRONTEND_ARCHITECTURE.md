# SPWN Apps 2.0 - Frontend Architecture Specification
**React 19 + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand**

---

## 1. Feature-Based Directory Architecture

Struktur frontend dibangun berbasis domain bisnis independen (features) dengan isolasi dependensi:

```
src/
├── app/
│   ├── App.tsx                      # Root shell & Layout provider
│   ├── router.tsx                   # React Router v6+ dengan role guard & code splitting
│   └── providers.tsx                # QueryClientProvider, ToastProvider, ThemeProvider
├── components/
│   ├── ui/                          # Reusable Atoms/Molecules (Design System)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Pagination.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   └── navigation/                  # Global Layout & Navigation Molecules
│       ├── Sidebar.tsx              # Dynamic RBAC menu navigation
│       ├── Header.tsx               # Top app bar, profile widget, notifications
│       └── BottomNavigation.tsx     # Mobile-first adaptive navigation bar
├── config/
│   ├── theme.config.ts              # Wonderful Indonesia Color Tokens & typography
│   ├── constants.ts                 # App constants, province lists, API URLs
│   └── navigation.config.ts         # Role-to-menu declarative routing table
├── features/
│   ├── auth/                        # Authentications, Login, RBAC session
│   ├── dashboard/                   # Executive widgets, Indonesia GeoMap, timeline
│   ├── membership/                  # Anggota, Krida, Locked KTA preview & Verification
│   ├── tourism/                     # Explorer, Destinations, Tour Packages, Reviews
│   ├── content/                     # CMS Berita, Artikel, Agenda, Galeri, Announcements
│   ├── commerce/                    # Marketplace, UMKM products, Orders, Inventory
│   └── analytics/                   # Real-time statistics & visual reporting
├── hooks/                           # Global UI hooks (useDebounce, useMediaQuery, etc.)
├── services/                        # HTTP client, GAS Api Client, Cache engine
├── stores/                          # Zustand stores (useAuthStore, useUIStore)
├── types/                           # Global TypeScript models & DTOs
└── utils/                           # Formatters (currency, date ID, string sanitizers)
```

---

## 2. Feature Internal Anatomy

Setiap modul di dalam `src/features/*` memiliki sub-folder standar:
```
features/{feature_name}/
├── components/       # Komponen spesifik domain fitur
├── hooks/            # Custom hooks yang mengintegrasikan TanStack Query
├── pages/            # Komponen halaman (View controllers)
├── services/         # API calls & data mapper khusus fitur
└── types/            # TypeScript interfaces & enums untuk fitur terkait
```

---

## 3. Design System & Theming: "Wonderful Indonesia"

### Color Palette Tokens:
- **Ocean Blue (`#0066B3`)**: Primary brand color, kredibilitas maritim, tombol aksi utama, navbar active state.
- **Tropical Green (`#009B4D`)**: Secondary brand color, kesegaran alam nusantara, badge terverifikasi/sukses.
- **Sunset Orange (`#F7941D`)**: Accent color, kehangatan senja Indonesia, alert, promo highlights.
- **Culture Purple (`#6A1B9A`)**: Royal & cultural heritage accent, penanda krida budaya & sejarah.
- **Festival Magenta (`#D81B60`)**: Vibrancy, pesona festival budaya & event kalender pariwisata.
- **Indonesia Night (`#0B1F33`)**: High-contrast slate dark, teks judul, sidebar background mode malam.
- **Background Neutral (`#F5F7FA`)**: Canvas bersih, kontras lembut anti-kelelahan mata.

---

## 4. KTA Architecture & The "Locked Component" Rule

### A. Digital KTA Preview (LOCKED COMPONENT)
- Komponen visual kartu anggota digital lama (`KTA_Card_Preview`) diisolasi dalam `src/features/membership/components/locked/DigitalKTACard.tsx`.
- **Aturan Ketat**: Tidak mengubah tata letak elemen kartu, rasio dimensi kartu identitas, generator QR, dan template visual agar tetap identik dengan output PDF cetak resmi SAKA Pariwisata Nasional.

### B. Public Member Verification System (`/verify/:token`)
- **Route Terbuka**: Dapat diakses oleh masyarakat umum / pemindai QR tanpa harus login.
- **Alur Eksekusi**:
  1. Pengguna memindai QR code pada KTA fisik/digital atau membuka URL `https://spwn.id/verify/{token}`.
  2. Komponen `PublicVerificationPage` mengeksekusi `useMemberVerification(token)`.
  3. Service memanggil endpoint `verification.verifyKTA`.
  4. Backend mengembalikan DTO publik yang telah disanitasi.
  5. Layar menampilkan layout verifikasi resmi:
     - Logo SPWN & Lambang Gerakan Pramuka / Kemenparekraf
     - Status Badge (`TERVERIFIKASI AKTIF` / `TIDAK DITEMUKAN` / `KTA DIBEKUKAN`)
     - Foto resmi anggota dengan frame rapi
     - Nama Lengkap
     - Nomor KTA Resmi
     - Provinsi & Pangkalan
     - Krida SAKA Pariwisata
     - Tanggal Bergabung
  6. **Privacy Guard**: Tidak ada NIK, alamat rumah, email, nomor HP, atau password yang dikirim ke browser.
