/**
 * SPWN Apps 2.0 - Auth API Client Module FINAL
 *
 * Location:
 * src/services/api/auth.api.ts
 *
 * Perbaikan:
 * - Menyesuaikan response GAS:
 *   data langsung berisi user atau
 *   data berisi { user, token, expiresAt }
 * - Normalisasi agar frontend selalu mendapatkan user.permissions
 */

import { apiClient, ApiResponse } from './apiClient';


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

  tingkatan?: string;

  krida?: string;

  provinsi_id?: string;

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

  token?: string;

  user: SpwnUser;

  expiresAt?: string;

}



export interface MeResponseData {

  user: SpwnUser;

  role: string;

  permissions: string[];

  serverTime: string;

}



function normalizeLoginResponse(
  response:any
):any{


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


  login: async (

    credentials: LoginPayload

  ): Promise<ApiResponse<LoginResponseData>> => {


    const response =
      await apiClient.post<LoginResponseData>(

        'auth.login',

        credentials

      );


    return normalizeLoginResponse(response);

  },





  me: async (

    userId:string

  ):Promise<ApiResponse<MeResponseData>> => {


    return apiClient.post<MeResponseData>(

      'auth.me',

      {

        user_id:userId

      }

    );


  },





  logout: async (

    userId:string

  ):Promise<ApiResponse<{loggedOut:boolean}>> => {


    return apiClient.post<{loggedOut:boolean}>(

      'auth.logout',

      {

        user_id:userId

      }

    );


  }


};
