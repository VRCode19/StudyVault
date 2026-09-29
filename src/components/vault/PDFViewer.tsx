import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Square,
  BookOpen,
} from 'lucide-react';
import { GlassIconButton } from '../common/GlassIconButton';
import type { PDFDocument } from '../../types/studyvault';
import { getPDFFile, updatePDFMeta } from '../../services/indexedDBService';
import { addStudyRecord, formatDuration } from '../../services/studyTrackingService';

interface PDFViewerProps {
  pdfDoc: PDFDocument;
  subjectName?: string;
  onClose: () => void;
  onProgressUpdate: (id: string, page: number, progress: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfDoc, subjectName, onClose, onProgressUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfInstance, setPdfInstance] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(pdfDoc.currentPage || 1);
  const [totalPages, setTotalPages] = useState(pdfDoc.totalPages || 0);
  const [zoom, setZoom] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [timerActive, setTimerActive] = useState(true);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerStartRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Load PDF
  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        setLoading(true);
        const blob = await getPDFFile(pdfDoc.id);
        if (!blob || cancelled) {
          setError('PDF file not found in storage.');
          setLoading(false);
          return;
        }

        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (cancelled) return;
        setPdfInstance(pdf);
        setTotalPages(pdf.numPages);

        // Update metadata with totalPages
        await updatePDFMeta(pdfDoc.id, {
          totalPages: pdf.numPages,
          lastOpenedAt: new Date().toISOString(),
        });

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error('[PDFViewer] Load error:', err);
          setError('Failed to load PDF. The file may be corrupted.');
          setLoading(false);
        }
      }
    }

    loadPDF();
    return () => { cancelled = true; };
  }, [pdfDoc.id]);

  // Render current page
  useEffect(() => {
    if (!pdfInstance || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      try {
        const page = await pdfInstance.getPage(currentPage);
        if (cancelled) return;

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        const viewport = page.getViewport({ scale: zoom * 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (err) {
        console.error('[PDFViewer] Render error:', err);
      }
    }

    renderPage();
    return () => { cancelled = true; };
  }, [pdfInstance, currentPage, zoom]);

  // Timer logic using timestamps (not intervals)
  useEffect(() => {
    if (!timerActive || timerPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    timerStartRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - timerStartRef.current) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerActive, timerPaused]);

  // Visibility API — pause timer when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerActive && !timerPaused) {
          // Accumulate elapsed time
          const now = Date.now();
          accumulatedRef.current += Math.floor((now - timerStartRef.current) / 1000);
          setTimerPaused(true);
        }
      } else {
        if (timerActive && timerPaused) {
          setTimerPaused(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timerActive, timerPaused]);

  // Save progress periodically (every 30 seconds) and on pause
  useEffect(() => {
    const saveProgress = async () => {
      const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
      await updatePDFMeta(pdfDoc.id, {
        currentPage,
        readingProgress: progress,
        totalReadingTimeSeconds: pdfDoc.totalReadingTimeSeconds + elapsedSeconds,
      });
      onProgressUpdate(pdfDoc.id, currentPage, progress);
      lastSaveRef.current = Date.now();
    };

    const saveInterval = setInterval(() => {
      if (elapsedSeconds > 0) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [currentPage, totalPages, elapsedSeconds, pdfDoc.id, pdfDoc.totalReadingTimeSeconds, onProgressUpdate]);

  // Handle pause toggle
  const togglePause = useCallback(() => {
    if (timerPaused) {
      // Resume: reset start time
      setTimerPaused(false);
    } else {
      // Pause: accumulate
      const now = Date.now();
      accumulatedRef.current += Math.floor((now - timerStartRef.current) / 1000);
      setTimerPaused(true);
    }
  }, [timerPaused]);

  // Handle stop & close
  const handleStop = useCallback(async () => {
    // Calculate final duration
    let finalSeconds = accumulatedRef.current;
    if (timerActive && !timerPaused) {
      finalSeconds += Math.floor((Date.now() - timerStartRef.current) / 1000);
    }
    setTimerActive(false);

    // Save study record if meaningful (> 10 seconds)
    if (finalSeconds > 10) {
      const record = {
        id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId: pdfDoc.subjectId,
        subjectName: subjectName || pdfDoc.subjectId,
        pdfId: pdfDoc.id,
        pdfName: pdfDoc.fileName,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date(Date.now() - finalSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: finalSeconds,
        type: 'pdf_reading' as const,
        source: 'vault' as const,
        createdAt: new Date().toISOString(),
      };

      await addStudyRecord(record);
    }

    // Save final PDF progress
    const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
    await updatePDFMeta(pdfDoc.id, {
      currentPage,
      readingProgress: progress,
      totalReadingTimeSeconds: pdfDoc.totalReadingTimeSeconds + finalSeconds,
      lastReadingSession: new Date().toISOString(),
    });
    onProgressUpdate(pdfDoc.id, currentPage, progress);

    onClose();
  }, [timerActive, timerPaused, pdfDoc, currentPage, totalPages, subjectName, onClose, onProgressUpdate]);

  // Window beforeunload & pagehide safety — prevent time loss on accidental close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      let finalSeconds = accumulatedRef.current;
      if (timerActive && !timerPaused) {
        finalSeconds += Math.floor((Date.now() - timerStartRef.current) / 1000);
      }
      if (finalSeconds > 10) {
        const record = {
          id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          subjectId: pdfDoc.subjectId,
          subjectName: subjectName || pdfDoc.subjectId,
          pdfId: pdfDoc.id,
          pdfName: pdfDoc.fileName,
          date: new Date().toISOString().split('T')[0],
          startTime: new Date(Date.now() - finalSeconds * 1000).toISOString(),
          endTime: new Date().toISOString(),
          durationSeconds: finalSeconds,
          type: 'pdf_reading' as const,
          source: 'vault' as const,
          createdAt: new Date().toISOString(),
        };
        addStudyRecord(record).catch(() => {});
        const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
        updatePDFMeta(pdfDoc.id, {
          currentPage,
          readingProgress: progress,
          totalReadingTimeSeconds: pdfDoc.totalReadingTimeSeconds + finalSeconds,
          lastReadingSession: new Date().toISOString(),
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [timerActive, timerPaused, pdfDoc, currentPage, totalPages, subjectName]);

  // Page navigation
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Zoom
  const zoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom(z => Math.max(0.5, z - 0.25));

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToNextPage();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPrevPage();
      if (e.key === 'Escape') handleStop();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, handleStop]);

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-50 bg-navy-950/95 flex items-center justify-center">
        <div className="liquid-glass-3 p-8 rounded-2xl border border-white/15 text-center max-w-md">
          <BookOpen className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Unable to Load PDF</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-navy-950/98 flex flex-col"
    >
      {/* Glass Control Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 liquid-glass-2 border-b border-white/10 backdrop-blur-xl gap-2">
        {/* Left: File info + Timer */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block min-w-0">
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{pdfDoc.fileName}</p>
          </div>
          <div className="flex items-center gap-2 bg-navy-800/60 px-3 py-1 rounded-xl border border-white/10">
            <span className={`inline-block w-2 h-2 rounded-full ${timerPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-sm font-mono text-white tabular-nums">{formatTimer(elapsedSeconds)}</span>
          </div>
          <div className="flex items-center gap-1">
            <GlassIconButton
              icon={timerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              size="sm"
              variant="glass"
              onClick={togglePause}
              label={timerPaused ? 'Resume' : 'Pause'}
            />
            <GlassIconButton
              icon={<Square className="w-3.5 h-3.5 text-rose-400" />}
              size="sm"
              variant="glass"
              onClick={handleStop}
              label="Stop & Save"
            />
          </div>
        </div>

        {/* Center: Page navigation */}
        <div className="flex items-center gap-2">
          <GlassIconButton
            icon={<ChevronLeft className="w-4 h-4" />}
            size="sm"
            variant="glass"
            onClick={goToPrevPage}
            label="Previous"
          />
          <span className="text-sm font-mono text-white tabular-nums min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <GlassIconButton
            icon={<ChevronRight className="w-4 h-4" />}
            size="sm"
            variant="glass"
            onClick={goToNextPage}
            label="Next"
          />
        </div>

        {/* Right: Zoom + Fullscreen + Close */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1">
            <GlassIconButton icon={<ZoomOut className="w-3.5 h-3.5" />} size="sm" variant="glass" onClick={zoomOut} label="Zoom out" />
            <span className="text-xs text-slate-400 font-mono min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <GlassIconButton icon={<ZoomIn className="w-3.5 h-3.5" />} size="sm" variant="glass" onClick={zoomIn} label="Zoom in" />
          </div>
          <GlassIconButton
            icon={isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            size="sm"
            variant="glass"
            onClick={toggleFullscreen}
            label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          />
          <GlassIconButton
            icon={<X className="w-4 h-4 text-rose-400" />}
            size="sm"
            variant="danger"
            onClick={handleStop}
            label="Close"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-1 bg-navy-800/60 relative">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-navy-950/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm">Loading PDF...</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-lg shadow-xl"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />
        )}
      </div>

      {/* Mobile floating controls */}
      <div className="sm:hidden flex-shrink-0 flex items-center justify-around px-4 py-2 liquid-glass-2 border-t border-white/10">
        <button onClick={zoomOut} className="text-slate-300 p-2"><ZoomOut className="w-5 h-5" /></button>
        <button onClick={goToPrevPage} className="text-slate-300 p-2"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-xs text-white font-mono">{progress}%</span>
        <button onClick={goToNextPage} className="text-slate-300 p-2"><ChevronRight className="w-5 h-5" /></button>
        <button onClick={zoomIn} className="text-slate-300 p-2"><ZoomIn className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
