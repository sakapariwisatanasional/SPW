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
import { ROLES, UserRole } from '../../../config/constants';
import { apiClient } from '../../../services/api/apiClient';


const normalizeKridaIdentity = (rawId?: string, rawName?: string) => {
  const id = String(rawId || '').trim().toUpperCase();
  const name = String(rawName || '').trim().toUpperCase();

  if (
    id === 'KRIDA_PEMANDU' ||
    name === 'KRIDA PEMANDU' ||
    name === 'PEMANDU' ||
    name === 'PEMANDU WISATA'
  ) {
    return {
      krida_id: 'KRIDA_PEMANDU',
      krida_nama: 'KRIDA PEMANDU',
    };
  }

  if (
    id === 'KRIDA_PENYULUH' ||
    name === 'KRIDA PENYULUH' ||
    name === 'PENYULUH' ||
    name === 'PENYULUH WISATA'
  ) {
    return {
      krida_id: 'KRIDA_PENYULUH',
      krida_nama: 'KRIDA PENYULUH',
    };
  }

  if (
    id === 'KRIDA_MICE_EVENT' ||
    name === 'KRIDA MICE & EVENT' ||
    name === 'KRIDA MICE EVENT' ||
    name === 'MICE & EVENT' ||
    name === 'MICE EVENT'
  ) {
    return {
      krida_id: 'KRIDA_MICE_EVENT',
      krida_nama: 'KRIDA MICE & EVENT',
    };
  }

  if (
    id === 'KRIDA_KULINER_CINDERAMATA' ||
    name === 'KRIDA KULINER & CINDERAMATA' ||
    name === 'KRIDA KULINER DAN CINDERAMATA' ||
    name === 'KULINER & CINDERAMATA' ||
    name === 'KULINER DAN CINDERAMATA'
  ) {
    return {
      krida_id: 'KRIDA_KULINER_CINDERAMATA',
      krida_nama: 'KRIDA KULINER & CINDERAMATA',
    };
  }

  return {
    krida_id: id,
    krida_nama: name,
  };
};

interface AdminState {
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;

  // Scoping / acting context. The authenticated account remains SUPER_ADMIN.
  actingLevel: 'NASIONAL' | 'WILAYAH' | 'PAMONG_SAKA';
  actingRole: 'ADMIN_NASIONAL' | 'ADMIN_WILAYAH' | 'MEMBER';
  simulatedScope: 'SUPER_ADMIN' | 'ADMIN_PUSAT' | 'ADMIN_WILAYAH' | 'MEMBER';
  qaPerspective:
    | 'SUPER_ADMIN'
    | 'ADMIN_KWARDA'
    | 'ADMIN_KWARCAB'
    | 'ADMIN_PANGKALAN'
    | 'PAMONG_SAKA'
    | 'PINSAKA'
    | 'MABISAKA'
    | 'ANGGOTA';
  scopeProvinceId: string; // 'ALL' or '32'
  scopeProvinceName: string;
  scopeRegencyId: string; // 'ALL' or '3201'
  scopeRegencyName: string;
  scopeDistrictId?: string;
  scopeDistrictName?: string;
  scopePangkalanId?: string;
  scopePangkalanName?: string;
  setActingLevel: (
    level: 'NASIONAL' | 'WILAYAH' | 'PAMONG_SAKA',
    provId?: string,
    provName?: string,
    regId?: string,
    regName?: string
  ) => void;
  setSimulatedScope: (
    scope: 'SUPER_ADMIN' | 'ADMIN_PUSAT' | 'ADMIN_WILAYAH' | 'MEMBER',
    provId?: string,
    provName?: string,
    regId?: string,
    regName?: string,
    distId?: string,
    distName?: string,
    pangkalanId?: string,
    pangkalanName?: string
  ) => void;
  setQaPerspective: (
    perspective:
      | 'SUPER_ADMIN'
      | 'ADMIN_KWARDA'
      | 'ADMIN_KWARCAB'
      | 'ADMIN_PANGKALAN'
      | 'PAMONG_SAKA'
      | 'PINSAKA'
      | 'MABISAKA'
      | 'ANGGOTA',
    options?: {
      provId?: string;
      provName?: string;
      regId?: string;
      regName?: string;
      distId?: string;
      distName?: string;
      pangkalanId?: string;
      pangkalanName?: string;
    }
  ) => void;

