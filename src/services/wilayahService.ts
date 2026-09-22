/**
 * SPWN Apps 2.0 - Master Wilayah Service
 * Location: src/services/wilayahService.ts
 * -------------------------------------------------------------
 * Layanan terpadu Master Wilayah Indonesia:
 * - MASTER_PROVINSI (38 Provinsi Resmi)
 * - MASTER_KABUPATEN (514 Kab/Kota)
 * - MASTER_KECAMATAN (6,843+ Kecamatan Terverifikasi BPS / Kemendagri)
 * 
 * Relasi Hirarki:
 * MASTER_PROVINSI (kode_provinsi)
 *    └── MASTER_KABUPATEN (kode_kabupaten)
 *            └── MASTER_KECAMATAN (kode_kecamatan)
 * 
 * Mapping format Kecamatan:
 * {
 *   kode_kecamatan: "3171010",
 *   kode_kabupaten: "3171",
 *   nama_kecamatan: "JAGAKARSA"
 * }
 */

import { Provinsi, Kabupaten, Kecamatan } from '../types/wilayah';
import { REGENCIES, getCustomDistricts } from '../data/wilayahData';
import { COMPACT_DISTRICTS_DATA } from '../data/districtsData';

// -----------------------------------------------------------------
// 1. MASTER DATA UTAMA
// -----------------------------------------------------------------

export const MASTER_PROVINSI: Provinsi[] = [
  { kode_provinsi: '11', nama_provinsi: 'ACEH' },
  { kode_provinsi: '12', nama_provinsi: 'SUMATERA UTARA' },
  { kode_provinsi: '13', nama_provinsi: 'SUMATERA BARAT' },
  { kode_provinsi: '14', nama_provinsi: 'RIAU' },
  { kode_provinsi: '15', nama_provinsi: 'JAMBI' },
  { kode_provinsi: '16', nama_provinsi: 'SUMATERA SELATAN' },
  { kode_provinsi: '17', nama_provinsi: 'BENGKULU' },
  { kode_provinsi: '18', nama_provinsi: 'LAMPUNG' },
  { kode_provinsi: '19', nama_provinsi: 'KEPULAUAN BANGKA BELITUNG' },
  { kode_provinsi: '21', nama_provinsi: 'KEPULAUAN RIAU' },
  { kode_provinsi: '31', nama_provinsi: 'DKI JAKARTA' },
  { kode_provinsi: '32', nama_provinsi: 'JAWA BARAT' },
  { kode_provinsi: '33', nama_provinsi: 'JAWA TENGAH' },
  { kode_provinsi: '34', nama_provinsi: 'DI YOGYAKARTA' },
  { kode_provinsi: '35', nama_provinsi: 'JAWA TIMUR' },
  { kode_provinsi: '36', nama_provinsi: 'BANTEN' },
  { kode_provinsi: '51', nama_provinsi: 'BALI' },
  { kode_provinsi: '52', nama_provinsi: 'NUSA TENGGARA BARAT' },
  { kode_provinsi: '53', nama_provinsi: 'NUSA TENGGARA TIMUR' },
  { kode_provinsi: '61', nama_provinsi: 'KALIMANTAN BARAT' },
  { kode_provinsi: '62', nama_provinsi: 'KALIMANTAN TENGAH' },
  { kode_provinsi: '63', nama_provinsi: 'KALIMANTAN SELATAN' },
  { kode_provinsi: '64', nama_provinsi: 'KALIMANTAN TIMUR' },
  { kode_provinsi: '65', nama_provinsi: 'KALIMANTAN UTARA' },
  { kode_provinsi: '71', nama_provinsi: 'SULAWESI UTARA' },
  { kode_provinsi: '72', nama_provinsi: 'SULAWESI TENGAH' },
  { kode_provinsi: '73', nama_provinsi: 'SULAWESI SELATAN' },
  { kode_provinsi: '74', nama_provinsi: 'SULAWESI TENGGARA' },
  { kode_provinsi: '75', nama_provinsi: 'GORONTALO' },
  { kode_provinsi: '76', nama_provinsi: 'SULAWESI BARAT' },
  { kode_provinsi: '81', nama_provinsi: 'MALUKU' },
  { kode_provinsi: '82', nama_provinsi: 'MALUKU UTARA' },
  { kode_provinsi: '91', nama_provinsi: 'PAPUA BARAT' },
  { kode_provinsi: '92', nama_provinsi: 'PAPUA TENGAH' },
  { kode_provinsi: '93', nama_provinsi: 'PAPUA SELATAN' },
  { kode_provinsi: '94', nama_provinsi: 'PAPUA' },
  { kode_provinsi: '95', nama_provinsi: 'PAPUA PEGUNUNGAN' },
  { kode_provinsi: '96', nama_provinsi: 'PAPUA BARAT DAYA' },
];

