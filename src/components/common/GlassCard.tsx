import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  glow?: 'none' | 'blue' | 'cyan';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  glow = 'none',
  rounded = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card',
    elevated: 'glass-card-elevated',
    subtle: 'glass-card-subtle',
    interactive: 'glass-card hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-tactile-hover cursor-pointer',
  };

  const glowStyles = {
    none: '',
    blue: 'shadow-blue-glow border-blue-500/30',
    cyan: 'shadow-cyan-glow border-cyan-500/30',
  };

  const roundedStyles = {
    sm: 'rounded-card-sm',
    md: 'rounded-card',
    lg: 'rounded-card-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`relative overflow-hidden ${variantStyles[variant]} ${glowStyles[glow]} ${roundedStyles[rounded]} ${className}`}
      {...props}
    >
      {/* Subtle top inner reflection border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-80" />
      {children}
    </div>
  );
};