  // Data Collections
  members: AdminMemberRecord[];
  membersLoading: boolean;
  membersError: string | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  dashboardLastSyncedAt: string | null;
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
  reviewMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => Promise<void>;
  reviewMemberWilayah: (memberId: string, notes: string, reviewerName: string) => Promise<void>;
  requestRevisionMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => Promise<void>;
  approveMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => Promise<void>;
  approveMemberPusat: (memberId: string, notes: string, sessionUserName: string) => void;
  rejectMember: (memberId: string, notes: string, reviewerName: string, reviewerRole?: string) => Promise<void>;
  generateKta: (memberId: string, reason: string, sessionUserName: string) => Promise<{ nomorKta: string; qrToken: string }>;
  revokeKta: (memberId: string, reason: string, sessionUserName: string) => void;
  activateMember: (memberId: string, notes: string, sessionUserName: string) => Promise<{ nomorKta: string; qrToken: string }>;
  regenerateKta: (memberId: string, reason: string, sessionUserName: string) => Promise<{ nomorKta: string; qrToken: string }>;
  updateMemberPhoto: (memberId: string, newPhotoUrl: string, reason: string, sessionUserName: string, sessionUserRole: string) => void;
  updateMemberAdmin: (memberId: string, updates: Partial<AdminMemberRecord>, reason: string, sessionUserName: string, sessionUserRole: string) => Promise<void>;
  resetMemberPassword: (memberId: string, temporaryPassword?: string, reason?: string, sessionUserName?: string, sessionUserRole?: string) => { temporaryPassword: string; message: string };
  assignAdmin: (data: Omit<AdminAppointmentRecord, 'id' | 'appointed_at'>) => AdminAppointmentRecord;
  revokeAdmin: (id: string, reason: string, sessionUserName: string) => void;
  updateAdminAppointment: (id: string, updates: Partial<AdminAppointmentRecord>, reason: string, sessionUserName: string) => void;
  resetAdminPassword: (appointmentId: string, temporaryPassword?: string, reason?: string, sessionUserName?: string) => { temporaryPassword: string; message: string };
  runRegionSeed: (force?: boolean) => Promise<void>;
  batchGenerateKta: (memberIds: string[], reason: string, sessionUserName: string) => void;
  loadMembers: () => Promise<AdminMemberRecord[]>;
  loadDashboardData: () => Promise<void>;
  syncMemberUserStatuses: () => Promise<{
    scanned: number;
    eligible: number;
    activated: number;
    already_active: number;
    skipped_status: number;
    skipped_email: number;
    user_not_found: number;
    failed: number;
    details?: any[];
  }>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  actingLevel: 'NASIONAL',
  actingRole: 'ADMIN_NASIONAL',
  simulatedScope: 'SUPER_ADMIN',
  qaPerspective: 'SUPER_ADMIN',
  scopeProvinceId: 'ALL',
  scopeProvinceName: 'Seluruh Indonesia (Nasional)',
  scopeRegencyId: 'ALL',
  scopeRegencyName: 'Seluruh Kabupaten/Kota',
  scopeDistrictId: 'ALL',
  scopeDistrictName: 'Seluruh Kecamatan',
  scopePangkalanId: 'ALL',
  scopePangkalanName: 'Seluruh Pangkalan',

