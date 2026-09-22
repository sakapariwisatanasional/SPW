/**
 * SPWN Apps 2.0 - Auth API Client Module
 * Location: src/services/api/auth.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';

export interface SpwnUser {
  id: string;
  no_kta: string;
  nama: string;
  email?: string;
  role: string;
  tingkatan: string;
  krida: string;
  provinsi_id: string;
  kwartir_daerah?: string;
  foto?: string;
  permissions: string[];
}

export interface LoginPayload {
  username?: string;
  no_kta?: string;
  email?: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: SpwnUser;
  expiresAt: string;
}

export interface MeResponseData {
  user: SpwnUser;
  role: string;
  permissions: string[];
  serverTime: string;
}

export const authApi = {
  /**
   * Otentikasi kredensial pengguna
   */
  login: async (credentials: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient.post<LoginResponseData>('auth.login', credentials as unknown as Record<string, unknown>);
  },

  /**
   * Mengambil data profil dan permission sesi aktif
   */
  me: async (): Promise<ApiResponse<MeResponseData>> => {
    return apiClient.get<MeResponseData>('auth.me');
  },

  /**
   * Mengakhiri sesi pengguna
   */
  logout: async (): Promise<ApiResponse<{ loggedOut: boolean }>> => {
    return apiClient.post<{ loggedOut: boolean }>('auth.logout');
  }
};
