/**
 * SPWN Apps 2.0 - Content & Publication API Client Module
 * Location: src/services/api/content.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';

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
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
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

export const contentApi = {
  /**
   * Mengambil daftar artikel warta kepariwisataan (hanya PUBLISHED untuk umum)
   */
  listArticles: async (params?: { page?: number; limit?: number; kategori?: string; search?: string }): Promise<ApiResponse<Article[]>> => {
    return apiClient.get<Article[]>('content.articles', params as Record<string, string | number>);
  },

  /**
   * Mengambil detail artikel warta berdasarkan slug atau ID
   */
  getArticle: async (idOrSlug: string): Promise<ApiResponse<Article>> => {
    return apiClient.get<Article>('content.article', { slug: idOrSlug });
  },

  /**
   * Membuat draft artikel warta baru (CONTENT_CREATE)
   */
  createDraft: async (payload: Partial<Article>): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.draft', payload as Record<string, unknown>);
  },

  /**
   * Mengajukan draft warta ke status verifikasi REVIEW
   */
  submitReview: async (id: string): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.submitReview', { id });
  },

  /**
   * Mempublikasikan warta (CONTENT_PUBLISH - Diaudit oleh AuditMiddleware)
   */
  publish: async (id: string): Promise<ApiResponse<Article>> => {
    return apiClient.post<Article>('content.publish', { id });
  },

  /**
   * Mengambil agenda kegiatan Saka Pariwisata se-Indonesia
   */
  listEvents: async (params?: { page?: number; limit?: number; provinsi_id?: string }): Promise<ApiResponse<AgendaEvent[]>> => {
    return apiClient.get<AgendaEvent[]>('content.events', params as Record<string, string | number>);
  },

  /**
   * Mengambil galeri foto kegiatan
   */
  listGallery: async (params?: { page?: number; limit?: number; kategori?: string }): Promise<ApiResponse<GalleryItem[]>> => {
    return apiClient.get<GalleryItem[]>('content.gallery', params as Record<string, string | number>);
  },

  /**
   * Mengambil maklumat dan pengumuman resmi pimpinan
   */
  listAnnouncements: async (): Promise<ApiResponse<Announcement[]>> => {
    return apiClient.get<Announcement[]>('content.announcements');
  }
};
