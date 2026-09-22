/**
 * SPWN Apps 2.0 - System Constants & Static Master Data
 */

export const APP_NAME = "SPWN Apps 2.0";
export const APP_TAGLINE = "SAKA Pariwisata Network - Digital Tourism Ecosystem Platform Indonesia";

export const KRIDA_MASTER = [
  {
    id: "KRIDA_PEMANDU",
    name: "KRIDA PEMANDU",
    code: "KPD",
    color: "#009B4D",
    description: "Pemanduan wisata, interpretasi budaya, dan hospitality pariwisata nusantara.",
  },
  {
    id: "KRIDA_PENYULUH",
    name: "KRIDA PENYULUH",
    code: "KPL",
    color: "#0066B3",
    description: "Penyuluhan sadar wisata, Sapta Pesona, kampanye CHSE, dan edukasi kepariwisataan.",
  },
  {
    id: "KRIDA_MICE_EVENT",
    name: "KRIDA MICE & EVENT",
    code: "KME",
    color: "#6A1B9A",
    description: "Pengelolaan Meeting, Incentive, Convention, Exhibition, dan event pariwisata.",
  },
  {
    id: "KRIDA_KULINER_CINDERAMATA",
    name: "KRIDA KULINER & CINDERAMATA",
    code: "KKC",
    color: "#F7941D",
    description: "Gastronomi nusantara, oleh-oleh kuliner lokal, dan cinderamata kreatif khas Indonesia.",
  },
] as const;

// 5 Peran Resmi Keanggotaan SAKA (SK Kwarnas No. 170A/2019)
export const MASTER_TINGKATAN_SAKA = [
  "Anggota",
  "Dewan Saka",
  "Pamong Saka",
  "Pimpinan Saka",
  "Mabisaka",
] as const;

export type TingkatanSakaRole = typeof MASTER_TINGKATAN_SAKA[number];
export const TINGKAT_GOLONGAN_PRAMUKA = MASTER_TINGKATAN_SAKA;

export const PROVINCES_INDONESIA = [
  "ACEH", "SUMATERA UTARA", "SUMATERA BARAT", "RIAU", "JAMBI", "SUMATERA SELATAN",
  "BENGKULU", "LAMPUNG", "KEPULAUAN BANGKA BELITUNG", "KEPULAUAN RIAU",
  "DKI JAKARTA", "JAWA BARAT", "JAWA TENGAH", "DI YOGYAKARTA", "JAWA TIMUR", "BANTEN",
  "BALI", "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR",
  "KALIMANTAN BARAT", "KALIMANTAN TENGAH", "KALIMANTAN SELATAN", "KALIMANTAN TIMUR", "KALIMANTAN UTARA",
  "SULAWESI UTARA", "SULAWESI TENGAH", "SULAWESI SELATAN", "SULAWESI TENGGARA", "GORONTALO", "SULAWESI BARAT",
  "MALUKU", "MALUKU UTARA", "PAPUA BARAT", "PAPUA"
] as const;

export const SPWN_SYSTEM = {
  PUBLIC_URL: (typeof window !== 'undefined' && window.location.origin) 
    ? window.location.origin 
    : 'https://ais-dev-kpcsufjvxrvm25tv5c5n5m-74565716531.asia-southeast1.run.app',
};

export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  REVIEWED_VERIFIED: "REVIEWED_VERIFIED",
  SUSPENDED: "SUSPENDED",
  ALUMNI: "ALUMNI",
} as const;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN_PUSAT: "ADMIN_PUSAT",
  ADMIN_WILAYAH: "ADMIN_WILAYAH",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  TOURISM_MANAGER: "TOURISM_MANAGER",
  COMMERCE_MANAGER: "COMMERCE_MANAGER",
  MEMBER: "MEMBER",
  PUBLIC_USER: "PUBLIC_USER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// 5 Tingkatan Penunjukan Admin Resmi oleh Super Admin
export const ADMIN_TIERS = {
  NASIONAL: "NASIONAL",
  PROVINSI: "PROVINSI",
  KABUPATEN_KOTA: "KABUPATEN_KOTA",
  KECAMATAN: "KECAMATAN",
  PANGKALAN: "PANGKALAN",
} as const;

export type AdminTier = (typeof ADMIN_TIERS)[keyof typeof ADMIN_TIERS];

export const ADMIN_TIER_LABELS: Record<AdminTier, { name: string; level: string; description: string; badge: string }> = {
  NASIONAL: {
    name: "Admin Kwartir Nasional",
    level: "Tingkat Nasional (Kwarnas)",
    description: "Wewenang penuh pengelolaan data nasional & penerbitan KTA Pusat",
    badge: "Pusat / Kwarnas",
  },
  PROVINSI: {
    name: "Admin Kwartir Daerah",
    level: "Tingkat Provinsi (Kwarda)",
    description: "Wewenang pengelolaan dan verifikasi anggota se-Provinsi",
    badge: "Kwarda",
  },
  KABUPATEN_KOTA: {
    name: "Admin Kwartir Cabang",
    level: "Tingkat Kab/Kota (Kwarcab)",
    description: "Wewenang supervisi cabang dan ranting di kabupaten/kota",
    badge: "Kwarcab",
  },
  KECAMATAN: {
    name: "Admin Kwartir Ranting",
    level: "Tingkat Kecamatan (Kwarran)",
    description: "Wewenang verifikasi pangkalan dan anggota di wilayah ranting",
    badge: "Kwarran",
  },
  PANGKALAN: {
    name: "Admin Gugus Depan / Pangkalan",
    level: "Tingkat Pangkalan (Gudep/Saka)",
    description: "Wewenang pendaftaran awal dan validasi berkas anggota pangkalan",
    badge: "Pangkalan",
  },
};

/**
 * Backend Database Sheet Schema Configuration
 * Selaras 100% dengan backend/google-apps-script/config/database.config.gs
 */
export const MEMBER = {
  DOMAIN: 'MEMBER',
  NAME: 'MEMBER DATABASE',
  SHEETS: {
    ANGGOTA: 'Anggota',
    USERS: 'Users',
    KRIDA_MASTER: 'Krida_Master',
    ROLE_MASTER: 'Role_Master',
    LOG_VERIFIKASI: 'Log_Verifikasi',
    KTA_SETTING: 'KTA_Setting',
    KTA_TEMPLATE: 'KTA_Template',
    KTA_TEMPLATE_HISTORY: 'KTA_Template_History',
    QR_VERIFICATION_LOG: 'QR_Verification_Log',
    MEMBER_CHANGE_HISTORY: 'Member_Change_History',
    SESSIONS: 'Sessions',
  },
} as const;
