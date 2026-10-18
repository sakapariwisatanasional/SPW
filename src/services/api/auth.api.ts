/**
 * SPWN Apps 2.0 - Auth API Client Module FINAL v4
 *
 * Location:
 * src/services/api/auth.api.ts
 *
 * Patch:
 * - Support GAS response with memberProfile
 * - Preserve member database fields from Sheet Anggota
 * - Normalize login response
 */

import { apiClient, ApiResponse } from './apiClient';


export interface MemberProfile {

  id?: string;

  no_kta?: string;

  full_name?: string;

  email?: string;

  phone?: string;

  province?: string;

  city?: string;

  district?: string;

  position?: string;

  krida?: string;

  status?: string;

  photo_url?: string;

  verification_url?: string;

  qr_token?: string;

}



export interface SpwnUser {

  id: string;

  no_kta?: string;

  nama?: string;

  full_name?: string;

  nama_lengkap?: string;

  nomor_kta?: string;

  nomorKTA?: string;

  email?: string;

  username?: string;

  role: string;

  status?: string;

  tingkatan?: string;

  krida?: string;

  provinsi_id?: string;

  kwartir_daerah?: string;

  foto?: string;

  permissions: string[];

  /**
   * Data utama anggota dari Sheet Anggota GAS
   */
  memberProfile?: MemberProfile | null;

}



export interface OtpRequestResponse { requested: boolean; message?: string }
export interface OtpVerifyResponse { token?: string; user?: SpwnUser; expiresAt?: string; verificationToken?: string; verified?: boolean; email?: string }

export interface MeResponseData {

  user: SpwnUser;

  role:string;

  permissions:string[];

  serverTime:string;

}



export const authApi = {
  requestOtp: async (email: string, purpose: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<ApiResponse<OtpRequestResponse>> => {
    return apiClient.post<OtpRequestResponse>('auth.otp.request', { email: email.trim().toLowerCase(), purpose }, undefined, { token: null });
  },
  verifyOtp: async (email: string, otp: string, purpose: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<ApiResponse<OtpVerifyResponse>> => {
    return apiClient.post<OtpVerifyResponse>('auth.otp.verify', { email: email.trim().toLowerCase(), otp: otp.trim(), purpose }, undefined, { token: null });
  },


  me: async(
    userId:string
  ):Promise<ApiResponse<MeResponseData>>=>{


    return apiClient.post<MeResponseData>(
      'auth.me',
      {
        user_id:userId
      }
    );

  },



  logout: async(
    userId:string
  ):Promise<ApiResponse<{loggedOut:boolean}>>=>{


    return apiClient.post<{loggedOut:boolean}>(
      'auth.logout',
      {
        user_id:userId
      }
    );

  },

};