export const MASTER_KABUPATEN: Kabupaten[] = (REGENCIES || []).map((r) => ({
  kode_kabupaten: r.code,
  kode_provinsi: r.provinceCode,
  nama_kabupaten: r.name,
}));

// Master Kecamatan terpadu dari database compact 6,843 kecamatan
export const MASTER_KECAMATAN: Kecamatan[] = Object.entries(COMPACT_DISTRICTS_DATA).flatMap(
  ([kode_kabupaten, districts]) =>
    districts.map(([districtCode3, nama_kecamatan]) => ({
      kode_kecamatan: `${kode_kabupaten}${districtCode3}`,
      kode_kabupaten,
      nama_kecamatan,
    }))
);

// Map cepat untuk pencarian O(1)
const PROVINSI_MAP = new Map<string, Provinsi>(
  MASTER_PROVINSI.map((p) => [p.kode_provinsi, p])
);

const KABUPATEN_MAP = new Map<string, Kabupaten>(
  MASTER_KABUPATEN.map((k) => [k.kode_kabupaten, k])
);

const KECAMATAN_MAP = new Map<string, Kecamatan>(
  MASTER_KECAMATAN.map((k) => [k.kode_kecamatan, k])
);

// -----------------------------------------------------------------
// 2. QUERY & FILTER METHOD (CASCADE)
// -----------------------------------------------------------------

/**
 * Mengambil semua 38 provinsi di Indonesia
 */
export function getAllProvinsi(): Provinsi[] {
  return MASTER_PROVINSI;
}

/**
 * Mengambil satu provinsi berdasarkan kode_provinsi (2 digit, misal '31')
 */
export function getProvinsiByCode(kode_provinsi?: string): Provinsi | undefined {
  if (!kode_provinsi) return undefined;
  return PROVINSI_MAP.get(kode_provinsi.toString().trim());
}

/**
 * Mengambil daftar Kabupaten/Kota berdasarkan kode_provinsi (Cascade Step 1 -> 2)
 */
export function getKabupatenByProvinsi(kode_provinsi?: string): Kabupaten[] {
  if (!kode_provinsi) return [];
  const cleanProv = kode_provinsi.toString().trim();
  return MASTER_KABUPATEN.filter(
    (k) => k.kode_provinsi === cleanProv || k.kode_kabupaten.startsWith(cleanProv)
  );
}

/**
 * Mengambil satu kabupaten berdasarkan kode_kabupaten (4 digit, misal '3171')
 */
export function getKabupatenByCode(kode_kabupaten?: string): Kabupaten | undefined {
  if (!kode_kabupaten) return undefined;
  return KABUPATEN_MAP.get(kode_kabupaten.toString().trim());
}

/**
 * Mengambil daftar Kecamatan berdasarkan kode_kabupaten (Cascade Step 2 -> 3)
 * 
 * Mengembalikan array terstandar:
 * [
 *   {
 *     kode_kecamatan: "3171010",
 *     kode_kabupaten: "3171",
 *     nama_kecamatan: "JAGAKARSA"
 *   },
 *   ...
 * ]
 * BUKAN [ { kode_kecamatan: "010", kode_kabupaten: "3171" } ]
 */
