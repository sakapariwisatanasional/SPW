import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full bg-white border rounded-lg text-sm text-slate-900 transition-colors placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-[#0066B3]/30 focus:border-[#0066B3]",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            leftIcon ? "pl-9" : "pl-3.5",
            rightIcon ? "pr-9" : "pr-3.5",
            "py-2",
            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-300",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
