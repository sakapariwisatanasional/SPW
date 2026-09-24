/**
 * SPWN Apps 2.0 - Member Achievement Profile Type Definitions
 * Location: src/types/achievement.ts
 * -------------------------------------------------------------
 * Read-Model types untuk pencapaian anggota SAKA Pariwisata:
 * - SKK Progress & Status Matrix
 * - Tingkatan Level (Purwa, Madya, Utama)
 * - Badges & Sertifikasi Digital
 * - Riwayat Aktivitas Kepariwisataan
 * - Privacy Filtering: Nilai evaluasi hanya tersedia untuk diri sendiri / berwenang
 */

export type MemberLevel = 'PURWA' | 'MADYA' | 'UTAMA';

export type SkkStatusType = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';

export interface AchievementMemberInfo {
  memberId: string;
  nama: string;
  nomorKta: string;
  full_name?: string;
  nama_lengkap?: string;
  no_kta?: string;
  nomor_kta?: string;
  fotoUrl: string;
  pangkalan: string;
  kwarcab: string;
  kwarda: string;
  kridaUtamaId: string;
  kridaUtamaNama: string;
  level: MemberLevel;
  statusKta: string;
  tanggalBergabung: string;
}

export interface AchievementSummary {
  totalSkkAvailable: number;
  completedSkk: number;
  inProgressSkk: number;
  notStartedSkk: number;
  progressPercent: number;
  totalBadges: number;
  totalActivities: number;
}

export interface MemberAchievementProfile {
  member: AchievementMemberInfo;
  summary: AchievementSummary;
}

export interface MemberSkkItem {
  skkCode: string;
  nama: string;
  kridaId: string;
  kridaNama?: string;
  status: SkkStatusType;
  levelAchieved: MemberLevel;
  startedAt?: string | null;
  completedAt?: string | null;
  progressPercent: number;
  /**
   * PRIVACY NOTE:
   * Nilai evaluasi SKK HANYA ada bila dipanggil oleh anggota itu sendiri
   * atau role berizin (Super Admin, Admin Pusat/Wilayah, Pembina).
   * Dihapus/undefined pada public view & KTA verification.
   */
  score?: number | null;
  evaluatorNama?: string;
  description?: string;
}

export interface MemberBadgeItem {
  id: string;
  badgeCode: string;
  badgeName: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface MemberActivityItem {
  id: string;
  activityName: string;
  date: string;
  location: string;
  role: string;
  /**
   * MEDIA POLICY:
   * Thumbnail URL hanya digunakan untuk preview tampilan, tidak mengunduh berkas fisik.
   * Format URL referensi aman (CDN / Google Drive view URL / External link).
   */
  thumbnailUrl: string;
  referenceUrl?: string;
}
