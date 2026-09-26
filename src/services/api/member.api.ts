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

  detail: async(memberId:string):Promise<ApiResponse<SpwnUser>>=>{
    const response = await apiClient.post<any>('member.detail',{
      body:{
        member_id:memberId
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
