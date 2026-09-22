# SPWN Apps 2.0 - Comprehensive Development Roadmap
**10-Phase Enterprise Delivery Plan**

---

## Roadmap Overview

```
[ Phase 1: Architecture Planning ] <─── CURRENT STAGE (Awaiting Approval)
             │
             ▼
[ Phase 2: Project Foundation & Design System ]
             │
             ▼
[ Phase 3: Google Apps Script Backend Engine ]
             │
             ▼
[ Phase 4: Authentication & RBAC Engine ]
             │
             ▼
[ Phase 5: Membership System & Public KTA Verification ]
             │
             ▼
[ Phase 6: Executive Dashboard & GeoMap Indonesia ]
             │
             ▼
[ Phase 7: Tourism Explorer Marketplace ]
             │
             ▼
[ Phase 8: Content Management System (CMS) ]
             │
             ▼
[ Phase 9: Tourism Commerce & UMKM Binaan ]
             │
             ▼
[ Phase 10: Optimization, Migration Adapter & Deployment ]
```

---

## Detailed Phase Breakdown

### Phase 1: Architecture Planning (Current Milestone)
- **Deliverables**:
  - System Architecture Document (`SYSTEM_ARCHITECTURE.md`)
  - Database Relationship & Schema Specification (`DATABASE_RELATIONSHIPS.md`)
  - Standardized API Endpoint Blueprint (`API_BLUEPRINT.md`)
  - Feature-Based Frontend Architecture (`FRONTEND_ARCHITECTURE.md`)
  - Enterprise Google Apps Script Architecture (`BACKEND_APPS_SCRIPT_ARCHITECTURE.md`)
  - Master Roadmap & Delivery Strategy (`DEVELOPMENT_ROADMAP.md`)
- **Gate Criteria**: Approval dari Lead Developer & Stakeholders sebelum penulisan kode produksi dimulai.

### Phase 2: Project Foundation & Design System
- **Deliverables**:
  - Setup Vite + React 19 + TypeScript + Tailwind CSS configuration.
  - Wonderful Indonesia design tokens (Ocean Blue, Tropical Green, Sunset Orange, Culture Purple, Festival Magenta, Indonesia Night).
  - Atomic UI Component Library: Button, Card, Badge, Avatar, Input, Select, Modal, Drawer, Table, Tabs, Pagination, Skeleton, Loading, EmptyState, ErrorState.
  - Layout & Navigation: Responsive Sidebar dengan RBAC filtering, Header, Mobile BottomNavigation.

### Phase 3: Google Apps Script Backend Engine
- **Deliverables**:
  - Struktur file `.gs` di `backend/google-apps-script/`.
  - Database config, Spreadsheet Repository dengan Sheet Locking & Script Cache.
  - Layer Services dan Controllers terpisah untuk Member, Tourism, Content, Commerce, dan Verification.
  - JSend JSON response formatter dan centralized error handling.

### Phase 4: Authentication & RBAC Engine
- **Deliverables**:
  - Store otentikasi via Zustand (`useAuthStore`) dan persisten session.
  - Role-Based Access Control untuk 7 roles: `SUPER_ADMIN`, `ADMIN_PUSAT`, `ADMIN_WILAYAH`, `CONTENT_MANAGER`, `TOURISM_MANAGER`, `COMMERCE_MANAGER`, `MEMBER`.
  - Dynamic navigation menu dan route guards (`ProtectedRoute`).

### Phase 5: Membership System & Public KTA Verification
- **Deliverables**:
  - Manajemen data anggota (Pencarian, Filter Wilayah, Filter Krida).
  - Isolasi Locked Component: `DigitalKTACard` (desain, rasio, dan template cetak lama tidak diubah).
  - Public Verification Route: `/verify/:token` dengan pemindaian QR code, validasi status, dan proteksi privasi ketat (tanpa NIK, email, password).

### Phase 6: Executive Dashboard & GeoMap Indonesia
- **Deliverables**:
  - Metric widgets: Statistik Anggota, Statistik Pariwisata, Konten, & Transaksi Commerce.
  - Visualisasi Interaktif Peta Indonesia: Sebaran anggota dan destinasi wisata per provinsi.
  - Activity timeline & quick action cards.

### Phase 7: Tourism Module
- **Deliverables**:
  - Tourism Explorer: Direktori destinasi nusantara berstandar modern.
  - Detail destinasi, filter kategori, fasilitas, ulasan rating.
  - Paket wisata dan profil mitra binaan pariwisata.

### Phase 8: Content Management System (CMS)
- **Deliverables**:
  - Manajemen Berita, Artikel, Agenda Kegiatan, Galeri Foto, dan Pengumuman.
  - Workflow publikasi multi-tahap: `Draft` -> `Review` -> `Published` -> `Archived`.

### Phase 9: Tourism Commerce & UMKM Binaan
- **Deliverables**:
  - Katalog produk kriya dan cenderamata binaan SAKA Pariwisata.
  - Detail produk, varian SKU, keranjang belanja, manajemen order & inventaris supplier.

### Phase 10: Optimization, Migration Adapter & Deployment
- **Deliverables**:
  - `SpreadsheetMigrationAdapter` untuk mapping otomatis data Google Sheet lama ke relational model (PostgreSQL/Supabase ready).
  - Auditing keamanan, validasi input, sanitasi XSS, error logging.
  - Production build verification dan dokumentasi deployment.
