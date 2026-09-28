import React from 'react';

export interface GlassProgressProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'blue' | 'violet' | 'teal' | 'orange' | 'gradient';
  className?: string;
}

export const GlassProgress: React.FC<GlassProgressProps> = ({
  value,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'cyan',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillStyles: Record<string, string> = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-glow/40',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-glow/40',
    violet: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-glow/40',
    teal: 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-teal-glow/40',
    orange: 'bg-gradient-to-r from-orange-400 to-amber-500 shadow-orange-glow/40',
    gradient: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-cyan-glow/40',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-mono font-semibold text-slate-400">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-md shadow-inner ${heightStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out relative ${fillStyles[variant]}`}
          style={{ width: `${clampedValue}%` }}
        >
          {/* Subtle top specular shimmer on the progress bar */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full" />
        </div>
      </div>
    </div>
  );
};
