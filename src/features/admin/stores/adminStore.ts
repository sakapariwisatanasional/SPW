/**
 * SPWN Apps 2.0 - Central Admin Dashboard State Store
 * Location: src/features/admin/stores/adminStore.ts
 */

import { create } from 'zustand';
import {
  AdminMemberRecord,
  MemberAdminStatus,
  KtaGenerationLogEntry,
  MemberApprovalEntry,
  MemberChangeHistoryEntry,
  PublicVerificationLogEntry,
  RegionSeederStatus,
  AdminActiveTab,
  AdminAppointmentRecord,
  AdminTierLevel,
} from '../types/admin.types';
import { ktaService } from '../../../services/ktaService';
import { ROLES, UserRole } from '../../../config/constants';
import { apiClient } from '../../../services/api/apiClient';

// Initial Mock Members (Zero NIK, SAKA Official Roles, Separated Status)
const INITIAL_MEMBERS: AdminMemberRecord[] = [
  {
    id: 'MEM-001',
    nomor_kta: '00.000001',
    nama_lengkap: 'Dr. H. Bambang Soedirman, M.Par',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1975-04-12',
    jenis_kelamin: 'L',
    golongan_darah: 'O',
    provinsi_id: '31',
    provinsi_nama: 'DKI JAKARTA',
    kabupaten_id: '3171',
    kabupaten_nama: 'JAKARTA SELATAN',
    kecamatan_id: '3171010',
    wilayah_kecamatan_id: '3171010',
    wilayah_kecamatan_nama: 'JAGAKARSA',
    pangkalan_gudep: 'Kwarnas Gerakan Pramuka Pusat',
    kwartir_cabang: 'Kwartir Nasional',
    kwartir_ranting: 'Kwarnas',
    krida_id: 'KRIDA_PEMANDU',
    krida_nama: 'Krida Pemandu',
    tingkat_keanggotaan: 'Pamong Saka',
    status_anggota: 'ACTIVE',
    kta_status: 'ACTIVE',
    status: 'ACTIVE',
    email: 'superadmin@spwn.id',
    nomor_telepon: '08119876543',
    alamat_domisili: 'Jl. Medan Merdeka Timur No. 6, Jakarta Pusat',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qr_token: 'SPWN-QR-NAS-8F2B1C90',
    qr_url: 'https://spwn.id/verifikasi/SPWN-QR-NAS-8F2B1C90',
    qr_status: 'ACTIVE',
    level_organisasi: 'KWARTIR_NASIONAL',
    tanggal_bergabung: '2023-01-15',
    tanggal_aktivasi: '2023-01-16',
    activated_by: 'Kwarnas Admin',
    activated_at: '2023-01-16T10:00:00Z',
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2023-01-16T10:00:00Z',
  },
  {
    id: 'MEM-002',
    nomor_kta: '00.32.04.190.000123',
    nama_lengkap: 'Fajar Nugraha Wijaya',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1998-08-15',
    jenis_kelamin: 'L',
    golongan_darah: 'A',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3204',
    kabupaten_nama: 'KABUPATEN BANDUNG',
    kecamatan_id: '3204190',
    wilayah_kecamatan_id: '3204190',
    wilayah_kecamatan_nama: 'SOREANG',
    pangkalan_gudep: 'Pangkalan Saka Pariwisata Kab. Bandung',
    kwartir_cabang: 'KABUPATEN BANDUNG',
    kwartir_ranting: 'SOREANG',
    krida_id: 'KRIDA_PEMANDU',
    krida_nama: 'Krida Pemandu',
    tingkat_keanggotaan: 'Anggota',
    status_anggota: 'ACTIVE',
    kta_status: 'ACTIVE',
    status: 'ACTIVE',
    email: 'fajar.nusantara@gmail.com',
    nomor_telepon: '081234567890',
    alamat_domisili: 'Jl. Soreang Raya No. 45, Soreang, Bandung',
    foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    qr_token: 'SPWN-QR-WIL-3204-7A8F9C1B',
    qr_url: 'https://spwn.id/verifikasi/SPWN-QR-WIL-3204-7A8F9C1B',
    qr_status: 'ACTIVE',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2024-02-10',
    tanggal_aktivasi: '2024-02-12',
    activated_by: 'Siti Nurhaliza Putri (Admin Jabar)',
    activated_at: '2024-02-12T14:30:00Z',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-12T14:30:00Z',
  },
  {
    id: 'MEM-003',
    nomor_kta: '00.32.01.010.000124',
    nama_lengkap: 'Annisa Rahmawati Putri',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '2001-06-25',
    jenis_kelamin: 'P',
    golongan_darah: 'B',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3201',
    kabupaten_nama: 'KABUPATEN BOGOR',
    kecamatan_id: '3201010',
    wilayah_kecamatan_id: '3201010',
    wilayah_kecamatan_nama: 'CIBINONG',
    pangkalan_gudep: 'Pangkalan SMAN 1 Cibinong',
    kwartir_cabang: 'KABUPATEN BOGOR',
    kwartir_ranting: 'CIBINONG',
    krida_id: 'KRIDA_PENYULUH',
    krida_nama: 'Krida Penyuluh',
    tingkat_keanggotaan: 'Dewan Saka',
    status_anggota: 'ACTIVE',
    kta_status: 'ACTIVE',
    status: 'ACTIVE',
    email: 'annisa.bogor@gmail.com',
    nomor_telepon: '085712349988',
    alamat_domisili: 'Kecamatan Cibinong, Kab. Bogor',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qr_token: 'SPWN-QR-WIL-3201-9F3C1A7E',
    qr_url: 'https://spwn.id/verifikasi/SPWN-QR-WIL-3201-9F3C1A7E',
    qr_status: 'ACTIVE',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2024-03-01',
    tanggal_aktivasi: '2024-03-03',
    activated_by: 'Siti Nurhaliza Putri (Admin Jabar)',
    activated_at: '2024-03-03T11:00:00Z',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-03T11:00:00Z',
  },
  {
    id: 'MEM-004',
    nomor_kta: '',
    nama_lengkap: 'Bagas Aditya Pratama',
    tempat_lahir: 'Cibinong',
    tanggal_lahir: '2002-07-14',
    jenis_kelamin: 'L',
    golongan_darah: 'O',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3201',
    kabupaten_nama: 'KABUPATEN BOGOR',
    kecamatan_id: '3201020',
    wilayah_kecamatan_id: '3201020',
    wilayah_kecamatan_nama: 'GUNUNG PUTRI',
    pangkalan_gudep: 'Pangkalan SMKN 1 Cibinong',
    kwartir_cabang: 'KABUPATEN BOGOR',
    kwartir_ranting: 'GUNUNG PUTRI',
    krida_id: 'KRIDA_KULINER_CINDERAMATA',
    krida_nama: 'Krida Kuliner & Cinderamata',
    tingkat_keanggotaan: 'Anggota',
    status_anggota: 'ACTIVE',
    kta_status: 'NOT_CREATED',
    status: 'ACTIVE',
    email: 'bagas.kuliner@pramuka.or.id',
    nomor_telepon: '089612345678',
    alamat_domisili: 'Jl. Sukahati No. 12, Cibinong, Bogor',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2026-03-10',
    tanggal_aktivasi: '2026-03-15',
    activated_by: 'Admin Pusat SPWN',
    activated_at: '2026-03-15T09:30:00Z',
    created_at: '2026-03-10T11:00:00Z',
    updated_at: '2026-03-15T09:30:00Z',
  },
  {
    id: 'MEM-005',
    nomor_kta: '',
    nama_lengkap: 'Rizky Dwi Santoso',
    tempat_lahir: 'Semarang',
    tanggal_lahir: '2003-09-12',
    jenis_kelamin: 'L',
    golongan_darah: 'AB',
    provinsi_id: '33',
    provinsi_nama: 'JAWA TENGAH',
    kabupaten_id: '3374',
    kabupaten_nama: 'KOTA SEMARANG',
    kecamatan_id: '3374010',
    wilayah_kecamatan_id: '3374010',
    wilayah_kecamatan_nama: 'SEMARANG TENGAH',
    pangkalan_gudep: 'Pangkalan Universitas Diponegoro',
    kwartir_cabang: 'KOTA SEMARANG',
    kwartir_ranting: 'SEMARANG TENGAH',
    krida_id: 'KRIDA_MICE_EVENT',
    krida_nama: 'Krida Mice & Event',
    tingkat_keanggotaan: 'Anggota',
    status_anggota: 'REVIEWED_VERIFIED',
    kta_status: 'NOT_CREATED',
    status: 'REVIEWED_VERIFIED',
    email: 'rizky.santoso@semarang.id',
    nomor_telepon: '081399887766',
    alamat_domisili: 'Jl. Pemuda No. 100, Semarang',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2026-03-18',
    created_at: '2026-03-18T14:20:00Z',
    updated_at: '2026-03-18T14:20:00Z',
  },
  {
    id: 'MEM-006',
    nomor_kta: '',
    nama_lengkap: 'Ni Luh Made Suartini',
    tempat_lahir: 'Denpasar',
    tanggal_lahir: '2004-01-15',
    jenis_kelamin: 'P',
    golongan_darah: 'A',
    provinsi_id: '51',
    provinsi_nama: 'BALI',
    kabupaten_id: '5171',
    kabupaten_nama: 'KOTA DENPASAR',
    kecamatan_id: '5171020',
    wilayah_kecamatan_id: '5171020',
    wilayah_kecamatan_nama: 'DENPASAR BARAT',
    pangkalan_gudep: 'Pangkalan SMA Negeri 1 Denpasar',
    kwartir_cabang: 'KOTA DENPASAR',
    kwartir_ranting: 'DENPASAR BARAT',
    krida_id: 'KRIDA_PEMANDU',
    krida_nama: 'Krida Pemandu',
    tingkat_keanggotaan: 'Anggota',
    status_anggota: 'PENDING',
    kta_status: 'NOT_CREATED',
    status: 'PENDING',
    email: 'suartini.bali@gmail.com',
    nomor_telepon: '087860123456',
    alamat_domisili: 'Jl. Teuku Umar No. 88, Denpasar Barat',
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2026-03-20',
    created_at: '2026-03-20T16:45:00Z',
    updated_at: '2026-03-20T16:45:00Z',
  },
  {
    id: 'MEM-007',
    nomor_kta: '',
    nama_lengkap: 'Dimas Arya Pamungkas',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '2001-02-20',
    jenis_kelamin: 'L',
    golongan_darah: 'B',
    provinsi_id: '35',
    provinsi_nama: 'JAWA TIMUR',
    kabupaten_id: '3578',
    kabupaten_nama: 'KOTA SURABAYA',
    kecamatan_id: '3578030',
    wilayah_kecamatan_id: '3578030',
    wilayah_kecamatan_nama: 'GUBENG',
    pangkalan_gudep: 'Pangkalan Saka Pariwisata Surabaya',
    kwartir_cabang: 'KOTA SURABAYA',
    kwartir_ranting: 'GUBENG',
    krida_id: 'KRIDA_PENYULUH',
    krida_nama: 'Krida Penyuluh',
    tingkat_keanggotaan: 'Pamong Saka',
    status_anggota: 'ACTIVE',
    kta_status: 'NOT_CREATED',
    status: 'ACTIVE',
    email: 'dimas.arya@jatimpramuka.id',
    nomor_telepon: '082133445566',
    alamat_domisili: 'Gubeng, Surabaya Timur',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    level_organisasi: 'WILAYAH',
    tanggal_bergabung: '2026-03-12',
    tanggal_aktivasi: '2026-03-19',
    activated_by: 'Admin Pusat SPWN',
    activated_at: '2026-03-19T10:15:00Z',
    created_at: '2026-03-12T13:00:00Z',
    updated_at: '2026-03-19T10:15:00Z',
  },
];