  setActingLevel: (level, provId = 'ALL', provName = 'Seluruh Indonesia (Nasional)', regId = 'ALL', regName = 'Seluruh Kabupaten/Kota') => {
    const isWilayah = level === 'WILAYAH';
    const isPamong = level === 'PAMONG_SAKA';
    const actingRole =
      level === 'NASIONAL'
        ? 'ADMIN_NASIONAL'
        : level === 'WILAYAH'
        ? 'ADMIN_WILAYAH'
        : 'MEMBER';

    set({
      actingLevel: level,
      actingRole,
      // Compatibility for existing components until all consumers migrate.
      simulatedScope:
        level === 'NASIONAL'
          ? 'ADMIN_PUSAT'
          : level === 'WILAYAH'
          ? 'ADMIN_WILAYAH'
          : 'MEMBER',
      scopeProvinceId: (isWilayah || isPamong) ? (provId === 'ALL' ? '32' : provId) : 'ALL',
      scopeProvinceName: (isWilayah || isPamong) ? (provName || 'Jawa Barat') : 'Seluruh Indonesia (Nasional)',
      scopeRegencyId: (isWilayah || isPamong) ? (regId === 'ALL' ? 'ALL' : regId) : 'ALL',
      scopeRegencyName: (isWilayah || isPamong) ? (regName || 'Seluruh Kabupaten/Kota') : 'Seluruh Kabupaten/Kota',
    });
  },

  setSimulatedScope: (scope, provId = 'ALL', provName = 'Seluruh Indonesia (Nasional)', regId = 'ALL', regName = 'Seluruh Kabupaten/Kota', distId = 'ALL', distName = 'Seluruh Kecamatan', pangkalanId = 'ALL', pangkalanName = 'Seluruh Pangkalan') => {
    const level =
      scope === 'ADMIN_WILAYAH' ? 'WILAYAH' :
      scope === 'MEMBER' ? 'PAMONG_SAKA' :
      'NASIONAL';

    get().setActingLevel(level, provId, provName, regId, regName);
    set({
      scopeDistrictId: distId,
      scopeDistrictName: distName,
      scopePangkalanId: pangkalanId,
      scopePangkalanName: pangkalanName,
    });
  },

