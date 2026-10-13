// member.api.ts
// SPWN Apps 2.0 Frontend Hardening
// Replace existing src/services/api/member.api.ts

import { apiClient, ApiResponse } from './apiClient';
import { SpwnUser } from './auth.api';

export function normalizeMemberKtaData(member:any){
  return {
    ...member,
    fullName: member.fullName || member.full_name || member.nama || '',
    nationalMemberNumber: member.nationalMemberNumber || member.no_kta || member.nomor_kta || '',
    photoUrl: member.photoUrl || member.photo_url || member.foto || '',
    status: member.status || ''
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
    const response = await apiClient.post<any[]>('member.list',{
      query: params || {}
    });

    return {
      ...response,
      data:Array.isArray(response.data)
        ? response.data.map(normalizeMemberKtaData) as SpwnUser[]
        : response.data
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

    return {
      ...response,
      data:response.data
        ? normalizeMemberKtaData(response.data) as SpwnUser
        : response.data
    };
  },

  approval: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.approval',{
      body:{
        member_id:memberId
      }
    });
  },

  reject: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.reject',{
      body:{
        member_id:memberId
      }
    });
  },

  generateKta: async(memberId:string):Promise<ApiResponse<any>>=>{
    return apiClient.post('member.generate_kta',{
      body:{
        member_id:memberId
      }
    });
  }

};
