import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Terjadi Kendala Koneksi",
  message = "Sistem gagal memuat data dari gateway. Silakan periksa koneksi atau ulangi proses.",
  onRetry,
  className,
}) => {
  return (
    <div className={cn("p-6 rounded-xl bg-rose-50/70 border border-rose-200 text-center flex flex-col items-center justify-center", className)}>
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="danger"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Coba Lagi
        </Button>
      )}
    </div>
  );
};
