import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn("animate-pulse bg-slate-200/80", variantStyles[variant], className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
