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
   * Verifikasi QR Token KTA secara publik (Rate Limited)
   */
  verifyQr: async (token: string): Promise<ApiResponse<QrVerificationResult>> => {
    return apiClient.get<QrVerificationResult>('verify.kta', { token });
  },

  /**
   * Verifikasi internal KTA via Nomor KTA (Khusus Admin / Pengurus Berizin)
   */
  verifyInternal: async (noKta: string): Promise<ApiResponse<QrVerificationResult>> => {
    return apiClient.get<QrVerificationResult>('verify.internal', { no_kta: noKta });
  }
};
