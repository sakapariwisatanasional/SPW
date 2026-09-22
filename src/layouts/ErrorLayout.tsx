/**
 * ErrorLayout
 * -----------------------------------------------------------------
 * Layout terpusat untuk penanganan status error sistem:
 * 404 (Not Found), 403 (Forbidden / Akses Ditolak),
 * 500 (Internal Server Error / Gateway Crash), dan Maintenance.
 * Memenuhi spesifikasi Refinement 2.
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, FileQuestion, Wrench, ArrowLeft, Home, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export type ErrorType = '404' | '403' | '500' | 'maintenance';

export interface ErrorLayoutProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  requiredPermission?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onRetry?: () => void;
}

const ERROR_CONFIGS: Record<ErrorType, {
  code: string;
  defaultTitle: string;
  defaultMessage: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeText: string;
}> = {
  '404': {
    code: '404',
    defaultTitle: 'Halaman Tidak Ditemukan',
    defaultMessage: 'Halaman atau sumber daya yang Anda tuju tidak ditemukan atau telah dipindahkan ke tautan lain.',
    icon: FileQuestion,
    accentColor: '#0066B3',
    badgeText: 'PAGE NOT FOUND',
  },
  '403': {
    code: '403',
    defaultTitle: 'Akses Ditolak',
    defaultMessage: 'Akun Anda tidak memiliki izin otorisasi yang mencukupi untuk membuka fitur atau dokumen ini.',
    icon: ShieldAlert,
    accentColor: '#D81B60',
    badgeText: 'ACCESS FORBIDDEN',
  },
  '500': {
    code: '500',
    defaultTitle: 'Kesalahan Sistem Internal',
    defaultMessage: 'Server gateway Google Apps Script atau database spreadsheet mengalami kendala pemrosesan.',
    icon: AlertTriangle,
    accentColor: '#DC2626',
    badgeText: 'SYSTEM FAULT',
  },
  'maintenance': {
    code: '503',
    defaultTitle: 'Pemeliharaan Terjadwal',
    defaultMessage: 'Sistem SPWN Apps 2.0 sedang dalam sinkronisasi berkala pangkalan data nasional.',
    icon: Wrench,
    accentColor: '#F7941D',
    badgeText: 'SYSTEM MAINTENANCE',
  },
};

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  type = '404',
  title,
  message,
  requiredPermission,
  onGoBack,
  onGoHome,
  onRetry,
}) => {
  const config = ERROR_CONFIGS[type];
  const IconComponent = config.icon;

  return (
    <div
      id="spwn-error-layout"
      className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="w-full max-w-lg text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: config.accentColor }}
        />

        {/* Icon & Code Badge */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: config.accentColor }}
          >
            <IconComponent className="w-8 h-8" />
          </div>

          <span
            className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full border uppercase"
            style={{
              color: config.accentColor,
              borderColor: `${config.accentColor}30`,
              backgroundColor: `${config.accentColor}10`,
            }}
          >
            {config.badgeText} • ERROR {config.code}
          </span>
        </div>

        {/* Heading & Explanation */}
        <div className="mt-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title || config.defaultTitle}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {message || config.defaultMessage}
          </p>
          {requiredPermission && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-left">
              <strong>Izin Diperlukan:</strong>{' '}
              <code className="font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-rose-200">
                {requiredPermission}
              </code>
            </div>
          )}
        </div>

        {/* Call to Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          {onGoBack && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4 text-slate-600" />}
              onClick={onGoBack}
            >
              Kembali
            </Button>
          )}

          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4 text-white" />}
              onClick={onRetry}
            >
              Coba Lagi
            </Button>
          )}

          {onGoHome && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Home className="w-4 h-4 text-white" />}
              onClick={onGoHome}
            >
              Ke Beranda
            </Button>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="mt-6 text-[11px] text-slate-400 font-medium">
          SAKA Pariwisata Network Indonesia • Gugus Layanan Digital
        </div>
      </div>
    </div>
  );
};
