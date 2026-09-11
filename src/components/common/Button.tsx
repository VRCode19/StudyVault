import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none tactile-btn';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2 font-medium',
    md: 'px-4 py-2.5 text-sm rounded-tactile gap-2.5',
    lg: 'px-6 py-3.5 text-base rounded-tactile gap-3 font-semibold',
  };

  const variantStyles = {
    primary: 'tactile-primary-btn text-white border border-blue-400/30 font-semibold shadow-blue-glow',
    secondary: 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-white/10 hover:border-white/20',
    glass: 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 hover:border-white/25 backdrop-blur-md',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent shadow-none',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30',
    glow: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-semibold shadow-blue-glow-lg border border-white/25 hover:brightness-110',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
