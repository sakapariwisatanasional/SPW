import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Tidak ada data ditemukan",
  description = "Belum ada rekaman data pada kategori atau filter yang dipilih.",
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200", className)}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
