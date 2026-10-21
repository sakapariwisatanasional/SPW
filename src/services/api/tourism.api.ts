/** SPWN Apps 2.0 - Tourism API Client */
import { apiClient, ApiResponse } from './apiClient';

export interface Destination { id:string; nama_destinasi:string; kategori?:string; lokasi?:string; deskripsi?:string; foto_utama?:string; rating?:number; harga_mulai?:number; status?:string; [key:string]:unknown; }
export interface TourPackage {
  id:string; nama_paket:string; deskripsi?:string; harga?:number; durasi?:string; lokasi?:string;
  kontak?:string; url?:string; foto_utama?:string; status?:string; submitted_by?:string;
  submitted_by_name?:string; submitted_at?:string; review_note?:string; [key:string]:unknown;
}
export interface TourismPartner { id:string; nama?:string; name?:string; [key:string]:unknown; }

const normalizeList = <T,>(response: ApiResponse<any>): ApiResponse<T[]> => {
  const d:any=response?.data;
  const rows=Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.items)?d.items:[];
  return {...response,data:rows as T[]};
};

export const tourismApi = {
  listDestinations: async (params?:Record<string,string|number>):Promise<ApiResponse<Destination[]>> => normalizeList<Destination>(await apiClient.get<any>('tourism.destinations',params)),
  getDestination: async (id:string):Promise<ApiResponse<Destination>> => apiClient.get<Destination>('tourism.destination',{id}),
  createDestination: async (payload:Partial<Destination>):Promise<ApiResponse<Destination>> => apiClient.post<Destination>('tourism.createDestination',payload as Record<string,unknown>),
  listPackages: async (params?:Record<string,string|number>):Promise<ApiResponse<TourPackage[]>> => normalizeList<TourPackage>(await apiClient.get<any>('tourism.packages',params)),
  uploadThumbnail: async (payload: { file_name: string; mime_type: string; base64_data: string }): Promise<ApiResponse<{ thumbnail_url: string; drive_file_id: string }>> =>
    apiClient.post<{ thumbnail_url: string; drive_file_id: string }>('content.uploadThumbnail', payload as unknown as Record<string, unknown>),
  submitPackage: async (payload:Partial<TourPackage>):Promise<ApiResponse<TourPackage>> => apiClient.post<TourPackage>('tourism.package.submit',payload as Record<string,unknown>),
  listMyPackages: async ():Promise<ApiResponse<TourPackage[]>> => normalizeList<TourPackage>(await apiClient.get<any>('tourism.package.mine')),
  listPendingPackages: async ():Promise<ApiResponse<TourPackage[]>> => normalizeList<TourPackage>(await apiClient.get<any>('tourism.package.pending')),
  reviewPackage: async (id:string,decision:'APPROVE'|'REJECT',note=''):Promise<ApiResponse<TourPackage>> => apiClient.post<TourPackage>('tourism.package.review',{id,decision,note}),
  submitReview: async (payload:Record<string,unknown>):Promise<ApiResponse<any>> => apiClient.post<any>('tourism.review',payload),
  listPartners: async (params?:Record<string,string|number>):Promise<ApiResponse<TourismPartner[]>> => normalizeList<TourismPartner>(await apiClient.get<any>('tourism.partners',params)),
};
