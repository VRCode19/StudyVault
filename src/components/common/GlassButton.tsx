import React from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'secondary' | 'pill' | 'glow' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pill?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  pill = false,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none liquid-btn cursor-pointer';

  const sizeStyles = {
    xs: 'px-3 py-1 text-xs gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs gap-2',
    md: 'px-4 py-2.5 text-sm gap-2.5',
    lg: 'px-6 py-3.5 text-base gap-3 font-semibold',
  };

  const roundedClass = pill ? 'rounded-chip' : 'rounded-btn';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-blue-glow border border-blue-400/40',
    glass:
      'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/15 hover:border-white/30 backdrop-blur-xl',
    secondary:
      'bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-white/10 hover:border-white/20',
    pill:
      'liquid-pill-btn text-slate-200 hover:text-white',
    glow:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-semibold shadow-cyan-glow hover:shadow-blue-glow-lg border border-white/30 hover:brightness-110',
    ghost:
      'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent shadow-none',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${roundedClass} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
