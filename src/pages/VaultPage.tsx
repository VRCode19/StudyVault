import React, { useState } from 'react';
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
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { VaultResource } from '../types/studyvault';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassInput } from '../components/common/GlassInput';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassIconButton } from '../components/common/GlassIconButton';
import { GlassModal } from '../components/common/GlassModal';

type FilterType = 'All' | 'Notes' | 'PDFs' | 'Links' | 'Videos' | 'Documents';

export const VaultPage: React.FC = () => {
  const {
    vaultResources,
    addResource,
    updateResource,
    deleteResource,
    activeNoteId,
    setActiveNoteId,
    subjects,
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
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Data Structures & Algorithms');
  const [newType, setNewType] = useState<VaultResource['type']>('note');
  const [newContent, setNewContent] = useState('');

  // Find active note if open
  const activeResource = vaultResources.find((r) => r.id === activeNoteId);

  // Subject folders with counts
  const folderData = [
    {
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      tileColor: 'blue' as const,
      icon: <FileCode className="w-5 h-5 text-white" />,
    },
    {
      name: 'Database Management Systems',
      code: 'CS304',
      tileColor: 'violet' as const,
      icon: <BookOpen className="w-5 h-5 text-white" />,
    },
    {
      name: 'Artificial Intelligence',
      code: 'CS410',
      tileColor: 'teal' as const,
      icon: <Sparkles className="w-5 h-5 text-white" />,
    },
    {
      name: 'Operating Systems',
      code: 'CS302',
      tileColor: 'clear' as const,
      icon: <FileText className="w-5 h-5 text-white" />,
    },
    {
      name: 'Discrete Mathematics',
      code: 'MA201',
      tileColor: 'orange' as const,
      icon: <FolderArchive className="w-5 h-5 text-white" />,
    },
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

  const getResourceIcon = (type: VaultResource['type']) => {
    switch (type) {
      case 'note':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'pdf':
        return <File className="w-4 h-4 text-rose-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-teal-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-violet-400" />;
      case 'doc':
        return <FileCode className="w-4 h-4 text-blue-400" />;
    }
  };

  // -------------------------------------------------------------
  // VIEW A: NOTE VIEWER (Dedicated, highly readable glass workspace)
  // -------------------------------------------------------------
  if (activeResource) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        {/* Top Note Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-panel liquid-glass-2 border border-white/15">
          <div className="flex items-center gap-3">
            <GlassIconButton
              icon={<ArrowLeft className="w-4 h-4" />}
              size="sm"
              variant="glass"
              onClick={() => setActiveNoteId(null)}
              label="Back to Vault"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{activeResource.subject}</span>
                <span>/</span>
                <span className="font-mono uppercase text-cyan-300">{activeResource.type}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate max-w-md">
                {activeResource.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassIconButton
              icon={
                <Bookmark
                  className={`w-4 h-4 ${
                    activeResource.bookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              }
              size="sm"
              variant="glass"
              onClick={() =>
                updateResource(activeResource.id, {
                  bookmarked: !activeResource.bookmarked,
                })
              }
              label="Bookmark"
            />

            {isEditing ? (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Check className="w-3.5 h-3.5" />}
                onClick={handleSaveEdit}
              >
                Save
              </GlassButton>
            ) : (
              <GlassButton
                variant="glass"
                size="sm"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={handleStartEdit}
              >
                Edit Note
              </GlassButton>
            )}

            <GlassIconButton
              icon={<Trash2 className="w-4 h-4 text-rose-400" />}
              size="sm"
              variant="danger"
              onClick={() => deleteResource(activeResource.id)}
              label="Delete resource"
            />
          </div>
        </div>

        {/* Large Glass Reading & Editing Workspace */}
        <div className="rounded-panel liquid-glass-3 p-6 sm:p-10 border border-white/20 shadow-liquid-modal bg-navy-950/90 text-slate-100">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full liquid-input py-2.5 px-4 text-lg font-bold text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Markdown Content
                </label>
                <textarea
                  rows={18}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full liquid-input p-4 font-mono text-sm leading-relaxed text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <GlassButton variant="secondary" size="md" onClick={() => setIsEditing(false)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" size="md" onClick={handleSaveEdit}>
                  Save Changes
                </GlassButton>
              </div>
            </div>
          ) : (
            <article className="prose prose-invert max-w-none space-y-4 leading-relaxed">
              <div className="pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-400">{activeResource.subject}</span>
                  <span>•</span>
                  <span>Updated {activeResource.updatedAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeResource.tags?.map((t) => (
                    <GlassBadge key={t} size="xs" variant="glass">
                      {t}
                    </GlassBadge>
                  ))}
                </div>
              </div>

              {/* Rendered content */}
              <div className="space-y-4 text-slate-200 font-sans whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {activeResource.content || (
                  <p className="text-slate-400 italic">No text content available for this resource.</p>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: VAULT DIGITAL LIBRARY (Folders, Filters, Resources)
  // -------------------------------------------------------------
  return (
    <div className="space-y-7 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your Vault
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              Digital Library
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize notes, PDFs, code references, and academic materials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="glass"
            size="md"
            icon={<Upload className="w-4 h-4 text-cyan-400" />}
            onClick={() => {
              showToast('Upload Resource', 'Select files to upload into StudyVault.', 'info');
              setIsCreateNoteOpen(true);
            }}
          >
            Upload
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateNoteOpen(true)}
          >
            Create Note
          </GlassButton>
        </div>
      </div>

      {/* Subject Folders: 5 Glowing Liquid Tiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Subject Folders
          </h3>
          {selectedSubjectFilter && (
            <button
              onClick={() => setSelectedSubjectFilter(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Clear filter ({selectedSubjectFilter})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {folderData.map((folder) => {
            const resourceCount = vaultResources.filter((r) => r.subject === folder.name).length;
            const isSelected = selectedSubjectFilter === folder.name;

            return (
              <GlassCard
                key={folder.name}
                tileColor={folder.tileColor}
                rounded="md"
                className={`p-4 cursor-pointer hover:-translate-y-1.5 transition-all duration-200 group ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-glow' : ''
                }`}
                onClick={() =>
                  setSelectedSubjectFilter(isSelected ? null : folder.name)
                }
              >
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-liquid-sm">
                  {folder.icon}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                  {folder.name}
                </h4>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[11px] text-slate-300/90 font-mono">
                  <span>{folder.code}</span>
                  <span>{resourceCount} items</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-panel liquid-glass-2 border border-white/15">
        <div className="w-full md:w-96">
          <GlassInput
            icon={<Search className="w-4 h-4 text-cyan-400" />}
            placeholder="Search notes, PDFs, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Notes', 'PDFs', 'Links', 'Videos', 'Documents'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
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
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or filter criteria, or create a new note.
            </p>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateNoteOpen(true)}
            >
              Create Note
            </GlassButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <GlassCard
                key={res.id}
                level={2}
                rounded="md"
                className="p-5 flex flex-col justify-between hover:border-white/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-liquid-sm"
                onClick={() => handleOpenNote(res)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                        {getResourceIcon(res.type)}
                      </div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                        {res.type}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateResource(res.id, { bookmarked: !res.bookmarked });
                      }}
                      className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                      aria-label="Bookmark resource"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          res.bookmarked ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{res.subject}</p>
                  </div>

                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {res.tags.slice(0, 3).map((tag) => (
                        <GlassBadge key={tag} size="xs" variant="glass">
                          {tag}
                        </GlassBadge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{res.updatedAt}</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                    Open Note →
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Note / Resource Modal */}
      <GlassModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        title="Add to Study Vault"
        subtitle="Create a new lecture note, cheatsheet, or link"
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
            <GlassInput
              placeholder="e.g. Graph Algorithms & Shortest Path"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} className="bg-navy-950 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Format</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full liquid-input py-2 px-3 text-sm text-white"
              >
                <option value="note" className="bg-navy-950 text-white">Lecture Note</option>
                <option value="pdf" className="bg-navy-950 text-white">PDF Document</option>
                <option value="doc" className="bg-navy-950 text-white">Slide Deck / Code</option>
                <option value="link" className="bg-navy-950 text-white">Web Link</option>
                <option value="video" className="bg-navy-950 text-white">Video Resource</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Note Content / Notes
            </label>
            <textarea
              rows={6}
              placeholder="Type your notes or paste Markdown here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full liquid-input p-3 text-sm font-mono text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateNoteOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="md">
              Save to Vault
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