const INITIAL_KTA_LOGS: KtaGenerationLogEntry[] = [
  {
    id: 'KLOG-A19F',
    member_id: 'MEM-001',
    nomor_kta: '00.000001',
    qr_token: 'SPWN-QR-NAS-8F2B1C90',
    action_type: 'INITIAL_ISSUE',
    reason: 'Penerbitan KTA Kwartir Nasional Perdana',
    generated_by: 'Super Administrator',
    generated_at: '2023-01-16T10:00:00Z',
  },
  {
    id: 'KLOG-B28C',
    member_id: 'MEM-002',
    nomor_kta: '00.3204.190.000123',
    qr_token: 'SPWN-QR-WIL-3204-7A8F9C1B',
    action_type: 'INITIAL_ISSUE',
    reason: 'Aktivasi Resmi Anggota Jawa Barat',
    generated_by: 'Siti Nurhaliza Putri',
    generated_at: '2024-02-12T14:30:00Z',
  },
  {
    id: 'KLOG-C37D',
    member_id: 'MEM-003',
    nomor_kta: '00.3201.010.000124',
    qr_token: 'SPWN-QR-WIL-3201-9F3C1A7E',
    action_type: 'INITIAL_ISSUE',
    reason: 'Penerbitan KTA Wilayah Kab. Bogor',
    generated_by: 'Siti Nurhaliza Putri',
    generated_at: '2024-03-03T11:00:00Z',
  },
];

