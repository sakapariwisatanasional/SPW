/**
 * SPWN Apps 2.0 - Storage & Default Data Service
 * Location: src/services/storage.ts
 * -------------------------------------------------------------
 * Menyediakan:
 * 1. Default Field & Settings KTA (Hybrid Layout 3-Zone Architecture)
 * 2. Mock & Live Member Binding Data (dengan membershipLevel)
 * 3. Wilayah Data Helpers (Provinsi, Kabupaten, Kecamatan)
 * 4. LocalStorage Persistence Fallback
 */

import {
  KtaCardSettings,
  KtaDataFieldConfig,
  KtaMemberBindingData,
} from '../types/kta.types';
import { PROVINCES, REGENCIES, getDistrictsByRegency, resolveDistrictName } from '../data/wilayahData';
import { useAdminStore } from '../features/admin/stores/adminStore';

/**
 * DEFAULT_KTA_DATA_FIELDS (Structured Auto-Flow Identity Stack)
 * Urutan Default:
 * 1. Nama Lengkap
 * 2. Nomor KTA / NTA
 * 3. Tingkatan Keanggotaan (membershipLevel)
 * 4. Jabatan (currentPosition)
 * 5. Krida (krida)
 * 6. Kwartir (kwartirHierarchy / kwartirName)
 * 7. Gugus Depan (gugusDepan)
 */
export const DEFAULT_KTA_DATA_FIELDS: KtaDataFieldConfig[] = [
  {
    id: 'fld-name',
    field: 'fullName',
    label: 'Nama Lengkap',
    side: 'FRONT',
    visible: true,
    showLabel: false,
    order: 1,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    align: 'left',
  },
  {
    id: 'fld-kta',
    field: 'nationalMemberNumber',
    label: 'Nomor KTA / NTA',
    side: 'FRONT',
    visible: true,
    showLabel: false,
    order: 2,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F7941D',
    textTransform: 'none',
    align: 'left',
  },
  {
    id: 'fld-membership-level',
    field: 'membershipLevel',
    label: 'Tingkatan Keanggotaan',
    side: 'FRONT',
    visible: true,
    showLabel: true,
    order: 3,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 8.5,
    fontWeight: 'medium',
    color: '#38BDF8',
    textTransform: 'capitalize',
    align: 'left',
  },
  {
    id: 'fld-position',
    field: 'currentPosition',
    label: 'Jabatan Organisasi',
    side: 'FRONT',
    visible: true,
    showLabel: true,
    order: 4,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 8.5,
    fontWeight: 'medium',
    color: '#E2E8F0',
    textTransform: 'capitalize',
    align: 'left',
  },
  {
    id: 'fld-krida',
    field: 'krida',
    label: 'Krida',
    side: 'FRONT',
    visible: true,
    showLabel: true,
    order: 5,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 8.5,
    fontWeight: 'medium',
    color: '#009B4D',
    textTransform: 'capitalize',
    align: 'left',
  },
  {
    id: 'fld-kwartir',
    field: 'kwartirHierarchy',
    label: 'Kwartir',
    side: 'FRONT',
    visible: true,
    showLabel: true,
    order: 6,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 8,
    fontWeight: 'normal',
    color: '#CBD5E1',
    textTransform: 'capitalize',
    align: 'left',
  },
  {
    id: 'fld-gudep',
    field: 'gugusDepan',
    label: 'Gugus Depan',
    side: 'FRONT',
    visible: true,
    showLabel: true,
    order: 7,
    x: 0,
    y: 0,
    width: 100,
    fontSize: 8,
    fontWeight: 'normal',
    color: '#94A3B8',
    textTransform: 'capitalize',
    align: 'left',
  },
];

export const DEFAULT_KTA_SETTINGS: KtaCardSettings = {
  id: 'TMPL_DEFAULT',
  name: 'Template Resmi KTA SPWN (CR80)',
  preset: 'CR80_KTA',
  widthMm: 85.6,
  heightMm: 53.98,
  cornerRadiusMm: 3.18,
  frontBackgroundUrl: '/asset/kta/kta-depan.png',
  backBackgroundUrl: '/asset/kta/kta-belakang.png',
  customBackgroundColorFront: '#004C85',
  customBackgroundColorBack: '#0B1F33',
  bgOpacity: 100,
  showBackgroundPattern: false, // Default: Latar bersih (clean) tanpa motif/dot

  // Hybrid Layout Architecture
  identityLayoutMode: 'AUTO_FLOW',
  identityDensity: 'standard',
  identityFontScale: 1.0,
  autoArrangeEnabled: true,
  showFieldLabels: false,
  logoSafePlacement: 'HEADER_LEFT',

  // Front Dynamic QR Code (Zone 3 / Precision Positioning - No Effects)
  showQrCode: true,
  qrX: 84,
  qrY: 52,
  qrSize: 18,
  showQrCaption: false,
  qrCaptionText: 'VERIFIKASI QR',

  // Typography & Headers
  showFrontHeader: true,
  frontOrganizationTitle: 'GERAKAN PRAMUKA INDONESIA',
  frontOrganizationSubtitle: 'SAKA PARIWISATA NASIONAL',
  showFrontValidityText: true,
  frontValidityText: 'Berlaku Selama Menjadi Anggota Aktif',
  showFrontMemberId: true,

  // Back Side Elements
  showBackHeaderTitle: true,
  backHeaderTitle: 'KETENTUAN KARTU TANDA ANGGOTA',
  backHeaderTitleX: 4,
  backHeaderTitleY: 6,
  backHeaderTitleFontSize: 10,
  showBackHeaderDivider: true,

  showBackSubTitle: true,
  backSubTitle: 'SAKA PARIWISATA GERAKAN PRAMUKA INDONESIA',
  backSubTitleX: 4,
  backSubTitleY: 13,
  backSubTitleFontSize: 7,

  showTerms: true,
  terms: [
    'Kartu ini adalah identitas resmi anggota SAKA Pariwisata Gerakan Pramuka.',
    'Kartu ini tidak dapat dipindahtangankan kepada pihak lain yang tidak berhak.',
    'Pindai Dynamic QR Code untuk memvalidasi keaslian status keanggotaan real-time.',
    'Apabila kartu ini hilang atau ditemukan, mohon hubungi Sekretariat Pimpinan Saka Pariwisata.',
  ],
  termsX: 4,
  termsY: 24,
  termsWidth: 54,
  termsFontSize: 7,

  showBackFooter: true,
  backFooterLeftText: 'Sekretariat SAKA Pariwisata Nasional • spwn.id',
  backFooterRightText: 'ISO/IEC 7810 ID-1 Standard',
  backFooterX: 4,
  backFooterY: 93,

  dataFields: DEFAULT_KTA_DATA_FIELDS,
  textElements: [],
  // Bersih tanpa logo bawaan (hanya ada bila ditambahkan via KTA Desainer)
  logos: [],

  // Signer (Back side)
  showSignerQrCode: true,
  showSignerName: true,
  showSignerTitle: true,
  signerName: '',
  signerTitle: '',
  signerSubtitle: '',
  signerQrX: 74,
  signerQrY: 46,
  signerQrSize: 18,
  signerQrPadding: 2,
  signerX: 74,
  signerY: 62,
  issueLocationDate: '',
  showSignerVerified: true,
  lastUpdated: new Date().toISOString(),
};

