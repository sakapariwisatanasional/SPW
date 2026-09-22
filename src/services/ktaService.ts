/**
 * SPWN Apps 2.0 - KTA Identity Service (Frontend & Isomorphic Engine)
 * Location: src/services/ktaService.ts
 * -------------------------------------------------------------
 * Spesifikasi & Logika Penomoran Kartu Tanda Anggota (KTA) Format Final SPWN.
 * 
 * ATURAN PENOMORAN RESMI:
 * 1. Anggota Kwartir Nasional:
 *    Format: 00.NNNNNN
 *    - 00: Kode Tetap Kwartir Nasional
 *    - NNNNNN: Nomor urut anggota 6 digit
 * 
 * 2. Anggota Bukan Kwartir Nasional (Wilayah / Kwarda / Kwarcab / Kwarran):
 *    Format: 00.PPKK.CCC.NNNNNN
 *    - 00: Kode Tetap Kwartir Nasional
 *    - PPKK: Kode Kabupaten/Kota dari regencies (4 digit)
 *    - CCC: 3 digit kode Kecamatan turunan dari districts
 *    - NNNNNN: Nomor urut anggota 6 digit
 * 
 * KETENTUAN KHUSUS:
 * - Jangan menggunakan kode provinsi pada nomor KTA wilayah.
 * - Namun database tetap menyimpan:
 *   * kode_provinsi
 *   * kode_kabupaten
 *   * kode_kecamatan
 *   untuk kebutuhan laporan dan filtering.
 */

import { getRegencyByCode, getProvinceByCode, DISTRICTS_MAP, resolveDistrictName } from '../data/wilayahData';
import { SPWN_SYSTEM } from '../config/constants';
import { KtaTemplateRecord, KtaTemplateHistoryRecord } from '../types/membership';

export type KtaOrganizationLevel = 'KWARTIR_NASIONAL' | 'WILAYAH';

export interface GenerateKtaOptions {
  level: KtaOrganizationLevel;
  kodeKabupaten?: string; // 4 digit PPKK e.g. "3201"
  kodeKecamatan?: string; // 3 digit CCC e.g. "010" atau 7 digit PPKKCCC
  sequence: number | string;
}

export interface KtaValidationResult {
  isValid: boolean;
  level?: KtaOrganizationLevel;
  kodeNasional?: string; // "00"
  kodeProvinsi?: string; // PP (2 digit)
  kodeKabupaten?: string; // KK (2 digit) atau PPKK
  kodeKecamatan?: string; // CCC (3 digit)
  sequence?: string; // NNNNNN (6 digit)
  regencyName?: string;
  provinceCode?: string;
  provinceName?: string;
  districtName?: string;
  message?: string;
  formatted?: string;
}

// Regex baku KTA Format Final SPWN 2.0
// 1. Kwartir Nasional: 00.NNNNNN
export const KTA_NASIONAL_REGEX = /^00\.([0-9]{6})$/;
// 2. Non Kwartir Nasional (Wilayah): 00.PP.KK.CCC.NNNNNN (5 segmen resmi)
export const KTA_WILAYAH_5PART_REGEX = /^00\.([0-9]{2})\.([0-9]{2})\.([0-9]{3})\.([0-9]{6})$/;
// Kompatibilitas format 4 segmen: 00.PPKK.CCC.NNNNNN
export const KTA_WILAYAH_REGEX = /^00\.([0-9]{4})\.([0-9]{3})\.([0-9]{6})$/;

// Default KTA Template (NASIONAL scope)
export const DEFAULT_KTA_TEMPLATE: KtaTemplateRecord = {
  id: 'TMPL-SPWN-NASIONAL-DEF',
  name: 'Template Resmi KTA Saka Pariwisata Nasional',
  template_scope: 'NASIONAL',
  front_bg_color: '#064E3B', // deep emerald
  back_bg_color: '#022C22',
  card_theme: 'emerald',
  logo_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=160&auto=format&fit=crop&q=80',
  background_pattern: 'batik',
  signature_title: 'Pimpinan Saka Pariwisata Nasional',
  signature_name: 'Dr. H. Budi Santoso, M.Si.',
  signature_image_url: 'https://api.dicebear.com/7.x/initials/svg?seed=BS&backgroundColor=004d40&textColor=ffffff',
  qr_position: 'bottom-right',
  qr_size: 'medium',
  qr_box_style: 'clean',
  visible_fields: ['fullName', 'noKta', 'krida', 'membershipLevel', 'city', 'joinedDate'],
  is_active: true,
  updated_by: 'SUPER_ADMIN',
  updated_at: new Date().toISOString(),
};

