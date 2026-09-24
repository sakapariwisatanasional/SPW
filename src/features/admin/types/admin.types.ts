/**
 * SPWN Apps 2.0 - Admin Architecture Types
 * Location: src/features/admin/types/admin.types.ts
 */

import { OrganizationLevelType } from '../../../types/membership';

export type MemberAdminStatus = 
  | 'PENDING' 
  | 'REVIEWED_VERIFIED' 
  | 'REVISION_REQUIRED' 
  | 'ACTIVE' 
  | 'KTA_GENERATED' 
  | 'REJECTED' 
  | 'INACTIVE';
export type KtaAdminStatus = 'NOT_CREATED' | 'GENERATED' | 'ACTIVE' | 'REVOKED';

export interface AdminMemberRecord {
  id: string;
  nomor_kta: string;
  nama_lengkap: string;
  // Compatibility fields for field mapping
  full_name?: string;
  no_kta?: string;
  nama?: string;
  nomorKTA?: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  golongan_darah?: string;
  provinsi_id: string;
  provinsi_nama: string;
  kabupaten_id: string;
  kabupaten_nama: string;
  kecamatan_id?: string;
  wilayah_kecamatan_id?: string;
  wilayah_kecamatan_nama?: string;
  wilayah_desa_id?: string;
  pangkalan_id?: string;
  pangkalan_gudep?: string;
  kwartir_cabang?: string;
  kwartir_ranting?: string;
  krida_id: string;
  krida_nama?: string;
  tingkat_keanggotaan: 'Anggota' | 'Dewan Saka' | 'Pamong Saka' | 'Pimpinan Saka' | 'Mabisaka' | string;
  status_anggota: MemberAdminStatus;
  kta_status: KtaAdminStatus;
  status: string; // compatibility alias with status_anggota
  email: string;
  nomor_telepon: string;
  alamat_domisili?: string;
  foto_url?: string;
  photo_thumbnail_url?: string;
  drive_file_id?: string;
  qr_token?: string;
  qr_url?: string;
  qr_status?: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  qr_scan_count?: number;
  qr_last_verified_at?: string;
  level_organisasi: OrganizationLevelType;
  tanggal_bergabung: string;
  tanggal_aktivasi?: string;
  activated_by?: string;
  activated_at?: string;
  force_change_password?: boolean;
  temporary_password?: string;
  created_at: string;
  updated_at: string;
}

export interface MasterWilayahRecord {
  id: string;
  kode_wilayah: string;
  nama_wilayah: string;
  tingkat_wilayah: 'KWARTIR_NASIONAL' | 'PROVINSI' | 'KABUPATEN_KOTA' | 'KECAMATAN';
  kode_parent: string;
  parent_id: string;
  status_aktif: boolean;
}

export interface MasterTingkatanRecord {
  id: string;
  kode_tingkat: 'ANGGOTA' | 'DEWAN_SAKA' | 'PAMONG_SAKA' | 'PIMPINAN_SAKA' | 'MABISAKA';
  nama_tingkat: 'Anggota' | 'Dewan Saka' | 'Pamong Saka' | 'Pimpinan Saka' | 'Mabisaka';
  kategori: string;
  urutan: number;
  status_aktif: boolean;
}

export interface KtaGenerationLogEntry {
  id: string;
  member_id: string;
  nomor_kta: string;
  qr_token: string;
  action_type: 'INITIAL_ISSUE' | 'REGENERATE' | 'REPRINT' | 'CORRECTION';
  reason: string;
  generated_by: string;
  generated_at: string;
}

export interface MemberApprovalEntry {
  id: string;
  member_id: string;
  step_name: 'PENDAFTARAN' | 'VERIFIKASI_BERKAS_WILAYAH' | 'VERIFIKASI_FAKTUAL' | 'PERSETUJUAN_KWARTIR' | 'FINAL_APPROVAL_PUSAT' | 'AKTIVASI_KTA' | 'PENOLAKAN_BERKAS';
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_role: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION';
  notes: string;
  reviewed_at: string;
}

export interface MemberChangeHistoryEntry {
  id: string;
  member_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  actor_id: string;
  actor_role: string;
  reason: string;
  timestamp: string;
}

export interface PublicVerificationLogEntry {
  id: string;
  qr_token: string;
  nomor_kta: string;
  nama_lengkap: string;
  scanned_at: string;
  ip_address: string;
  device_info: string;
  verification_status: 'VALID' | 'REVOKED' | 'NOT_FOUND';
}

export interface RegionSeederStatus {
  isSeeded: boolean;
  statistics: {
    provinces: number;
    regencies: number;
    districts: number;
    villages: number;
  };
  chunkSize: number;
  lastChecked: string;
}

export type AdminTierLevel = 'NASIONAL' | 'PROVINSI' | 'KABUPATEN_KOTA' | 'KECAMATAN' | 'PANGKALAN';

export interface AdminAppointmentRecord {
  id: string;
  member_id?: string;
  user_id?: string;
  nama_lengkap: string;
  email: string;
  nomor_telepon?: string;
  nomor_kta?: string;
  tier_level: AdminTierLevel;
  tingkat_label: string; // e.g., 'Admin Kwartir Nasional', 'Admin Kwarda Jawa Barat'
  provinsi_id?: string;
  provinsi_nama?: string;
  kabupaten_id?: string;
  kabupaten_nama?: string;
  kecamatan_id?: string;
  kecamatan_nama?: string;
  pangkalan_id?: string;
  pangkalan_nama?: string;
  nomor_sk: string;
  tanggal_sk: string;
  masa_berlaku?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  catatan_mandat?: string;
  appointed_by: string;
  appointed_at: string;
  last_password_reset_at?: string;
}

export type AdminActiveTab = 
  | 'overview'
  | 'members'
  | 'admin_assignment'
  | 'kta'
  | 'regions'
  | 'audit';