  setQaPerspective: (perspective, options = {}) => {
    const provId = options.provId || get().scopeProvinceId || 'ALL';
    const provName = options.provName || get().scopeProvinceName || 'Seluruh Indonesia (Nasional)';
    const regId = options.regId || get().scopeRegencyId || 'ALL';
    const regName = options.regName || get().scopeRegencyName || 'Seluruh Kabupaten/Kota';
    const distId = options.distId || get().scopeDistrictId || 'ALL';
    const distName = options.distName || get().scopeDistrictName || 'Seluruh Kecamatan';
    const pangkalanId = options.pangkalanId || get().scopePangkalanId || 'ALL';
    const pangkalanName = options.pangkalanName || get().scopePangkalanName || 'Seluruh Pangkalan';

    if (perspective === 'SUPER_ADMIN') {
      set({
        qaPerspective: perspective,
        actingLevel: 'NASIONAL',
        actingRole: 'ADMIN_NASIONAL',
        simulatedScope: 'SUPER_ADMIN',
        scopeProvinceId: 'ALL',
        scopeProvinceName: 'Seluruh Indonesia (Nasional)',
        scopeRegencyId: 'ALL',
        scopeRegencyName: 'Seluruh Kabupaten/Kota',
        scopeDistrictId: 'ALL',
        scopeDistrictName: 'Seluruh Kecamatan',
        scopePangkalanId: 'ALL',
        scopePangkalanName: 'Seluruh Pangkalan',
      });
      return;
    }

    if (perspective === 'ADMIN_KWARDA') {
      set({
        qaPerspective: perspective,
        actingLevel: 'WILAYAH',
        actingRole: 'ADMIN_WILAYAH',
        simulatedScope: 'ADMIN_WILAYAH',
        scopeProvinceId: provId === 'ALL' ? '32' : provId,
        scopeProvinceName: provName || 'JAWA BARAT',
        scopeRegencyId: 'ALL',
        scopeRegencyName: 'Seluruh Kabupaten/Kota',
        scopeDistrictId: 'ALL',
        scopeDistrictName: 'Seluruh Kecamatan',
        scopePangkalanId: 'ALL',
        scopePangkalanName: 'Seluruh Pangkalan',
      });
      return;
    }

    if (perspective === 'ADMIN_KWARCAB') {
      set({
        qaPerspective: perspective,
        actingLevel: 'WILAYAH',
        actingRole: 'ADMIN_WILAYAH',
        simulatedScope: 'ADMIN_WILAYAH',
        scopeProvinceId: provId === 'ALL' ? '32' : provId,
        scopeProvinceName: provName || 'JAWA BARAT',
        scopeRegencyId: regId,
        scopeRegencyName: regName,
        scopeDistrictId: 'ALL',
        scopeDistrictName: 'Seluruh Kecamatan',
        scopePangkalanId: 'ALL',
        scopePangkalanName: 'Seluruh Pangkalan',
      });
      return;
    }

    if (perspective === 'ADMIN_PANGKALAN') {
      set({
        qaPerspective: perspective,
        actingLevel: 'WILAYAH',
        actingRole: 'ADMIN_WILAYAH',
        simulatedScope: 'ADMIN_WILAYAH',
        scopeProvinceId: provId === 'ALL' ? '32' : provId,
        scopeProvinceName: provName || 'JAWA BARAT',
        scopeRegencyId: regId,
        scopeRegencyName: regName,
        scopeDistrictId: distId,
        scopeDistrictName: distName,
        scopePangkalanId: pangkalanId,
        scopePangkalanName: pangkalanName,
      });
      return;
    }

    set({
      qaPerspective: perspective,
      actingLevel: 'PAMONG_SAKA',
      actingRole: 'MEMBER',
      simulatedScope: 'MEMBER',
      scopeProvinceId: provId === 'ALL' ? '32' : provId,
      scopeProvinceName: provName || 'JAWA BARAT',
      scopeRegencyId: regId,
      scopeRegencyName: regName,
      scopeDistrictId: distId,
      scopeDistrictName: distName,
      scopePangkalanId: pangkalanId,
      scopePangkalanName: pangkalanName,
    });
  },

  members: [],
  membersLoading: false,
  membersError: null,
  dashboardLoading: false,
  dashboardError: null,
  dashboardLastSyncedAt: null,
  adminAppointments: [],
  ktaLogs: [],
  approvals: [],
  changeHistory: [],
  publicLogs: [],

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
    const id =
      (memberData as any).id ||
      (memberData as any).member_id ||
      ('MEM-' + String(get().members.length + 1).padStart(3, '0'));

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

  reviewMember: async (memberId, notes, reviewerName, reviewerRole) => {
    const effectiveRole = reviewerRole || get().actingRole;
    await apiClient.post('member.approval', {
      member_id: memberId,
      decision: 'REVIEWED_VERIFIED',
      notes,
      reviewer_name: reviewerName,
      reviewer_role: effectiveRole,
      acting_level: get().actingLevel,
    });

    // Backend adalah source of truth. Jangan membuat status lokal sendiri
    // sebelum membaca ulang spreadsheet.
    await get().loadMembers();
  },

  reviewMemberWilayah: async (memberId, notes, reviewerName) => {
    await get().reviewMember(memberId, notes, reviewerName, 'ADMIN_WILAYAH');
  },