const INITIAL_APPROVALS: MemberApprovalEntry[] = [
  {
    id: 'APP-01',
    member_id: 'MEM-004',
    step_name: 'VERIFIKASI_FAKTUAL',
    reviewer_id: 'usr-adminwilayah',
    reviewer_role: 'ADMIN_WILAYAH',
    decision: 'APPROVED',
    notes: 'KTA Gudep, SKK Kuliner, dan KTP absah',
    reviewed_at: '2026-03-15T09:30:00Z',
  },
  {
    id: 'APP-02',
    member_id: 'MEM-007',
    step_name: 'VERIFIKASI_FAKTUAL',
    reviewer_id: 'usr-adminpusat',
    reviewer_role: 'ADMIN_PUSAT',
    decision: 'APPROVED',
    notes: 'Verifikasi faktual selesai via Kwarda Jatim',
    reviewed_at: '2026-03-19T10:15:00Z',
  },
];

const INITIAL_CHANGE_HISTORY: MemberChangeHistoryEntry[] = [
  {
    id: 'HIST-01',
    member_id: 'MEM-002',
    field_name: 'tingkat_keanggotaan',
    old_value: 'Tamu Saka',
    new_value: 'Penegak Bantara',
    actor_id: 'usr-adminwilayah',
    actor_role: 'ADMIN_WILAYAH',
    reason: 'Pelantikan Bantara Saka Pariwisata Kab. Bandung',
    timestamp: '2024-02-12T14:25:00Z',
  },
  {
    id: 'HIST-02',
    member_id: 'MEM-003',
    field_name: 'status_anggota',
    old_value: 'APPROVED',
    new_value: 'ACTIVE',
    actor_id: 'usr-adminwilayah',
    actor_role: 'ADMIN_WILAYAH',
    reason: 'Aktivasi penerbitan kartu identitas KTA resmi',
    timestamp: '2024-03-03T11:00:00Z',
  },
];

const INITIAL_PUBLIC_LOGS: PublicVerificationLogEntry[] = [
  {
    id: 'PVL-001',
    qr_token: 'SPWN-QR-NAS-8F2B1C90',
    nomor_kta: '00.000001',
    nama_lengkap: 'Dr. H. Bambang Soedirman, M.Par',
    scanned_at: '2026-09-21T06:14:20Z',
    ip_address: '182.253.112.44',
    device_info: 'Chrome Mobile / Android 14',
    verification_status: 'VALID',
  },
  {
    id: 'PVL-002',
    qr_token: 'SPWN-QR-WIL-3204-7A8F9C1B',
    nomor_kta: '00.3204.190.000123',
    nama_lengkap: 'Fajar Nugraha Wijaya',
    scanned_at: '2026-09-20T19:45:10Z',
    ip_address: '114.122.38.19',
    device_info: 'Mobile Safari / iOS 17.4',
    verification_status: 'VALID',
  },
  {
    id: 'PVL-003',
    qr_token: 'SPWN-QR-WIL-3201-9F3C1A7E',
    nomor_kta: '00.3201.010.000124',
    nama_lengkap: 'Annisa Rahmawati Putri',
    scanned_at: '2026-09-20T11:05:32Z',
    ip_address: '36.85.12.80',
    device_info: 'Firefox Desktop / Windows 11',
    verification_status: 'VALID',
  },
];

