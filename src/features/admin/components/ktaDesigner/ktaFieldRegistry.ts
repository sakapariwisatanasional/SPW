/**
 * SPWN Apps 2.0 - Dynamic KTA Field Registry
 * Location: src/features/admin/components/ktaDesigner/ktaFieldRegistry.ts
 */
import type { KtaMemberFieldKey } from '../../../../types/kta.types';

export interface KtaFieldDefinition {
  key: KtaMemberFieldKey;
  label: string;
  category: 'IDENTITAS' | 'KEANGGOTAAN' | 'WILAYAH' | 'LAINNYA';
  renderType: 'text' | 'image' | 'date' | 'custom';
  allowMultiple?: boolean;
}

export const KTA_FIELD_REGISTRY: KtaFieldDefinition[] = [
  { key: 'full_name', label: 'Nama Lengkap', category: 'IDENTITAS', renderType: 'text' },
  { key: 'no_kta', label: 'Nomor KTA', category: 'IDENTITAS', renderType: 'text' },
  { key: 'id', label: 'ID Anggota', category: 'IDENTITAS', renderType: 'text' },
  { key: 'position', label: 'Jabatan', category: 'KEANGGOTAAN', renderType: 'text' },
  { key: 'tingkat', label: 'Tingkat Organisasi', category: 'KEANGGOTAAN', renderType: 'text' },
  { key: 'krida', label: 'Krida', category: 'KEANGGOTAAN', renderType: 'text' },
  { key: 'provinsi_nama', label: 'Provinsi', category: 'WILAYAH', renderType: 'text' },
  { key: 'kabupaten_kota_nama', label: 'Kabupaten/Kota', category: 'WILAYAH', renderType: 'text' },
  { key: 'kecamatan_nama', label: 'Kecamatan', category: 'WILAYAH', renderType: 'text' },
  { key: 'kwartir', label: 'Kwartir', category: 'WILAYAH', renderType: 'text' },
  { key: 'pangkalan_gudep', label: 'Pangkalan/Gudep', category: 'WILAYAH', renderType: 'text' },
  { key: 'status', label: 'Status Anggota', category: 'KEANGGOTAAN', renderType: 'text' },
  { key: 'photo_url', label: 'Foto', category: 'IDENTITAS', renderType: 'image' },
  { key: 'valid_until', label: 'Masa Berlaku', category: 'LAINNYA', renderType: 'date' },
  { key: 'custom_text', label: 'Teks Custom', category: 'LAINNYA', renderType: 'custom', allowMultiple: true },
];

export const LEGACY_TO_CANONICAL_FIELD: Partial<Record<KtaMemberFieldKey, KtaMemberFieldKey>> = {
  fullName: 'full_name',
  nationalMemberNumber: 'no_kta',
  currentPosition: 'position',
  membershipLevel: 'tingkat',
  provinceName: 'provinsi_nama',
  regencyName: 'kabupaten_kota_nama',
  districtName: 'kecamatan_nama',
  kwartirName: 'kwartir',
  kwartirHierarchy: 'kwartir',
  branchName: 'pangkalan_gudep',
  gugusDepan: 'pangkalan_gudep',
};

export const canonicalKtaFieldKey = (key: KtaMemberFieldKey): KtaMemberFieldKey =>
  LEGACY_TO_CANONICAL_FIELD[key] || key;

export const getKtaFieldDefinition = (key: KtaMemberFieldKey) =>
  KTA_FIELD_REGISTRY.find((field) => field.key === canonicalKtaFieldKey(key));
