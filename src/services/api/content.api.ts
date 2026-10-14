/**
 * SPWN Apps 2.0 - Content / Warta SAKA API Client (superset)
 * Location: src/services/api/content.api.ts
 *
 * Supports current Warta SAKA endpoints:
 * - content.list
 * - content.detail
 * - content.create
 * - content.approve
 * - content.reject
 *
 * Also preserves legacy helpers for compatibility.
 */

import { apiClient, ApiResponse } from './apiClient';

export interface ContentItem {
  id: string;
  member_id?: string;
  member_name?: string;
  content_type: string;
  title: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface CreateContentPayload {
  member_id: string;
  member_name?: string;
  content_type: string;
  title: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
}

// Legacy interfaces kept so older pages/imports do not break.
export interface Article {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan?: string;
  konten: string;
  penulis_id: string;
  penulis_nama?: string;
  foto_sampul?: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | string;
  published_at?: string;
  views?: number;
}

export interface AgendaEvent {
  id: string;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  provinsi_id: string;
  penyelenggara: string;
  status: string;
}

export interface GalleryItem {
  id: string;
  judul: string;
  url_media: string;
  kategori: string;
  kegiatan_id?: string;
  tanggal_unggah: string;
}

export interface Announcement {
  id: string;
  judul: string;
  isi: string;
  prioritas: 'NORMAL' | 'URGENT';
  berlaku_sampai?: string;
  dibuat_pada: string;
}

function normalizeListResponse<T>(response: ApiResponse<any>): ApiResponse<T[]> {
  const raw = response?.data;
  const rows =
    Array.isArray(raw) ? raw :
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.items) ? raw.items :
    [];

  return {
    ...response,
    data: rows as T[],
  };
}

export const contentApi = {
  // ------------------------------------------------------------------
  // Current Warta SAKA API
  // ------------------------------------------------------------------
  list: async (status: string = ''): Promise<ApiResponse<ContentItem[]>> => {
    const response = await apiClient.get<any>('content.list', status ? { status } : undefined);
    return normalizeListResponse<ContentItem>(response);
  },

  detail: async (contentId: string): Promise<ApiResponse<ContentItem>> => {
    // Existing ContentAdminController.detail reads body.content_id.
    return apiClient.post<ContentItem>('content.detail', { content_id: contentId });
  },

  create: async (payload: CreateContentPayload): Promise<ApiResponse<ContentItem>> => {
    return apiClient.post<ContentItem>('content.create', payload as unknown as Record<string, unknown>);
  },

  approve: async (contentId: string, user?: string): Promise<ApiResponse<unknown>> => {
    return apiClient.post<unknown>('content.approve', {
      content_id: contentId,
      user: user || '',
    });
  },

  reject: async (contentId: string, user?: string): Promise<ApiResponse<unknown>> => {
    return apiClient.post<unknown>('content.reject', {
      content_id: contentId,
      user: user || '',
    });
  },

  // ------------------------------------------------------------------
  // Legacy compatibility API
  // ------------------------------------------------------------------
  listArticles: async (params?: { page?: number; limit?: number; kategori?: string; search?: string }): Promise<ApiResponse<Article[]>> => {
    return apiClient.get<Article[]>('content.articles', params as Record<string, string | number>);
  },

  getArticle: async (idOrSlug: string): Promise<ApiResponse<Article>> => {
    return apiClient.get<Article>('content.article', { slug: idOrSlug });
  },

  createDraft: async (payload: Partial<Article>): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.draft', payload as Record<string, unknown>);
  },

  submitReview: async (id: string): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.submitReview', { id });
  },

  publish: async (id: string): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.publish', { id });
  },

  listEvents: async (params?: { page?: number; limit?: number; provinsi_id?: string }): Promise<ApiResponse<AgendaEvent[]>> => {
    return apiClient.get<AgendaEvent[]>('content.events', params as Record<string, string | number>);
  },

  listGallery: async (params?: { page?: number; limit?: number; kategori?: string }): Promise<ApiResponse<GalleryItem[]>> => {
    return apiClient.get<GalleryItem[]>('content.gallery', params as Record<string, string | number>);
  },

  listAnnouncements: async (): Promise<ApiResponse<Announcement[]>> => {
    return apiClient.get<Announcement[]>('content.announcements');
  },
};
