/**
 * SPWN Apps 2.0 - Frontend API Error Handler & Mapping
 * Location: src/services/api/apiError.ts
 * -----------------------------------------------------
 * Memetakan kode kesalahan backend SPWN menjadi representasi ramah pengguna
 * dan aksi penanganan UI (misal: redirect ke login, modal konfirmasi, dll).
 */

export interface SpwnErrorDetails {
  code?: string;
  details?: unknown;
}

export class SpwnApiError extends Error {
  public statusCode: number;
  public code: string;
  public action: string;
  public requestId?: string;
  public rawDetails?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string = 'SPWN_ERROR',
    action: string = '',
    requestId?: string,
    rawDetails?: unknown
  ) {
    super(message);
    this.name = 'SpwnApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.action = action;
    this.requestId = requestId;
    this.rawDetails = rawDetails;
  }
}

/**
 * Peta deskripsi dan penanganan UI untuk masing-masing kode error backend
 */
export const ERROR_MAPPINGS: Record<string, { title: string; defaultMessage: string; userAction: string }> = {
  SPWN_UNAUTHORIZED: {
    title: 'Sesi Tidak Ditemukan',
    defaultMessage: 'Akses ditolak. Silakan login menggunakan akun SAKA Anda.',
    userAction: 'REDIRECT_LOGIN'
  },
  SPWN_SESSION_EXPIRED: {
    title: 'Sesi Berakhir',
    defaultMessage: 'Sesi Anda telah kedaluwarsa demi keamanan. Silakan login kembali.',
    userAction: 'LOGOUT_AND_LOGIN'
  },
  SPWN_FORBIDDEN: {
    title: 'Akses Dibatasi',
    defaultMessage: 'Akun Anda tidak memiliki izin untuk mengakses fitur atau data ini.',
    userAction: 'SHOW_ALERT'
  },
  SPWN_NOT_FOUND: {
    title: 'Data Tidak Ditemukan',
    defaultMessage: 'Sumber daya atau catatan yang Anda cari tidak tersedia di pangkalan data.',
    userAction: 'SHOW_NOT_FOUND'
  },
  SPWN_VALIDATION_ERROR: {
    title: 'Data Tidak Valid',
    defaultMessage: 'Mohon periksa kembali kolom formulir yang Anda isi.',
    userAction: 'HIGHLIGHT_FIELDS'
  },
  SPWN_RATE_LIMITED: {
    title: 'Batas Permintaan Terlampaui',
    defaultMessage: 'Terlalu banyak permintaan dalam waktu singkat. Harap tunggu beberapa saat.',
    userAction: 'THROTTLE_WAIT'
  },
  SPWN_OUT_OF_STOCK: {
    title: 'Stok Habis',
    defaultMessage: 'Jumlah barang yang diminta melebihi stok yang tersedia saat ini.',
    userAction: 'ADJUST_CART'
  },
  SPWN_DATABASE_ERROR: {
    title: 'Gangguan Database',
    defaultMessage: 'Pangkalan data spreadsheet sedang padat. Sistem sedang mengulang koneksi otomatis.',
    userAction: 'RETRY_LATER'
  },
  SPWN_CONTROLLER_CRASH: {
    title: 'Kesalahan Sistem',
    defaultMessage: 'Terjadi kegagalan pemrosesan di server gateway. Harap hubungi administrator.',
    userAction: 'SHOW_SUPPORT'
  }
};

/**
 * Normalisasi error HTTP atau network menjadi SpwnApiError terstruktur
 */
export function handleApiError(err: unknown, action: string = ''): SpwnApiError {
  if (err instanceof SpwnApiError) {
    return err;
  }

  if (err instanceof Error) {
    return new SpwnApiError(
      err.message || 'Terjadi kesalahan jaringan atau koneksi terputus',
      0,
      'SPWN_NETWORK_ERROR',
      action
    );
  }

  return new SpwnApiError('Kesalahan tidak diketahui', 500, 'SPWN_UNKNOWN', action);
}
