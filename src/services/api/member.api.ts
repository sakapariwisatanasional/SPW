/**
 * SPWN Apps 2.0 - Member API Client Module
 * Location: src/services/api/member.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';
import { SpwnUser } from './auth.api';


/**
 * Adapter response MEMBER API -> format KTA Renderer
 * Menyamakan snake_case dari GAS dengan camelCase frontend KTA.
 */
export function normalizeMemberKtaData(member: any) {
  return {
    ...member,
    fullName: member.fullName || member.full_name || member.nama || member.nama_lengkap || '',
    nationalMemberNumber:
      member.nationalMemberNumber || member.no_kta || member.nomor_kta || '',
    photoUrl: member.photoUrl || member.photo_url || member.foto || '',
    membershipLevel:
      member.membershipLevel || member.position || member.tingkatan || '',
    currentPosition:
      member.currentPosition || member.position || member.tingkatan || '',
    krida: member.krida || '',
    province: member.province || member.provinsi_id || '',
    city: member.city || member.kwartir_daerah || '',
    district: member.district || '',
    status: member.status || '',
  };
}


export interface MemberListParams {
  page?: number;
  limit?: number;
  search?: string;
  provinsi_id?: string;
  tingkatan?: string;
  status?: string;
}

export interface RegisterMemberPayload {
  nama_lengkap: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P' | string;
  golongan_darah?: string;
  nik?: string;
  email?: string;
  telepon?: string;
  nomor_telepon?: string;
  alamat_domisili?: string;
  provinsi_id: string;
  provinsi_nama?: string;
  kabupaten_id?: string;
  kabupaten_nama?: string;
  kecamatan_id?: string;
  wilayah_kecamatan_id?: string;
  wilayah_kecamatan_nama?: string;
  pangkalan_gudep?: string;
  kwartir_cabang?: string;
  kwartir_ranting?: string;
  tingkatan?: string;
  tingkat_keanggotaan?: string;
  krida?: string;
  krida_id?: string;
  level_organisasi?: string;
  foto_url?: string;
  is_public?: boolean;
  source?: string;
}

export interface UpdateMemberPayload {
  id: string;
  nama_lengkap?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  foto?: string;
  krida?: string;
}

export const memberApi = {
  /**
   * Mengambil daftar anggota terpaginasi
   */
  list: async (params?: MemberListParams): Promise<ApiResponse<SpwnUser[]>> => {
    const response = await apiClient.get<any[]>('member.list', params as Record<string, string | number>);

    return {
      ...response,
      data: Array.isArray(response.data)
        ? response.data.map(normalizeMemberKtaData) as SpwnUser[]
        : response.data,
    };
  },

  /**
   * Mengambil detail profil anggota berdasarkan ID atau no_kta
   */
  detail: async (idOrNoKta: string): Promise<ApiResponse<SpwnUser>> => {
    const response = await apiClient.get<any>('member.detail', { id: idOrNoKta });

    return {
      ...response,
      data: response.data ? normalizeMemberKtaData(response.data) as SpwnUser : response.data,
    };
  },

  /**
   * Mendaftarkan anggota baru ke backend dan Google Spreadsheet
   */
  register: async (payload: RegisterMemberPayload): Promise<ApiResponse<SpwnUser>> => {
    return apiClient.post<SpwnUser>('member.register', {
      ...payload,
      is_public: payload.is_public !== undefined ? payload.is_public : true,
      source: payload.source || 'PUBLIC_REGISTER',
    } as unknown as Record<string, unknown>);
  },

  /**
   * Memperbarui data anggota
   */
  update: async (payload: UpdateMemberPayload): Promise<ApiResponse<SpwnUser>> => {
    return apiClient.post<SpwnUser>('member.update', payload as unknown as Record<string, unknown>);
  },

  /**
   * Menonaktifkan anggota (Super Admin / Admin Pusat)
   */
  deactivate: async (id: string, reason: string): Promise<ApiResponse<SpwnUser>> => {
    return apiClient.post<SpwnUser>('member.deactivate', { id, reason });
  },

  /**
   * Koreksi dan pembaruan profil anggota oleh Admin (dengan alasan audit)
   */
  adminUpdate: async (
    memberId: string,
    updates: Record<string, unknown>,
    reason: string
  ): Promise<ApiResponse<{ memberId: string; modifiedFields: string[] }>> => {
    return apiClient.post<{ memberId: string; modifiedFields: string[] }>('admin.member.update', {
      member_id: memberId,
      updates,
      reason,
    });
  },

  /**
   * Reset kata sandi anggota oleh Admin
   */
  adminResetPassword: async (
    memberId: string,
    temporaryPassword?: string,
    reason?: string
  ): Promise<ApiResponse<{ memberId: string; temporaryPassword: string }>> => {
    return apiClient.post<{ memberId: string; temporaryPassword: string }>('admin.member.resetPassword', {
      member_id: memberId,
      temporary_password: temporaryPassword,
      reason,
    });
  },

  /**
   * Daftar penunjukan admin berjenjang (Nasional, Provinsi, Kab/Kota, Kecamatan, Pangkalan)
   */
  listAppointments: async (params?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> => {
    return apiClient.get<unknown[]>('admin.assignment.list', params as Record<string, string | number>);
  },

  /**
   * Penunjukan admin berjenjang baru oleh Super Admin
   */
  assignAdmin: async (payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    return apiClient.post<unknown>('admin.assignment.create', payload);
  },

  /**
   * Pencabutan SK penunjukan admin oleh Super Admin
   */
  revokeAdmin: async (appointmentId: string, reason: string): Promise<ApiResponse<unknown>> => {
    return apiClient.post<unknown>('admin.assignment.revoke', {
      appointment_id: appointmentId,
      reason,
    });
  },

  /**
   * Reset kata sandi admin berjenjang oleh Super Admin
   */
  resetAdminPassword: async (
    appointmentId: string,
    temporaryPassword?: string,
    reason?: string
  ): Promise<ApiResponse<{ appointmentId: string; temporaryPassword: string }>> => {
    return apiClient.post<{ appointmentId: string; temporaryPassword: string }>('admin.assignment.resetPassword', {
      appointment_id: appointmentId,
      temporary_password: temporaryPassword,
      reason,
    });
  },
};
