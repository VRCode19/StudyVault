import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FolderArchive,
  Search,
  Plus,
  Upload,
  FileText,
  FileCode,
  Link as LinkIcon,
  Video,
  File,
  Bookmark,
  Edit3,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Share2,
  Trash2,
  ExternalLink,
  BookOpen,
  FolderPlus,
  MoreVertical,
  Clock,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { VaultResource, PDFDocument } from '../types/studyvault';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassInput } from '../components/common/GlassInput';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassIconButton } from '../components/common/GlassIconButton';
import { GlassModal } from '../components/common/GlassModal';
import { CreateSubjectModal, DeleteSubjectModal } from '../components/vault/SubjectModals';
import { PDFViewer } from '../components/vault/PDFViewer';
import {
  storePDFFile,
  storePDFMeta,
  getAllPDFMetaForSubject,
  getAllPDFMeta,
  deletePDFFile,
  deletePDFMeta,
  deleteAllPDFsForSubject,
  updatePDFMeta,
} from '../services/indexedDBService';
import { formatDuration } from '../services/studyTrackingService';

type FilterType = 'All' | 'Notes' | 'PDFs' | 'Links' | 'Videos' | 'Documents';

// Color mapping for subjects in folder tiles
const TILE_COLORS: Record<string, 'blue' | 'violet' | 'teal' | 'clear' | 'orange'> = {};
const TILE_COLOR_CYCLE: ('blue' | 'violet' | 'teal' | 'clear' | 'orange')[] = ['blue', 'violet', 'teal', 'clear', 'orange'];

