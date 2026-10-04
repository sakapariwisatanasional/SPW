/**
 * SPWN Apps 2.0 - Verification API Client Module
 * Location: src/services/api/verification.api.ts
 */

import { apiClient, ApiResponse } from './apiClient';

export interface QrVerificationResult {
  isValid: boolean;
  no_kta?: string;
  nomor_kta?: string;
  nama?: string;
  full_name?: string;
  nama_lengkap?: string;
  tingkatan?: string;
  krida?: string;
  kwartir_daerah?: string;
  status?: string;
  foto?: string;
  verifiedAt: string;
  message?: string;
  qr_token?: string;
  qr_url?: string;
  qr_scan_count?: number;
  qr_last_verified_at?: string;
}

export const verificationApi = {
  /**
   * Verifikasi QR Token KTA secara publik
   */
  verifyQr: async (
    token: string
  ): Promise<ApiResponse<QrVerificationResult>> => {
    const response = await apiClient.post<QrVerificationResult>('verify.qr', {
      qr_token: token.trim(),
    });
    // API transport dapat mengembalikan HTTP 200 tetapi data.success=false.
    const envelope = response as any;
    if (envelope.success === false || envelope.data?.success === false) {
      throw new Error(envelope.data?.message || envelope.message || 'Verifikasi QR ditolak backend');
    }
    return response;
  },

  /**
   * Verifikasi internal KTA melalui nomor KTA
   */
  verifyInternal: async (
    noKta: string
  ): Promise<ApiResponse<QrVerificationResult>> => {
    const response = await apiClient.post<QrVerificationResult>('verify.kta', {
      nomor_kta: noKta.trim(),
    });
    const envelope = response as any;
    if (envelope.success === false || envelope.data?.success === false) {
      throw new Error(envelope.data?.message || envelope.message || 'Verifikasi nomor KTA ditolak backend');
    }
    return response;
  }
};
