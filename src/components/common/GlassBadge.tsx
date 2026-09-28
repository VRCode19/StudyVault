import React from 'react';

export type GlassBadgeVariant =
  | 'blue'
  | 'cyan'
  | 'violet'
  | 'teal'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'neutral'
  | 'glass'
  | 'adaptive'
  | 'deadline-protected'
  | 'on-track'
  | 'ai-optimized'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger';

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: GlassBadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  token?: boolean; // Circular/squircle token style like in the reference image (e.g. 16, 20, 24)
  icon?: React.ReactNode;
  dot?: boolean;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'glass',
  size = 'sm',
  token = false,
  icon,
  dot = false,
  className = '',
  ...props
}) => {
  // Map semantic variants to visual palette
  const resolvedVariant: 'blue' | 'cyan' | 'violet' | 'teal' | 'orange' | 'amber' | 'emerald' | 'rose' | 'neutral' | 'glass' =
    variant === 'adaptive'
      ? 'cyan'
      : variant === 'deadline-protected'
      ? 'blue'
      : variant === 'on-track' || variant === 'success'
      ? 'emerald'
      : variant === 'ai-optimized'
      ? 'violet'
      : variant === 'warning'
      ? 'orange'
      : variant === 'info'
      ? 'cyan'
      : variant === 'danger'
      ? 'rose'
      : variant;

  const sizeStyles = {
    xs: token ? 'w-5 h-5 text-[10px]' : 'px-2 py-0.5 text-[10px]',
    sm: token ? 'w-7 h-7 text-xs' : 'px-2.5 py-1 text-xs',
    md: token ? 'w-9 h-9 text-sm' : 'px-3 py-1.5 text-sm',
  };

  const variantStyles = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-400/35 shadow-blue-glow/20',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35 shadow-cyan-glow/20',
    violet: 'bg-purple-500/20 text-purple-300 border-purple-400/35 shadow-violet-glow/20',
    teal: 'bg-teal-500/20 text-teal-300 border-teal-400/35 shadow-teal-glow/20',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-400/35 shadow-orange-glow/20',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-400/35',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-400/35',
    neutral: 'bg-white/[0.06] text-slate-300 border-white/15',
    glass: 'bg-white/[0.08] text-slate-200 border-white/20 backdrop-blur-md shadow-liquid-sm',
  };

  const dotColors = {
    blue: 'bg-blue-400',
    cyan: 'bg-cyan-400',
    violet: 'bg-purple-400',
    teal: 'bg-teal-400',
    orange: 'bg-orange-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    neutral: 'bg-slate-400',
    glass: 'bg-cyan-400',
  };

  if (token) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-full border shadow-liquid-sm select-none ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-md select-none ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[resolvedVariant]} shrink-0`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
