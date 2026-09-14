import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { ExtractionPreview } from '../../types/studyvault';
import { Button } from '../common/Button';

interface ExtractionPreviewCardProps {
  extraction: ExtractionPreview;
  onConfirm?: () => void;
  confirmed?: boolean;
}

export const ExtractionPreviewCard: React.FC<ExtractionPreviewCardProps> = ({
  extraction,
  onConfirm,
  confirmed = false,
}) => {
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const getDocTypeInfo = (type: ExtractionPreview['document_type']) => {
    switch (type) {
      case 'timetable':
        return {
          label: 'Class Timetable',
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
          color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
        };
      case 'exam_timetable':
        return {
          label: 'Exam Schedule',
          icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
          color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
        };
      case 'syllabus':
        return {
          label: 'Academic Syllabus',
          icon: <BookOpen className="w-4 h-4 text-purple-400" />,
          color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
        };
      case 'module_details':
        return {
          label: 'Module Breakdown',
          icon: <Layers className="w-4 h-4 text-emerald-400" />,
          color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
        };
      default:
        return {
          label: 'Document Analysis',
          icon: <BookOpen className="w-4 h-4 text-slate-400" />,
          color: 'from-slate-500/20 to-slate-500/10 border-slate-500/30 text-slate-300',
        };
    }
  };

  const getConfidenceBadge = (confidence: ExtractionPreview['confidence']) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Review Advised
          </span>
        );
      case 'low':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Low Confidence
          </span>
        );
    }
  };

  const docInfo = getDocTypeInfo(extraction.document_type);

  return (
    <div className="my-3 rounded-2xl bg-dark-900/95 border border-white/15 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white/[0.05] border border-white/10">
            {docInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">{docInfo.label}</span>
              <span className="text-[10px] font-mono text-slate-400">Extracted by Vision Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getConfidenceBadge(extraction.confidence)}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Warnings callout if present */}
          {extraction.warnings && extraction.warnings.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <div className="flex items-center justify-between font-semibold text-[11px] mb-1">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Notes & Ambiguities ({extraction.warnings.length})
                </span>
                {extraction.warnings.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllWarnings(!showAllWarnings)}
                    className="text-[10px] underline text-amber-300"
                  >
                    {showAllWarnings ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90 font-mono">
                {(showAllWarnings ? extraction.warnings : extraction.warnings.slice(0, 2)).map(
                  (warn, idx) => (
                    <li key={idx}>{warn}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* 1. Timetable Extraction View */}
          {extraction.timetable && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Weekly Class Schedule
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {extraction.timetable.weeklySchedule.map((dayGroup, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-cyan-300 font-mono">
                      {dayGroup.day}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {dayGroup.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{slot.subject}</span>
                            {slot.room && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({slot.room})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{slot.timeSlot}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Exam Timetable View */}
          {extraction.examTimetable && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Exam Milestones ({extraction.examTimetable.exams.length} papers)
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {extraction.examTimetable.exams.map((exam, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{exam.subject}</span>
                        {exam.code && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-slate-300">
                            {exam.code}
                          </span>
                        )}
                      </div>
                      {exam.venue && (
                        <span className="text-[10px] text-slate-400">Venue: {exam.venue}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-amber-300 font-medium">{exam.date}</div>
                      {exam.time && (
                        <div className="text-[10px] font-mono text-slate-400">{exam.time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Syllabus View */}
          {extraction.syllabus && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Extracted Subjects & Modules
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {extraction.syllabus.subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[12px]">{sub.name}</span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {sub.code}
                      </span>
                    </div>

                    {/* Modules or topics list */}
                    {sub.modules && sub.modules.length > 0 ? (
                      <div className="space-y-1 pl-2 border-l border-purple-500/30">
                        {sub.modules.map((mod, mIdx) => (
                          <div key={mIdx} className="text-[11px] text-slate-300">
                            <span className="font-semibold text-slate-200">
                              Module {mod.moduleNumber}: {mod.title}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              ({mod.topics.length} topics)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : sub.topics && sub.topics.length > 0 ? (
                      <div className="text-[11px] text-slate-400">
                        {sub.topics.length} topics extracted
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Module Details View */}
          {extraction.moduleDetails && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">
                  Module {extraction.moduleDetails.moduleNumber}: {extraction.moduleDetails.moduleTitle}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {extraction.moduleDetails.subjectName}
                </span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {extraction.moduleDetails.topics.map((top, tIdx) => (
                  <div
                    key={tIdx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02] text-[11px]"
                  >
                    <span className="text-slate-300">{top.name}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-400">{top.estimatedMinutes}m</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] ${
                          top.difficulty === 'hard'
                            ? 'bg-rose-500/10 text-rose-300'
                            : top.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {top.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Action Button */}
          {onConfirm && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {confirmed
                  ? 'Ingested into your StudyVault profile'
                  : 'Ready to build or adapt your timetable?'}
              </span>
              <Button
                size="xs"
                variant={confirmed ? 'glass' : 'primary'}
                disabled={confirmed}
                onClick={onConfirm}
                icon={
                  confirmed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )
                }
              >
                {confirmed ? 'Ingested' : 'Confirm & Apply'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
