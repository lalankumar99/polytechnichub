import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  Check,
  Expand,
  Lock,
  Unlock,
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { extractDriveFileId, resolveGoogleDriveUrls } from '../utils/googleDrive';

// Configure PDF.js worker URL (using reliable CDN fallback matching the pdfjs-dist version)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
}

export interface DrivePdfViewerProps {
  /** Google Drive share link (e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing) OR raw File ID */
  driveSource: string;
  /** Optional custom document title to display */
  title?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Callback fired when user closes or exits the viewer */
  onClose?: () => void;
  /** Whether to automatically launch fullscreen and attempt landscape orientation */
  autoFullscreen?: boolean;
  /** Auto-hide delay for toolbars in milliseconds (default: 3500ms). Set to 0 to disable auto-hide */
  autoHideDelay?: number;
  /** Additional CSS class names */
  className?: string;
}

export const DrivePdfViewer: React.FC<DrivePdfViewerProps> = ({
  driveSource,
  title,
  subtitle,
  onClose,
  autoFullscreen = false,
  autoHideDelay = 3500,
  className = ''
}) => {
  // 1. Google Drive URL Resolution
  const resolved = resolveGoogleDriveUrls(driveSource);
  const fileId = resolved?.fileId || extractDriveFileId(driveSource) || '';
  const isDrive = !!fileId;
  const directDownloadUrl = resolved?.directDownloadUrl || (isDrive ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveSource);
  const streamUrl = resolved?.proxyStreamUrl || (isDrive ? `/api/proxy/drive-pdf?fileId=${fileId}` : driveSource);
  const embeddedDriveUrl = resolved?.embeddedStreamUrl || (isDrive ? `https://drive.google.com/file/d/${fileId}/preview` : driveSource);

  // DOM Container & Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const autoHideTimerRef = useRef<any>(null);

  // Document & Render State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageInputVal, setPageInputVal] = useState<string>('1');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState<boolean>(false);

  // Zoom & Rotation State
  const [scale, setScale] = useState<number>(1.0); // 1.0 = 100%
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width');

  // Fullscreen & UI Visibility State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [controlsPinned, setControlsPinned] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [landscapeLocked, setLandscapeLocked] = useState<boolean>(false);

  // Multi-Touch Pinch-to-Zoom Ref
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
    isPinching: boolean;
  }>({ initialDist: 0, initialScale: 1.0, isPinching: false });

  // -------------------------------------------------------------
  // Fullscreen & Orientation Lock Logic
  // -------------------------------------------------------------
  const toggleFullscreen = useCallback(async () => {
    try {
      const isCurrentlyFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isCurrentlyFs) {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
        try {
          if (screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
          setLandscapeLocked(false);
        } catch (e) {}
      } else {
        const el = containerRef.current || document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          (el as any).msRequestFullscreen();
        }
        setIsFullscreen(true);

        // Attempt Auto-Landscape orientation lock
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
            setLandscapeLocked(true);
          } catch (e1) {
            try {
              await (screen.orientation as any).lock('landscape-primary');
              setLandscapeLocked(true);
            } catch (e2) {
              setLandscapeLocked(false);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  // Enter fullscreen on mount if autoFullscreen is set
  useEffect(() => {
    if (autoFullscreen) {
      const timer = setTimeout(() => {
        toggleFullscreen();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFullscreen, toggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(isFs);
      if (!isFs && landscapeLocked) {
        try {
          if (screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
        } catch (e) {}
        setLandscapeLocked(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [landscapeLocked]);

  // -------------------------------------------------------------
  // Auto-hide Controls Logic
  // -------------------------------------------------------------
  const resetAutoHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsPinned || autoHideDelay === 0) return;

    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
    autoHideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, autoHideDelay);
  }, [controlsPinned, autoHideDelay]);

  useEffect(() => {
    resetAutoHideTimer();
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [resetAutoHideTimer]);

  const handleUserActivity = () => {
    resetAutoHideTimer();
  };

  // -------------------------------------------------------------
  // Load PDF with PDF.js
  // -------------------------------------------------------------
  useEffect(() => {
    if (!driveSource) {
      setError('Invalid or missing PDF source.');
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);
    setLoadProgress(20);

    const loadDocument = async () => {
      try {
        setLoadProgress(40);
        // We load via our internal server proxy endpoint to completely eliminate CORS restrictions
        const loadingTask = pdfjsLib.getDocument({
          url: streamUrl,
          withCredentials: false,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',
          cMapPacked: true
        });

        loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
          if (progressData.total > 0) {
            const pct = Math.round((progressData.loaded / progressData.total) * 100);
            setLoadProgress(Math.min(Math.max(pct, 20), 95));
          }
        };

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setPageInputVal('1');
        setLoadProgress(100);
        setLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn('PDF.js primary load failed, trying fallback stream...', err);

        // Try direct download URL fallback
        try {
          const directTask = pdfjsLib.getDocument({
            url: directDownloadUrl,
            withCredentials: false
          });
          const doc = await directTask.promise;
          if (isCancelled) return;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        } catch (err2: any) {
          if (isCancelled) return;
          console.warn('Direct stream also failed, switching to Google Drive Clean Stream Mode', err2);
          setUseFallbackEmbed(true);
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [fileId, streamUrl, directDownloadUrl]);

  // -------------------------------------------------------------
  // Render Page to Canvas
  // -------------------------------------------------------------
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > numPages) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Base unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1, rotation });

      // Determine scale based on fit mode
      let activeScale = scale;
      const containerWidth = containerRef.current ? containerRef.current.clientWidth - 48 : 800;
      const containerHeight = containerRef.current ? containerRef.current.clientHeight - 140 : 600;

      if (fitMode === 'width' && containerWidth > 100) {
        activeScale = (containerWidth / unscaledViewport.width) * scale;
      } else if (fitMode === 'page' && containerHeight > 100) {
        const scaleW = containerWidth / unscaledViewport.width;
        const scaleH = containerHeight / unscaledViewport.height;
        activeScale = Math.min(scaleW, scaleH) * scale;
      }

      // Handle HiDPI / Retina screens for ultra-crisp text rendering
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
      const viewport = page.getViewport({ scale: activeScale, rotation });

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);

      // Cyberpunk clean background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      const renderContext = {
        canvasContext: ctx,
        viewport
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      ctx.restore();
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering PDF page:', err);
      }
    }
  }, [pdfDoc, currentPage, numPages, scale, rotation, fitMode]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // -------------------------------------------------------------
  // Page Navigation Handlers
  // -------------------------------------------------------------
  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setPageInputVal(String(prev));
      resetAutoHideTimer();
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInputVal(String(next));
      resetAutoHideTimer();
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setCurrentPage(parsed);
    } else {
      setPageInputVal(String(currentPage));
    }
    resetAutoHideTimer();
  };

  // -------------------------------------------------------------
  // Zoom & Rotate Handlers
  // -------------------------------------------------------------
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.15, 3.5));
    setFitMode('custom');
    resetAutoHideTimer();
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.15, 0.4));
    setFitMode('custom');
    resetAutoHideTimer();
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setFitMode('width');
    resetAutoHideTimer();
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    resetAutoHideTimer();
  };

  // -------------------------------------------------------------
  // Touch Gestures: Pinch-to-zoom
  // -------------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    resetAutoHideTimer();
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialScale: scale,
        isPinching: true
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStateRef.current.initialDist > 10) {
        const factor = dist / touchStateRef.current.initialDist;
        const newScale = Math.min(Math.max(touchStateRef.current.initialScale * factor, 0.4), 3.5);
        setScale(newScale);
        setFitMode('custom');
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStateRef.current.isPinching = false;
    }
  };

  // -------------------------------------------------------------
  // Keyboard Shortcuts
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, isFullscreen, onClose, toggleFullscreen]);

  // -------------------------------------------------------------
  // Direct Download Trigger
  // -------------------------------------------------------------
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const fileName = (title ? `${title.replace(/\s+/g, '_')}.pdf` : `Document_${fileId}.pdf`);

      // Fetch file data through proxy or direct download URL
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error('Proxy fetch failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.warn('Proxy download failed, attempting direct Google link download...', err);
      // Fallback: direct download link trigger
      const link = document.createElement('a');
      link.href = directDownloadUrl;
      link.download = title || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
      resetAutoHideTimer();
    }
  };

  const handleOpenInNewTab = () => {
    window.open(directDownloadUrl, '_blank', 'noopener,noreferrer');
    resetAutoHideTimer();
  };

  const handleExitViewer = () => {
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {}
    }
    if (onClose) onClose();
  };

  const displayTitle = title || `Google Drive Document (${fileId.slice(0, 12)}...)`;

  // -------------------------------------------------------------
  // RENDER COMPONENT
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 z-50 bg-[#0d1117] text-slate-100 flex flex-col h-screen w-screen overflow-hidden select-none font-sans ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. TOP GLASSMORPHIC CYBERPUNK HEADER (AUTO-HIDES)        */}
      {/* ========================================================= */}
      <header
        className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ease-out transform ${
          controlsVisible || controlsPinned
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-2 sm:mx-4 mt-2 sm:mt-3 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl bg-[#0d1117]/85 backdrop-blur-xl border border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between">
          
          {/* Left: Back/Close & Document Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={handleExitViewer}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/60 shrink-0"
              title="Close Viewer (Esc)"
              aria-label="Close Viewer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 shrink-0">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>PDF NATIVE</span>
                </span>
                <h1 className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-xl">
                  {displayTitle}
                </h1>
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-400 truncate max-w-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action Buttons & Settings */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Direct Instant Download */}
            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/60 flex items-center space-x-1.5 text-xs font-semibold"
              title="Direct Download PDF (Instant, no Google tabs)"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-cyan-400" />
              )}
              <span className="hidden md:inline">Download</span>
            </button>

            {/* Open in Browser Tab */}
            <button
              onClick={handleOpenInNewTab}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/60"
              title="Open direct file in new browser tab"
            >
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </button>

            {/* Pin/Unpin Controls */}
            <button
              onClick={() => setControlsPinned(!controlsPinned)}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                controlsPinned
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700/60'
              }`}
              title={controlsPinned ? 'Unpin Toolbars (Auto-hide on read)' : 'Pin Toolbars (Always Visible)'}
            >
              {controlsPinned ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Auto-Landscape)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN DOCUMENT CANVAS VIEWPORT                           */}
      {/* ========================================================= */}
      <main
        onClick={handleUserActivity}
        className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-2 sm:p-6 cursor-grab active:cursor-grabbing relative"
        style={{
          background: 'radial-gradient(ellipse at center, #161b22 0%, #0d1117 100%)',
          touchAction: 'pan-x pan-y'
        }}
      >
        {/* Loading Spinner / Buffering Skeleton */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]/90 backdrop-blur-md z-30 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin" />
              <FileText className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Resolving Google Drive PDF...</h3>
              <p className="text-xs text-slate-400 font-mono">Bypassing Google UI & Buffering document</p>
            </div>
            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 backdrop-blur-xl text-center space-y-4 z-20">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">Unable to load document</h3>
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => setUseFallbackEmbed(true)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all"
              >
                Switch to Clean Stream Viewer
              </button>
              <button
                onClick={handleDirectDownload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Download PDF File
              </button>
            </div>
          </div>
        )}

        {/* Primary PDF Canvas Viewport */}
        {!useFallbackEmbed ? (
          <div
            className="flex items-center justify-center min-w-full min-h-full transition-transform duration-150"
            style={{
              paddingTop: controlsVisible ? '64px' : '16px',
              paddingBottom: controlsVisible ? '64px' : '16px'
            }}
          >
            <div className="relative shadow-[0_12px_48px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden border border-slate-800/80 bg-white">
              <canvas
                ref={canvasRef}
                className="block max-w-none transition-all duration-100 ease-linear"
              />
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* Fallback Clean Stream Mode (Google UI CROP MASK)          */
          /* Completely crops out Google Drive top bar and popouts     */
          /* ========================================================= */
          <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-black">
            <style>{`
              /* Mask Google Drive embed top navigation bar */
              .drive-crop-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              .drive-crop-iframe {
                position: absolute;
                top: -56px;
                left: 0;
                width: 100%;
                height: calc(100% + 56px);
                border: 0;
              }
            `}</style>
            <div className="drive-crop-container">
              <iframe
                src={embeddedDriveUrl}
                title={displayTitle}
                className="drive-crop-iframe"
                allow="autoplay"
              />
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. BOTTOM FLOATING NAVIGATION & ZOOM TOOLBAR (AUTO-HIDES)  */}
      {/* ========================================================= */}
      <footer
        className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out transform ${
          controlsVisible || controlsPinned
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-2xl mb-3 sm:mb-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#0d1117]/85 backdrop-blur-xl border border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2">
          
          {/* Page Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 hover:text-white transition-all cursor-pointer border border-slate-700/60"
              title="Previous Page (Left Arrow)"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Jump-To-Page Form */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1">
              <input
                type="number"
                min={1}
                max={numPages || 1}
                value={pageInputVal}
                onChange={e => setPageInputVal(e.target.value)}
                onBlur={handlePageInputSubmit}
                disabled={loading}
                className="w-10 sm:w-12 py-1 px-1.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                title="Type page number and press Enter"
              />
              <span className="text-xs font-mono text-slate-400">
                / {numPages || '–'}
              </span>
            </form>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages || loading}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 hover:text-white transition-all cursor-pointer border border-slate-700/60"
              title="Next Page (Right Arrow)"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/80 px-1.5 py-1 rounded-xl border border-slate-800">
            <button
              onClick={handleZoomOut}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
            </button>

            <button
              onClick={handleResetZoom}
              disabled={loading}
              className="px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-mono font-bold text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer min-w-[46px] text-center"
              title="Reset Zoom (100% Fit Width)"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
            </button>
          </div>

          {/* Rotate & View Modes */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={handleRotate}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer border border-slate-700/60"
              title="Rotate 90° Clockwise (R)"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>

            {/* Fit Width / Fit Page Toggle */}
            <button
              onClick={() => {
                setFitMode(fitMode === 'width' ? 'page' : 'width');
                resetAutoHideTimer();
              }}
              disabled={loading}
              className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 transition-all cursor-pointer border border-slate-700/60 text-[11px] font-bold hidden sm:inline-flex items-center space-x-1"
              title="Toggle Fit Width / Fit Page"
            >
              <Expand className="w-3.5 h-3.5 text-cyan-400" />
              <span>{fitMode === 'width' ? 'Fit Page' : 'Fit Width'}</span>
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
};
export default DrivePdfViewer;
