import { KtaMemberBindingData } from '../types/kta.types';

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
    source.position ||
    source.currentPosition ||
    source.jabatan ||
    source.jabatan_khusus ||
    source.tingkat_keanggotaan ||
    source.tingkatan ||
    source.role ||
    'Anggota';

  const organizationLevel =
    source.level_organisasi ||
    source.tingkat_organisasi ||
    source.tingkat ||
    source.membershipLevel ||
    '';

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
