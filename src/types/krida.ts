/**
 * SPWN Apps 2.0 - Krida & SKK Type Definitions
 * Based on: Buku Panduan Krida dan Syarat Kecakapan Khusus SAKA Pariwisata (Edisi 2026)
 * Location: src/types/krida.ts
 */

export type KridaId = 'pemandu' | 'penyuluh' | 'mice-event' | 'kuliner-cinderamata';

export type SkkLevelKey = 'purwa' | 'madya' | 'utama';

export interface SkkLevelDetail {
  fokus: string;
  kelompokUsia: string;
  standar: string[];
  pengetahuan: string[];
  keterampilan: string[];
  sikapKerja: string[];
  produkPraktik: string;
  buktiKecakapan: string[];
}

export interface SkkItem {
  kode: string; // e.g. "PM-01"
  nama: string;
  kridaId: KridaId;
  kridaNama: string;
  kridaSlug: string;
  bidang: string;
  deskripsi: string;
  tujuan: string[];
  acuanSkkni: string;
  catatanKhusus?: string;
  tingkatan: {
    purwa: SkkLevelDetail;
    madya: SkkLevelDetail;
    utama: SkkLevelDetail;
  };
  metodeUji: string[];
  bobotPenilaian: {
    pengetahuan: number; // 20
    keterampilan: number; // 40
    sikapKerja: number; // 20
    produkPraktik: number; // 20
    total: number; // 100
    ambangLulus: number; // 80
  };
}

export interface KridaItem {
  id: KridaId;
  kode: string; // "KR-01"
  nama: string;
  slug: string;
  tagline: string;
  deskripsi: string;
  bab: string;
  warna: string;
  warnaBg: string;
  warnaBorder: string;
  warnaText: string;
  totalSkk: number;
  tujuan: string[];
  skkCodes: string[];
}
