/**
 * SPWN Apps 2.0
 * Content API Client Module
 *
 * Location:
 * src/services/api/content.api.ts
 *
 * Frontend Hardening:
 * - Sesuai Content Management Backend Phase 5B
 * - content.list
 * - content.detail
 * - content.create
 * - content.approve
 * - content.reject
 */

import { apiClient, ApiResponse } from './apiClient';


export interface ContentItem {
  id:string;
  member_id?:string;
  member_name?:string;
  content_type:string;
  title:string;
  description?:string;
  url?:string;
  thumbnail_url?:string;
  status:string;
  created_at?:string;
  updated_at?:string;
  approved_by?:string;
  approved_at?:string;
}


export interface CreateContentPayload {
  member_id:string;
  member_name?:string;
  content_type:string;
  title:string;
  description?:string;
  url?:string;
  thumbnail_url?:string;
}


export const contentApi = {

  list: async(
    status:string = ''
  ):Promise<ApiResponse<ContentItem[]>>=>{

    return apiClient.post<ContentItem[]>(
      'content.list',
      {
        query:{
          status
        }
      }
    );

  },


  detail: async(
    contentId:string
  ):Promise<ApiResponse<ContentItem>>=>{

    return apiClient.post<ContentItem>(
      'content.detail',
      {
        content_id: contentId
      }
    );

  },


  create: async(
    payload:CreateContentPayload
  ):Promise<ApiResponse<ContentItem>>=>{

    return apiClient.post<ContentItem>(
      'content.create',
      payload
    );

  },


  approve: async(
    contentId:string,
    user:string
  ):Promise<ApiResponse<any>>=>{

    return apiClient.post(
      'content.approve',
      {
        content_id: contentId,
        user
      }
    );

  },


  reject: async(
    contentId:string,
    user:string
  ):Promise<ApiResponse<any>>=>{

    return apiClient.post(
      'content.reject',
      {
        content_id: contentId,
        user
      }
    );

  }

};
