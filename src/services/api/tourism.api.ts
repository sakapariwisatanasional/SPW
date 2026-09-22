/**
 * SPWN Apps 2.0 - Tourism API Client Module
 * Location: src/services/api/tourism.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';

export interface SaptaPesonaScores {
  aman?: number;
  tertib?: number;
  bersih?: number;
  sejuk?: number;
  indah?: number;
  ramah?: number;
  kenangan?: number;
  rata_rata?: number;
}

export interface Destination {
  id: string;
  nama_destinasi: string;
  kategori: string;
  deskripsi: string;
  provinsi_id: string;
  lokasi: string;
  koordinat?: string;
  foto_utama: string;
  rating_rata_rata?: number;
  jumlah_ulasan?: number;
  sapta_pesona?: SaptaPesonaScores;
  status: string;
}

export interface DestinationFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  provinsi_id?: string;
  kategori?: string;
}

export interface ReviewPayload {
  destinasi_id: string;
  rating: number;
  komentar: string;
  aman?: number;
  tertib?: number;
  bersih?: number;
  sejuk?: number;
  indah?: number;
  ramah?: number;
  kenangan?: number;
  nama_pengulas?: string;
}

export interface TourPackage {
  id: string;
  destinasi_id: string;
  nama_paket: string;
  deskripsi: string;
  durasi: string;
  harga: number;
  kuota_min: number;
  krida_fokus: string;
}

export interface TourismPartner {
  id: string;
  nama_mitra: string;
  jenis_mitra: string;
  kontak_person: string;
  telepon: string;
  provinsi_id: string;
  status: string;
}

export const tourismApi = {
  /**
   * Mengambil daftar destinasi wisata aktif
   */
  listDestinations: async (params?: DestinationFilterParams): Promise<ApiResponse<Destination[]>> => {
    return apiClient.get<Destination[]>('tourism.destinations', params as Record<string, string | number>);
  },

  /**
   * Mengambil detail destinasi beserta skor evaluasi Sapta Pesona
   */
  getDestination: async (id: string): Promise<ApiResponse<Destination>> => {
    return apiClient.get<Destination>('tourism.destination', { id });
  },

  /**
   * Mendaftarkan destinasi wisata binaan baru (RequireAuth: TOURISM_MANAGE)
   */
  createDestination: async (payload: Partial<Destination>): Promise<ApiResponse<Destination>> => {
    return apiClient.post<Destination>('tourism.createDestination', payload as Record<string, unknown>);
  },

  /**
   * Mengambil daftar paket wisata & edukasi krida
   */
  listPackages: async (destinasiId?: string): Promise<ApiResponse<TourPackage[]>> => {
    return apiClient.get<TourPackage[]>('tourism.packages', { destinasi_id: destinasiId });
  },

  /**
   * Mengirimkan ulasan & skor Sapta Pesona (Dual-Gate: Member atau Public ber-rate limit)
   */
  submitReview: async (payload: ReviewPayload): Promise<ApiResponse<unknown>> => {
    return apiClient.post<unknown>('tourism.review', payload as unknown as Record<string, unknown>);
  },

  /**
   * Mengambil daftar mitra desa wisata dan Pokdarwis
   */
  listPartners: async (provinsiId?: string): Promise<ApiResponse<TourismPartner[]>> => {
    return apiClient.get<TourismPartner[]>('tourism.partners', { provinsi_id: provinsiId });
  }
};
