import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  label = "Memuat data...",
  size = 'md',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "rounded-full border-[#0066B3] border-t-transparent animate-spin",
          sizeMap[size]
        )}
      />
      {label && <p className="text-xs font-medium text-slate-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
};
