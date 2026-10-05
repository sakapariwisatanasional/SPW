/**
 * SPWN Apps 2.0 - KTA Region Visibility Guard
 * Location: src/features/admin/components/ktaDesigner/ktaFieldVisibility.ts
 */
import type { KtaMemberFieldKey } from '../../../../types/kta.types';
import { canonicalKtaFieldKey } from './ktaFieldRegistry';

export type OrganizationLevel = 'KWARNAS' | 'KWARDA' | 'KWARCAB';

export const normalizeOrganizationLevel = (member: any): OrganizationLevel => {
  const raw = String(
    member?.tingkat ||
    member?.level_organisasi ||
    member?.tingkat_organisasi ||
    ''
  ).trim().toUpperCase();

  if (['KWARNAS', 'KWARTIR_NASIONAL', 'NASIONAL'].includes(raw)) return 'KWARNAS';
  if (['KWARDA', 'KWARTIR_DAERAH', 'PROVINSI'].includes(raw)) return 'KWARDA';
  if (['KWARCAB', 'KWARTIR_CABANG', 'KABUPATEN_KOTA', 'WILAYAH'].includes(raw)) return 'KWARCAB';

  const kwartirText = String(
    member?.kwartirName ||
    member?.kwartirHierarchy ||
    ''
  ).toUpperCase();

  if (kwartirText.includes('KWARTIR NASIONAL') || kwartirText.includes('KWARNAS')) return 'KWARNAS';
  if (kwartirText.includes('KWARTIR DAERAH') || kwartirText.includes('KWARDA')) return 'KWARDA';

  return 'KWARCAB';
};

export const canRenderKtaField = (
  fieldKey: KtaMemberFieldKey,
  member: any
): boolean => {
  const key = canonicalKtaFieldKey(fieldKey);
  const level = normalizeOrganizationLevel(member);

  // Aturan wajib: member KWARNAS tidak boleh menampilkan turunan wilayah.
  if (
    level === 'KWARNAS' &&
    ['provinsi_nama', 'kabupaten_kota_nama', 'kecamatan_nama', 'pangkalan_gudep'].includes(key)
  ) {
    return false;
  }

  // Member KWARDA tidak menampilkan konteks Kwarcab/Kwarran.
  if (
    level === 'KWARDA' &&
    ['kabupaten_kota_nama', 'kecamatan_nama'].includes(key)
  ) {
    return false;
  }

  return true;
};

export const resolveKwartirDisplay = (
  member: any,
  showHierarchyPrefix: boolean = true
): string => {
  const level = normalizeOrganizationLevel(member);

  // KWARNAS adalah nama organisasi final, bukan prefix opsional.
  // Karena itu selalu tampil sebagai "Kwartir Nasional".
  if (level === 'KWARNAS') return 'Kwartir Nasional';

  if (level === 'KWARDA') {
    const province = member?.provinsi_nama || member?.provinceName || member?.province || '';

    if (!showHierarchyPrefix) {
      return province || '';
    }

    return province ? `Kwartir Daerah ${province}` : 'Kwartir Daerah';
  }

  const regency =
    member?.kabupaten_kota_nama ||
    member?.kabupaten_nama ||
    member?.regencyName ||
    member?.city ||
    '';

  if (!showHierarchyPrefix) {
    return regency || '';
  }

  return regency ? `Kwartir Cabang ${regency}` : 'Kwartir Cabang';
};
