import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Circle,
  Scissors,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DayOfWeek } from '../../types/studyvault';

export const SessionModal: React.FC = () => {
  const {
    selectedSession,
    setSelectedSession,
    toggleSessionComplete,
    rescheduleSession,
    splitSession,
  } = useStudyVault();

  const [targetDay, setTargetDay] = useState<DayOfWeek>('SAT');
  const [targetTime, setTargetTime] = useState<string>('15:00');

  if (!selectedSession) return null;

  const isDone = selectedSession.status === 'completed';
  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleReschedule = () => {
    rescheduleSession(
      selectedSession.id,
      targetDay,
      targetTime,
      `Rescheduled by student to ${targetDay} ${targetTime}`
    );
    setSelectedSession(null);
  };

  const handleSplit = () => {
    splitSession(selectedSession.id);
    setSelectedSession(null);
  };

  const handleToggle = () => {
    toggleSessionComplete(selectedSession.id);
    setSelectedSession(null);
  };

  return (
    <Modal
      isOpen={!!selectedSession}
      onClose={() => setSelectedSession(null)}
      title="Study Session Details"
      subtitle={`${selectedSession.subjectName} • ${selectedSession.dayOfWeek}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Session details card */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: `${selectedSession.subjectColor}20`,
                color: selectedSession.subjectColor,
                border: `1px solid ${selectedSession.subjectColor}40`,
              }}
            >
              {selectedSession.subjectName}
            </span>

            {selectedSession.isAdaptive && (
              <Badge variant="adaptive" size="xs">
                Adaptive
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {selectedSession.topicName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                {selectedSession.dayOfWeek}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {selectedSession.startTime} — {selectedSession.endTime} ({selectedSession.durationMinutes} min)
              </span>
            </div>
          </div>

          {selectedSession.notes && (
            <p className="text-xs text-slate-300 leading-relaxed bg-dark-900/60 p-2.5 rounded-lg border border-white/[0.04]">
              {selectedSession.notes}
            </p>
          )}

          {selectedSession.adaptiveReason && (
            <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{selectedSession.adaptiveReason}</span>
            </div>
          )}
        </div>

        {/* Action: Toggle completion */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <div className="text-xs font-semibold text-white">Completion Status</div>
              <div className="text-[11px] text-slate-400">
                {isDone ? 'Marked as completed' : 'Pending completion'}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant={isDone ? 'secondary' : 'primary'}
            onClick={handleToggle}
          >
            {isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
        </div>

        {/* Reschedule Section */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Adaptive Reschedule</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-normal normal-case">
              <ShieldCheck className="w-3.5 h-3.5" /> Exam Deadline Protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Day</label>
              <select
                value={targetDay}
                onChange={(e) => setTargetDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 rounded-xl bg-dark-900 text-white text-xs border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Preferred Time</label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-900 text-white text-xs border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="glass"
              onClick={handleReschedule}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Move to {targetDay} {targetTime}
            </Button>

            <Button
              size="sm"
              variant="glass"
              onClick={handleSplit}
              icon={<Scissors className="w-3.5 h-3.5" />}
              title="Split into two 30-min segments"
            >
              Split Session
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
