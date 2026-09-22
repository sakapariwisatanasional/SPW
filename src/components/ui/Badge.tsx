import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'magenta' | 'neutral' | 'red';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'blue',
  size = 'sm',
  dot = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full whitespace-nowrap";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
  };

  const variantStyles = {
    blue: "bg-[#E6F0F8] text-[#0066B3] border border-[#0066B3]/20",
    green: "bg-[#E6F5ED] text-[#009B4D] border border-[#009B4D]/20",
    orange: "bg-[#FEF4E8] text-[#DE7F12] border border-[#F7941D]/25",
    purple: "bg-[#F3E8F8] text-[#6A1B9A] border border-[#6A1B9A]/20",
    magenta: "bg-[#FCE8F0] text-[#D81B60] border border-[#D81B60]/20",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    red: "bg-rose-50 text-rose-700 border border-rose-200",
  };

  const dotColors = {
    blue: "bg-[#0066B3]",
    green: "bg-[#009B4D]",
    orange: "bg-[#F7941D]",
    purple: "bg-[#6A1B9A]",
    magenta: "bg-[#D81B60]",
    neutral: "bg-slate-500",
    red: "bg-rose-500",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};
