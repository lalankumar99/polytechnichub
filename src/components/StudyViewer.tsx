import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink,
  ArrowLeft,
  Link2,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  Code,
  X,
  Sun,
  Moon,
  Coffee,
  Share2,
  Check,
  Smartphone,
  BookOpen,
  Eye,
  Youtube,
  Play,
  WifiOff
} from 'lucide-react';
import { StudyItem } from '../types';
import { requestFullscreenAndLandscape, exitFullscreen, formatFileSize, getMaskedDisplayName, getEffectiveDisplayType, extractYoutubeId, parseVideoEmbed } from '../utils/formatters';
import { DrivePdfViewer } from './DrivePdfViewer';
import { extractDriveFileId } from '../utils/googleDrive';

import html2pdf from 'html2pdf.js';

interface StudyViewerProps {
  file: StudyItem;
  onClose: () => void;
  initialFullscreen?: boolean;
}

export const StudyViewer: React.FC<StudyViewerProps> = ({
  file,
  onClose,
  initialFullscreen = false
}) => {
  const effType = getEffectiveDisplayType(file);
  const contentYtId = extractYoutubeId(file.content);
  const urlYtId = extractYoutubeId(file.fileUrl);
  const hasYtId = urlYtId || contentYtId;

  // 1. VIDEO DETECTION: Must run FIRST before PDF check
  const isVideo = effType === 'video' ||
    file.type === 'youtube' ||
    file.isVideo ||
    !!hasYtId ||
    (file.fileUrl && (file.fileUrl.includes('youtube.com') || file.fileUrl.includes('youtu.be') || file.fileUrl.includes('<iframe'))) ||
    (file.content && (file.content.includes('youtube.com') || file.content.includes('youtu.be') || file.content.includes('class="video"')));

  // 2. PDF DETECTION: Only check file.fileUrl (NEVER file.id) and only if NOT video
  const driveFileId = !isVideo ? extractDriveFileId(file.fileUrl || '') : null;
  const isGoogleDrivePdf = !isVideo && (!!driveFileId || (file.fileUrl && (file.fileUrl.includes('drive.google.com') || file.fileUrl.includes('docs.google.com'))));
  const isAnyPdf = !isVideo && (isGoogleDrivePdf || effType === 'pdf' || file.type === 'pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf')));

  // Render unified mobile-first DrivePdfViewer for all PDF documents
  if (isAnyPdf) {
    return (
      <DrivePdfViewer
        driveSource={file.fileUrl || `/api/files/${file.id}`}
        title={file.name}
        subtitle={[file.branch, file.semester, file.subject].filter(Boolean).join(' • ')}
        onClose={onClose}
      />
    );
  }

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // AUTOMATIC FULLSCREEN + LANDSCAPE MODE FOR VIDEOS
  useEffect(() => {
    if (!isVideo) return;

    const launchLandscapeFullscreen = async () => {
      try {
        /* Landscape lock */
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (e) {}
        }

        /* Auto fullscreen */
        const el = videoContainerRef.current;
        if (el) {
          if (el.requestFullscreen) {
            await el.requestFullscreen().catch(() => {});
          } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
          } else if ((el as any).msRequestFullscreen) {
            (el as any).msRequestFullscreen();
          }
        }
      } catch (err) {
        console.log('Fullscreen/Landscape error:', err);
      }
    };

    launchLandscapeFullscreen();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleVideoBack();
      }
      if (e.key === 'f' || e.key === 'F') {
        handleFullscreenToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {}
    };
  }, [isVideo]);

  const handleVideoBack = async () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch (e) {}
    onClose();
  };

  const handleFullscreenToggle = async () => {
    try {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (isFs) {
        if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        if (screen.orientation && (screen.orientation as any).unlock) {
          try { (screen.orientation as any).unlock(); } catch (e) {}
        }
      } else {
        const el = videoContainerRef.current || document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          (el as any).msRequestFullscreen();
        }

        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (e) {
            try {
              await (screen.orientation as any).lock('landscape-primary');
            } catch (e2) {}
          }
        }
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
  };

  const handleVideoTouchEnd = (event: React.TouchEvent) => {
    const now = Date.now();
    const difference = now - lastTapRef.current;
    if (difference < 350 && difference > 0) {
      handleFullscreenToggle();
      event.preventDefault();
    }
    lastTapRef.current = now;
  };

  // IF VIDEO: RENDER ONLY FULLSCREEN LANDSCAPE VIDEO WITH TOP BACK ARROW & BOTTOM FULLSCREEN
  if (isVideo) {
    let srcUrl = '';
    if (hasYtId) {
      srcUrl = `https://www.youtube-nocookie.com/embed/${hasYtId}?autoplay=1&rel=0&playsinline=1&controls=1&fs=1`;
    } else {
      // Check fileUrl and content
      const urlEmbed = file.fileUrl && !file.fileUrl.startsWith('/api/') && !file.fileUrl.startsWith('/uploads/') 
        ? parseVideoEmbed(file.fileUrl).embedUrl 
        : '';
      const contentEmbed = parseVideoEmbed(file.content).embedUrl;
      srcUrl = urlEmbed || contentEmbed || file.fileUrl || '';
    }

    // Sanitize in case srcUrl still contains an iframe string
    if (srcUrl && srcUrl.includes('<iframe')) {
      const match = srcUrl.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) srcUrl = match[1];
    }

    return (
      <>
        <style>{`
          .force-landscape-player {
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
            z-index: 9999999 !important;
            background: #000 !important;
          }
          .force-landscape-player iframe {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border: 0 !important;
            display: block !important;
          }
        `}</style>
        <div
          ref={videoContainerRef}
          onTouchEnd={handleVideoTouchEnd}
          className="force-landscape-player bg-black select-none m-0 p-0"
        >
          {/* Full-width, full-height edge-to-edge Video */}
          <iframe
            src={srcUrl}
            title={file.videoTitle || file.name}
            className="absolute inset-0 w-full h-full border-0 m-0 p-0 block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />

          {/* Offline Warning Overlay for Video */}
          {!navigator.onLine && (
            <div className="absolute inset-0 z-[10000001] bg-black/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-1">
                <WifiOff className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Internet Connection Required</h3>
              <p className="text-xs text-slate-300 max-w-sm">
                Video lecture streaming requires an active internet connection. Please connect to Wi-Fi or mobile data to watch this lecture.
              </p>
              <button
                onClick={handleVideoBack}
                className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Return to Materials
              </button>
            </div>
          )}

          {/* TOP LEFT BACK ARROW (ICON ONLY) */}
          <button
            onClick={handleVideoBack}
            className="absolute top-3 left-3 z-[10000000] p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/20"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* BOTTOM RIGHT FULLSCREEN TOGGLE (BRACKET ICON ONLY - NO TEXT) */}
          <button
            onClick={handleFullscreenToggle}
            className="absolute bottom-3 right-3 z-[10000000] p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/20"
            aria-label="Toggle Fullscreen"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<number>(16);
  const [copied, setCopied] = useState(false);
  const [orientationMsg, setOrientationMsg] = useState<string | null>(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [showZoomToast, setShowZoomToast] = useState(false);
  const zoomToastTimerRef = useRef<any>(null);

  // Multi-Touch Pinch-to-Zoom State
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    isPinching: boolean;
  }>({ initialDist: 0, initialZoom: 100, isPinching: false });

  const displayName = getMaskedDisplayName(file);
  const isPdf = (effType as string) === 'pdf';
  const isYoutube = false;
  const isLink = effType === 'link';
  const fileApiUrl = file.fileUrl || `/api/files/${file.id}`;

  // Enter fullscreen on mount if requested & listen to mobile back button
  useEffect(() => {
    window.history.pushState({ studyViewerOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    if (initialFullscreen && containerRef.current) {
      requestFullscreenAndLandscape(containerRef.current).then(({ fullscreenGranted, orientationGranted }) => {
        setIsFullscreen(fullscreenGranted || initialFullscreen);
        if (!orientationGranted && window.innerWidth < 768) {
          setOrientationMsg('Please rotate your device horizontally for landscape study view');
          setTimeout(() => setOrientationMsg(null), 4000);
        }
      });
    }

    const handleFullscreenChange = () => {
      const isDocFs = !!document.fullscreenElement;
      setIsFullscreen(isDocFs);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [initialFullscreen, isFullscreen, onClose]);

  const toggleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      const { fullscreenGranted } = await requestFullscreenAndLandscape(containerRef.current);
      setIsFullscreen(fullscreenGranted || true);
    } else {
      exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const next = Math.min(prev + 15, 300);
      triggerZoomToast(next);
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 15, 50);
      triggerZoomToast(next);
      return next;
    });
  };

  const triggerZoomToast = (level: number) => {
    setShowZoomToast(true);
    if (zoomToastTimerRef.current) clearTimeout(zoomToastTimerRef.current);
    zoomToastTimerRef.current = setTimeout(() => setShowZoomToast(false), 1200);
  };

  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // TOUCH PINCH-TO-ZOOM HANDLERS
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoomLevel,
        isPinching: true,
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
        const newZoom = Math.min(Math.max(Math.round(touchStateRef.current.initialZoom * factor), 50), 300);
        setZoomLevel(newZoom);
        triggerZoomToast(newZoom);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStateRef.current.isPinching = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      setZoomLevel(prev => {
        const next = Math.min(Math.max(prev + delta, 50), 300);
        triggerZoomToast(next);
        return next;
      });
    }
  };

  // PROPER A4 PDF DOWNLOAD (210mm x 297mm, 10mm margins, clean typography)
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (isYoutube || isLink) {
        window.open(fileApiUrl, '_blank');
        setIsDownloading(false);
        return;
      }

      if (isPdf) {
        // Native PDF file download
        let fileName = file.name;
        if (!fileName.toLowerCase().endsWith('.pdf')) {
          fileName += '.pdf';
        }
        try {
          const response = await fetch(fileApiUrl);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
          const link = document.createElement('a');
          link.href = fileApiUrl;
          link.download = fileName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Convert HTML study note to a balanced, clean A4 PDF (210mm x 297mm)
        const cleanTitle = file.name.replace(/\.(pdf|html)$/i, '');
        const container = document.createElement('div');
        
        // Proper A4 print container with standard 10mm margins & balanced typography
        container.style.width = '190mm'; // 210mm - 20mm (10mm left + 10mm right)
        container.style.padding = '0';
        container.style.margin = '0 auto';
        container.style.boxSizing = 'border-box';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#0f172a';
        container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

        const rawContent = file.content || `
          <h1>${cleanTitle}</h1>
          <p>${file.description || 'Study notes uploaded on POLYTECHNIC HUB.'}</p>
        `;

        container.innerHTML = `
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .a4-pdf-document {
              width: 190mm;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              font-size: 11pt;
              line-height: 1.6;
              word-wrap: break-word;
            }
            .a4-header {
              border-bottom: 2pt solid #0284c7;
              padding-bottom: 8pt;
              margin-bottom: 14pt;
            }
            .a4-header-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9pt;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4pt;
            }
            .a4-title {
              font-size: 18pt;
              font-weight: 800;
              color: #0f172a;
              line-height: 1.25;
              margin: 0;
            }
            .a4-meta {
              font-size: 9.5pt;
              color: #475569;
              margin-top: 4pt;
            }
            .a4-content {
              font-size: 11pt;
              line-height: 1.6;
              color: #1e293b;
            }
            .a4-content h1 { font-size: 16pt; font-weight: 700; color: #0f172a; margin-top: 14pt; margin-bottom: 6pt; page-break-after: avoid; }
            .a4-content h2 { font-size: 13.5pt; font-weight: 600; color: #1e293b; margin-top: 12pt; margin-bottom: 5pt; page-break-after: avoid; }
            .a4-content h3 { font-size: 12pt; font-weight: 600; color: #334155; margin-top: 10pt; margin-bottom: 4pt; page-break-after: avoid; }
            .a4-content p { margin-bottom: 8pt; }
            .a4-content ul, .a4-content ol { margin: 6pt 0 8pt 18pt; }
            .a4-content li { margin-bottom: 3pt; }
            .a4-content table { width: 100%; border-collapse: collapse; margin: 10pt 0; page-break-inside: avoid; }
            .a4-content th, .a4-content td { border: 1pt solid #cbd5e1; padding: 6pt 8pt; font-size: 9.5pt; }
            .a4-content th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
            .a4-content img { max-width: 100%; height: auto; page-break-inside: avoid; margin: 8pt 0; }
            .a4-content pre, .a4-content code { background: #f8fafc; font-family: monospace; font-size: 9pt; padding: 2pt 4pt; border-radius: 3pt; }
            .a4-content pre { padding: 8pt; overflow-x: auto; border: 1pt solid #e2e8f0; }
            .a4-footer {
              margin-top: 24pt;
              padding-top: 6pt;
              border-top: 1pt solid #e2e8f0;
              font-size: 8pt;
              color: #94a3b8;
              text-align: center;
            }
          </style>
          <div class="a4-pdf-document">
            <div class="a4-header">
              <div class="a4-header-top">
                <span>POLYTECHNIC HUB • STUDY NOTES</span>
                <span>${[file.branch, file.semester].filter(Boolean).join(' • ')}</span>
              </div>
              <h1 class="a4-title">${cleanTitle}</h1>
              ${file.subject || file.unit ? `<div class="a4-meta">${[file.subject, file.unit].filter(Boolean).join(' — ')}</div>` : ''}
            </div>
            <div class="a4-content">
              ${rawContent}
            </div>
            <div class="a4-footer">
              Study Material from Polytechnic Hub • Saved for Offline Learning (A4 Standard)
            </div>
          </div>
        `;

        const opt = {
          margin: [10, 10, 10, 10] as [number, number, number, number], // 10mm margins on all 4 sides
          filename: `${cleanTitle}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            windowWidth: 800
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait' as const
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (typeof args[0] === 'string' && args[0].includes('oklch')) return;
          originalConsoleError(...args);
        };

        try {
          await html2pdf().set(opt).from(container).save();
        } finally {
          console.error = originalConsoleError;
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Safe HTML content wrapper for rendering
  const formattedHtml = file.content || `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 1.5rem; max-width: 900px; margin: auto; }
          h1 { color: #0284c7; }
        </style>
      </head>
      <body>
        <h1>${file.name.replace(/\.(pdf|html)$/i, '')}</h1>
        <p>${file.description || 'Study notes uploaded on POLYTECHNIC HUB.'}</p>
      </body>
    </html>
  `;

  // -------------------------------------------------------------
  // STUDY VIEWER (PDF and HTML Layout with STRICT LANDSCAPE MODE)
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      id="polytechnic-study-viewer"
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden select-none font-sans"
    >
      <style>{`
        /* ========================================================= */
        /* STRICT LANDSCAPE MODE (Hide all UI, 100% full-screen material) */
        /* ========================================================= */
        @media screen and (orientation: landscape) {
          .study-viewer-header,
          .study-viewer-footer {
            display: none !important;
          }
          .study-viewer-main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 100 !important;
          }
          .study-material-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            min-height: 100vh !important;
            height: auto !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 1.5rem 3.5rem !important;
          }
          .study-pdf-wrapper {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .study-landscape-back {
            display: flex !important;
          }
        }

        @media screen and (orientation: portrait) {
          .study-landscape-back {
            display: none !important;
          }
        }
      `}</style>

      {/* FLOATING BACK ARROW FOR STRICT LANDSCAPE MODE */}
      <button
        onClick={onClose}
        className="study-landscape-back fixed top-3 left-3 z-[1000] px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20 items-center space-x-1.5 text-xs font-bold"
        aria-label="Back to Library"
        title="Back to Library"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
        <span>Back</span>
      </button>

      {/* PINCH-TO-ZOOM TOAST FEEDBACK */}
      {showZoomToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000] px-3.5 py-1.5 rounded-full bg-slate-900/90 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/40 shadow-2xl pointer-events-none backdrop-blur-md transition-opacity">
          Zoom: {zoomLevel}%
        </div>
      )}

      {/* TOP HEADER BAR (Only visible in Portrait Mode) */}
      <header className="study-viewer-header h-14 sm:h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
        
        {/* Left: Back + Doc Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            id="viewer-back-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
            title="Back to library"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Back</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                isPdf ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                isLink ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}>
                {isPdf ? 'PDF' : isLink ? 'LINK' : 'NOTE'}
              </span>
              <h1 className="font-bold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md lg:max-w-lg">
                {displayName}
              </h1>
              <div className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 text-[11px] font-semibold shrink-0" title="Verified reading count">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span className="font-mono">{file.viewsCount || 0} reads</span>
              </div>
            </div>
            {(file.subject || file.branch) && (
              <span className="text-[11px] text-slate-400 truncate block">
                {[file.branch, file.semester, file.subject, file.unit].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* HTML Theme Selector (Portrait Mode) */}
          {!isPdf && (
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-md ${theme === 'sepia' ? 'bg-amber-100 text-amber-900' : 'text-slate-400 hover:text-white'}`}
                title="Sepia Theme"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct File Link / Open in Tab */}
          <a
            href={fileApiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Download A4 PDF */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
            title="Download Proper A4 PDF"
          >
            {isDownloading ? <span className="animate-pulse text-xs font-bold text-cyan-400">PDF...</span> : <Download className="w-4 h-4" />}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            title="Copy Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            id="viewer-fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/50 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (100vw/100vh)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* ORIENTATION HINT TOAST */}
      {orientationMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-cyan-950/95 border border-cyan-500 text-cyan-300 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center space-x-2 z-50 animate-bounce">
          <Smartphone className="w-4 h-4 rotate-90" />
          <span>{orientationMsg}</span>
        </div>
      )}

      {/* MAIN READING CANVAS (Supports Touch Pinch-to-Zoom & Strict Landscape) */}
      <main
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`study-viewer-main flex-1 overflow-auto bg-slate-950 p-2 sm:p-4 flex items-center justify-center ${
          theme === 'dark' ? 'theme-dark' : theme === 'sepia' ? 'theme-sepia' : 'theme-light'
        }`}
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {isLink ? (
          <div className="w-full h-full max-w-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Link2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{file.name}</h2>
                {file.description && (
                  <p className="text-sm text-slate-500 mb-6">{file.description}</p>
                )}
              </div>
              <a 
                href={fileApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : isPdf ? (
          <div
            className="study-pdf-wrapper w-full h-full max-w-5xl flex flex-col items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <iframe
              src={`${fileApiUrl}#view=FitH`}
              title={file.name.replace(/\.(pdf|html)$/i, '')}
              onError={() => setPdfLoadError(true)}
              className="w-full h-full rounded-xl bg-white shadow-2xl border border-slate-800"
            />
            {pdfLoadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-xl space-y-4">
                <FileText className="w-12 h-12 text-rose-400" />
                <h3 className="text-lg font-bold">Document Preview</h3>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Your browser preferences prevented inline PDF rendering. You can open or download the document directly:
                </p>
                <a
                  href={fileApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Document in New Window</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD HTML STUDY NOTE MODE (100% in landscape, themeable, pinch-to-zoomable) */
          <div
            className={`study-material-wrapper w-full max-w-4xl h-full rounded-2xl shadow-2xl p-6 sm:p-10 transition-colors border overflow-y-auto ${
              theme === 'light'
                ? 'bg-white text-slate-900 border-slate-200'
                : theme === 'sepia'
                ? 'bg-[#fcf6e8] text-[#433422] border-[#e8dcc4]'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {file.content && (file.content.includes('<!DOCTYPE') || file.content.includes('<html')) ? (
              <iframe
                srcDoc={file.content}
                title={file.name.replace(/\.(pdf|html)$/i, '')}
                className="w-full h-full border-0 bg-white rounded-xl min-h-[70vh]"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : file.content ? (
              <div
                className="study-html-content space-y-4"
                dangerouslySetInnerHTML={{ __html: file.content }}
              />
            ) : (
              <iframe
                srcDoc={formattedHtml}
                title={file.name.replace(/\.(pdf|html)$/i, '')}
                className="w-full h-full border-0 bg-transparent min-h-[500px]"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}
          </div>
        )}

      </main>

      {/* BOTTOM TOOLBAR (Only visible in Portrait Mode) */}
      <footer className="study-viewer-footer h-14 sm:h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
        
        {/* Left: Font Size or Info */}
        <div className="flex items-center space-x-2">
          {!isPdf ? (
            <div className="flex items-center space-x-1.5 bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setFontSize(s => Math.max(s - 2, 12))}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white font-bold cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-slate-400 font-mono">{fontSize}px</span>
              <button
                onClick={() => setFontSize(s => Math.min(s + 2, 26))}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white font-bold cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-mono">
              {formatFileSize(file.size)}
            </span>
          )}
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-800 rounded-xl p-1 border border-slate-700">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            title="Zoom Out (or Pinch on Screen)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-200 px-2 min-w-[50px] text-center">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            title="Zoom In (or Pinch on Screen)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Rotate & Landscape Fullscreen Mode */}
        <div className="flex items-center space-x-2">
          {isPdf && (
            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Toggle Landscape Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full-Screen View'}</span>
          </button>
        </div>

      </footer>
    </div>
  );
};

