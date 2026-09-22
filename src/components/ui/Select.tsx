import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  className,
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || React.useId();

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none bg-white border rounded-lg text-sm text-slate-900 transition-colors cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-[#0066B3]/30 focus:border-[#0066B3]",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            "pl-3.5 pr-8 py-2",
            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-300",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = "Select";
