/** SPWN Apps 2.0 - Commerce & Kedai SAKA API Client */
import { apiClient, ApiResponse } from './apiClient';

export interface Product {
  id:string; sku:string; nama_produk:string; kategori:string; deskripsi:string; harga:number; stok:number;
  berat_gram:number; foto_utama:string; status:'ACTIVE'|'INACTIVE'|'PENDING'|'REJECTED'|string;
  submitted_by?:string; submitted_by_name?:string; submitted_at?:string; review_note?:string;
}
export interface ProductCategory { id:string; nama_kategori:string; deskripsi?:string; total_produk?:number; }
export interface OrderItemInput { product_id:string; quantity:number; }
export interface CheckoutPayload { items:OrderItemInput[]; alamat_pengiriman:string; telepon:string; provinsi_tujuan_id?:string; kurir?:string; ongkos_kirim?:number; catatan?:string; }
export interface OrderDetail { id:string; invoice_number:string; pemesan_id:string; total_harga:number; ongkos_kirim:number; grand_total:number; status:string; resi_pengiriman?:string; alamat_pengiriman:string; telepon:string; items:Array<{product_id:string;nama_produk:string;harga_satuan:number;kuantitas:number;subtotal:number}>; created_at:string; }

const normalizeList=<T,>(response:ApiResponse<any>):ApiResponse<T[]>=>{
  const d:any=response?.data;
  const rows=Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.items)?d.items:Array.isArray(d?.products)?d.products:[];
  return {...response,data:rows as T[]};
};

export const commerceApi={
  listProducts:async(params?:{page?:number;limit?:number;kategori?:string;search?:string}):Promise<ApiResponse<Product[]>>=>normalizeList<Product>(await apiClient.get<any>('commerce.products',params as Record<string,string|number>)),
  getProduct:async(id:string):Promise<ApiResponse<Product>>=>apiClient.get<Product>('commerce.product',{id}),
  createProduct:async(payload:Partial<Product>):Promise<ApiResponse<Product>>=>apiClient.post<Product>('commerce.createProduct',payload as Record<string,unknown>),
  submitProduct:async(payload:Partial<Product>):Promise<ApiResponse<Product>>=>apiClient.post<Product>('commerce.product.submit',payload as Record<string,unknown>),
  listMyProducts:async():Promise<ApiResponse<Product[]>>=>normalizeList<Product>(await apiClient.get<any>('commerce.product.mine')),
  listPendingProducts:async():Promise<ApiResponse<Product[]>>=>normalizeList<Product>(await apiClient.get<any>('commerce.product.pending')),
  reviewProduct:async(id:string,decision:'APPROVE'|'REJECT',note=''):Promise<ApiResponse<Product>>=>apiClient.post<Product>('commerce.product.review',{id,decision,note}),
  listCategories:async():Promise<ApiResponse<ProductCategory[]>>=>normalizeList<ProductCategory>(await apiClient.get<any>('commerce.categories')),
  checkout:async(payload:CheckoutPayload):Promise<ApiResponse<OrderDetail>>=>apiClient.post<OrderDetail>('commerce.order',payload as unknown as Record<string,unknown>),
  getOrderDetail:async(orderId:string):Promise<ApiResponse<OrderDetail>>=>apiClient.get<OrderDetail>('commerce.orderDetail',{order_id:orderId}),
  updateOrderStatus:async(orderId:string,status:string,resi?:string):Promise<ApiResponse<OrderDetail>>=>apiClient.post<OrderDetail>('commerce.updateOrder',{order_id:orderId,status,resi}),
};
