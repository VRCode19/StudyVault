import React, { useState } from 'react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';

export const WeeklyChart: React.FC = () => {
  const { stats } = useStudyVault();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const maxHours = 5.0; // scale limit for chart

  return (
    <GlassCard variant="default" rounded="lg" className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Study Hours This Week
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Consistency analytics against your 3.5h daily target.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-slate-300">Studied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400/60" />
            <span className="text-slate-400">Daily Target (3.5h)</span>
          </div>
        </div>
      </div>

      {/* Vertical Bar Grid */}
      <div className="pt-4 pb-2">
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 relative">
          {/* Target line across chart (at 3.5 / 5.0 = 70%) */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-cyan-400/30 z-0 pointer-events-none"
            style={{ bottom: `${(3.5 / maxHours) * 100}%` }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-mono text-cyan-400/80">
              3.5h target
            </span>
          </div>

          {stats.weeklyStudyHours.map((item) => {
            const heightPercent = Math.min(100, Math.round((item.hours / maxHours) * 100));
            const isHovered = hoveredDay === item.day;
            const isTargetMet = item.hours >= item.target;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredDay(item.day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer z-10"
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="mb-2 px-2 py-1 rounded-md bg-dark-950 text-white border border-white/20 text-[11px] font-mono shadow-xl whitespace-nowrap animate-fadeIn">
                    {item.hours} hrs ({Math.round((item.hours / item.target) * 100)}% of goal)
                  </div>
                )}

                {/* Tactile Bar */}
                <div className="w-full max-w-[38px] bg-white/[0.04] rounded-t-xl overflow-hidden p-1 flex flex-col justify-end border border-white/[0.05] group-hover:border-white/20 transition-all">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      isTargetMet
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-cyan-glow/20'
                        : 'bg-gradient-to-t from-slate-700 to-blue-500/70'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`mt-2 text-xs font-mono font-semibold transition-colors ${
                    item.day === 'FRI'
                      ? 'text-cyan-400'
                      : isHovered
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
