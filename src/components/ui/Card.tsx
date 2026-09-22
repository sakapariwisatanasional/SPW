import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'accent-blue' | 'accent-green';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const baseStyles = "bg-white rounded-xl transition-all duration-150 border border-slate-200/80";

  const paddingStyles = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-6",
  };

  const variantStyles = {
    default: "shadow-xs",
    flat: "border-slate-200 shadow-none",
    interactive: "shadow-xs hover:shadow-md hover:border-slate-300 cursor-pointer",
    'accent-blue': "border-t-4 border-t-[#0066B3] shadow-xs",
    'accent-green': "border-t-4 border-t-[#009B4D] shadow-xs",
  };

  return (
    <div className={cn(baseStyles, paddingStyles[padding], variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};
