import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, AlertCircle, ExternalLink, Maximize2, WifiOff } from 'lucide-react';
import { extractDriveFileId, resolveGoogleDriveUrls } from '../utils/googleDrive';

export interface DrivePdfViewerProps {
  /** Google Drive share link OR raw File ID OR direct PDF URL */
  driveSource: string;
  /** Optional custom document title to display */
  title?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Callback fired when user closes or exits the viewer */
  onClose?: () => void;
  className?: string;
}

export const DrivePdfViewer: React.FC<DrivePdfViewerProps> = ({
  driveSource,
  title,
  subtitle,
  onClose,
  className = ''
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hasHistoryPushedRef = useRef(false);

  // 1. Google Drive URL Resolution
  const resolved = resolveGoogleDriveUrls(driveSource);
  const fileId = resolved?.fileId || extractDriveFileId(driveSource) || '';
  const isDrive = !!fileId;

  // Determine the best viewing URL
  let viewerUrl = '';
  let externalUrl = driveSource;

  if (isDrive) {
    viewerUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    externalUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  } else if (driveSource.startsWith('http')) {
    viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(driveSource)}&embedded=true`;
    externalUrl = driveSource;
  } else {
    viewerUrl = driveSource;
  }

  const displayTitle = title || (isDrive ? 'Polytechnic Study PDF' : 'Document Viewer');

  // Handle Safe Close and cleanup
  const handleExit = () => {
    try {
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch (e) {}

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitFullscreenElement && (document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } catch (e) {}

    if (onClose) {
      onClose();
    }
  };

  // 2. AUTOMATIC FULLSCREEN + LANDSCAPE ORIENTATION + MOBILE BACK BUTTON
  useEffect(() => {
    // A. Push state so mobile hardware/swipe back button closes viewer
    if (!hasHistoryPushedRef.current) {
      window.history.pushState({ polytechnicPdfViewer: true }, '');
      hasHistoryPushedRef.current = true;
    }

    const handlePopState = () => {
      handleExit();
    };

    window.addEventListener('popstate', handlePopState);

    // B. Launch edge-to-edge Fullscreen & Landscape
    const launchFullscreenAndLandscape = async () => {
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      } catch (err) {}

      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (e1) {
            try {
              await (screen.orientation as any).lock('landscape-primary');
            } catch (e2) {}
          }
        }
      } catch (err) {}
    };

    launchFullscreenAndLandscape();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {}
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) {}
    };
  }, []);

  return (
    <>
      {/* ========================================================= */}
      {/* 100% NATIVE FULLSCREEN LANDSCAPE EDGE-TO-EDGE CSS         */}
      {/* Real device landscape rotation without CSS coordinate hack*/}
      {/* ========================================================= */}
      <style>{`
        .pdf-immersive-landscape {
          position: fixed !important;
          inset: 0 !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99999999 !important;
          background: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .pdf-immersive-landscape iframe {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          display: block !important;
        }
      `}</style>

      <div
        id="pdf-immersive-container"
        className={`pdf-immersive-landscape select-none ${className}`}
        onClick={() => setShowControls(prev => !prev)}
      >
        {/* Loading Spinner */}
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 space-y-2 pointer-events-none">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-300 font-bold">Opening Full Screen PDF...</p>
          </div>
        )}

        {/* 100% Edge-to-Edge Pure PDF Canvas (Zero Top/Bottom Clutter) */}
        <iframe
          src={viewerUrl}
          title={displayTitle}
          onLoad={() => setIframeLoading(false)}
          onError={() => {
            setIframeLoading(false);
            setLoadError(true);
          }}
          className="absolute inset-0 w-full h-full border-0 block bg-black"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />

        {/* Ultra-Minimal Floating Back Button (Tap screen or click) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.history.length > 1) {
              window.history.back();
            } else {
              handleExit();
            }
          }}
          className="absolute top-3 left-3 z-[100000000] p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all cursor-pointer border border-white/20 active:scale-90"
          style={{ 
            top: 'max(env(safe-area-inset-top, 0px), 12px)', 
            left: 'max(env(safe-area-inset-left, 0px), 12px)' 
          }}
          title="Back / Exit Full Screen"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Offline Warning Overlay */}
        {!navigator.onLine && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-white z-35 space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-1">
              <WifiOff className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-white">No Internet Connection</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Online Google Drive PDFs require an active network connection to display. Please connect to the internet to view this document.
            </p>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  handleExit();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Back to Library
            </button>
          </div>
        )}

        {/* Fallback if iframe fails to load */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-white z-30 space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-bold text-sm">Unable to render PDF inline</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Please open directly in Google Drive or browser:
            </p>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Document Direct</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default DrivePdfViewer;
