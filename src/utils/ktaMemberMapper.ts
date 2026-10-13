import { KtaMemberBindingData } from '../types/kta.types';


const normalizeUpper = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ');

const STRUCTURAL_POSITIONS = new Set([
  'PAMONG SAKA',
  'PIMPINAN SAKA',
  'PINSAKA',
  'MABISAKA',
]);

const AGE_GROUP_VALUES = new Set([
  'PENEGAK',
  'PANDEGA',
  'ANGGOTA DEWASA',
]);

const normalizePosition = (value: unknown) => {
  const raw = normalizeUpper(value);

  if (raw === 'PIN SAKA') return 'PIMPINAN SAKA';
  if (raw === 'PINSAKA') return 'PIMPINAN SAKA';
  if (raw === 'PAMONG') return 'PAMONG SAKA';
  if (raw === 'MABI SAKA') return 'MABISAKA';
  if (raw === 'DEWANSAKA') return 'DEWAN SAKA';

  return raw;
};

const sanitizeOrganizationLevel = (value: unknown) => {
  const raw = normalizeUpper(value);

  // Golongan usia bukan tingkat organisasi.
  if (!raw || AGE_GROUP_VALUES.has(raw)) {
    return '';
  }

  if (
    raw === 'NASIONAL' ||
    raw === 'KWARTIR NASIONAL' ||
    raw === 'KWARNAS'
  ) {
    return 'KWARNAS';
  }

  if (
    raw === 'DAERAH' ||
    raw === 'KWARTIR DAERAH' ||
    raw === 'KWARDA'
  ) {
    return 'KWARDA';
  }

  if (
    raw === 'CABANG' ||
    raw === 'KWARTIR CABANG' ||
    raw === 'KWARCAB'
  ) {
    return 'KWARCAB';
  }

  if (
    raw === 'RANTING' ||
    raw === 'KWARTIR RANTING' ||
    raw === 'KWARRAN'
  ) {
    return 'KWARRAN';
  }

  if (
    raw === 'PANGKALAN' ||
    raw === 'GUDEP' ||
    raw === 'GUGUS DEPAN'
  ) {
    return 'PANGKALAN';
  }

  return raw;
};

