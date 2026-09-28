import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  rounded?: 'panel' | 'panel-lg' | 'card' | 'none';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  rounded = 'panel',
  ...props
}) => {
  const roundedClasses = {
    panel: 'rounded-panel',
    'panel-lg': 'rounded-panel-lg',
    card: 'rounded-card',
    none: '',
  };

  return (
    <div
      className={`liquid-panel relative overflow-hidden ${roundedClasses[rounded]} ${className}`}
      {...props}
    >
      {/* Refraction highlight rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent z-10" />
      {children}
    </div>
  );
};
