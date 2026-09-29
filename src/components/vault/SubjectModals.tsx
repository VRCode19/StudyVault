import React, { useState } from 'react';
import { Plus, Edit3, Trash2, AlertTriangle, X, FolderPlus } from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';

const SUBJECT_COLORS = [
  { accent: '#2563eb', glow: 'rgba(37,99,235,0.4)', label: 'Blue' },
  { accent: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', label: 'Violet' },
  { accent: '#06b6d4', glow: 'rgba(6,182,212,0.4)', label: 'Cyan' },
  { accent: '#14b8a6', glow: 'rgba(20,184,166,0.4)', label: 'Teal' },
  { accent: '#f97316', glow: 'rgba(249,115,22,0.4)', label: 'Orange' },
  { accent: '#ef4444', glow: 'rgba(239,68,68,0.4)', label: 'Red' },
  { accent: '#ec4899', glow: 'rgba(236,72,153,0.4)', label: 'Pink' },
  { accent: '#22c55e', glow: 'rgba(34,197,94,0.4)', label: 'Green' },
];

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    description?: string;
    accentColor: string;
    glowColor: string;
    professor?: string;
    targetDailyMinutes?: number;
  }) => void;
  editData?: {
    name: string;
    code: string;
    description?: string;
    accentColor: string;
    professor?: string;
    targetDailyMinutes?: number;
  };
}

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const [name, setName] = useState(editData?.name || '');
  const [code, setCode] = useState(editData?.code || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [selectedColor, setSelectedColor] = useState(
    SUBJECT_COLORS.find(c => c.accent === editData?.accentColor) || SUBJECT_COLORS[0]
  );
  const [professor, setProfessor] = useState(editData?.professor || '');
  const [targetMinutes, setTargetMinutes] = useState(editData?.targetDailyMinutes?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      code: code.trim() || `SUB${Date.now() % 1000}`,
      description: description.trim() || undefined,
      accentColor: selectedColor.accent,
      glowColor: selectedColor.glow,
      professor: professor.trim() || undefined,
      targetDailyMinutes: targetMinutes ? parseInt(targetMinutes, 10) : undefined,
    });
    // Reset
    setName('');
    setCode('');
    setDescription('');
    setProfessor('');
    setTargetMinutes('');
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Subject' : 'Create Subject'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Subject Name *</label>
          <GlassInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Database Management Systems"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Subject Code</label>
          <GlassInput
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CS304"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the subject..."
            rows={2}
            className="w-full liquid-input p-3 text-sm text-slate-200 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Professor / Faculty</label>
          <GlassInput
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="e.g. Dr. Smith"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Daily Study Target (minutes)</label>
          <GlassInput
            value={targetMinutes}
            onChange={(e) => setTargetMinutes(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 90"
            type="number"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((color) => (
              <button
                key={color.accent}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  selectedColor.accent === color.accent
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-900 scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color.accent }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton variant="secondary" size="md" onClick={onClose} type="button">
            Cancel
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            type="submit"
            icon={editData ? <Edit3 className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
          >
            {editData ? 'Save Changes' : 'Create Subject'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};

// ─── Delete Confirmation Modal ───

interface DeleteSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subjectName: string;
  pdfCount: number;
  resourceCount: number;
}

export const DeleteSubjectModal: React.FC<DeleteSubjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subjectName,
  pdfCount,
  resourceCount,
}) => {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Delete Subject">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-400/20">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-300">
              Are you sure you want to delete "{subjectName}"?
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {(pdfCount > 0 || resourceCount > 0) && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20">
            <p className="text-xs text-amber-300 font-semibold mb-1">Warning: Data will be lost</p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              {pdfCount > 0 && (
                <li>• {pdfCount} PDF{pdfCount > 1 ? 's' : ''} stored in this subject will be permanently deleted</li>
              )}
              {resourceCount > 0 && (
                <li>• {resourceCount} vault resource{resourceCount > 1 ? 's' : ''} will be removed</li>
              )}
              <li>• All study sessions and records for this subject will be cleared</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton variant="secondary" size="md" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            onClick={onConfirm}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            className="!bg-rose-600 hover:!bg-rose-500"
          >
            Delete Subject
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
