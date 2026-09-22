/**
 * SPWN Apps 2.0 - Commerce & Kedai SAKA API Client Module
 * Location: src/services/api/commerce.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';

export interface Product {
  id: string;
  sku: string;
  nama_produk: string;
  kategori: string;
  deskripsi: string;
  harga: number;
  stok: number;
  berat_gram: number;
  foto_utama: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductCategory {
  id: string;
  nama_kategori: string;
  deskripsi?: string;
  total_produk?: number;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: OrderItemInput[];
  alamat_pengiriman: string;
  telepon: string;
  provinsi_tujuan_id?: string;
  kurir?: string;
  ongkos_kirim?: number;
  catatan?: string;
}

export interface OrderDetail {
  id: string;
  invoice_number: string;
  pemesan_id: string;
  total_harga: number;
  ongkos_kirim: number;
  grand_total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  resi_pengiriman?: string;
  alamat_pengiriman: string;
  telepon: string;
  items: Array<{
    product_id: string;
    nama_produk: string;
    harga_satuan: number;
    kuantitas: number;
    subtotal: number;
  }>;
  created_at: string;
}

export const commerceApi = {
  /**
   * Mengambil etalase produk aktif dan tersedia stok
   */
  listProducts: async (params?: { page?: number; limit?: number; kategori?: string; search?: string }): Promise<ApiResponse<Product[]>> => {
    return apiClient.get<Product[]>('commerce.products', params as Record<string, string | number>);
  },

  /**
   * Mengambil detail spesifikasi dan ketersediaan stok SKU produk
   */
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get<Product>('commerce.product', { id });
  },

  /**
   * Membuat produk baru (COMMERCE_MANAGE)
   */
  createProduct: async (payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiClient.post<Product>('commerce.createProduct', payload as Record<string, unknown>);
  },

  /**
   * Mengambil daftar kategori produk kedai
   */
  listCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    return apiClient.get<ProductCategory[]>('commerce.categories');
  },

  /**
   * Melakukan pemesanan barang / Checkout (COMMERCE_BUY)
   */
  checkout: async (payload: CheckoutPayload): Promise<ApiResponse<OrderDetail>> => {
    return apiClient.post<OrderDetail>('commerce.order', payload as unknown as Record<string, unknown>);
  },

  /**
   * Mengambil rincian invoice dan status pesanan
   */
  getOrderDetail: async (orderId: string): Promise<ApiResponse<OrderDetail>> => {
    return apiClient.get<OrderDetail>('commerce.orderDetail', { order_id: orderId });
  },

  /**
   * Memperbarui status pesanan (COMMERCE_MANAGE - Diaudit oleh AuditMiddleware)
   */
  updateOrderStatus: async (orderId: string, status: string, resi?: string): Promise<ApiResponse<OrderDetail>> => {
    return apiClient.post<OrderDetail>('commerce.updateOrder', { order_id: orderId, status, resi });
  }
};
