/**
 * DynamicQrCode Component
 * -------------------------------------------------------------
 * Render QR Code Identity secara dinamis di sisi klien (in-memory).
 * Sesuai QR STORAGE POLICY:
 * - Tidak menyimpan QR PNG/JPG/Image file ke Google Drive
 * - Menggunakan Dynamic QR Identity berbasis URL (SPWN_SYSTEM.PUBLIC_URL/verifikasi/{qr_token})
 * - Keamanan kriptografis, non-sequential, zero PII
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Loader2 } from 'lucide-react';

export interface DynamicQrCodeProps {
  /**
   * Nilai yang dienkode ke dalam QR (URL verifikasi lengkap atau token)
   */
  value: string;
  /**
   * Ukuran dalam pixel (default: 120)
   */
  size?: number;
  /**
   * Margin border QR dalam blok modul (default: 1)
   */
  margin?: number;
  /**
   * Level koreksi kesalahan: 'L' | 'M' | 'Q' | 'H' (default: 'M')
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /**
   * Warna foreground (default: '#0B1F33')
   */
  colorDark?: string;
  /**
   * Warna background (default: '#FFFFFF')
   */
  colorLight?: string;
  /**
   * Kelas styling tambahan
   */
  className?: string;
  /**
   * Label teks kecil di bawah QR
   */
  caption?: string;
  /**
   * Aksesibilitas alt text
   */
  altText?: string;
  /**
   * Ketebalan padding latar belakang barcode (default: 0)
   */
  backgroundPadding?: number;
  /**
   * Warna latar belakang barcode (default: '#FFFFFF')
   */
  backgroundColor?: string;
  /**
   * Mode bersih tanpa efek stroke/bayangan (default: true)
   */
  clean?: boolean;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  value,
  size = 120,
  margin = 1,
  errorCorrectionLevel = 'M',
  colorDark = '#0B1F33',
  colorLight = '#FFFFFF',
  className = '',
  caption,
  altText = 'Dynamic QR Verification Identity',
  backgroundPadding = 0,
  backgroundColor = '#FFFFFF',
  clean = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (!value || value.trim().length === 0) {
      setDataUrl('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina rendering
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate Dynamic QR Code:', err);
          setError('Gagal merender QR');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, margin, errorCorrectionLevel, colorDark, colorLight]);

  if (!value) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 border border-dashed border-slate-300 rounded-lg text-slate-400 p-2 ${className}`}
        style={{ width: size, height: size }}
      >
        <QrIcon className="w-1/2 h-1/2 opacity-40" />
        <span className="text-[9px] mt-1 text-center font-mono">NO TOKEN</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
          padding: `${backgroundPadding}px`,
          backgroundColor: backgroundColor || '#FFFFFF',
          boxShadow: 'none',
          filter: 'none',
          border: 'none',
          outline: 'none',
          borderRadius: clean ? '0px' : '4px',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center p-2 text-rose-500 text-center">
            <QrIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[8px] font-mono leading-tight">{error}</span>
          </div>
        ) : (
          dataUrl && (
            <img
              src={dataUrl}
              alt={altText}
              className="w-full h-full object-contain select-none"
              style={{
                boxShadow: 'none',
                filter: 'none',
                border: 'none',
                outline: 'none',
              }}
              draggable={false}
            />
          )
        )}
      </div>

      {caption && (
        <span className="text-[8px] font-mono tracking-wider text-slate-400 uppercase mt-1 text-center">
          {caption}
        </span>
      )}
    </div>
  );
};