// Initial Mock Admin Appointments across 5 Administrative Tiers
const INITIAL_APPOINTMENTS: AdminAppointmentRecord[] = [
  {
    id: 'ADM-NAS-01',
    member_id: 'MEM-001',
    nama_lengkap: 'Dr. H. Bambang Soedirman, M.Par',
    email: 'superadmin@spwn.id',
    nomor_telepon: '08119876543',
    nomor_kta: '00.000001',
    tier_level: 'NASIONAL',
    tingkat_label: 'Admin Kwartir Nasional',
    provinsi_id: '00',
    provinsi_nama: 'Kwartir Nasional Gerakan Pramuka',
    nomor_sk: 'SK-KWARNAS/SAKA-PAR/01/2024',
    tanggal_sk: '2024-01-10',
    masa_berlaku: '2029-01-10',
    status: 'ACTIVE',
    catatan_mandat: 'Koordinator Nasional Sistem Informasi & Integrasi KTA Digital SAKA Pariwisata',
    appointed_by: 'Super Administrator',
    appointed_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'ADM-PROV-32',
    member_id: 'MEM-005',
    nama_lengkap: 'Siti Nurhaliza Putri, S.Par',
    email: 'kwarda.jabar@spwn.id',
    nomor_telepon: '08122334455',
    nomor_kta: '00.3201.010.000124',
    tier_level: 'PROVINSI',
    tingkat_label: 'Admin Kwarda Jawa Barat',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    nomor_sk: 'SK-KWARDA-JB/SAKA/04/2024',
    tanggal_sk: '2024-02-15',
    masa_berlaku: '2028-02-15',
    status: 'ACTIVE',
    catatan_mandat: 'Supervisi keanggotaan dan verifikasi berkas pendaftar se-Jawa Barat',
    appointed_by: 'Super Administrator',
    appointed_at: '2024-02-15T09:30:00Z',
  },
  {
    id: 'ADM-KAB-3201',
    member_id: 'MEM-003',
    nama_lengkap: 'Annisa Rahmawati Putri',
    email: 'annisa.bogor@gmail.com',
    nomor_telepon: '085712349988',
    nomor_kta: '00.3201.010.000124',
    tier_level: 'KABUPATEN_KOTA',
    tingkat_label: 'Admin Kwarcab Kabupaten Bogor',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3201',
    kabupaten_nama: 'KABUPATEN BOGOR',
    nomor_sk: 'SK-KWARCAB-BGR/08/2024',
    tanggal_sk: '2024-03-01',
    masa_berlaku: '2027-03-01',
    status: 'ACTIVE',
    catatan_mandat: 'Pengelolaan direktori cabang, pangkalan Saka, dan rekomendasi KTA Kab. Bogor',
    appointed_by: 'Super Administrator',
    appointed_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'ADM-KEC-3201010',
    nama_lengkap: 'Rahmat Hidayat, S.Pd',
    email: 'kwarran.nanggung@spwn.id',
    nomor_telepon: '081388776655',
    tier_level: 'KECAMATAN',
    tingkat_label: 'Admin Kwarran Kecamatan Nanggung',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3201',
    kabupaten_nama: 'KABUPATEN BOGOR',
    kecamatan_id: '010',
    kecamatan_nama: 'NANGGUNG',
    nomor_sk: 'SK-KWR-NGG/12/2025',
    tanggal_sk: '2025-01-20',
    masa_berlaku: '2027-01-20',
    status: 'ACTIVE',
    catatan_mandat: 'Verifikasi berkas calon penegak/pandega di tingkat ranting kecamatan',
    appointed_by: 'Super Administrator',
    appointed_at: '2025-01-20T11:00:00Z',
  },
  {
    id: 'ADM-PANGK-01',
    member_id: 'MEM-002',
    nama_lengkap: 'Fajar Nugraha Wijaya',
    email: 'fajar.nusantara@gmail.com',
    nomor_telepon: '081234567890',
    nomor_kta: '00.3204.190.000123',
    tier_level: 'PANGKALAN',
    tingkat_label: 'Admin Pangkalan Saka Soreang',
    provinsi_id: '32',
    provinsi_nama: 'JAWA BARAT',
    kabupaten_id: '3204',
    kabupaten_nama: 'KABUPATEN BANDUNG',
    kecamatan_id: '190',
    kecamatan_nama: 'SOREANG',
    pangkalan_id: 'PGK-3204-01',
    pangkalan_nama: 'Pangkalan Saka Pariwisata Soreang (SMK Pariwisata)',
    nomor_sk: 'MANDAT-GUDP-SRG/02/2025',
    tanggal_sk: '2025-02-10',
    masa_berlaku: '2026-12-31',
    status: 'ACTIVE',
    catatan_mandat: 'Pendaftaran anggota baru pangkalan dan koordinasi instruktur Saka',
    appointed_by: 'Super Administrator',
    appointed_at: '2025-02-10T14:00:00Z',
  },
];

interface AdminState {
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;

  // Scoping
  simulatedScope: 'SUPER_ADMIN' | 'ADMIN_PUSAT' | 'ADMIN_WILAYAH';
  scopeProvinceId: string; // 'ALL' or '32'
  scopeProvinceName: string;
  scopeRegencyId: string; // 'ALL' or '3201'
  scopeRegencyName: string;
  scopeDistrictId?: string;
  scopeDistrictName?: string;
  scopePangkalanId?: string;
  scopePangkalanName?: string;
  setSimulatedScope: (
    scope: 'SUPER_ADMIN' | 'ADMIN_PUSAT' | 'ADMIN_WILAYAH',
    provId?: string,
    provName?: string,
    regId?: string,
    regName?: string,
    distId?: string,
    distName?: string,
    pangkalanId?: string,
    pangkalanName?: string
  ) => void;

  // Data Collections
  members: AdminMemberRecord[];
  adminAppointments: AdminAppointmentRecord[];
  ktaLogs: KtaGenerationLogEntry[];
  approvals: MemberApprovalEntry[];
  changeHistory: MemberChangeHistoryEntry[];
  publicLogs: PublicVerificationLogEntry[];

  // Seeder Status
  regionSeederStatus: RegionSeederStatus;
  isSeederRunning: boolean;
  seederProgress: number;

  // Selected for Modal/Inspect
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;

  // Actions - Phase 3 Lifecycle Management & Privacy Refactor
  addMember: (memberData: Omit<AdminMemberRecord, 'id' | 'created_at' | 'updated_at'>) => AdminMemberRecord;
  reviewMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => void;
  reviewMemberWilayah: (memberId: string, notes: string, reviewerName: string) => void;
  requestRevisionMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => void;
  approveMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => void;
  approveMemberPusat: (memberId: string, notes: string, sessionUserName: string) => void;
  rejectMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => void;
  generateKta: (memberId: string, reason: string, sessionUserName: string) => { nomorKta: string; qrToken: string };
  revokeKta: (memberId: string, reason: string, sessionUserName: string) => void;
  activateMember: (memberId: string, notes: string, sessionUserName: string) => { nomorKta: string; qrToken: string };
  regenerateKta: (memberId: string, reason: string, sessionUserName: string) => { nomorKta: string; qrToken: string };
  updateMemberPhoto: (memberId: string, newPhotoUrl: string, reason: string, sessionUserName: string, sessionUserRole: string) => void;
  updateMemberAdmin: (memberId: string, updates: Partial<AdminMemberRecord>, reason: string, sessionUserName: string, sessionUserRole: string) => void;
  resetMemberPassword: (memberId: string, temporaryPassword?: string, reason?: string, sessionUserName?: string, sessionUserRole?: string) => { temporaryPassword: string; message: string };
  assignAdmin: (data: Omit<AdminAppointmentRecord, 'id' | 'appointed_at'>) => AdminAppointmentRecord;
  revokeAdmin: (id: string, reason: string, sessionUserName: string) => void;
  updateAdminAppointment: (id: string, updates: Partial<AdminAppointmentRecord>, reason: string, sessionUserName: string) => void;
  resetAdminPassword: (appointmentId: string, temporaryPassword?: string, reason?: string, sessionUserName?: string) => { temporaryPassword: string; message: string };
  runRegionSeed: (force?: boolean) => Promise<void>;
  batchGenerateKta: (memberIds: string[], reason: string, sessionUserName: string) => void;
  loadMembers: () => Promise<AdminMemberRecord[]>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  simulatedScope: 'SUPER_ADMIN',
  scopeProvinceId: 'ALL',
  scopeProvinceName: 'Seluruh Indonesia (Nasional)',
  scopeRegencyId: 'ALL',
  scopeRegencyName: 'Seluruh Kabupaten/Kota',
  scopeDistrictId: 'ALL',
  scopeDistrictName: 'Seluruh Kecamatan',
  scopePangkalanId: 'ALL',
  scopePangkalanName: 'Seluruh Pangkalan',