let ktaSettingsMemoryCache: KtaCardSettings = DEFAULT_KTA_SETTINGS;

export const storage = {
  getProvinces: () => {
    return PROVINCES.map((p) => ({ id: p.code, name: p.name }));
  },

  getRegencies: (provinceCode?: string) => {
    if (!provinceCode || provinceCode === 'ALL') {
      return REGENCIES.map((r) => ({ id: r.code, name: r.name, provinceId: r.provinceCode }));
    }
    return REGENCIES.filter((r) => r.provinceCode === provinceCode).map((r) => ({
      id: r.code,
      name: r.name,
      provinceId: r.provinceCode,
    }));
  },

  getDistricts: (regencyCode?: string) => {
    if (!regencyCode || regencyCode === 'ALL') return [];
    const list = getDistrictsByRegency(regencyCode);
    return list.map((d) => ({
      id: d.districtCode3,
      name: d.name,
      regencyId: d.regencyCode,
    }));
  },

  getMembers: (): KtaMemberBindingData[] => {
    const storeMembers = useAdminStore.getState().members;
    if (!Array.isArray(storeMembers) || storeMembers.length === 0) return [];

    return storeMembers.map((m) => {
      const distName =
        m.wilayah_kecamatan_nama ||
        resolveDistrictName(m.kabupaten_id, m.wilayah_kecamatan_id) ||
        '';
      const pangkalan = (m as any).pangkalan_gudep || '';
      const isNasional =
        m.level_organisasi === 'KWARTIR_NASIONAL' ||
        m.tingkat_keanggotaan === 'Pimpinan Saka';

      return {
        id: m.id,
        fullName: m.nama_lengkap || '',
        nationalMemberNumber: m.nomor_kta || '',
        membershipLevel: m.tingkat_keanggotaan || '',
        currentPosition: (m as any).jabatan_khusus || m.tingkat_keanggotaan || '',
        provinceName: isNasional ? 'Kwartir Nasional' : (m.provinsi_nama || ''),
        regencyName: isNasional ? '' : (m.kabupaten_nama || ''),
        districtName: distName,
        kwartirName: isNasional ? 'Kwartir Nasional' : (m.provinsi_nama ? `Kwarda ${m.provinsi_nama}` : ''),
        kwartirHierarchy: isNasional
          ? 'Kwartir Nasional'
          : [m.provinsi_nama ? `Kwarda ${m.provinsi_nama}` : '', m.kabupaten_nama ? `Kwarcab ${m.kabupaten_nama}` : '']
              .filter(Boolean).join(' • '),
        branchName: pangkalan,
        gugusDepan: pangkalan,
        krida: m.krida_nama || '',
        phone: m.nomor_telepon || '',
        email: m.email || '',
        joinYear: (m.tanggal_bergabung || '').substring(0, 4),
        status: m.status_anggota || '',
        photoUrl: m.foto_url || '',
        qrToken: m.qr_token || '',
        qrUrl: m.qr_url || '',
      };
    });
  },

  getKtaSettings: (): KtaCardSettings => {
    return ktaSettingsMemoryCache;
  },

  saveKtaSettings: (settings: KtaCardSettings): void => {
    ktaSettingsMemoryCache = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
  },

  generateNationalMemberNumbersByRegion: (
    _provinceId?: string,
    _regencyId?: string,
    _districtId?: string
  ) => {
    const adminStore = useAdminStore.getState();
    const targetMembers = adminStore.members.filter(
      (m) => (!m.nomor_kta || m.nomor_kta === '00.000000') && m.status_anggota === 'ACTIVE'
    );
    let count = 0;
    targetMembers.forEach((m) => {
      try {
        adminStore.generateKta(m.id, 'Penerbitan KTA Batch Wilayah', 'SUPER_ADMIN');
        count++;
      } catch {
        // continue
      }
    });
    return count;
  },
};
