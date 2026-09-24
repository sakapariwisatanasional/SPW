export type MemberStatusType = 'PENDING' | 'REVIEWED_VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
export type KtaStatusType = 'NOT_CREATED' | 'GENERATED' | 'ACTIVE' | 'REVOKED';
export type SakaMembershipRole = 'Anggota' | 'Dewan Saka' | 'Pamong Saka' | 'Pimpinan Saka' | 'Mabisaka';
export type OrganizationLevelType = 'KWARTIR_NASIONAL' | 'WILAYAH';
export type QrStatusType = 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
export type KtaTemplateScope = 'NASIONAL' | 'PROVINSI';

export interface KridaMasterItem {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  iconUrl?: string;
}

export interface MemberRecord {
  id: string;
  noKta: string;
  fullName: string;
  // Compatibility fields for field mapping
  full_name?: string;
  no_kta?: string;
  nama?: string;
  nama_lengkap?: string;
  nomor_kta?: string;
  nomorKTA?: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  levelOrganisasi?: OrganizationLevelType;
  kodeProvinsi?: string;
  kodeKabupaten?: string; // PPKK
  kodeKecamatan?: string; // CCC
  province: string;
  city: string;
  kecamatan?: string;
  address: string;
  pangkalan?: string;
  kwartirDaerah?: string;
  kwartirCabang?: string;
  kwartirRanting?: string;
  kridaId: string;
  kridaName: string;
  membershipLevel: SakaMembershipRole | string;
  photoUrl: string;
  photoDriveFileId?: string;
  photoThumbnailUrl?: string;
  status: MemberStatusType;
  ktaStatus?: KtaStatusType;
  verificationToken: string;
  joinedDate: string;
  createdAt: string;

  // Dynamic QR Identity System Fields
  qr_token?: string;
  qr_url?: string;
  qr_status?: QrStatusType;
  qr_created_at?: string;
  qr_updated_at?: string;
  qr_scan_count?: number;
  qr_last_verified_at?: string;
  qr_regenerate_reason?: string;

  // Review & Approval Workflow
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PhotoHistoryRecord {
  id: string;
  memberId: string;
  previousPhotoUrl: string;
  newPhotoUrl: string;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface QrVerificationLogRecord {
  id: string;
  memberId: string;
  qr_token_hash: string;
  scan_time: string;
  device: string;
  ip: string;
  result: 'VALID_ACTIVE' | 'EXPIRED' | 'REVOKED' | 'INVALID_TOKEN';
}

export interface KtaTemplateRecord {
  id: string;
  name: string;
  template_scope: KtaTemplateScope;
  provinceCode?: string; // Optional if PROVINSI
  front_bg_color: string;
  back_bg_color: string;
  card_theme: 'emerald' | 'gold' | 'sapphire' | 'amber' | 'slate';
  logo_url: string;
  background_pattern: 'geometric' | 'batik' | 'minimal' | 'circuit' | 'dots';
  signature_title: string;
  signature_name: string;
  signature_image_url: string;
  qr_position: 'top-right' | 'bottom-right' | 'bottom-left' | 'center-right';
  qr_size: 'small' | 'medium' | 'large';
  qr_box_style: 'clean' | 'framed' | 'badge';
  visible_fields: string[];
  is_active: boolean;
  updated_by: string;
  updated_at: string;
}

export interface KtaTemplateHistoryRecord {
  id: string;
  template_id: string;
  snapshot_data: KtaTemplateRecord;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

/**
 * Publicly exposed member verification data (STRICT PRIVACY - NO NIK, NO EMAIL, NO PASSWORD)
 */
export interface PublicMemberVerificationResult {
  isValid: boolean;
  noKta: string;
  fullName: string;
  levelOrganisasi?: OrganizationLevelType;
  kodeProvinsi?: string;
  kodeKabupaten?: string;
  kodeKecamatan?: string;
  status: MemberStatusType;
  province: string;
  city?: string;
  kecamatan?: string;
  kridaName: string;
  membershipLevel: string;
  photoUrl: string;
  joinedDate: string;
  verificationTimestamp: string;
  certificateRef?: string;
}
