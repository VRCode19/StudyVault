import React from 'react';

export interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'primary' | 'subtle' | 'ghost' | 'danger';
  rounded?: 'full' | 'md' | 'lg';
  active?: boolean;
  badge?: number | string;
  label?: string; // For accessibility
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'glass',
  rounded = 'lg',
  active = false,
  badge,
  label,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const roundedStyles = {
    full: 'rounded-full',
    lg: 'rounded-2xl',
    md: 'rounded-xl',
  };

  const variantStyles = {
    glass:
      'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/12 hover:border-white/25 shadow-liquid-sm',
    primary:
      'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-400/40 shadow-blue-glow/30',
    subtle:
      'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/5',
    ghost:
      'hover:bg-white/[0.08] text-slate-400 hover:text-white border border-transparent shadow-none',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30',
  };

  const activeStyles = active
    ? 'border-blue-400/50 bg-blue-500/20 text-white shadow-blue-glow/40'
    : '';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center transition-all duration-200 backdrop-blur-xl cursor-pointer select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${sizeStyles[size]} ${roundedStyles[rounded]} ${variantStyles[variant]} ${activeStyles} ${className}`}
      {...props}
    >
      {/* Specular top rim */}
      <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/20" />
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full border border-white/40 shadow-sm animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
};
