import React from 'react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';

export const SubjectProgress: React.FC = () => {
  const { subjects } = useStudyVault();

  return (
    <GlassCard variant="default" rounded="lg" className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Subject Coverage Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time syllabus completion by course module.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
          4 Subjects
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {subjects.map((sub) => (
          <div key={sub.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sub.accentColor }}
                />
                <span className="font-semibold text-white">{sub.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({sub.completedTopics}/{sub.totalTopics} topics)
                </span>
              </div>
              <span className="font-mono font-bold text-slate-300">
                {sub.progressPercentage}%
              </span>
            </div>

            {/* Tactile Progress bar */}
            <div className="w-full bg-dark-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-sm"
                style={{
                  width: `${sub.progressPercentage}%`,
                  backgroundColor: sub.accentColor,
                  boxShadow: `0 0 12px ${sub.glowColor}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
