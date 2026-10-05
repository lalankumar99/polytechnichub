import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Layers,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { extractDriveFileId, resolveGoogleDriveUrls } from '../utils/googleDrive';

interface DriveReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchViewer: (driveSource: string, title?: string) => void;
}

export const DriveReaderModal: React.FC<DriveReaderModalProps> = ({
  isOpen,
  onClose,
  onLaunchViewer
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [docTitle, setDocTitle] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setParseError('Please enter a Google Drive link or File ID.');
      return;
    }

    const fileId = extractDriveFileId(trimmed);
    if (!fileId) {
      setParseError('Could not find a valid Google Drive File ID. Please check the URL format.');
      return;
    }

    const titleToUse = docTitle.trim() || `Google Drive Document`;
    onLaunchViewer(trimmed, titleToUse);
    onClose();
  };

  const handleUseSample = (sampleUrl: string, sampleTitle: string) => {
    setInputVal(sampleUrl);
    setDocTitle(sampleTitle);
    setParseError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0d1117] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-100 space-y-6">
        
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Custom Drive PDF Viewer</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fullscreen reading mode with zero Google Drive branding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Google Drive Share Link or File ID</span>
              <span className="text-[10px] text-cyan-400 font-mono">Public / Anyone with link</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value);
                  setParseError(null);
                }}
                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
            {parseError && (
              <p className="text-xs text-rose-400 font-medium pt-1">
                {parseError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Document Title (Optional)
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="e.g. Electrical Circuit Theory — Semester 3"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Quick Sample Links */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Or Try A Quick Demo Drive File:
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleUseSample('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing', 'Polytechnic Engineering Syllabus & Curriculum')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-200">Sample 1:</span> Engineering Syllabus Guide
                </div>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleUseSample('1s_vR95G9F2d9W3T1N9Y1L8X4C6B2M7Q0', 'Applied Mathematics-II Formula Sheet')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-200">Sample 2:</span> Formula Sheet (Raw File ID)
                </div>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 py-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Zero Google Drive UI/Header</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Auto-Landscape & Fullscreen</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Pinch-to-Zoom & Panning</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Direct Instant Download</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_0_24px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <span>Launch Native Custom Viewer</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

        </form>
      </div>
    </div>
  );
};
