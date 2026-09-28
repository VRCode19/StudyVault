import React from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  label?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ icon, rightElement, error, label, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full liquid-input py-2.5 text-sm text-white placeholder-slate-400/80 transition-all ${
              icon ? 'pl-10' : 'pl-4'
            } ${rightElement ? 'pr-11' : 'pr-4'} ${
              error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40' : ''
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
