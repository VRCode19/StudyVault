import React from 'react';

export type GlassLevel = 1 | 2 | 3 | 4;
export type GlassTileColor = 'none' | 'orange' | 'blue' | 'clear' | 'violet' | 'amber' | 'teal';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  level?: GlassLevel;
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  tileColor?: GlassTileColor;
  glow?: 'none' | 'blue' | 'cyan' | 'violet' | 'orange' | 'teal';
  rounded?: 'sm' | 'md' | 'lg' | 'panel' | 'full';
  className?: string;
  specular?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  level = 2,
  variant,
  tileColor = 'none',
  glow = 'none',
  rounded = 'md',
  className = '',
  specular = true,
  ...props
}) => {
  // Tile colors matching the 6 liquid tiles from the reference image
  if (tileColor !== 'none') {
    const tileStyles: Record<Exclude<GlassTileColor, 'none'>, string> = {
      orange: 'liquid-tile-orange',
      blue: 'liquid-tile-blue',
      clear: 'liquid-tile-clear',
      violet: 'liquid-tile-violet',
      amber: 'liquid-tile-amber',
      teal: 'liquid-tile-teal',
    };

    const roundedStyles = {
      sm: 'rounded-card-sm',
      md: 'rounded-card',
      lg: 'rounded-card-lg',
      panel: 'rounded-panel',
      full: 'rounded-full',
    };

    return (
      <div
        className={`relative overflow-hidden transition-all duration-300 ${tileStyles[tileColor]} ${roundedStyles[rounded]} ${className}`}
        {...props}
      >
        {specular && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        )}
        {children}
      </div>
    );
  }

  // Standard multi-level glass surface
  const levelStyles: Record<GlassLevel, string> = {
    1: 'liquid-glass-1',
    2: 'liquid-glass-2',
    3: 'liquid-glass-3',
    4: 'liquid-glass-4',
  };

  const resolvedLevel: GlassLevel =
    variant === 'subtle' ? 1 : variant === 'elevated' ? 3 : level;

  const glowStyles = {
    none: '',
    blue: 'shadow-blue-glow border-blue-500/30',
    cyan: 'shadow-cyan-glow border-cyan-500/30',
    violet: 'shadow-violet-glow border-purple-500/30',
    orange: 'shadow-orange-glow border-orange-500/30',
    teal: 'shadow-teal-glow border-teal-500/30',
  };

  const roundedStyles = {
    sm: 'rounded-card-sm',
    md: 'rounded-card',
    lg: 'rounded-card-lg',
    panel: 'rounded-panel',
    full: 'rounded-full',
  };

  const interactiveClasses =
    variant === 'interactive'
      ? 'hover:border-white/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-liquid-elevated cursor-pointer active:translate-y-0 active:scale-[0.99]'
      : '';

  return (
    <div
      className={`relative overflow-hidden ${levelStyles[resolvedLevel]} ${glowStyles[glow]} ${roundedStyles[rounded]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {/* Specular inner highlight rim */}
      {specular && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-90" />
      )}
      {children}
    </div>
  );
};