export const ktaService = {
  /**
   * Menghasilkan nomor KTA resmi sesuai level organisasi:
   * - Kwartir Nasional: 00.NNNNNN (contoh: 00.000001)
   * - Non Kwartir Nasional: 00.PP.KK.CCC.NNNNNN (contoh: 00.32.01.010.000001)
   *   00 = Kode Kwarnas, PP = Kode Provinsi, KK = Kode Kab/Kota, CCC = Kode Kecamatan, NNNNNN = No urut
   */
  generateKtaNumber: (options: GenerateKtaOptions): string => {
    const seqNum = parseInt(String(options.sequence), 10) || 1;
    const seqPadded = seqNum.toString().padStart(6, '0').slice(-6);

    if (options.level === 'KWARTIR_NASIONAL') {
      return `00.${seqPadded}`;
    }

    // Level Wilayah: 00.PP.KK.CCC.NNNNNN
    const rawKab = (options.kodeKabupaten || '3201').toString().padStart(4, '0').slice(-4);
    const pp = rawKab.slice(0, 2); // 2 digit kode provinsi
    const kk = rawKab.slice(2, 4); // 2 digit kode kabupaten dalam provinsi
    
    // Ambil 3 digit CCC terakhir dari kode kecamatan
    const rawCcc = (options.kodeKecamatan || '010').toString();
    const ccc = rawCcc.length >= 3 ? rawCcc.slice(-3) : rawCcc.padStart(3, '0');

    return `00.${pp}.${kk}.${ccc}.${seqPadded}`;
  },

  /**
   * Memvalidasi sintaks & struktur nomor KTA berdasarkan format resmi.
   */
  validateKta: (noKta: string): KtaValidationResult => {
    if (!noKta || typeof noKta !== 'string') {
      return {
        isValid: false,
        message: 'Nomor KTA tidak boleh kosong.',
      };
    }

    const clean = noKta.trim();

    // 1. Uji Format Kwartir Nasional (00.NNNNNN)
    const matchNasional = clean.match(KTA_NASIONAL_REGEX);
    if (matchNasional) {
      return {
        isValid: true,
        level: 'KWARTIR_NASIONAL',
        kodeNasional: '00',
        sequence: matchNasional[1],
        provinceCode: '00',
        provinceName: 'Kwartir Nasional Gerakan Pramuka',
        regencyName: 'Pusat (Kwarnas)',
        formatted: clean,
        message: 'Nomor KTA resmi Kwartir Nasional valid.',
      };
    }

    // 2. Uji Format Wilayah 5 Bagian (00.PP.KK.CCC.NNNNNN)
    const matchWilayah5 = clean.match(KTA_WILAYAH_5PART_REGEX);
    if (matchWilayah5) {
      const pp = matchWilayah5[1];
      const kk = matchWilayah5[2];
      const ccc = matchWilayah5[3];
      const seq = matchWilayah5[4];
      const fullKabCode = `${pp}${kk}`;

      const regency = getRegencyByCode(fullKabCode);
      const province = getProvinceByCode(pp);
      const districtName = resolveDistrictName(fullKabCode, ccc) || (DISTRICTS_MAP[`${fullKabCode}${ccc}`]?.name);

      return {
        isValid: true,
        level: 'WILAYAH',
        kodeNasional: '00',
        kodeProvinsi: pp,
        kodeKabupaten: kk,
        kodeKecamatan: ccc,
        sequence: seq,
        provinceCode: pp,
        provinceName: province ? province.name : undefined,
        regencyName: regency ? regency.name : undefined,
        districtName: districtName || undefined,
        formatted: clean,
        message: 'Nomor KTA resmi Wilayah valid (5 segmen).',
      };
    }

    // 3. Uji Kompatibilitas Wilayah 4 Bagian (00.PPKK.CCC.NNNNNN)
    const matchWilayah4 = clean.match(KTA_WILAYAH_REGEX);
    if (matchWilayah4) {
      const ppkk = matchWilayah4[1];
      const ccc = matchWilayah4[2];
      const seq = matchWilayah4[3];
      const pp = ppkk.slice(0, 2);
      const kk = ppkk.slice(2, 4);

      const regency = getRegencyByCode(ppkk);
      const provCode = regency ? regency.provinceCode : pp;
      const province = getProvinceByCode(provCode);
      const districtName = resolveDistrictName(ppkk, ccc) || (DISTRICTS_MAP[`${ppkk}${ccc}`]?.name);

      return {
        isValid: true,
        level: 'WILAYAH',
        kodeNasional: '00',
        kodeProvinsi: pp,
        kodeKabupaten: kk,
        kodeKecamatan: ccc,
        sequence: seq,
        provinceCode: provCode,
        provinceName: province ? province.name : undefined,
        regencyName: regency ? regency.name : undefined,
        districtName: districtName || undefined,
        formatted: `00.${pp}.${kk}.${ccc}.${seq}`,
        message: 'Nomor KTA resmi Wilayah valid.',
      };
    }

    return {
      isValid: false,
      message:
        'Format KTA tidak valid. Format resmi: 00.NNNNNN (Kwarnas) atau 00.PP.KK.CCC.NNNNNN (Wilayah)',
    };
  },

  /**
   * Menghasilkan token QR acak berkeamanan tinggi (16-32 karakter entropy)
   * Format: SPWN-QR-{random_secure_token}
   * Non-sequential, tidak memuat data pribadi.
   */
  generateMemberQrToken: (charLength: number = 24): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Base32-like (tanpa I, O, 0, 1 untuk visual clarity)
    let token = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(charLength);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < charLength; i++) {
        token += chars[array[i] % chars.length];
      }
    } else {
      // Node / fallback generator
      for (let i = 0; i < charLength; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return `SPWN-QR-${token}`;
  },

  /**
   * Kompatibilitas: alias untuk generateMemberQrToken (16-32 char secure entropy)
   */
  generateQrToken: (_nomorKta?: string, _identifier?: string): string => {
    return ktaService.generateMemberQrToken(24);
  },

  /**
   * Menghasilkan URL verifikasi dinamis tanpa hardcoded domain.
   * Menggunakan SPWN_SYSTEM.PUBLIC_URL sebagai konfigurasi utama.
   */
  generateMemberQrUrl: (qrToken: string): string => {
    const baseUrl = SPWN_SYSTEM.PUBLIC_URL.replace(/\/+$/, '');
    return `${baseUrl}/verifikasi/${encodeURIComponent(qrToken)}`;
  },

  /**
   * Memvalidasi format token QR identitas SPWN.
   */
  validateQrTokenFormat: (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    const clean = token.trim();
    // Mendukung format baru SPWN-QR-{16-32} dan format legacy
    return /^SPWN-QR-[A-Z0-9_-]{8,40}$/i.test(clean);
  },

  /**
   * Template Management: Dapatkan template aktif saat ini
   */
  getActiveTemplate: (scope: 'NASIONAL' | 'PROVINSI' = 'NASIONAL', provinceCode?: string): KtaTemplateRecord => {
    try {
      const stored = localStorage.getItem(`SPWN_KTA_TEMPLATE_${scope}_${provinceCode || 'ALL'}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_KTA_TEMPLATE;
  },

  /**
   * Template Management: Simpan konfigurasi template ke storage & arsipkan riwayat
   */
  saveTemplate: (
    template: KtaTemplateRecord,
    changedBy: string,
    changeReason: string
  ): { template: KtaTemplateRecord; history: KtaTemplateHistoryRecord } => {
    const updatedTemplate: KtaTemplateRecord = {
      ...template,
      updated_by: changedBy,
      updated_at: new Date().toISOString(),
    };

    const historyRecord: KtaTemplateHistoryRecord = {
      id: `TMPL-HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      template_id: updatedTemplate.id,
      snapshot_data: updatedTemplate,
      changed_by: changedBy,
      change_reason: changeReason,
      created_at: new Date().toISOString(),
    };

    try {
      const storageKey = `SPWN_KTA_TEMPLATE_${updatedTemplate.template_scope}_${updatedTemplate.provinceCode || 'ALL'}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTemplate));

      // Append to history list
      const histKey = 'SPWN_KTA_TEMPLATE_HISTORY';
      const existingHistStr = localStorage.getItem(histKey);
      const existingHist: KtaTemplateHistoryRecord[] = existingHistStr ? JSON.parse(existingHistStr) : [];
      existingHist.unshift(historyRecord);
      // Keep last 50 revisions
      localStorage.setItem(histKey, JSON.stringify(existingHist.slice(0, 50)));
    } catch (e) {
      console.error('Failed saving KTA template to storage:', e);
    }

    return { template: updatedTemplate, history: historyRecord };
  },

  /**
   * Template Management: Dapatkan riwayat perubahan template
   */
  getTemplateHistory: (): KtaTemplateHistoryRecord[] => {
    try {
      const histKey = 'SPWN_KTA_TEMPLATE_HISTORY';
      const raw = localStorage.getItem(histKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
