// member.api.ts
// SPWN Apps 2.0 - member.list nested response normalization

import { apiClient, ApiResponse } from './apiClient';
import { SpwnUser } from './auth.api';

export function normalizeMemberKtaData(member:any){
  return {
    ...member,
    fullName:
      member?.fullName ||
      member?.full_name ||
      member?.nama_lengkap ||
      member?.nama ||
      '',
    nationalMemberNumber:
      member?.nationalMemberNumber ||
      member?.nomor_kta ||
      member?.no_kta ||
      '',
    photoUrl:
      member?.photoUrl ||
      member?.foto_url ||
      member?.photo_url ||
      member?.foto ||
      '',
    status:
      member?.kta_status ||
      member?.status_anggota ||
      member?.status ||
      ''
  };
}

export interface MemberListParams {
  page?:number;
  limit?:number;
  search?:string;
  status?:string;
}

export const memberApi = {

  list: async(params?:MemberListParams):Promise<ApiResponse<SpwnUser[]>>=>{
    const response = await apiClient.post<any>('member.list',{
      query: params || {}
    });

    /*
     * Backend member.list saat ini mengembalikan:
     * response.data = {
     *   data: [...],
     *   pagination: {...}
     * }
     *
     * Versi lama hanya mengecek Array.isArray(response.data),
     * sehingga hasil sukses dianggap bukan array.
     */
    const raw =
      Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray((response as any)?.data?.members)
        ? (response as any).data.members
        : Array.isArray((response as any)?.members)
        ? (response as any).members
        : [];

    return {
      ...response,
      data: raw.map(normalizeMemberKtaData) as SpwnUser[]
    };
  },

  detail: async(
    identity:string,
    aliases?:{
      member_id?:string;
      nomor_kta?:string;
      no_kta?:string;
      email?:string;
      user_id?:string;
    }
  ):Promise<ApiResponse<SpwnUser>>=>{
    const response = await apiClient.post<any>('member.detail',{
      body:{
        member_id:
          aliases?.member_id ||
          identity,
        nomor_kta:
          aliases?.nomor_kta ||
          '',
        no_kta:
          aliases?.no_kta ||
          '',
        email:
          aliases?.email ||
          '',
        user_id:
          aliases?.user_id ||
          ''
      }
    });

    const raw =
      response?.data?.data ??
      response?.data ??
      null;

    return {
      ...response,
      data: raw
        ? normalizeMemberKtaData(raw) as SpwnUser
        : raw
    };
  },

  approval: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.approval',{
      body:{ member_id:memberId }
    });
  },

  reject: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.reject',{
      body:{ member_id:memberId }
    });
  },

  generateKta: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.generate_kta',{
      body:{ member_id:memberId }
    });
  }

};
