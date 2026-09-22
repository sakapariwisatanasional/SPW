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
  id: 'TMPL-CR80-SPWN-DEFAULT',
  name: 'Template Resmi KTA SPWN (CR80)',
  preset: 'CR80_KTA',
  widthMm: 85.6,
  heightMm: 53.98,
  cornerRadiusMm: 3.18,
  frontBackgroundUrl: '',
  backBackgroundUrl: '',
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
  signerName: 'Dr. H. Budi Santoso, M.Si.',
  signerTitle: 'Pimpinan Saka Pariwisata Nasional',
  signerSubtitle: 'Kwartir Nasional Gerakan Pramuka',
  signerQrX: 74,
  signerQrY: 46,
  signerQrSize: 18,
  signerQrPadding: 2,
  signerX: 74,
  signerY: 62,
  issueLocationDate: 'Jakarta, 17 Agustus 2024',
  showSignerVerified: true,
  lastUpdated: new Date().toISOString(),
};

const KTA_SETTINGS_STORAGE_KEY = 'SPWN_KTA_CARD_SETTINGS';

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
    try {
      const storeMembers = useAdminStore.getState().members;
      if (storeMembers && storeMembers.length > 0) {
        return storeMembers.map((m) => {
          const distName =
            m.wilayah_kecamatan_nama ||
            resolveDistrictName(m.kabupaten_id, m.wilayah_kecamatan_id) ||
            'Babakan Madang';
          const pangkalan = (m as any).pangkalan_gudep || 'Pangkalan Saka Pariwisata';
          const isNasional =
            m.level_organisasi === 'KWARTIR_NASIONAL' || m.tingkat_keanggotaan === 'Pimpinan Saka';

          return {
            id: m.id,
            fullName: m.nama_lengkap,
            nationalMemberNumber: m.nomor_kta || '00.000000',
            membershipLevel: m.tingkat_keanggotaan || 'Anggota',
            currentPosition: (m as any).jabatan_khusus || m.tingkat_keanggotaan || 'Anggota',
            provinceName: isNasional ? 'DKI Jakarta' : (m.provinsi_nama || 'Jawa Barat'),
            regencyName: isNasional ? 'Kota Jakarta Pusat' : (m.kabupaten_nama || 'Kabupaten Bogor'),
            districtName: distName,
            kwartirName: isNasional ? 'Kwartir Nasional' : `Kwarda ${m.provinsi_nama || 'Jawa Barat'}`,
            kwartirHierarchy: isNasional
              ? 'Kwartir Nasional Gerakan Pramuka'
              : `Kwarda ${m.provinsi_nama || 'Jawa Barat'} • Kwarcab ${m.kabupaten_nama || 'Kab. Bogor'}`,
            branchName: pangkalan,
            gugusDepan: pangkalan,
            krida: m.krida_nama || 'KRIDA PEMANDU',
            phone: m.nomor_telepon || '081234567890',
            email: m.email || 'anggota@spwn.id',
            joinYear: (m.tanggal_bergabung || '2024').substring(0, 4),
            status: m.status_anggota || 'ACTIVE',
            photoUrl: m.foto_url,
            qrToken: m.qr_token || 'SPWN-QR-DEMO',
            qrUrl: m.qr_url || `https://spwn.id/verifikasi/${m.qr_token || 'SPWN-QR-DEMO'}`,
          };
        });
      }
    } catch {
      // fallback
    }

    // Default sample member for preview
    return [
      {
        id: 'SPW-000001',
        fullName: 'Bagas Pratama Putra',
        nationalMemberNumber: '00.3201.010.000001',
        membershipLevel: 'Anggota',
        currentPosition: 'Penegak Bantara',
        provinceName: 'Jawa Barat',
        regencyName: 'Kabupaten Bogor',
        districtName: 'Babakan Madang',
        kwartirName: 'Kwarda Jawa Barat',
        kwartirHierarchy: 'Kwarda Jawa Barat • Kwarcab Kab. Bogor',
        branchName: 'Gudep 01.045 - 01.046 Pangkalan SMKN 1 Bogor',
        gugusDepan: 'Gudep 01.045 - 01.046 Pangkalan SMKN 1 Bogor',
        krida: 'KRIDA PEMANDU',
        phone: '081298765432',
        email: 'bagas.pratama@spwn.id',
        joinYear: '2024',
        status: 'ACTIVE',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        qrToken: 'SPWN-QR-BAGASPRATAMA001',
        qrUrl: 'https://spwn.id/verifikasi/SPWN-QR-BAGASPRATAMA001',
      },
      {
        id: 'SPW-000002',
        fullName: 'Siti Nurhaliza Rahayu',
        nationalMemberNumber: '00.000002',
        membershipLevel: 'Pimpinan Saka',
        currentPosition: 'Pimpinan Saka Nasional',
        provinceName: 'DKI Jakarta',
        regencyName: 'Kota Jakarta Pusat',
        districtName: 'Gambir',
        kwartirName: 'Kwartir Nasional',
        kwartirHierarchy: 'Kwartir Nasional Gerakan Pramuka',
        branchName: 'Kwarnas Gerakan Pramuka - Pangkalan Saka Nasional',
        gugusDepan: 'Kwarnas Gerakan Pramuka - Pangkalan Saka Nasional',
        krida: 'KRIDA PENYULUH',
        phone: '081288899900',
        email: 'siti.nurhaliza@spwn.id',
        joinYear: '2023',
        status: 'ACTIVE',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
        qrToken: 'SPWN-QR-SITINURHALIZA002',
        qrUrl: 'https://spwn.id/verifikasi/SPWN-QR-SITINURHALIZA002',
      },
      {
        id: 'SPW-000003',
        fullName: 'Rian Kurniawan, S.Pd.',
        nationalMemberNumber: '00.3271.020.000003',
        membershipLevel: 'Pamong Saka',
        currentPosition: 'Pamong Saka Pariwisata',
        provinceName: 'Jawa Barat',
        regencyName: 'Kota Bogor',
        districtName: 'Bogor Selatan',
        kwartirName: 'Kwarda Jawa Barat',
        kwartirHierarchy: 'Kwarda Jawa Barat • Kwarcab Kota Bogor',
        branchName: 'Gudep 02.011 - 02.012 Pangkalan Saka Kota Bogor',
        gugusDepan: 'Gudep 02.011 - 02.012 Pangkalan Saka Kota Bogor',
        krida: 'KRIDA KULINER & CINDERAMATA',
        phone: '081377788899',
        email: 'rian.kurniawan@spwn.id',
        joinYear: '2022',
        status: 'ACTIVE',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        qrToken: 'SPWN-QR-RIANKURNIAWAN003',
        qrUrl: 'https://spwn.id/verifikasi/SPWN-QR-RIANKURNIAWAN003',
      },
    ];
  },

  getKtaSettings: (): KtaCardSettings => {
    try {
      const stored = localStorage.getItem(KTA_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Hapus logo dummy bawaan lama yang tidak bisa diedit
        const sanitizedLogos = (parsed.logos || []).filter(
          (l: any) =>
            l &&
            l.url &&
            !l.url.includes('photo-1596461404969-9ae70f2830c1') &&
            l.id !== 'logo-back' &&
            l.id !== 'logo-spwn'
        );

        return {
          ...DEFAULT_KTA_SETTINGS,
          ...parsed,
          showBackgroundPattern: parsed.showBackgroundPattern ?? false,
          identityLayoutMode: parsed.identityLayoutMode || 'AUTO_FLOW',
          identityDensity: parsed.identityDensity || 'standard',
          identityFontScale: parsed.identityFontScale || 1.0,
          autoArrangeEnabled: parsed.autoArrangeEnabled ?? true,
          logos: sanitizedLogos,
          dataFields: parsed.dataFields && parsed.dataFields.length > 0 ? parsed.dataFields : DEFAULT_KTA_DATA_FIELDS,
        };
      }
    } catch (e) {
      console.warn('Failed to parse KTA settings from storage, using default:', e);
    }
    return DEFAULT_KTA_SETTINGS;
  },

  saveKtaSettings: (settings: KtaCardSettings): void => {
    try {
      const payload: KtaCardSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(KTA_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save KTA settings to storage:', e);
    }
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