  setSimulatedScope: (scope, provId = 'ALL', provName = 'Seluruh Indonesia (Nasional)', regId = 'ALL', regName = 'Seluruh Kabupaten/Kota', distId = 'ALL', distName = 'Seluruh Kecamatan', pangkalanId = 'ALL', pangkalanName = 'Seluruh Pangkalan') => {
    set({
      simulatedScope: scope,
      scopeProvinceId: scope === 'ADMIN_WILAYAH' ? (provId === 'ALL' ? '32' : provId) : 'ALL',
      scopeProvinceName: scope === 'ADMIN_WILAYAH' ? (provName === 'Seluruh Indonesia (Nasional)' ? 'Jawa Barat' : provName) : 'Seluruh Indonesia (Nasional)',
      scopeRegencyId: scope === 'ADMIN_WILAYAH' ? (regId === 'ALL' ? '3201' : regId) : 'ALL',
      scopeRegencyName: scope === 'ADMIN_WILAYAH' ? (regName === 'Seluruh Kabupaten/Kota' ? 'Kabupaten Bogor' : regName) : 'Seluruh Kabupaten/Kota',
      scopeDistrictId: distId,
      scopeDistrictName: distName,
      scopePangkalanId: pangkalanId,
      scopePangkalanName: pangkalanName,
    });
  },

  members: [],
  adminAppointments: INITIAL_APPOINTMENTS,
  ktaLogs: INITIAL_KTA_LOGS,
  approvals: INITIAL_APPROVALS,
  changeHistory: INITIAL_CHANGE_HISTORY,
  publicLogs: INITIAL_PUBLIC_LOGS,

  regionSeederStatus: {
    isSeeded: true,
    statistics: {
      provinces: 38,
      regencies: 514,
      districts: 7288,
      villages: 83794,
    },
    chunkSize: 500,
    lastChecked: '2026-09-21T08:00:00Z',
  },
  isSeederRunning: false,
  seederProgress: 100,

