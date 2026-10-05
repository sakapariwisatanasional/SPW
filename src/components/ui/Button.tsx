import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'magenta';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  const variantStyles = {
    primary: "bg-[#0066B3] text-white border-2 border-[#0066B3] hover:bg-white hover:text-[#0066B3] hover:border-[#0066B3] focus:ring-[#0066B3]/40 shadow-sm [&_svg]:transition-colors [&_svg]:stroke-current",
    secondary: "bg-[#009B4D] text-white border-2 border-[#009B4D] hover:bg-white hover:text-[#009B4D] hover:border-[#009B4D] focus:ring-[#009B4D]/40 shadow-sm [&_svg]:transition-colors [&_svg]:stroke-current",
    outline: "bg-white text-slate-800 border-2 border-slate-300 hover:bg-[#0066B3] hover:text-white hover:border-[#0066B3] focus:ring-[#0066B3]/40 shadow-xs [&_svg]:transition-colors [&_svg]:stroke-current",
    ghost: "bg-transparent text-slate-700 border-2 border-transparent hover:bg-slate-900 hover:text-white hover:border-slate-900 focus:ring-slate-300 [&_svg]:transition-colors [&_svg]:stroke-current",
    danger: "bg-rose-600 text-white border-2 border-rose-600 hover:bg-white hover:text-rose-600 hover:border-rose-600 focus:ring-rose-500/40 shadow-sm [&_svg]:transition-colors [&_svg]:stroke-current",
    warning: "bg-[#F7941D] text-white border-2 border-[#F7941D] hover:bg-slate-950 hover:text-white hover:border-slate-950 focus:ring-[#F7941D]/40 shadow-sm [&_svg]:transition-colors [&_svg]:stroke-current",
    magenta: "bg-[#D81B60] text-white border-2 border-[#D81B60] hover:bg-white hover:text-[#D81B60] hover:border-[#D81B60] focus:ring-[#D81B60]/40 shadow-sm [&_svg]:transition-colors [&_svg]:stroke-current",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
