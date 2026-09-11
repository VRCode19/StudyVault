import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, BookOpen, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Subject } from '../../types/studyvault';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface SubjectCardProps {
  subject: Subject;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert minutes to hours & minutes string
  const hours = Math.floor(subject.totalMinutes / 60);
  const mins = subject.totalMinutes % 60;
  const timeString = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  return (
    <GlassCard variant="default" rounded="lg" className="overflow-hidden border-white/[0.08]">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="w-3.5 h-12 rounded-full shrink-0"
            style={{ backgroundColor: subject.accentColor }}
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                {subject.code}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {subject.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
              <span>{subject.totalTopics} topics</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {timeString}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {subject.completedTopics} completed ({subject.progressPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Progress bar & expand toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="w-28 sm:w-36 bg-dark-900/80 rounded-full h-2 overflow-hidden border border-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${subject.progressPercentage}%`,
                backgroundColor: subject.accentColor,
              }}
            />
          </div>

          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Topic list */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-white/[0.06] bg-dark-950/40 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-1">
            Extracted Topics & Estimated Study Allocation
          </div>

          {subject.topics.map((topic, index) => {
            const isDone = topic.status === 'completed';
            const difficultyStyles = {
              easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            };

            return (
              <div
                key={topic.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono w-4 text-center">
                    {index + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className={`font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {topic.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{topic.module}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyStyles[topic.difficulty]}`}>
                    {topic.difficulty}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {topic.estimatedMinutes}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