  selectedMemberId: null,
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),

  addMember: (memberData) => {
    const id = 'MEM-' + String(get().members.length + 1).padStart(3, '0');
    const nowIso = new Date().toISOString();
    const newRecord: AdminMemberRecord = {
      ...memberData,
      id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    set((state) => ({
      members: [newRecord, ...state.members],
      changeHistory: [
        {
          id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          member_id: id,
          field_name: 'PENDAFTARAN_BARU',
          old_value: '-',
          new_value: memberData.status_anggota,
          actor_id: 'admin',
          actor_role: 'ADMIN',
          reason: 'Pendaftaran anggota baru melalui Admin Portal',
          timestamp: nowIso,
        },
        ...state.changeHistory,
      ],
    }));

    return newRecord;
  },

  reviewMember: (memberId, notes, reviewerName, reviewerRole = 'ADMIN_WILAYAH') => {
    const nowIso = new Date().toISOString();
    const effectiveRole = reviewerRole || get().simulatedScope;
    set((state) => {
      const updatedMembers = state.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status_anggota: 'REVIEWED_VERIFIED' as MemberAdminStatus,
            status: 'REVIEWED_VERIFIED',
            updated_at: nowIso,
          };
        }
        return m;
      });

      const newApproval: MemberApprovalEntry = {
        id: 'APP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        step_name: 'VERIFIKASI_BERKAS_WILAYAH',
        reviewer_id: reviewerName,
        reviewer_role: effectiveRole,
        decision: 'APPROVED',
        notes: notes || 'Berkas diverifikasi absah oleh Admin Wilayah',
        reviewed_at: nowIso,
      };

      const historyEntry: MemberChangeHistoryEntry = {
        id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        field_name: 'status_anggota',
        old_value: 'PENDING',
        new_value: 'REVIEWED_VERIFIED',
        actor_id: reviewerName,
        actor_role: effectiveRole,
        reason: notes || 'Verifikasi berkas administratif wilayah',
        timestamp: nowIso,
      };

      return {
        members: updatedMembers,
        approvals: [newApproval, ...state.approvals],
        changeHistory: [historyEntry, ...state.changeHistory],
      };
    });
  },

  reviewMemberWilayah: (memberId, notes, reviewerName) => {
    get().reviewMember(memberId, notes, reviewerName, 'ADMIN_WILAYAH');
  },

  requestRevisionMember: (memberId, notes, reviewerName, reviewerRole = 'ADMIN_WILAYAH') => {
    const nowIso = new Date().toISOString();
    const effectiveRole = reviewerRole || get().simulatedScope;
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = member?.status_anggota || 'PENDING';

    set((state) => {
      const updatedMembers = state.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status_anggota: 'REVISION_REQUIRED' as MemberAdminStatus,
            status: 'REVISION_REQUIRED',
            updated_at: nowIso,
          };
        }
        return m;
      });

      const newApproval: MemberApprovalEntry = {
        id: 'APP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        step_name: 'VERIFIKASI_BERKAS_WILAYAH',
        reviewer_id: reviewerName,
        reviewer_role: effectiveRole,
        decision: 'REVISION',
        notes: notes || 'Berkas memerlukan perbaikan / revisi dari pemohon.',
        reviewed_at: nowIso,
      };

      const historyEntry: MemberChangeHistoryEntry = {
        id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        field_name: 'status_anggota',
        old_value: oldStatus,
        new_value: 'REVISION_REQUIRED',
        actor_id: reviewerName,
        actor_role: effectiveRole,
        reason: notes || 'Permintaan revisi berkas pendaftaran',
        timestamp: nowIso,
      };

      return {
        members: updatedMembers,
        approvals: [newApproval, ...state.approvals],
        changeHistory: [historyEntry, ...state.changeHistory],
      };
    });
  },

  approveMember: (memberId, notes, reviewerName, reviewerRole = 'ADMIN_PUSAT') => {
    const effectiveRole = reviewerRole || get().simulatedScope;
    if (effectiveRole === 'ADMIN_WILAYAH') {
      throw new Error('Admin Wilayah tidak memiliki wewenang Final Approval. Wewenang ini khusus Admin Pusat atau Super Admin.');
    }

    const nowIso = new Date().toISOString();
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = member?.status_anggota || 'REVIEWED_VERIFIED';

    set((state) => {
      const updatedMembers = state.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status_anggota: 'ACTIVE' as MemberAdminStatus,
            status: 'ACTIVE',
            tanggal_aktivasi: nowIso.substring(0, 10),
            activated_by: reviewerName,
            activated_at: nowIso,
            updated_at: nowIso,
          };
        }
        return m;
      });

      const newApproval: MemberApprovalEntry = {
        id: 'APP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        step_name: 'FINAL_APPROVAL_PUSAT',
        reviewer_id: reviewerName,
        reviewer_role: effectiveRole,
        decision: 'APPROVED',
        notes: notes || 'Persetujuan keanggotaan penuh disetujui Admin Pusat',
        reviewed_at: nowIso,
      };

      const historyEntry: MemberChangeHistoryEntry = {
        id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        field_name: 'status_anggota',
        old_value: oldStatus,
        new_value: 'ACTIVE',
        actor_id: reviewerName,
        actor_role: effectiveRole,
        reason: notes || 'Final Approval Kwartir Nasional',
        timestamp: nowIso,
      };

      return {
        members: updatedMembers,
        approvals: [newApproval, ...state.approvals],
        changeHistory: [historyEntry, ...state.changeHistory],
      };
    });
  },

  approveMemberPusat: (memberId, notes, sessionUserName) => {
    get().approveMember(memberId, notes, sessionUserName, 'ADMIN_PUSAT');
  },

  rejectMember: (memberId, notes, reviewerName, reviewerRole = 'ADMIN') => {
    const nowIso = new Date().toISOString();
    const effectiveRole = reviewerRole || get().simulatedScope;
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = member?.status_anggota || 'PENDING';

    set((state) => {
      const updatedMembers = state.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status_anggota: 'REJECTED' as MemberAdminStatus,
            status: 'REJECTED',
            updated_at: nowIso,
          };
        }
        return m;
      });

      const newApproval: MemberApprovalEntry = {
        id: 'APP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        step_name: 'PENOLAKAN_BERKAS',
        reviewer_id: reviewerName,
        reviewer_role: effectiveRole,
        decision: 'REJECTED',
        notes: notes || 'Pendaftaran tidak memenuhi kualifikasi persyaratan.',
        reviewed_at: nowIso,
      };

      const historyEntry: MemberChangeHistoryEntry = {
        id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        member_id: memberId,
        field_name: 'status_anggota',
        old_value: oldStatus,
        new_value: 'REJECTED',
        actor_id: reviewerName,
        actor_role: effectiveRole,
        reason: notes || 'Penolakan pendaftaran anggota',
        timestamp: nowIso,
      };

      return {
        members: updatedMembers,
        approvals: [newApproval, ...state.approvals],
        changeHistory: [historyEntry, ...state.changeHistory],
      };
    });
  },

  generateKta: (memberId, reason, sessionUserName) => {
    const state = get();
    const effectiveRole = state.simulatedScope;
    if (effectiveRole === 'ADMIN_WILAYAH') {
      throw new Error('Penerbitan KTA adalah wewenang khusus Kwartir Nasional / Admin Pusat.');
    }

    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');
    if (member.status_anggota !== 'ACTIVE' && member.status_anggota !== 'KTA_GENERATED') {
      throw new Error('Generate KTA hanya diizinkan untuk anggota dengan status ACTIVE!');
    }
    if (member.kta_status === 'ACTIVE' && member.nomor_kta) {
      throw new Error('KTA sudah aktif. Gunakan menu Regenerate/Peremajaan jika ingin menerbitkan ulang.');
    }

    const nowIso = new Date().toISOString();
    const nextSeq = state.members.filter((m) => m.nomor_kta).length + 1;

    const nomorKta = ktaService.generateKtaNumber({
      level: member.level_organisasi,
      kodeKabupaten: member.kabupaten_id || '3201',
      kodeKecamatan: member.kecamatan_id || member.wilayah_kecamatan_id || '010',
      sequence: nextSeq,
    });

    const qrToken = ktaService.generateMemberQrToken(24);
    const qrUrl = ktaService.generateMemberQrUrl(qrToken);

    const logEntry: KtaGenerationLogEntry = {
      id: 'KLOG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: member.id,
      nomor_kta: nomorKta,
      qr_token: qrToken,
      action_type: 'INITIAL_ISSUE',
      reason: reason || 'Penerbitan KTA Digital dan QR Identity',
      generated_by: sessionUserName,
      generated_at: nowIso,
    };

    const historyEntry: MemberChangeHistoryEntry = {
      id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: member.id,
      field_name: 'status_anggota & kta_status',
      old_value: `${member.status_anggota} / ${member.kta_status || 'NOT_CREATED'}`,
      new_value: 'KTA_GENERATED / ACTIVE',
      actor_id: sessionUserName,
      actor_role: effectiveRole,
      reason: reason || 'Generate KTA & QR Identity',
      timestamp: nowIso,
    };

    set((curr) => ({
      members: curr.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            nomor_kta: nomorKta,
            status_anggota: 'KTA_GENERATED' as MemberAdminStatus,
            status: 'KTA_GENERATED',
            kta_status: 'ACTIVE',
            qr_token: qrToken,
            qr_url: qrUrl,
            qr_status: 'ACTIVE',
            qr_scan_count: 0,
            updated_at: nowIso,
          };
        }
        return m;
      }),
      ktaLogs: [logEntry, ...curr.ktaLogs],
      changeHistory: [historyEntry, ...curr.changeHistory],
    }));

    return { nomorKta, qrToken };
  },

  revokeKta: (memberId, reason, sessionUserName) => {
    const state = get();
    const effectiveRole = state.simulatedScope;
    if (effectiveRole === 'ADMIN_WILAYAH') {
      throw new Error('Pencabutan KTA adalah wewenang khusus Kwartir Nasional / Admin Pusat.');
    }

    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan pencabutan KTA wajib diisi minimal 5 karakter!');
    }

    const nowIso = new Date().toISOString();

    const historyEntry: MemberChangeHistoryEntry = {
      id: 'HIST-REV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: member.id,
      field_name: 'kta_status (REVOKE)',
      old_value: member.kta_status,
      new_value: 'REVOKED',
      actor_id: sessionUserName,
      actor_role: effectiveRole,
      reason: reason,
      timestamp: nowIso,
    };

    set((curr) => ({
      members: curr.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            kta_status: 'REVOKED',
            qr_status: 'REVOKED',
            updated_at: nowIso,
          };
        }
        return m;
      }),
      changeHistory: [historyEntry, ...curr.changeHistory],
    }));
  },

  activateMember: (memberId, notes, sessionUserName) => {
    // Approve member Pusat if not active
    get().approveMember(memberId, notes, sessionUserName, 'ADMIN_PUSAT');
    // Generate KTA
    return get().generateKta(memberId, notes, sessionUserName);
  },

  regenerateKta: (memberId, reason, sessionUserName) => {
    const state = get();
    const effectiveRole = state.simulatedScope;
    if (effectiveRole === 'ADMIN_WILAYAH') {
      throw new Error('Regenerasi KTA adalah wewenang khusus Kwartir Nasional / Admin Pusat.');
    }

    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Member tidak ditemukan');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan peremajaan KTA wajib diisi minimal 5 karakter!');
    }

    const nowIso = new Date().toISOString();
    const oldKta = member.nomor_kta;

    // Pertahankan sequence atau buat nomor baru
    const seq = member.nomor_kta
      ? parseInt(member.nomor_kta.split('.').pop() || '1', 10)
      : state.members.filter((m) => m.nomor_kta).length + 1;

    const nomorKta = ktaService.generateKtaNumber({
      level: member.level_organisasi,
      kodeKabupaten: member.kabupaten_id || '3201',
      kodeKecamatan: member.kecamatan_id || member.wilayah_kecamatan_id || '010',
      sequence: seq,
    });

    const qrToken = ktaService.generateMemberQrToken(24);
    const qrUrl = ktaService.generateMemberQrUrl(qrToken);

    const logEntry: KtaGenerationLogEntry = {
      id: 'KLOG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: member.id,
      nomor_kta: nomorKta,
      qr_token: qrToken,
      action_type: 'REGENERATE',
      reason: reason,
      generated_by: sessionUserName,
      generated_at: nowIso,
    };

    const historyEntry: MemberChangeHistoryEntry = {
      id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: member.id,
      field_name: 'nomor_kta (REGENERATE)',
      old_value: oldKta,
      new_value: nomorKta,
      actor_id: sessionUserName,
      actor_role: effectiveRole,
      reason: reason,
      timestamp: nowIso,
    };

    set((curr) => ({
      members: curr.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            nomor_kta: nomorKta,
            status_anggota: 'KTA_GENERATED' as MemberAdminStatus,
            status: 'KTA_GENERATED',
            kta_status: 'ACTIVE',
            qr_token: qrToken,
            qr_url: qrUrl,
            qr_scan_count: 0,
            updated_at: nowIso,
          };
        }
        return m;
      }),
      ktaLogs: [logEntry, ...curr.ktaLogs],
      changeHistory: [historyEntry, ...curr.changeHistory],
    }));

    return { nomorKta, qrToken };
  },

  updateMemberPhoto: (memberId, newPhotoUrl, reason, sessionUserName, sessionUserRole) => {
    const state = get();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Member tidak ditemukan');
    if (!reason || reason.trim().length < 3) {
      throw new Error('Alasan perubahan foto wajib diisi minimal 3 karakter!');
    }

    const nowIso = new Date().toISOString();
    const oldPhotoUrl = member.foto_url;

    const historyEntry: MemberChangeHistoryEntry = {
      id: 'HIST-PHOTO-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      member_id: memberId,
      field_name: 'foto_url',
      old_value: oldPhotoUrl || '',
      new_value: newPhotoUrl,
      actor_id: sessionUserName,
      actor_role: sessionUserRole,
      reason: reason,
      timestamp: nowIso,
    };

    // Keep persistent photo history log
    try {
      const key = `SPWN_PHOTO_HISTORY_${memberId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({
        id: historyEntry.id,
        memberId,
        previousPhotoUrl: oldPhotoUrl || '',
        newPhotoUrl,
        changedBy: sessionUserName,
        changedAt: nowIso,
        reason,
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed writing photo history to local storage', e);
    }

    set((curr) => ({
      members: curr.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            foto_url: newPhotoUrl,
            updated_at: nowIso,
          };
        }
        return m;
      }),
      changeHistory: [historyEntry, ...curr.changeHistory],
    }));
  },

  updateMemberAdmin: (memberId, updates, reason, sessionUserName, sessionUserRole) => {
    const state = get();
    const member = state.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Member tidak ditemukan');
    if (!reason || reason.trim().length < 3) {
      throw new Error('Alasan perubahan data administrasi wajib diisi!');
    }

    const nowIso = new Date().toISOString();
    const changeRecords: MemberChangeHistoryEntry[] = [];

    (Object.keys(updates) as (keyof AdminMemberRecord)[]).forEach((field) => {
      const oldVal = String(member[field] || '');
      const newVal = String(updates[field] || '');
      if (oldVal !== newVal) {
        changeRecords.push({
          id: 'HIST-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          member_id: memberId,
          field_name: field,
          old_value: oldVal,
          new_value: newVal,
          actor_id: sessionUserName,
          actor_role: sessionUserRole,
          reason: reason,
          timestamp: nowIso,
        });
      }
    });

    if (updates.foto_url && updates.foto_url !== member.foto_url) {
      try {
        const key = `SPWN_PHOTO_HISTORY_${memberId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: 'HIST-PHOTO-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          memberId,
          previousPhotoUrl: member.foto_url,
          newPhotoUrl: updates.foto_url,
          changedBy: sessionUserName,
          changedAt: nowIso,
          reason,
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.warn('Failed writing photo history to local storage', e);
      }
    }

    set((curr) => ({
      members: curr.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            ...updates,
            updated_at: nowIso,
          };
        }
        return m;
      }),
      changeHistory: [...changeRecords, ...curr.changeHistory],
    }));
  },

  resetMemberPassword: (memberId, temporaryPassword, reason = 'Reset kata sandi akun oleh administrator', sessionUserName = 'Super Administrator', sessionUserRole = 'SUPER_ADMIN') => {
    const effectiveRole = sessionUserRole || get().simulatedScope;
    if (effectiveRole !== 'SUPER_ADMIN' && effectiveRole !== 'ADMIN_PUSAT') {
      throw new Error('Hanya Super Admin atau Admin Pusat yang berwenang mereset kata sandi akun anggota.');
    }

    const member = get().members.find((m) => m.id === memberId);
    if (!member) {
      throw new Error(`Anggota dengan ID ${memberId} tidak ditemukan.`);
    }

    const tempPass = temporaryPassword?.trim() || `Pramuka#${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const changeEntry: MemberChangeHistoryEntry = {
      id: `HIST-PWD-${Date.now()}`,
      member_id: memberId,
      field_name: 'password_hash (RESET)',
      old_value: '●●●●●●●● (Terenkripsi Salted SHA-256)',
      new_value: '[KREDENSIAL_BARU_DITERBITKAN: Password Sementara Diberikan Langsung ke Anggota (Wajib Ubah saat Login)]',
      actor_id: sessionUserName,
      actor_role: effectiveRole,
      reason: reason,
      timestamp: nowIso,
    };

    set((curr) => ({
      members: curr.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              force_change_password: true,
              updated_at: nowIso,
            }
          : m
      ),
      changeHistory: [changeEntry, ...curr.changeHistory],
    }));

    return {
      temporaryPassword: tempPass,
      message: `Password berhasil direset. Password sementara untuk ${member.nama_lengkap}: ${tempPass}. Anggota diwajibkan mengganti kata sandi pada login berikutnya.`,
    };
  },

  /**
   * Load anggota real dari SPWN Backend GAS
   * menggantikan INITIAL_MEMBERS dummy
   */
  loadMembers: async () => {
    try {
      const response = await apiClient.post<any>(
        'admin.member.pending',
        {}
      );

      const fetched =
        response.data ||
        (response as any).members ||
        (response as any).data?.members ||
        [];

      if (Array.isArray(fetched) && fetched.length > 0) {
        set({
          members: fetched
        });
        return fetched;
      }

      return get().members;
    } catch (e) {
      console.warn('Gagal memuat data anggota dari backend GAS:', e);
      return get().members;
    }
  },

  assignAdmin: (data) => {
    const nowIso = new Date().toISOString();
    const idPrefix = data.tier_level ? data.tier_level.substring(0, 4) : 'ADM';
    const newAppointment: AdminAppointmentRecord = {
      ...data,
      id: `ADM-${idPrefix}-${Date.now().toString().slice(-4)}`,
      appointed_at: nowIso,
      status: 'ACTIVE',
    };

    set((curr) => ({
      adminAppointments: [newAppointment, ...curr.adminAppointments],
    }));

    return newAppointment;
  },

  revokeAdmin: (id, reason, sessionUserName) => {
    const nowIso = new Date().toISOString();
    set((curr) => ({
      adminAppointments: curr.adminAppointments.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'REVOKED',
            catatan_mandat: `${item.catatan_mandat || ''} \n[MANDAT DICABUT ${nowIso.slice(0, 10)}] oleh ${sessionUserName}: ${reason}`,
          };
        }
        return item;
      }),
    }));
  },

  updateAdminAppointment: (id, updates, reason, sessionUserName) => {
    set((curr) => ({
      adminAppointments: curr.adminAppointments.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updates,
          };
        }
        return item;
      }),
    }));
  },

  resetAdminPassword: (appointmentId, temporaryPassword, reason = 'Reset kredensial akses admin', sessionUserName = 'Super Administrator') => {
    const appt = get().adminAppointments.find((a) => a.id === appointmentId);
    if (!appt) {
      throw new Error(`Admin appointment dengan ID ${appointmentId} tidak ditemukan.`);
    }

    const tempPass = temporaryPassword?.trim() || `AdminSaka#${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    set((curr) => ({
      adminAppointments: curr.adminAppointments.map((a) =>
        a.id === appointmentId ? { ...a, last_password_reset_at: nowIso } : a
      ),
    }));

    return {
      temporaryPassword: tempPass,
      message: `Password admin ${appt.nama_lengkap} (${appt.tingkat_label}) berhasil direset menjadi: ${tempPass}`,
    };
  },

  runRegionSeed: async (force = false) => {
    set({ isSeederRunning: true, seederProgress: 10 });
    // Simulasi chunked sync progress
    await new Promise((resolve) => setTimeout(resolve, 600));
    set({ seederProgress: 45 });
    await new Promise((resolve) => setTimeout(resolve, 700));
    set({ seederProgress: 80 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      isSeederRunning: false,
      seederProgress: 100,
      regionSeederStatus: {
        isSeeded: true,
        statistics: {
          provinces: 38,
          regencies: 514,
          districts: 7288,
          villages: 83794,
        },
        chunkSize: 500,
        lastChecked: new Date().toISOString(),
      },
    });
  },

  batchGenerateKta: (memberIds, reason, sessionUserName) => {
    memberIds.forEach((id) => {
      try {
        get().activateMember(id, reason, sessionUserName);
      } catch (e) {
        // Continue next
      }
    });
  },
}));
