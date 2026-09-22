# SPWN Apps 2.0 - System Architecture Document
**SAKA Pariwisata Network (Digital Tourism Ecosystem Platform Indonesia)**

---

## 1. Executive Summary & Vision
SPWN Apps 2.0 adalah platform ekosistem pariwisata digital terpadu milik SAKA Pariwisata Nasional yang dirancang untuk mengintegrasikan:
1. **Digital Membership System & Identity (KTA Digital)**
2. **Public Member Verification System (QR & Token based)**
3. **Tourism Explorer (Destinasi, Paket Wisata, Mitra, & Review)**
4. **Content Management System (Agenda, Berita, Artikel, Galeri, Pengumuman)**
5. **Tourism Commerce Marketplace (Katalog Produk UMKM, Inventory, Order, & Supplier)**
6. **Executive & Operational Analytics Dashboard**

Sistem ini melayani 7 persona pengguna dengan batasan hak akses (RBAC):
- **PUBLIC USER**: Akses public explorer, verifikasi KTA publik, berita & agenda, katalog produk.
- **MEMBER**: Profil anggota, KTA Digital, history kegiatan, partisipasi pariwisata.
- **ADMIN WILAYAH**: Manajemen anggota cabang/daerah, verifikasi berkas lokal, event wilayah.
- **ADMIN PUSAT**: Tata kelola nasional, penetapan kebijakan krida, verifikasi KTA massal, persetujuan konten.
- **CONTENT MANAGER**: Kurasi artikel, berita, kalender agenda nasional, aset media galeri.
- **TOURISM MANAGER**: Kurasi destinasi unggulan, paket wisata, verifikasi kemitraan pariwisata.
- **COMMERCE MANAGER**: Manajemen katalog UMKM binaan, order handling, monitoring inventory.
- **SUPER ADMIN**: Full access, konfigurasi database, system setting, audit log, role master.

---

## 2. Hybrid Migration Architecture
SPWN memiliki basis data yang sedang aktif pada **Google Spreadsheet** yang diakses melalui **Google Apps Script**. Untuk menghindari downtime, kehilangan data, dan risiko migrasi dini, sistem mengadopsi **Hybrid Clean Architecture**:

```
[ Frontend Client: React + TS + Tailwind ]
                    │
                    ▼
          [ Feature Services ]
                    │
                    ▼
         [ Repository Interface ]  <─── Strict Abstraction Barrier
         /                      \
        ▼                        ▼
[ GAS Api Gateway Provider ]   [ Future: Supabase/PostgreSQL Provider ]
        │
        ▼
[ Google Apps Script Controllers ]
        │
        ▼
[ Google Spreadsheet Database Engine ]
  ├─ MEMBER (Anggota, Users, KTA, Krida, Role)
  ├─ CONTENT (Agenda, Berita, Artikel, Galeri)
  ├─ TRAVEL (Destinasi, Paket Wisata, Mitra)
  └─ COMMERCE (Products, Categories, Orders, etc.)
```

### Karakteristik & Safeguard Arsitektur:
1. **Zero Direct Access**: Frontend tidak pernah menyentuh Google Spreadsheet secara langsung ataupun mengekspos API Key.
2. **Repository Decoupling**: Semua panggilan I/O dibungkus dalam TypeScript Interface (`IMemberRepository`, `ITourismRepository`, dll.). Ketika migrasi ke PostgreSQL/Supabase dilakukan, komponen UI dan Service tidak akan mengalami perubahan kode sama sekali.
3. **Optimistic Caching & Batching**: Mengingat Google Apps Script memiliki kuota eksekusi dan latensi baca/tulis, layer Repository mengimplementasikan in-memory deduplication, smart stale-while-revalidate, dan batch mutations.

---

## 3. High-Level Folder Structure

```
SPWN-Apps-2/
├── frontend/
│   ├── src/
│   │   ├── app/                      # App providers, routes, layout wrappers
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   ├── components/               # Shared Design System & UI Library
│   │   │   ├── ui/                   # Button, Card, Modal, Input, Badge, Table, etc.
│   │   │   ├── navigation/           # Sidebar, Header, BottomNav, Breadcrumbs
│   │   │   └── feedback/             # Loading, EmptyState, ErrorBoundary, Skeleton
│   │   ├── config/                   # Theme tokens, Wonderful Indonesia colors, env
│   │   │   ├── theme.config.ts
│   │   │   ├── constants.ts
│   │   │   └── navigation.config.ts
│   │   ├── features/                 # Modular Feature-Driven Domains
│   │   │   ├── auth/                 # Login, session, password reset, guards
│   │   │   ├── dashboard/            # Statistics, map visualization, timeline
│   │   │   ├── membership/           # Members, Krida, Digital KTA (Locked) & Verify
│   │   │   ├── tourism/              # Destinations, tour packages, partners, reviews
│   │   │   ├── content/              # News, articles, events, gallery, announcements
│   │   │   ├── commerce/             # Catalog, products, cart/orders, suppliers
│   │   │   └── analytics/            # National tourism & membership telemetry
│   │   ├── hooks/                    # Global reusable custom hooks
│   │   ├── services/                 # API client, HTTP adapter, encryption helpers
│   │   ├── stores/                   # Global state (authStore, uiStore, filterStore)
│   │   ├── types/                    # Shared enterprise TypeScript contracts
│   │   └── utils/                    # Formatters, date utils, security sanitizers
├── backend/
│   └── google-apps-script/           # Enterprise Google Apps Script Engine
│       ├── config/
│       │   └── database.config.gs    # Sheet IDs, table maps, system secrets
│       ├── controllers/
│       │   ├── member.controller.gs
│       │   ├── tourism.controller.gs
│       │   ├── content.controller.gs
│       │   ├── commerce.controller.gs
│       │   └── verification.controller.gs
│       ├── services/
│       │   ├── member.service.gs
│       │   ├── tourism.service.gs
│       │   ├── content.service.gs
│       │   └── commerce.service.gs
│       ├── repositories/
│       │   └── spreadsheet.repository.gs # Generic CRUD, locking, batching
│       └── utils/
│           ├── response.gs           # Standard JSend/JSON response formatter
│           ├── validator.gs          # Schema validation & type checking
│           └── error.gs              # Centralized error handler & status codes
└── database/
    ├── migration/                    # Spreadsheet to Relational schema mappers
    │   ├── 001_initial_schema.sql
    │   └── migration_adapter.ts
    └── documentation/                # Architecture & contract specifications
        ├── SYSTEM_ARCHITECTURE.md
        ├── DATABASE_RELATIONSHIPS.md
        ├── API_BLUEPRINT.md
        ├── FRONTEND_ARCHITECTURE.md
        ├── BACKEND_APPS_SCRIPT_ARCHITECTURE.md
        └── DEVELOPMENT_ROADMAP.md
```

---

## 4. Security & Compliance Principles
- **Locked KTA Generator Compliance**: Digital KTA generator lama diisolasi sebagai immutable legacy component agar barcode, hashing QR, dan PDF export tetap 100% kompatibel.
- **Public Verification Privacy**: Endpoint `/verify/:token` difilter secara ketat di layer controller untuk *hanya* mengembalikan data publik (Nama, No KTA, Status, Foto, Provinsi, Krida, Tanggal Bergabung). Password, email, NIK, alamat rumah, dan data internal **diharamkan** keluar dari server.
- **Role-Based Dynamic Access**: Sidebar navigasi, action button, dan query payload difilter secara kondisional sesuai role pengguna.