export const VaultPage: React.FC = () => {
  const {
    vaultResources,
    addResource,
    updateResource,
    deleteResource,
    activeNoteId,
    setActiveNoteId,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    showToast,
  } = useStudyVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);

  // Note Viewer editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Modals state
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || '');
  const [newType, setNewType] = useState<VaultResource['type']>('note');
  const [newContent, setNewContent] = useState('');

  // Subject management
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [editSubjectTarget, setEditSubjectTarget] = useState<any | null>(null);
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<{id: string; name: string; pdfCount: number; resourceCount: number} | null>(null);

  // PDF state
  const [subjectPDFs, setSubjectPDFs] = useState<Map<string, PDFDocument[]>>(new Map());
  const [viewingPDF, setViewingPDF] = useState<PDFDocument | null>(null);
  const [openSubjectId, setOpenSubjectId] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Load PDFs from IndexedDB
  const loadPDFs = useCallback(async () => {
    const allPDFs = await getAllPDFMeta();
    const map = new Map<string, PDFDocument[]>();
    for (const pdf of allPDFs) {
      const existing = map.get(pdf.subjectId) || [];
      existing.push(pdf);
      map.set(pdf.subjectId, existing);
    }
    setSubjectPDFs(map);
  }, []);

  useEffect(() => { loadPDFs(); }, [loadPDFs]);

  // Update subject when newSubject is empty
  useEffect(() => {
    if (!newSubject && subjects.length > 0) setNewSubject(subjects[0].name);
  }, [subjects, newSubject]);

  // Find active note if open
  const activeResource = vaultResources.find((r) => r.id === activeNoteId);

  // Dynamic subject folders from state
  const folderIcons = [
    <FileCode className="w-5 h-5 text-white" />,
    <BookOpen className="w-5 h-5 text-white" />,
    <Sparkles className="w-5 h-5 text-white" />,
    <FileText className="w-5 h-5 text-white" />,
    <FolderArchive className="w-5 h-5 text-white" />,
  ];

  // Filter resources
  const filteredResources = vaultResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.tags && res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesType =
      activeFilter === 'All'
        ? true
        : activeFilter === 'Notes'
        ? res.type === 'note'
        : activeFilter === 'PDFs'
        ? res.type === 'pdf'
        : activeFilter === 'Links'
        ? res.type === 'link'
        : activeFilter === 'Videos'
        ? res.type === 'video'
        : res.type === 'doc';

    const matchesSubject = selectedSubjectFilter ? res.subject === selectedSubjectFilter : true;

    return matchesSearch && matchesType && matchesSubject;
  });

  const handleOpenNote = (resource: VaultResource) => {
    // If it's a PDF with a document ID, open the PDF viewer
    if (resource.type === 'pdf' && resource.pdfDocumentId) {
      const allPDFs = Array.from(subjectPDFs.values()).flat();
      const pdfDoc = allPDFs.find(p => p.id === resource.pdfDocumentId);
      if (pdfDoc) {
        setViewingPDF(pdfDoc);
        return;
      }
    }
    setActiveNoteId(resource.id);
    setIsEditing(false);
    setEditTitle(resource.title);
    setEditContent(resource.content || '');
  };

  const handleStartEdit = () => {
    if (!activeResource) return;
    setEditTitle(activeResource.title);
    setEditContent(activeResource.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activeResource) return;
    updateResource(activeResource.id, {
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addResource({
      title: newTitle.trim(),
      subject: newSubject,
      type: newType,
      size: newType === 'note' ? '12 KB' : '1.5 MB',
      updatedAt: 'Just now',
      content: newContent || `# ${newTitle}\n\nEnter lecture notes and study insights here...`,
      tags: ['StudyVault', newType],
      bookmarked: false,
    });

    setIsCreateNoteOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  // ─── PDF Upload Handler ───
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !openSubjectId) return;

    const subject = subjects.find(s => s.id === openSubjectId);
    if (!subject) return;

    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        showToast('Invalid File', `${file.name} is not a PDF file.`, 'warning');
        continue;
      }

      const pdfId = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Store binary in IndexedDB
      await storePDFFile(pdfId, file);

      // Store metadata
      const meta: PDFDocument = {
        id: pdfId,
        subjectId: openSubjectId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentPage: 1,
        totalPages: 0, // Will be determined when opened
        readingProgress: 0,
        totalReadingTimeSeconds: 0,
      };
      await storePDFMeta(meta);

      // Also add as a vault resource
      addResource({
        title: file.name.replace('.pdf', ''),
        subject: subject.name,
        type: 'pdf',
        size: formatFileSize(file.size),
        updatedAt: 'Just now',
        tags: ['PDF', subject.code],
        bookmarked: false,
        pdfDocumentId: pdfId,
      });

      showToast('PDF Uploaded', `${file.name} saved to ${subject.name}.`, 'success');
    }

    // Refresh PDF list
    await loadPDFs();

    // Reset input
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  // ─── Subject CRUD ───
  const handleCreateSubject = (data: any) => {
    addSubject({
      name: data.name,
      code: data.code,
      description: data.description,
      accentColor: data.accentColor,
      glowColor: data.glowColor,
      totalTopics: 0,
      completedTopics: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      progressPercentage: 0,
      topics: [],
      professor: data.professor,
      targetDailyMinutes: data.targetDailyMinutes,
      createdAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubject = async (subjectId: string) => {
    // Clean up IndexedDB PDFs
    const deletedCount = await deleteAllPDFsForSubject(subjectId);
    if (deletedCount > 0) {
      showToast('PDFs Cleaned', `${deletedCount} PDF(s) removed from storage.`, 'info');
    }

    deleteSubject(subjectId);
    setDeleteSubjectTarget(null);
    setOpenSubjectId(null);
    await loadPDFs();
  };

  const handleDeletePDF = async (pdfId: string) => {
    await deletePDFFile(pdfId);
    await deletePDFMeta(pdfId);
    // Remove vault resource that references this PDF
    const resource = vaultResources.find(r => r.pdfDocumentId === pdfId);
    if (resource) deleteResource(resource.id);
    await loadPDFs();
    showToast('PDF Deleted', 'PDF removed from storage.', 'info');
  };

  const handlePDFProgressUpdate = useCallback(async (id: string, page: number, progress: number) => {
    await loadPDFs();
  }, [loadPDFs]);

  const getResourceIcon = (type: VaultResource['type']) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'pdf': return <File className="w-4 h-4 text-rose-400" />;
      case 'link': return <LinkIcon className="w-4 h-4 text-teal-400" />;
      case 'video': return <Video className="w-4 h-4 text-violet-400" />;
      case 'doc': return <FileCode className="w-4 h-4 text-blue-400" />;
    }
  };

  // ─── PDF Viewer ───
  if (viewingPDF) {
    const parentSub = subjects.find((s) => s.id === viewingPDF.subjectId);
    return (
      <PDFViewer
        pdfDoc={viewingPDF}
        subjectName={parentSub?.name}
        onClose={() => { setViewingPDF(null); loadPDFs(); }}
        onProgressUpdate={handlePDFProgressUpdate}
      />
    );
  }

  // ─── Subject Detail View ───
  if (openSubjectId) {
    const subject = subjects.find(s => s.id === openSubjectId);
    if (!subject) {
      setOpenSubjectId(null);
      return null;
    }

    const pdfs = subjectPDFs.get(openSubjectId) || [];
    const subjectResources = vaultResources.filter(r => r.subject === subject.name);

    return (
      <div className="space-y-6 pb-20">
        {/* Subject Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-panel liquid-glass-2 border border-white/15">
          <div className="flex items-center gap-3">
            <GlassIconButton
              icon={<ArrowLeft className="w-4 h-4" />}
              size="sm"
              variant="glass"
              onClick={() => setOpenSubjectId(null)}
              label="Back to Vault"
            />
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.accentColor }} />
                <h2 className="text-lg sm:text-xl font-bold text-white">{subject.name}</h2>
              </div>
              <p className="text-xs text-slate-400">{subject.code} • {pdfs.length} PDFs • {subjectResources.length} resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setEditSubjectTarget(subject)}
            >
              Edit Subject
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => pdfInputRef.current?.click()}
            >
              Upload PDF
            </GlassButton>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handlePDFUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* PDFs Grid */}
        {pdfs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">PDF Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pdfs.map((pdf) => (
                <GlassCard
                  key={pdf.id}
                  level={2}
                  rounded="md"
                  className="p-4 hover:border-white/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                  onClick={() => setViewingPDF(pdf)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/20 flex items-center justify-center">
                        <File className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate max-w-[180px] group-hover:text-cyan-300 transition-colors">
                          {pdf.fileName.replace('.pdf', '')}
                        </h4>
                        <p className="text-xs text-slate-500">{formatFileSize(pdf.fileSize)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePDF(pdf.id); }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {pdf.currentPage > 1 ? `Page ${pdf.currentPage}` : 'Not started'}
                        {pdf.totalPages > 0 && ` / ${pdf.totalPages}`}
                      </span>
                      <span>{pdf.readingProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-navy-800/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                        style={{ width: `${pdf.readingProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {pdf.totalReadingTimeSeconds > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(pdf.totalReadingTimeSeconds)}
                      </span>
                    )}
                    {pdf.currentPage > 1 && (
                      <span className="text-cyan-400 font-medium">
                        Continue reading →
                      </span>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Other resources for this subject */}
        {subjectResources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Notes & Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectResources.map((res) => (
                <GlassCard
                  key={res.id}
                  level={2}
                  rounded="md"
                  className="p-4 hover:border-white/25 cursor-pointer group"
                  onClick={() => handleOpenNote(res)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getResourceIcon(res.type)}
                    <span className="text-xs font-mono uppercase text-slate-400">{res.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">{res.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{res.updatedAt}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {pdfs.length === 0 && subjectResources.length === 0 && (
          <div className="p-12 text-center rounded-panel liquid-glass-1 border border-white/10 space-y-3">
            <FolderArchive className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No resources yet</h4>
            <p className="text-xs text-slate-400">Upload a PDF or create a note to get started.</p>
            <GlassButton variant="primary" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={() => pdfInputRef.current?.click()}>
              Upload PDF
            </GlassButton>
          </div>
        )}
      </div>
    );
  }

  // ─── NOTE VIEWER ───
  if (activeResource) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-panel liquid-glass-2 border border-white/15">
          <div className="flex items-center gap-3">
            <GlassIconButton icon={<ArrowLeft className="w-4 h-4" />} size="sm" variant="glass" onClick={() => setActiveNoteId(null)} label="Back to Vault" />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{activeResource.subject}</span><span>/</span>
                <span className="font-mono uppercase text-cyan-300">{activeResource.type}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate max-w-md">{activeResource.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GlassIconButton icon={<Bookmark className={`w-4 h-4 ${activeResource.bookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />} size="sm" variant="glass" onClick={() => updateResource(activeResource.id, { bookmarked: !activeResource.bookmarked })} label="Bookmark" />
            {isEditing ? (
              <GlassButton variant="primary" size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={handleSaveEdit}>Save</GlassButton>
            ) : (
              <GlassButton variant="glass" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={handleStartEdit}>Edit Note</GlassButton>
            )}
            <GlassIconButton icon={<Trash2 className="w-4 h-4 text-rose-400" />} size="sm" variant="danger" onClick={() => deleteResource(activeResource.id)} label="Delete resource" />
          </div>
        </div>

        <div className="rounded-panel liquid-glass-3 p-6 sm:p-10 border border-white/20 shadow-liquid-modal bg-navy-950/90 text-slate-100">
          {isEditing ? (
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-400 block mb-1">Document Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full liquid-input py-2.5 px-4 text-lg font-bold text-white" /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1">Markdown Content</label>
                <textarea rows={18} value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full liquid-input p-4 font-mono text-sm leading-relaxed text-slate-200" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <GlassButton variant="secondary" size="md" onClick={() => setIsEditing(false)}>Cancel</GlassButton>
                <GlassButton variant="primary" size="md" onClick={handleSaveEdit}>Save Changes</GlassButton>
              </div>
            </div>
          ) : (
            <article className="prose prose-invert max-w-none space-y-4 leading-relaxed">
              <div className="pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-400">{activeResource.subject}</span><span>•</span><span>Updated {activeResource.updatedAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeResource.tags?.map((t) => (<GlassBadge key={t} size="xs" variant="glass">{t}</GlassBadge>))}
                </div>
              </div>
              <div className="space-y-4 text-slate-200 font-sans whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {activeResource.content || (<p className="text-slate-400 italic">No text content available for this resource.</p>)}
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  // ─── MAIN VAULT VIEW ───
  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Vault</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">Digital Library</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Organize notes, PDFs, code references, and academic materials.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <GlassButton variant="glass" size="md" icon={<FolderPlus className="w-4 h-4 text-teal-400" />} onClick={() => setIsCreateSubjectOpen(true)}>
            Add Subject
          </GlassButton>
          <GlassButton variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateNoteOpen(true)}>
            Create Note
          </GlassButton>
        </div>
      </div>

      {/* Subject Folders — DYNAMIC from state */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Subject Folders</h3>
          {selectedSubjectFilter && (
            <button onClick={() => setSelectedSubjectFilter(null)} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer">
              Clear filter ({selectedSubjectFilter})
            </button>
          )}
        </div>

        {subjects.length === 0 ? (
          <div className="p-8 text-center rounded-panel liquid-glass-1 border border-white/10 space-y-3">
            <FolderPlus className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No subjects yet</h4>
            <p className="text-xs text-slate-400">Create a subject to organize your study materials.</p>
            <GlassButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsCreateSubjectOpen(true)}>
              Create Subject
            </GlassButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {subjects.map((subject, idx) => {
              const resourceCount = vaultResources.filter((r) => r.subject === subject.name).length;
              const pdfCount = (subjectPDFs.get(subject.id) || []).length;
              const isSelected = selectedSubjectFilter === subject.name;
              const tileColor = TILE_COLOR_CYCLE[idx % TILE_COLOR_CYCLE.length];

              return (
                <GlassCard
                  key={subject.id}
                  tileColor={tileColor}
                  rounded="md"
                  className={`p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group relative ${
                    isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-glow' : ''
                  }`}
                  onClick={() => setOpenSubjectId(subject.id)}
                >
                  {/* Action buttons (Edit & Delete) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditSubjectTarget(subject);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                      title="Edit / Rename Subject"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSubjectTarget({
                          id: subject.id,
                          name: subject.name,
                          pdfCount,
                          resourceCount,
                        });
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-liquid-sm">
                    {folderIcons[idx % folderIcons.length]}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                    {subject.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[11px] text-slate-300/90 font-mono">
                    <span>{subject.code}</span>
                    <span>{pdfCount} PDFs • {resourceCount} items</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-panel liquid-glass-2 border border-white/15">
        <div className="w-full md:w-96">
          <GlassInput icon={<Search className="w-4 h-4 text-cyan-400" />} placeholder="Search notes, PDFs, subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Notes', 'PDFs', 'Links', 'Videos', 'Documents'] as FilterType[]).map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-chip text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-glow border border-white/30'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredResources.length} items</span>
        </div>

        {filteredResources.length === 0 ? (
          <div className="p-12 text-center rounded-panel liquid-glass-1 border border-white/10 space-y-3">
            <FolderArchive className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No resources found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your search terms or filter criteria, or create a new note.</p>
            <GlassButton variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsCreateNoteOpen(true)}>
              Create Note
            </GlassButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <GlassCard key={res.id} level={2} rounded="md" className="p-5 flex flex-col justify-between hover:border-white/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-liquid-sm" onClick={() => handleOpenNote(res)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">{getResourceIcon(res.type)}</div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">{res.type}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); updateResource(res.id, { bookmarked: !res.bookmarked }); }} className="text-slate-400 hover:text-amber-400 transition-colors p-1" aria-label="Bookmark resource">
                      <Bookmark className={`w-4 h-4 ${res.bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">{res.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{res.subject}</p>
                  </div>
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">{res.tags.slice(0, 3).map((tag) => (<GlassBadge key={tag} size="xs" variant="glass">{tag}</GlassBadge>))}</div>
                  )}
                </div>
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{res.updatedAt}</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">Open →</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      <GlassModal isOpen={isCreateNoteOpen} onClose={() => setIsCreateNoteOpen(false)} title="Add to Study Vault" subtitle="Create a new lecture note, cheatsheet, or link">
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
            <GlassInput placeholder="e.g. Graph Algorithms & Shortest Path" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full liquid-input py-2 px-3 text-sm text-white">
                {subjects.map((s) => (<option key={s.id} value={s.name} className="bg-navy-950 text-white">{s.name}</option>))}
              </select></div>
            <div><label className="text-xs font-semibold text-slate-300 block mb-1">Format</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full liquid-input py-2 px-3 text-sm text-white">
                <option value="note" className="bg-navy-950 text-white">Lecture Note</option>
                <option value="doc" className="bg-navy-950 text-white">Slide Deck / Code</option>
                <option value="link" className="bg-navy-950 text-white">Web Link</option>
                <option value="video" className="bg-navy-950 text-white">Video Resource</option>
              </select></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-300 block mb-1">Note Content</label>
            <textarea rows={6} placeholder="Type your notes or paste Markdown here..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full liquid-input p-3 text-sm font-mono text-slate-200" /></div>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="secondary" size="md" onClick={() => setIsCreateNoteOpen(false)}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" size="md">Save to Vault</GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Subject Modals */}
      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        onSubmit={handleCreateSubject}
      />

      {deleteSubjectTarget && (
        <DeleteSubjectModal
          isOpen={true}
          onClose={() => setDeleteSubjectTarget(null)}
          onConfirm={() => handleDeleteSubject(deleteSubjectTarget.id)}
          subjectName={deleteSubjectTarget.name}
          pdfCount={deleteSubjectTarget.pdfCount}
          resourceCount={deleteSubjectTarget.resourceCount}
        />
      )}

      {editSubjectTarget && (
        <CreateSubjectModal
          isOpen={true}
          onClose={() => setEditSubjectTarget(null)}
          onSubmit={(data) => {
            updateSubject(editSubjectTarget.id, data);
            setEditSubjectTarget(null);
          }}
          editData={{
            name: editSubjectTarget.name,
            code: editSubjectTarget.code,
            description: editSubjectTarget.description,
            accentColor: editSubjectTarget.accentColor,
            professor: editSubjectTarget.professor,
            targetDailyMinutes: editSubjectTarget.targetDailyMinutes,
          }}
        />
      )}
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
