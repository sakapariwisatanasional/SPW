/**
 * SPWN Apps 2.0 - Verification Store (production-safe)
 * Verifikasi hanya lewat API publik; tanpa mock, tanpa adminStore fallback.
 * Lokasi: src/stores/verificationStore.ts
 */
import { create } from 'zustand';
import { verificationApi, QrVerificationResult } from '../services/api/verification.api';

interface VerificationState {
  qrToken: string;
  isScanning: boolean;
  isLoading: boolean;
  isRateLimited: boolean;
  result: QrVerificationResult | null;
  error: string | null;
  history: Array<{ token: string; nama?: string; no_kta?: string; isValid: boolean; timestamp: string }>;
  setQrToken: (token: string) => void;
  setScanning: (value: boolean) => void;
  resetVerification: () => void;
  verifyToken: (token: string) => Promise<QrVerificationResult | null>;
  verifyManualKta: (noKta: string) => Promise<QrVerificationResult | null>;
}

function normalizeScanned(value: string): string {
  const raw = String(value || '').trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return raw;
    const fromQuery = url.searchParams.get('token') || url.searchParams.get('verifyId');
    if (fromQuery) return fromQuery.trim();
    const path = url.pathname.match(/\/(?:verifikasi|verify)\/([^/]+)\/?$/i);
    return path ? decodeURIComponent(path[1]).trim() : raw;
  } catch { return raw; }
}

function normalizedResult(response: any): QrVerificationResult {
  const body = response?.data;
  const data = body?.data && typeof body.data === 'object' ? body.data : body;
  if (response?.success === false || body?.success === false || !data || typeof data.isValid !== 'boolean') {
    throw new Error(body?.message || response?.message || 'Backend tidak mengembalikan hasil verifikasi yang valid');
  }
  return {
    ...data,
    no_kta: data.no_kta || data.nomor_kta,
    nama: data.nama || data.nama_lengkap || data.full_name,
    verifiedAt: data.verifiedAt || new Date().toISOString(),
  } as QrVerificationResult;
}

export const useVerificationStore = create<VerificationState>((set) => {
  let requestCounter = 0;
  const fail = (error: unknown, token: string, requestId: number) => {
    if (requestId !== requestCounter) return null;
    const message = error instanceof Error ? error.message : 'Gagal menghubungi layanan verifikasi';
    const limited = /(?:429|rate.limit|terlalu banyak|kuota)/i.test(message);
    const negative: QrVerificationResult = { isValid: false, verifiedAt: new Date().toISOString(),
      message: limited ? 'Batas permintaan verifikasi tercapai. Coba lagi nanti.' : `Verifikasi tidak dapat dikonfirmasi: ${message}` };
    set({ isLoading: false, isRateLimited: limited, qrToken: token, error: message, result: negative });
    return null;
  };
  const success = (result: QrVerificationResult, token: string, requestId: number) => {
    if (requestId !== requestCounter) return null;
    set(state => ({
      isLoading: false, isRateLimited: false, error: null, qrToken: token, result,
      history: [{ token, nama: result.nama, no_kta: result.no_kta,
        isValid: result.isValid, timestamp: new Date().toISOString() }, ...state.history].slice(0, 10),
    }));
    return result;
  };
  return {
    qrToken: '', isScanning: false, isLoading: false, isRateLimited: false,
    result: null, error: null, history: [],
    setQrToken: (qrToken) => set({ qrToken }),
    setScanning: (isScanning) => set({ isScanning }),
    resetVerification: () => { requestCounter++; set({qrToken: '', isLoading: false,
      isRateLimited: false, result: null, error: null}); },
    verifyToken: async (value) => {
      const token = normalizeScanned(value);
      const id = ++requestCounter;
      set({qrToken: token, isLoading: true, isRateLimited: false, result: null, error: null});
      if (!token || /^https?:\/\//i.test(token)) return fail(new Error('Token QR tidak ditemukan pada URL'), token, id);
      try { return success(normalizedResult(await verificationApi.verifyQr(token)), token, id); }
      catch (e) { return fail(e, token, id); }
    },
    verifyManualKta: async (value) => {
      const nomor = String(value || '').trim();
      const id = ++requestCounter;
      set({isLoading: true, isRateLimited: false, result: null, error: null});
      if (!nomor) return fail(new Error('Nomor KTA wajib diisi'), nomor, id);
      try { return success(normalizedResult(await verificationApi.verifyInternal(nomor)), nomor, id); }
      catch (e) { return fail(e, nomor, id); }
    },
  };
});
