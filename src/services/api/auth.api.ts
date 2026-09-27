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



export interface LoginPayload {

  username?: string;

  no_kta?: string;

  email?: string;

  password:string;

}



export interface LoginResponseData {

  token?: string;

  user: SpwnUser;

  expiresAt?: string;

}



export interface MeResponseData {

  user: SpwnUser;

  role:string;

  permissions:string[];

  serverTime:string;

}



function normalizeLoginResponse(response:any):any {


  if(
    response &&
    response.data &&
    response.data.user
  ){

    return response;

  }



  if(
    response &&
    response.data
  ){

    return {

      ...response,

      data:{

        token:
          response.data.token,

        expiresAt:
          response.data.expiresAt,


        user:
          response.data

      }

    };

  }


  return response;

}



export const authApi = {


  login: async(
    credentials:LoginPayload
  ):Promise<ApiResponse<LoginResponseData>>=>{


    const response =
      await apiClient.post<LoginResponseData>(
        'auth.login',
        credentials
      );


    return normalizeLoginResponse(response);

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

  }


};
