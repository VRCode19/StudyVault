import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Code,
  FileCode,
} from 'lucide-react';
import { useStudyVault } from '../../context/StudyVaultContext';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SAMPLE_SYLLABUS_TEXT } from '../../mock/demoData';

export const SyllabusUploader: React.FC = () => {
  const { isParsingSyllabus, parsingStep, runSyllabusParser } = useStudyVault();

  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const parsingSteps = [
    { title: 'Reading syllabus document...', icon: <FileText className="w-4 h-4" /> },
    { title: 'Identifying core subjects & modules...', icon: <Cpu className="w-4 h-4" /> },
    { title: 'Breaking modules into structured topics...', icon: <Code className="w-4 h-4" /> },
    { title: 'Estimating cognitive load & study time...', icon: <Sparkles className="w-4 h-4" /> },
    { title: 'Synthesizing adaptive schedule...', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      runSyllabusParser();
    }
  };

  const handlePasteSubmit = () => {
    setIsPasteModalOpen(false);
    runSyllabusParser();
  };

  const handleLoadSample = () => {
    setPasteText(SAMPLE_SYLLABUS_TEXT);
    runSyllabusParser();
  };

  return (
    <>
      <GlassCard
        variant="elevated"
        rounded="lg"
        className="p-6 sm:p-10 border-blue-500/20 text-center relative overflow-hidden"
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 ambient-glow-blue opacity-50" />

        {isParsingSyllabus ? (
          /* Live 5-step animated parsing state */
          <div className="py-6 max-w-md mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-cyan-400 mx-auto shadow-cyan-glow">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                AI Scheduling Engine Active
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Analyzing cognitive weight and formatting adaptive study sessions.
              </p>
            </div>

            {/* Step list */}
            <div className="space-y-3 text-left">
              {parsingSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCurrent = parsingStep === stepNum;
                const isFinished = parsingStep > stepNum;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                      isFinished
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : isCurrent
                        ? 'bg-blue-600/20 border-blue-500/40 text-white shadow-blue-glow/20'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1 rounded-lg bg-white/5">
                        {isFinished ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          step.icon
                        )}
                      </span>
                      <span className="text-xs font-semibold">{step.title}</span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase">
                        Processing...
                      </span>
                    )}
                    {isFinished && (
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">
                        Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Normal Upload Dropzone */
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 text-blue-400 mx-auto shadow-tactile group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-blue-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Turn your syllabus into a study plan
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Upload a PDF, timetable, or paste your module list. Studyvault extracts topics, estimates duration, and creates an adaptive schedule.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="tactile-btn tactile-primary-btn px-5 py-2.5 rounded-tactile text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer shadow-blue-glow">
                  <UploadCloud className="w-4 h-4" />
                  Upload syllabus
                </span>
              </label>

              <Button
                variant="glass"
                size="md"
                onClick={() => setIsPasteModalOpen(true)}
                icon={<FileText className="w-4 h-4 text-slate-300" />}
              >
                Paste text
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleLoadSample}
                icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              >
                Use sample CS syllabus
              </Button>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Supported formats: PDF, TXT, DOCX • Automatic topic and exam countdown extraction
            </div>
          </div>
        )}
      </GlassCard>

      {/* Paste Syllabus Modal */}
      <Modal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        title="Paste Syllabus or Course Curriculum"
        subtitle="Paste your raw course outline, topics, or weekly timetable"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <textarea
            rows={8}
            placeholder="Paste your course outline, modules, or syllabus text here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-dark-900 text-white placeholder-slate-500 border border-white/10 text-xs font-mono focus:border-blue-500 focus:outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPasteText(SAMPLE_SYLLABUS_TEXT)}
            >
              Insert CS Curriculum Template
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPasteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePasteSubmit}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Parse & Build Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
