/**
 * SPWN Apps 2.0 - Core Frontend API Client
 * Location: src/services/api/apiClient.ts
 * ----------------------------------------
 * Menangani komunikasi HTTP terstandarisasi dengan Google Apps Script Web App:
 * 1. Melalui Vercel Proxy Gateway (/api/spwn) secara transparan
 * 2. Penyisipan query parameter action (?action=...)
 * 3. Injeksi token sesi aktif
 * 4. Kepatuhan terhadap ApiResponse Contract (v2)
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
    // Production frontend uses Vercel Proxy /api/spwn by default
    this.baseUrl = import.meta.env.VITE_SPWN_API_URL || '/api/spwn';

    // Prevent direct browser call to script.google.com if proxy is preferred
    if (
      this.baseUrl.includes('script.google.com') ||
      this.baseUrl.includes('script.googleusercontent.com')
    ) {
      this.baseUrl = '/api/spwn';
    }
  }

  public registerTokenGetter(getter: () => string | null) {
    this.tokenGetter = getter;
  }

  private getToken(override?: string | null): string | null {
    if (override) return override;

    if (this.tokenGetter) {
      const token = this.tokenGetter();
      if (token) return token;
    }

    try {
      return localStorage.getItem('spwn_session_token');
    } catch {
      return null;
    }
  }

  private buildUrl(
    action: string,
    params?: Record<string, any>,
    token?: string | null
  ): string {
    const url = new URL(this.baseUrl, window.location.origin);
    url.searchParams.set('action', action);

    if (token) {
      url.searchParams.set('token', token);
    }

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.set(k, String(v));
        }
      });
    }

    return url.toString();
  }

  async post<T>(
    action: string,
    body: Record<string, unknown> = {},
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken(options?.token);

      const response = await fetch(this.buildUrl(action, params, token), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
        body: JSON.stringify({
          ...body,
          action,
          token,
        }),
        signal: options?.signal,
      });

      const json = await response.json();

      if (!json.success || response.status >= 400) {
        throw new SpwnApiError(
          json.message || 'API Error',
          json.statusCode || response.status,
          json.error?.code || 'SPWN_ERROR',
          action,
          json.meta?.requestId,
          json.error?.details
        );
      }

      return json as ApiResponse<T>;
    } catch (err) {
      throw handleApiError(err, action);
    }
  }

  async get<T>(
    action: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken(options?.token);

      const response = await fetch(this.buildUrl(action, params, token), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
        signal: options?.signal,
      });

      const json = await response.json();

      if (!json.success || response.status >= 400) {
        throw new SpwnApiError(
          json.message || 'API Error',
          json.statusCode || response.status,
          json.error?.code || 'SPWN_ERROR',
          action,
          json.meta?.requestId,
          json.error?.details
        );
      }

      return json as ApiResponse<T>;
    } catch (err) {
      throw handleApiError(err, action);
    }
  }
}

export const apiClient = new SpwnApiClient();
