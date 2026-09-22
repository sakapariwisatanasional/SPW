/**
 * SPWN Apps 2.0 - Krida & SKK API Service
 * Location: src/services/api/krida.api.ts
 */

import { KridaItem, SkkItem, KridaId } from '../../types/krida';
import { KRIDA_LIST, SKK_MASTER_LIST } from '../../features/krida/data/kridaData';

export interface KridaApiResponse<T> {
  success: boolean;
  statusCode: number;
  action: string;
  data: T;
  message?: string;
}

export const kridaApi = {
  /**
   * Mengambil daftar seluruh 4 Krida
   */
  async getKridaList(): Promise<KridaApiResponse<KridaItem[]>> {
    return {
      success: true,
      statusCode: 200,
      action: 'krida.list',
      data: KRIDA_LIST,
    };
  },

  /**
   * Mengambil detail Krida berdasarkan slug
   */
  async getKridaBySlug(slug: string): Promise<KridaApiResponse<KridaItem | null>> {
    const item = KRIDA_LIST.find((k) => k.slug === slug || k.id === slug) || null;
    return {
      success: !!item,
      statusCode: item ? 200 : 404,
      action: 'krida.detail',
      data: item,
      message: item ? 'Data Krida ditemukan' : 'Krida tidak ditemukan',
    };
  },

  /**
   * Mengambil daftar seluruh 23 SKK dengan opsi filter krida dan pencarian
   */
  async getSkkList(params?: { kridaId?: string; search?: string }): Promise<KridaApiResponse<SkkItem[]>> {
    let result = [...SKK_MASTER_LIST];

    if (params?.kridaId && params.kridaId !== 'all') {
      result = result.filter(
        (s) => s.kridaId === params.kridaId || s.kridaSlug === params.kridaId
      );
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.kode.toLowerCase().includes(q) ||
          s.nama.toLowerCase().includes(q) ||
          s.bidang.toLowerCase().includes(q) ||
          s.deskripsi.toLowerCase().includes(q) ||
          s.tingkatan.purwa.produkPraktik.toLowerCase().includes(q) ||
          s.tingkatan.madya.produkPraktik.toLowerCase().includes(q) ||
          s.tingkatan.utama.produkPraktik.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      statusCode: 200,
      action: 'skk.list',
      data: result,
    };
  },

  /**
   * Mengambil detail satu SKK berdasarkan kode (misal: "PM-01")
   */
  async getSkkByCode(kode: string): Promise<KridaApiResponse<SkkItem | null>> {
    const formattedKode = kode.toUpperCase().trim();
    const item = SKK_MASTER_LIST.find((s) => s.kode.toUpperCase() === formattedKode) || null;
    return {
      success: !!item,
      statusCode: item ? 200 : 404,
      action: 'skk.detail',
      data: item,
      message: item ? 'Data SKK ditemukan' : `Mata Kecakapan Khusus ${kode} tidak ditemukan`,
    };
  },
};
