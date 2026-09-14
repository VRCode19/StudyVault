import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Code,
  Image as ImageIcon,
  Layers,
  X,
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
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsingSteps = [
    { title: 'Reading syllabus document & images...', icon: <FileText className="w-4 h-4" /> },
    { title: 'Vision model identifying core subjects & modules...', icon: <Cpu className="w-4 h-4" /> },
    { title: 'Breaking modules into structured topics...', icon: <Code className="w-4 h-4" /> },
    { title: 'Estimating cognitive load & study time...', icon: <Sparkles className="w-4 h-4" /> },
    { title: 'Synthesizing adaptive schedule...', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    if (fileList.length === 1) {
      runSyllabusParser(fileList[0]);
    } else {
      setStagedFiles(fileList);
    }
  };

  const handleStartMultiFileParsing = () => {
    if (stagedFiles.length > 0) {
      runSyllabusParser(stagedFiles);
      setStagedFiles([]);
    }
  };

  const handleRemoveStagedFile = (idx: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handlePasteSubmit = () => {
    setIsPasteModalOpen(false);
    if (pasteText.trim()) {
      runSyllabusParser(pasteText.trim());
    }
  };

  const handleLoadSample = () => {
    setPasteText(SAMPLE_SYLLABUS_TEXT);
    runSyllabusParser(SAMPLE_SYLLABUS_TEXT);
  };

  return (
    <>
      <GlassCard
        variant="elevated"
        rounded="lg"
        className="p-6 sm:p-10 border-blue-500/20 text-center relative overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 ambient-glow-blue opacity-50" />

        {/* Drag & drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-dark-900/95 border-2 border-dashed border-cyan-400/80 rounded-2xl backdrop-blur-md animate-fadeIn">
            <UploadCloud className="w-16 h-16 text-cyan-400 animate-bounce mb-3" />
            <h3 className="text-lg font-bold text-white">Drop syllabus or module files here</h3>
            <p className="text-xs text-slate-400 mt-1">Supports images, PDF, and text documents</p>
          </div>
        )}

        {isParsingSyllabus ? (
          /* Live 5-step animated parsing state */
          <div className="py-6 max-w-md mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-cyan-400 mx-auto shadow-cyan-glow">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                AI Vision & Curriculum Engine Active
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Parsing document structure, extracting modules, and estimating study time without hallucinations.
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
        ) : stagedFiles.length > 0 ? (
          /* Multi-file staged review before parsing */
          <div className="max-w-md mx-auto space-y-5 animate-fadeIn">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {stagedFiles.length} Document(s) Selected
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The multimodal AI will parse all pages and synthesize your unified syllabus.
              </p>
            </div>

            {/* Staged file list */}
            <div className="space-y-2 max-h-48 overflow-y-auto text-left">
              {stagedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="text-slate-200 truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStagedFile(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStagedFiles([])}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartMultiFileParsing}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze All ({stagedFiles.length})
              </Button>
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
                Upload images, PDF pages, or text outlines. Studyvault's vision engine extracts subjects and modules, estimates durations, and builds an adaptive schedule.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".pdf,.txt,.docx,.doc,.jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="tactile-btn tactile-primary-btn px-5 py-2.5 rounded-tactile text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer shadow-blue-glow"
              >
                <UploadCloud className="w-4 h-4" />
                Upload syllabus / images
              </button>

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
              Supported formats: Images (JPG, PNG, WebP), PDF, TXT, DOCX • Multi-page & multi-module upload supported
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
