/**
 * SPWN Apps 2.0 - Member API Client Module
 * Location: src/services/api/member.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';
import { SpwnUser } from './auth.api';

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
  nik: string;
  email?: string;
  telepon?: string;
  provinsi_id: string;
  kwartir_cabang?: string;
  tingkatan: string;
  krida?: string;
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
    return apiClient.get<SpwnUser[]>('member.list', params as Record<string, string | number>);
  },

  /**
   * Mengambil detail profil anggota berdasarkan ID atau no_kta
   */
  detail: async (idOrNoKta: string): Promise<ApiResponse<SpwnUser>> => {
    return apiClient.get<SpwnUser>('member.detail', { id: idOrNoKta });
  },

  /**
   * Mendaftarkan anggota baru
   */
  register: async (payload: RegisterMemberPayload): Promise<ApiResponse<SpwnUser>> => {
    return apiClient.post<SpwnUser>('member.register', payload as unknown as Record<string, unknown>);
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