const parseBirthDate = (source: any): Date | null => {
  const raw =
    source?.tanggal_lahir ||
    source?.birthDate ||
    source?.birth_date ||
    source?.date_of_birth ||
    source?.dob ||
    '';

  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const calculateAge = (source: any): number | null => {
  const explicit =
    source?.umur ??
    source?.age;

  if (
    explicit !== null &&
    explicit !== undefined &&
    String(explicit).trim() !== ''
  ) {
    const parsed = Number(explicit);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }

  const birthDate = parseBirthDate(source);
  if (!birthDate) return null;

  const today = new Date();
  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDiff =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export const resolvePramukaAgeGroup = (member: any): string => {
  const source = member || {};

  const position = normalizePosition(
    source.position ||
    source.currentPosition ||
    source.jabatan ||
    source.jabatan_khusus ||
    source.tingkat_keanggotaan ||
    source.role ||
    ''
  );

  // Jabatan struktural tidak boleh dilabeli Penegak/Pandega/Anggota Dewasa.
  if (STRUCTURAL_POSITIONS.has(position)) {
    return '';
  }

  const age = calculateAge(source);

  if (age === null) {
    const explicit = normalizeUpper(
      source.golongan_pramuka ||
      source.golongan ||
      source.age_group ||
      source.kelompok_usia ||
      ''
    );

    return AGE_GROUP_VALUES.has(explicit)
      ? explicit
      : '';
  }

  if (age >= 16 && age <= 20) {
    return 'PENEGAK';
  }

  if (age >= 21 && age <= 25) {
    return 'PANDEGA';
  }

  if (age >= 26) {
    return 'ANGGOTA DEWASA';
  }

  return '';
};


/**
 * Satu-satunya mapper data anggota -> data KTA.
 * Semua preview/Designer/Dashboard/Member KTA/Admin Preview harus memakai ini
 * supaya field yang dirender konsisten.
 */
export const mapMemberToKtaBinding = (member: any): KtaMemberBindingData => {
  const source = member || {};

  const fullName =
    source.full_name ||
    source.nama_lengkap ||
    source.nama ||
    source.fullName ||
    '';

  const noKta =
    source.no_kta ||
    source.nomor_kta ||
    source.nomorKTA ||
    source.nationalMemberNumber ||
    '';

  const position =
    normalizePosition(
      source.position ||
      source.currentPosition ||
      source.jabatan ||
      source.jabatan_khusus ||
      source.tingkat_keanggotaan ||
      source.tingkatan ||
      source.role ||
      'Anggota'
    ) || 'ANGGOTA';

  const organizationLevel =
    sanitizeOrganizationLevel(
      source.level_organisasi ||
      source.tingkat_organisasi ||
      source.organizationLevel ||
      source.organization_level ||
      source.kwartir_level ||
      source.tingkat ||
      ''
    );

  const provinceName =
    source.provinsi_nama ||
    source.provinceName ||
    source.province ||
    '';

  const regencyName =
    source.kabupaten_kota_nama ||
    source.kabupaten_nama ||
    source.regencyName ||
    source.city ||
    '';

  const districtName =
    source.kecamatan_nama ||
    source.wilayah_kecamatan_nama ||
    source.districtName ||
    source.district ||
    '';

  const kwartirName =
    source.kwartir_nama ||
    source.kwartirName ||
    source.kwartir_cabang ||
    source.kwartir ||
    '';

  const gugusDepan =
    source.pangkalan_gudep ||
    source.gugus_depan ||
    source.gugusDepan ||
    source.gudep ||
    source.pangkalan ||
    '';

  const photoUrl =
    source.photo_url ||
    source.foto_url ||
    source.foto ||
    source.photoUrl ||
    source.avatarUrl ||
    '';

  const qrToken =
    source.qr_token ||
    source.qrToken ||
    source.verificationToken ||
    '';

  const qrUrl =
    source.verification_url ||
    source.qr_url ||
    source.qrUrl ||
    '';

  return {
    id:
      source.id ||
      source.member_id ||
      source.memberId ||
      noKta,

    fullName,
    nationalMemberNumber: noKta,
    // Legacy `membershipLevel` tidak lagi boleh fallback ke PENEGAK.
    // Untuk pejabat struktural: tampilkan tingkat organisasi/jabatan.
    // Untuk peserta: golongan usia dihitung terpisah dan tidak menggantikan
    // field `tingkat` (Tingkat Organisasi).
    membershipLevel: organizationLevel || position,
    currentPosition: position,

    provinceName,
    provinsi_id:
      source.provinsi_id ||
      source.kode_provinsi ||
      source.provinceId ||
      '',

    regencyName,
    kabupaten_id:
      source.kabupaten_kota_id ||
      source.kabupaten_id ||
      source.kode_kabupaten ||
      source.regencyId ||
      '',

    districtName,
    kecamatan_id:
      source.kecamatan_id ||
      source.wilayah_kecamatan_id ||
      source.kode_kecamatan ||
      source.districtCode3 ||
      '',

    wilayah_kecamatan_id:
      source.wilayah_kecamatan_id ||
      source.kecamatan_id ||
      source.kode_kecamatan ||
      '',

    kwartirName,
    kwartirHierarchy:
      source.kwartirHierarchy ||
      source.kwartir_hierarchy ||
      kwartirName ||
      provinceName ||
      regencyName ||
      '',

    branchName:
      source.branchName ||
      source.kwartir_cabang ||
      regencyName ||
      gugusDepan,

    gugusDepan,
    krida:
      source.krida_nama ||
      source.krida ||
      source.kridaName ||
      '',

    phone:
      source.phone ||
      source.nomor_telepon ||
      source.telepon ||
      '',

    email: source.email || '',

    joinYear:
      source.joinYear ||
      (source.tanggal_bergabung
        ? String(source.tanggal_bergabung).substring(0, 4)
        : ''),

    status:
      source.status_anggota ||
      source.status ||
      '',

    photoUrl,
    qrToken,
    qrUrl,

    // aliases canonical untuk Dynamic Field Builder / renderer
    full_name: fullName,
    no_kta: noKta,
    position,
    tingkat: organizationLevel,
    level_organisasi: organizationLevel,
    provinsi_nama: provinceName,
    kabupaten_kota_nama: regencyName,
    kecamatan_nama: districtName,
    pangkalan_gudep: gugusDepan,
    photo_url: photoUrl,
    valid_until:
      source.valid_until ||
      source.berlaku_sampai ||
      '',
  };
};