  requestRevisionMember: async (memberId, notes, reviewerName, reviewerRole) => {
    const nowIso = new Date().toISOString();
    const effectiveRole = reviewerRole || get().actingRole;
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = member?.status_anggota || 'PENDING';
    await apiClient.post('member.approval', {
      member_id: memberId,
      decision: 'REVISION_REQUIRED',
      notes,
      reviewer_name: reviewerName,
      reviewer_role: effectiveRole,
      acting_level: get().actingLevel,
    });

    await get().loadMembers();

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

  approveMember: async (memberId, notes, reviewerName, reviewerRole) => {
    const effectiveRole = reviewerRole || get().actingRole;
    const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';

    // SUPER_ADMIN adalah otoritas tertinggi dan boleh mengesahkan langsung
    // dari PENDING / REVIEWED_VERIFIED / REVISION_REQUIRED tanpa bergantung
    // pada actingLevel/simulatedScope. Admin lain tetap mengikuti hierarchy.
    if (!isSuperAdmin && get().actingLevel !== 'NASIONAL') {
      throw new Error('Final Approval hanya tersedia pada mode Admin Nasional.');
    }
    if (effectiveRole === 'ADMIN_WILAYAH') {
      throw new Error('Admin Wilayah tidak memiliki wewenang Final Approval. Wewenang ini khusus Admin Pusat atau Super Admin.');
    }

    const nowIso = new Date().toISOString();
    const before = get().members.find((m) => m.id === memberId);
    const oldStatusBeforeReload = before?.status_anggota || 'PENDING';

    await apiClient.post('admin.member.activate', {
      member_id: memberId,
      notes: notes || (isSuperAdmin
        ? 'SUPER_ADMIN_DIRECT_APPROVAL: pengesahan langsung oleh Super Administrator.'
        : 'Final Approval tingkat nasional.'),
    });
    await get().loadMembers();
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = oldStatusBeforeReload || member?.status_anggota || 'PENDING';

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

  rejectMember: async (memberId, notes, reviewerName, reviewerRole) => {
    const nowIso = new Date().toISOString();
    const effectiveRole = reviewerRole || get().actingRole;
    const member = get().members.find((m) => m.id === memberId);
    const oldStatus = member?.status_anggota || 'PENDING';

    await apiClient.post('member.reject', {
      member_id: memberId,
      notes,
      reviewer_name: reviewerName,
      reviewer_role: effectiveRole,
      acting_level: get().actingLevel,
    });
    await get().loadMembers();

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

  generateKta: async (memberId, reason, sessionUserName) => {
    const state = get();
    const effectiveRole = state.actingRole;
    if (state.actingLevel !== 'NASIONAL') {
      throw new Error('Penerbitan KTA hanya tersedia pada mode Admin Nasional.');
    }
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
    const gasResult:any = await apiClient.post('member.generate_kta', {
      member_id: memberId,
      reason,
      acting_level: state.actingLevel,
      actor: sessionUserName,
    });
    const nomorKta = gasResult.data?.no_kta || gasResult.data?.nomor_kta || gasResult.data?.nomorKta;
    const qrToken = gasResult.data?.qr_token || gasResult.data?.qrToken || '';
    const qrUrl = gasResult.data?.verification_url || gasResult.data?.qr_url || '';
    if (!nomorKta) throw new Error('Backend KTA berhasil dipanggil tetapi nomor KTA tidak dikembalikan.');
    await get().loadMembers();

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
    const effectiveRole = state.actingRole;
    if (state.actingLevel !== 'NASIONAL') {
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

  activateMember: async (memberId, notes, sessionUserName) => {
    if (get().actingLevel !== 'NASIONAL') {
      throw new Error('Aktivasi dan penerbitan KTA hanya tersedia pada mode Admin Nasional.');
    }
    const current = get().members.find((m) => m.id === memberId);
    if (!current) throw new Error('Anggota tidak ditemukan');
    if (current.status_anggota !== 'ACTIVE') {
      await get().approveMember(memberId, notes, sessionUserName, 'ADMIN_PUSAT');
    }
    return await get().generateKta(memberId, notes, sessionUserName);
  },

  regenerateKta: async (memberId, reason, sessionUserName) => {
    const state = get();
    const effectiveRole = state.actingRole;
    if (state.actingLevel !== 'NASIONAL') {
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

    const gasResult:any = await apiClient.post('member.generate_kta', { member_id: memberId, reason, acting_level: state.actingLevel, authenticated_role: 'SUPER_ADMIN' });
    const nomorKta = gasResult.data?.nomor_kta || gasResult.data?.nomorKta;
    const qrToken = gasResult.data?.qr_token || gasResult.data?.qrToken;
    const qrUrl = gasResult.data?.qr_url || '';

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

  updateMemberAdmin: async (memberId, updates, reason, sessionUserName, sessionUserRole) => {
    const state = get();
    const member = state.members.find((m) => m.id === memberId);

    if (!member) throw new Error('Member tidak ditemukan');
    if (!reason || reason.trim().length < 3) {
      throw new Error('Alasan perubahan data administrasi wajib diisi!');
    }

    // Sinkronisasi ke backend GAS agar perubahan masuk Spreadsheet
    await apiClient.post('member.update_profile', {
      member_id: memberId,
      data: updates,
      actor: sessionUserName,
    });

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
          reason,
          timestamp: nowIso,
        });
      }
    });

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
    set({
      membersLoading: true,
      membersError: null,
    });

    try {
      /**
       * Admin Portal harus memakai endpoint admin.member.list.
       * Backend endpoint ini mengembalikan data anggota sesuai RBAC admin
       * dan merupakan source of truth untuk dashboard administrasi.
       */
      const response = await apiClient.get<any>('admin.member.list');

      /**
       * Normalisasi seluruh response shape yang pernah dipakai GAS:
       * 1. data: [...]
       * 2. data: { data: [...] }
       * 3. data: { members: [...] }
       * 4. { members: [...] }
       *
       * BUG lama:
       * const fetched = response.data || ...
       * Jika response.data adalah object { data: [...] }, ekspresi berhenti
       * pada object tersebut sehingga Array.isArray(fetched) = false.
       */
      const candidates = [
        response?.data,
        response?.data?.data,
        response?.data?.members,
        (response as any)?.members,
        (response as any)?.data?.data?.members,
      ];

      const fetched =
        candidates.find((value) => Array.isArray(value)) || [];

      const normalizedMembers = (fetched as any[]).map((member: any) => {
        const status =
          member.status_anggota ||
          member.status ||
          'PENDING';

        const normalizedKrida = normalizeKridaIdentity(
          member.krida_id,
          member.krida_nama || member.krida
        );

        return {
          ...member,

          // ID resmi backend / spreadsheet
          id:
            member.id ||
            member.member_id ||
            member.memberId ||
            '',

          nomor_kta:
            member.nomor_kta ||
            member.no_kta ||
            '',

          no_kta:
            member.nomor_kta ||
            member.no_kta ||
            '',

          nama_lengkap:
            member.full_name ||
            member.nama_lengkap ||
            member.nama ||
            '',

          full_name:
            member.full_name ||
            member.nama_lengkap ||
            member.nama ||
            '',

          nomor_telepon:
            member.phone ||
            member.nomor_telepon ||
            member.telepon ||
            '',

          provinsi_nama:
            member.provinsi_nama ||
            member.province ||
            '',

          kabupaten_nama:
            member.kabupaten_kota_nama ||
            member.kabupaten_nama ||
            member.city ||
            '',

          wilayah_kecamatan_nama:
            member.kecamatan_nama ||
            member.wilayah_kecamatan_nama ||
            member.district ||
            '',

          provinsi_id:
            member.provinsi_id ||
            member.kode_provinsi ||
            '',

          kabupaten_id:
            member.kabupaten_kota_id ||
            member.kabupaten_id ||
            member.kode_kabupaten ||
            '',

          kecamatan_id:
            member.kecamatan_id ||
            member.wilayah_kecamatan_id ||
            member.kode_kecamatan ||
            '',

          wilayah_kecamatan_id:
            member.kecamatan_id ||
            member.wilayah_kecamatan_id ||
            member.kode_kecamatan ||
            '',

          krida_id:
            normalizedKrida.krida_id,

          krida_nama:
            normalizedKrida.krida_nama,

          krida:
            normalizedKrida.krida_nama,

          tingkat_keanggotaan:
            member.tingkat_keanggotaan ||
            member.position ||
            member.tingkatan ||
            '',

          status_anggota: status,
          status,

          kta_status:
            member.kta_status ||
            (member.no_kta || member.nomor_kta ? 'ACTIVE' : 'NOT_CREATED'),

          foto_url:
            member.foto_url ||
            member.photo_url ||
            member.foto ||
            '',

          qr_token:
            member.qr_token || '',

          verification_url:
            member.verification_url ||
            member.qr_url ||
            '',
        } as AdminMemberRecord;
      });

      // GAS adalah source of truth: response kosong berarti UI juga kosong.
      set({
        members: normalizedMembers,
        membersLoading: false,
        membersError: null,
      });

      return normalizedMembers;
    } catch (error: any) {
      const message =
        error?.message ||
        'Tidak dapat mengambil data anggota dari GAS';

      console.error(
        'Gagal memuat admin.member.list dari GAS:',
        error
      );

      // Jangan fallback ke dummy / data browser lama.
      set({
        members: [],
        membersLoading: false,
        membersError: message,
      });

      return [];
    }
  },

  /**
   * Load seluruh read-model Dashboard dari GAS.
   * members tetap dibaca dari admin.member.list.
   * KTA logs / approval / audit dibaca dari admin.dashboard.summary.
   */
  loadDashboardData: async () => {
    set({
      dashboardLoading: true,
      dashboardError: null,
    });

    try {
      const [members, dashboardResponse] = await Promise.all([
        get().loadMembers(),
        apiClient.get<any>('admin.dashboard.summary'),
      ]);

      const envelope =
        dashboardResponse?.data?.data ||
        dashboardResponse?.data ||
        dashboardResponse ||
        {};

      const ktaLogs =
        Array.isArray(envelope?.ktaLogs)
          ? envelope.ktaLogs
          : [];

      const approvals =
        Array.isArray(envelope?.approvals)
          ? envelope.approvals
          : [];

      const changeHistory =
        Array.isArray(envelope?.changeHistory)
          ? envelope.changeHistory
          : [];

      set({
        members,
        ktaLogs,
        approvals,
        changeHistory,
        dashboardLoading: false,
        dashboardError: null,
        dashboardLastSyncedAt:
          envelope?.meta?.generated_at ||
          new Date().toISOString(),
      });

    } catch (error: any) {
      const message =
        error?.message ||
        'Tidak dapat memuat data dashboard dari GAS';

      console.error(
        'Gagal memuat admin.dashboard.summary:',
        error
      );

      // Tidak fallback ke dummy/local.
      set({
        ktaLogs: [],
        approvals: [],
        changeHistory: [],
        dashboardLoading: false,
        dashboardError: message,
      });
    }
  },

  syncMemberUserStatuses: async () => {
    const response = await apiClient.post<any>(
      'admin.member.syncUserStatus',
      {}
    );

    const result =
      response?.data?.data ||
      response?.data ||
      response ||
      {};

    await get().loadDashboardData();

    return {
      scanned: Number(result.scanned || 0),
      eligible: Number(result.eligible || 0),
      activated: Number(result.activated || 0),
      already_active: Number(result.already_active || 0),
      skipped_status: Number(result.skipped_status || 0),
      skipped_email: Number(result.skipped_email || 0),
      user_not_found: Number(result.user_not_found || 0),
      failed: Number(result.failed || 0),
      details: Array.isArray(result.details)
        ? result.details
        : [],
    };
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

  batchGenerateKta: async (memberIds, reason, sessionUserName) => {
    for (const id of memberIds) {
      try {
        await get().activateMember(id, reason, sessionUserName);
      } catch (e) {
        // Continue next
      }
    }
  },
}));
