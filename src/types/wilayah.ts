/**
 * SPWN Apps 2.0 - Standar Master Wilayah Indonesia
 * Location: src/types/wilayah.ts
 * -------------------------------------------------------------
 * Struktur tipe data master wilayah berjenjang:
 * Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan
 * Sesuai kodefikasi resmi BPS / Kemendagri & Penomoran KTA SPWN.
 */

export interface Provinsi {
  kode_provinsi: string;
  nama_provinsi: string;
}

export interface Kabupaten {
  kode_kabupaten: string;
  kode_provinsi: string;
  nama_kabupaten: string;
}

export interface Kecamatan {
  kode_kecamatan: string;
  kode_kabupaten: string;
  nama_kecamatan: string;
}

export interface WilayahHierarchy {
  provinsi: Provinsi;
  kabupaten: Kabupaten;
  kecamatan: Kecamatan;
}