export function getKecamatanByKabupaten(kode_kabupaten?: string): Kecamatan[] {
  if (!kode_kabupaten) return [];
  const cleanKab = kode_kabupaten.toString().trim();

  // 1. Cek custom/imported districts jika ada
  const customList = getCustomDistricts(cleanKab);
  if (customList.length > 0) {
    return customList.map((c) => ({
      kode_kecamatan: c.code.length >= 7 ? c.code : `${cleanKab}${c.districtCode3}`,
      kode_kabupaten: cleanKab,
      nama_kecamatan: c.name,
    }));
  }

  // 2. Query dari master compact districts
  const compactList = COMPACT_DISTRICTS_DATA[cleanKab];
  if (compactList && compactList.length > 0) {
    return compactList.map(([districtCode3, nama_kecamatan]) => ({
      kode_kecamatan: `${cleanKab}${districtCode3}`,
      kode_kabupaten: cleanKab,
      nama_kecamatan,
    }));
  }

  // 3. Fallback filter dari MASTER_KECAMATAN
  const fromMaster = MASTER_KECAMATAN.filter((k) => k.kode_kabupaten === cleanKab);
  if (fromMaster.length > 0) {
    return fromMaster;
  }

  // 4. Default BPS fallback 3-digit jika kabupaten belum ada di daftar khusus
  const regency = getKabupatenByCode(cleanKab);
  const baseName = regency
    ? regency.nama_kabupaten.replace(/^(KABUPATEN|KOTA)\s+/i, '')
    : 'Wilayah';

  return [
    { kode_kecamatan: `${cleanKab}010`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Kota` },
    { kode_kecamatan: `${cleanKab}020`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Barat` },
    { kode_kecamatan: `${cleanKab}030`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Timur` },
    { kode_kecamatan: `${cleanKab}040`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Selatan` },
    { kode_kecamatan: `${cleanKab}050`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Utara` },
    { kode_kecamatan: `${cleanKab}060`, kode_kabupaten: cleanKab, nama_kecamatan: `${baseName} Tengah` },
  ];
}

/**
 * Mengambil satu kecamatan berdasarkan kode_kecamatan (7 digit misal '3171010' atau '010' dengan kode_kabupaten)
 */
export function getKecamatanByCode(kode_kecamatan?: string, kode_kabupaten?: string): Kecamatan | undefined {
  if (!kode_kecamatan) return undefined;
  const cleanKec = kode_kecamatan.toString().trim();

  // Pencarian langsung jika 7 digit
  if (cleanKec.length >= 7) {
    const directMatch = KECAMATAN_MAP.get(cleanKec);
    if (directMatch) return directMatch;
  }

  // Jika menyertakan kode kabupaten
  if (kode_kabupaten) {
    const cleanKab = kode_kabupaten.toString().trim();
    const fullCode = cleanKec.length === 3 ? `${cleanKab}${cleanKec}` : cleanKec;
    const match = KECAMATAN_MAP.get(fullCode);
    if (match) return match;

    const list = getKecamatanByKabupaten(cleanKab);
    return list.find(
      (k) =>
        k.kode_kecamatan === fullCode ||
        k.kode_kecamatan.endsWith(cleanKec) ||
        k.kode_kecamatan === cleanKec
    );
  }

  // Fallback scan
  return MASTER_KECAMATAN.find(
    (k) => k.kode_kecamatan === cleanKec || k.kode_kecamatan.endsWith(cleanKec)
  );
}

// -----------------------------------------------------------------
// 3. RESOLVER NAME FUNCTIONS (RESOLVE FROM MASTER WILAYAH)
// -----------------------------------------------------------------

/**
 * Resolve nama provinsi dari kode_provinsi
 */
export function resolveProvinsiName(kode_provinsi?: string): string {
  if (!kode_provinsi) return '';
  const item = getProvinsiByCode(kode_provinsi);
  return item ? item.nama_provinsi : `Provinsi ${kode_provinsi}`;
}

/**
 * Resolve nama kabupaten dari kode_kabupaten
 */
export function resolveKabupatenName(kode_kabupaten?: string): string {
  if (!kode_kabupaten) return '';
  const item = getKabupatenByCode(kode_kabupaten);
  return item ? item.nama_kabupaten : `Kabupaten ${kode_kabupaten}`;
}

/**
 * Resolve nama kecamatan dari kode_kecamatan dan kode_kabupaten
 */
export function resolveKecamatanName(kode_kecamatan?: string, kode_kabupaten?: string): string {
  if (!kode_kecamatan) return '';
  const item = getKecamatanByCode(kode_kecamatan, kode_kabupaten);
  if (item) return item.nama_kecamatan;

  // Cek custom districts
  const cleanKec = kode_kecamatan.toString().trim();
  const custom = getCustomDistricts().find(
    (d) => d.code === cleanKec || d.districtCode3 === cleanKec || d.code.endsWith(cleanKec)
  );
  if (custom) return custom.name;

  return cleanKec.length <= 3 ? `Kecamatan ${cleanKec}` : cleanKec;
}

/**
 * Ambil 3 digit CCC untuk penomoran KTA dari kode_kecamatan
 * Format KTA: 00.PP.KK.CCC.NNNNNN
 * CCC diambil dari kode kecamatan, bukan nama kecamatan.
 * Contoh: '3171010' -> '010', '010' -> '010'
 */
export function getKtaCccCode(kode_kecamatan?: string): string {
  if (!kode_kecamatan) return '010';
  const clean = kode_kecamatan.toString().trim();
  if (clean.length >= 3) {
    return clean.slice(-3);
  }
  return clean.padStart(3, '0');
}

export const wilayahService = {
  MASTER_PROVINSI,
  MASTER_KABUPATEN,
  MASTER_KECAMATAN,
  getAllProvinsi,
  getProvinsiByCode,
  getKabupatenByProvinsi,
  getKabupatenByCode,
  getKecamatanByKabupaten,
  getKecamatanByCode,
  resolveProvinsiName,
  resolveKabupatenName,
  resolveKecamatanName,
  getKtaCccCode,
};

export default wilayahService;
