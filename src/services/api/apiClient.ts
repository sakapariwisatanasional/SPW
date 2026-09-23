/**
 * SPWN Apps 2.0 - Core Frontend API Client
 * Location: src/services/api/apiClient.ts
 * ----------------------------------------
 * Menangani komunikasi HTTP terstandarisasi dengan Google Apps Script Web App:
 * 1. Penyisipan query parameter action (?action=...)
 * 2. Injeksi Bearer Token sesi dari localStorage/store
 * 3. Kepatuhan terhadap ApiResponse Contract (v2)
 * 4. Pemetaan error respons secara tersentralisasi
 */

import { SpwnApiError, handleApiError } from './apiError';

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  apiVersion: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  action: string;
  data: T;
  pagination: ApiPagination | null;
  error?: {
    code: string;
    details?: unknown;
  } | null;
  meta: ApiResponseMeta;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string | null;
  signal?: AbortSignal;
}

class SpwnApiClient {
  private baseUrl: string;
  private tokenGetter: (() => string | null) | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SPWN_API_URL || '';
    if (!this.baseUrl) {
      // Fallback default endpoint saat development
      this.baseUrl = '/api/spwn';
    }
  }

  /**
   * Mendaftarkan callback untuk mengambil token sesi aktif dari auth store
   */
  public registerTokenGetter(getter: () => string | null): void {
    this.tokenGetter = getter;
  }

  /**
   * Mengambil token sesi aktif dari localStorage atau getter terdaftar
   */
  private getActiveToken(overrideToken?: string | null): string | null {
    if (overrideToken) return overrideToken;
    if (this.tokenGetter) {
      const t = this.tokenGetter();
      if (t) return t;
    }
    try {
      return localStorage.getItem('spwn_session_token');
    } catch {
      return null;
    }
  }

  /**
   * Membangun URL lengkap dengan parameter action & query
   */
  private buildUrl(action: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(this.baseUrl);
    url.searchParams.set('action', action);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.set(key, String(val));
        }
      });
    }

    return url.toString();
  }

  /**
   * HTTP GET Request
   */
  public async get<T>(
    action: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(action, params);
      const token = this.getActiveToken(options?.token);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(options?.headers || {})
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: options?.signal
      });

      return await this.handleResponse<T>(response, action);
    } catch (err) {
      throw handleApiError(err, action);
    }
  }

  /**
   * HTTP POST Request (JSON Payload)
   */
  public async post<T>(
    action: string,
    body: Record<string, unknown> = {},
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(action, params);
      const token = this.getActiveToken(options?.token);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      };

      // Tambahkan token pada payload body juga untuk redundansi GAS
      const payload: Record<string, unknown> = {
        ...body,
        action
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        payload.token = token;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: options?.signal
      });

      return await this.handleResponse<T>(response, action);
    } catch (err) {
      throw handleApiError(err, action);
    }
  }

  /**
   * Mengurai dan memvalidasi respons JSON backend SPWN
   */
  private async handleResponse<T>(response: Response, action: string): Promise<ApiResponse<T>> {
    let rawJson: ApiResponse<T>;

    try {
      rawJson = await response.json();
    } catch {
      throw new SpwnApiError(
        `Gagal memproses respons dari server gateway (${response.status})`,
        response.status,
        'SPWN_MALFORMED_RESPONSE',
        action
      );
    }

    // Periksa status success contract
    if (!rawJson.success || response.status >= 400) {
      const errorCode = rawJson.error?.code || 'SPWN_ERROR';
      const errorMessage = rawJson.message || 'Terjadi kesalahan sistem internal';
      const requestId = rawJson.meta?.requestId;

      throw new SpwnApiError(
        errorMessage,
        rawJson.statusCode || response.status,
        errorCode,
        action,
        requestId,
        rawJson.error?.details
      );
    }

    return rawJson;
  }
}

export const apiClient = new SpwnApiClient();
