import React, { useState } from 'react';
import { FileText, Eye, X } from 'lucide-react';
import { ChatAttachment } from '../../types/studyvault';

interface ImageAttachmentProps {
  attachment: ChatAttachment;
  onRemove?: () => void;
  interactive?: boolean;
}

export const ImageAttachment: React.FC<ImageAttachmentProps> = ({
  attachment,
  onRemove,
  interactive = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = attachment.type === 'image';

  return (
    <>
      <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-dark-900/80 border border-white/10 hover:border-cyan-500/40 transition-all shadow-tactile text-left">
        {/* Preview thumbnail or file icon */}
        {isImage ? (
          <div
            className={`relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shrink-0 ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onClick={() => interactive && setIsExpanded(true)}
          >
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {interactive && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
        )}

        {/* File info */}
        <div className="min-w-0 max-w-[140px] text-xs">
          <p className="font-medium text-white truncate text-[11px]">{attachment.name}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            {formatFileSize(attachment.size)}
          </p>
        </div>

        {/* Remove button if inside input draft */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 p-1 rounded-full bg-white/10 hover:bg-rose-500/30 hover:text-rose-300 text-slate-400 transition-colors"
            aria-label="Remove attachment"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Expanded image modal */}
      {isExpanded && isImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-dark-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-xs font-mono text-slate-300 truncate max-w-md">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={attachment.previewUrl}
                alt={attachment.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
