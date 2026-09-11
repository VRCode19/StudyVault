import React from 'react';
import { GlassCard } from '../common/GlassCard';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
}) => {
  return (
    <GlassCard
      variant="default"
      rounded="md"
      className="p-5 flex flex-col justify-between hover:border-white/15 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight group-hover:text-blue-100 transition-colors">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {trend && (
          <span
            className={`font-medium font-mono ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-2.5 w-full bg-dark-900/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </GlassCard>
  );
};
