/**
 * SPWN Apps 2.0 - Content / Warta SAKA API Client (superset)
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
  member_id?: string;
  member_name?: string;
  content_type?: string;
  title?: string;
  description?: string;
  caption?: string;
  url?: string;
  thumbnail_url?: string;
}

export interface Article {
  id: string; judul: string; slug: string; kategori: string; ringkasan?: string;
  konten: string; penulis_id: string; penulis_nama?: string; foto_sampul?: string;
  status: string; published_at?: string; views?: number;
}
export interface AgendaEvent { id:string; nama_kegiatan:string; deskripsi:string; tanggal_mulai:string; tanggal_selesai:string; lokasi:string; provinsi_id:string; penyelenggara:string; status:string; }
export interface GalleryItem { id:string; judul:string; url_media:string; kategori:string; kegiatan_id?:string; tanggal_unggah:string; }
export interface Announcement { id:string; judul:string; isi:string; prioritas:'NORMAL'|'URGENT'; berlaku_sampai?:string; dibuat_pada:string; }

const normalizeListResponse = <T,>(response: ApiResponse<any>): ApiResponse<T[]> => {
  const raw:any = response?.data;
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  return { ...response, data: rows as T[] };
};

export const contentApi = {
  // Public: backend always exposes APPROVED only.
  list: async (): Promise<ApiResponse<ContentItem[]>> => normalizeListResponse<ContentItem>(await apiClient.get<any>('content.list')),

  listMine: async (): Promise<ApiResponse<ContentItem[]>> => normalizeListResponse<ContentItem>(await apiClient.get<any>('content.mine')),

  listPending: async (): Promise<ApiResponse<ContentItem[]>> => normalizeListResponse<ContentItem>(await apiClient.get<any>('content.pending')),

  detail: async (contentId: string): Promise<ApiResponse<ContentItem>> => apiClient.post<ContentItem>('content.detail', { content_id: contentId }),

  create: async (payload: CreateContentPayload): Promise<ApiResponse<ContentItem>> =>
    apiClient.post<ContentItem>('content.create', payload as Record<string, unknown>),

  previewLink: async (url: string): Promise<ApiResponse<{ url: string; title: string; description: string; thumbnail_url: string }>> =>
    apiClient.post<{ url: string; title: string; description: string; thumbnail_url: string }>('content.preview', { url }),

  uploadThumbnail: async (payload: { file_name: string; mime_type: string; base64_data: string }): Promise<ApiResponse<{ thumbnail_url: string; drive_file_id: string }>> =>
    apiClient.post<{ thumbnail_url: string; drive_file_id: string }>('content.uploadThumbnail', payload as unknown as Record<string, unknown>),

  submitLink: async (url: string, caption = '', contentType = 'BERITA'): Promise<ApiResponse<ContentItem>> =>
    apiClient.post<ContentItem>('content.create', {
      url,
      caption,
      description: caption,
      content_type: contentType,
    }),

  update: async (contentId: string, payload: { url: string; caption?: string; description?: string; content_type?: string }): Promise<ApiResponse<ContentItem>> =>
    apiClient.post<ContentItem>('content.update', {
      content_id: contentId,
      ...payload,
    }),

  delete: async (contentId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('content.delete', { content_id: contentId }),

  approve: async (contentId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('content.approve', { content_id: contentId }),

  reject: async (contentId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post<unknown>('content.reject', { content_id: contentId }),

  // Legacy compatibility
  listArticles: async (params?: { page?:number; limit?:number; kategori?:string; search?:string }): Promise<ApiResponse<Article[]>> => apiClient.get<Article[]>('content.articles', params as Record<string,string|number>),
  getArticle: async (idOrSlug:string):Promise<ApiResponse<Article>> => apiClient.get<Article>('content.article',{slug:idOrSlug}),
  createDraft: async (payload:Partial<Article>):Promise<ApiResponse<Article>> => apiClient.post<Article>('content.draft',payload as Record<string,unknown>),
  submitReview: async (id:string):Promise<ApiResponse<Article>> => apiClient.post<Article>('content.submitReview',{id}),
  publish: async (id:string):Promise<ApiResponse<Article>> => apiClient.post<Article>('content.publish',{id}),
  listEvents: async (params?:{page?:number;limit?:number;provinsi_id?:string}):Promise<ApiResponse<AgendaEvent[]>> => apiClient.get<AgendaEvent[]>('content.events',params as Record<string,string|number>),
  listGallery: async (params?:{page?:number;limit?:number;kategori?:string}):Promise<ApiResponse<GalleryItem[]>> => apiClient.get<GalleryItem[]>('content.gallery',params as Record<string,string|number>),
  listAnnouncements: async ():Promise<ApiResponse<Announcement[]>> => apiClient.get<Announcement[]>('content.announcements'),
};
