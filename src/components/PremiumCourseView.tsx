import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { PremiumCourse, PremiumItem } from '../types';
import { 
  Shield, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Folder, 
  Youtube, 
  Link2, 
  Code,
  BookOpen,
  Sparkles,
  ExternalLink,
  PlayCircle,
  Search,
  Maximize2,
  Minimize2,
  Smartphone,
  X,
  Share2,
  Eye,
  Check,
  RotateCw,
  Clock,
  BookMarked,
  ArrowLeft,
  Lock,
  Radio,
  Tv
} from 'lucide-react';
import { extractYoutubeId, getYoutubeThumbnailUrl, parseVideoEmbed } from '../utils/formatters';
import { LiveClassPlayer } from './LiveClassPlayer';

interface PremiumCourseViewProps {
  course: PremiumCourse;
  onBack: () => void;
  user: any; // premiumUser
  isAdmin?: boolean;
  onOpenFile: (file: any) => void;
  onOpenPremiumLogin?: () => void;
}

export const PremiumCourseView: React.FC<PremiumCourseViewProps> = ({ 
  course, 
  onBack, 
  user, 
  isAdmin,
  onOpenFile, 
  onOpenPremiumLogin 
}) => {
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'pdf' | 'html'>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [lockedModalItem, setLockedModalItem] = useState<PremiumItem | null>(null);
  
  // Tab switcher between Live Class Room and Curriculum
  const [activeCourseTab, setActiveCourseTab] = useState<'curriculum' | 'live'>(
    course.isLive ? 'live' : 'curriculum'
  );
  const curriculumRef = useRef<HTMLDivElement>(null);

  // Video Player Modal State
  const [activeVideoItem, setActiveVideoItem] = useState<PremiumItem | null>(null);

  // HTML Note Reader State
  const [activeHtmlItem, setActiveHtmlItem] = useState<PremiumItem | null>(null);

  // Check if student has unlocked access to this specific course
  const canAccess = isAdmin || (user?.status === 'approved' && (!user?.assignedCourseIds || user.assignedCourseIds.length === 0 || user.assignedCourseIds.includes(course.id)));

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseItems = await api.getPremiumItems(course.id);
        setItems(courseItems.filter((i: any) => isAdmin || i.status === 'published'));
      } catch (err) {
        console.error('Error fetching course items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [course.id, isAdmin]);

  // Handle hardware / phone swipe back button when video or HTML note is active
  useEffect(() => {
    if (activeVideoItem || activeHtmlItem) {
      window.history.pushState({ immersiveActive: true }, '');

      const handlePopState = () => {
        closeImmersiveViewer();
      };

      window.addEventListener('popstate', handlePopState);

      // Launch Fullscreen and Landscape
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      } catch (e) {}

      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {
            if ((screen.orientation as any).lock) {
              (screen.orientation as any).lock('landscape-primary').catch(() => {});
            }
          });
        }
      } catch (e) {}

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
    }
  }, [activeVideoItem, activeHtmlItem]);

  const closeImmersiveViewer = () => {
    setActiveVideoItem(null);
    setActiveHtmlItem(null);
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

  const handleOpenItem = async (item: PremiumItem) => {
    // If it's a folder, enter the folder (allowed for both locked and unlocked users)
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      return;
    }

    // If user does not have unlocked access to this course, show lock modal
    if (!canAccess) {
      setLockedModalItem(item);
      return;
    }

    // Direct user-gesture triggered native fullscreen & landscape rotation
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } catch (e) {}

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch(async () => {
          if ((screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape-primary').catch(() => {});
          }
        });
      }
    } catch (e) {}

    const isVideo = item.type === 'youtube' || 
      item.fileUrl?.includes('youtube.com') || 
      item.fileUrl?.includes('youtu.be') || 
      item.fileUrl?.includes('<iframe');

    if (isVideo) {
      setActiveVideoItem(item);
    } else if (item.type === 'html') {
      setActiveHtmlItem(item);
    } else {
      // PDF or Link - opens via onOpenFile (routes to DrivePdfViewer)
      const studyItem: any = {
        id: item.id,
        name: item.name,
        type: item.type,
        fileUrl: item.fileUrl,
        description: item.description,
        status: item.status,
        size: item.size || 0,
        parentId: item.parentId,
        isPremium: false,
        accessType: 'premium',
        isVideo: false,
        downloadsCount: 0,
        viewsCount: 0,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      };
      onOpenFile(studyItem);
    }
  };

  const toggleManualFullscreenLandscape = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      }
    } catch (e) {}
  };

  // Counts
  const videoCount = items.filter(i => i.type === 'youtube' || i.fileUrl?.includes('youtube.com') || i.fileUrl?.includes('youtu.be')).length;
  const pdfCount = items.filter(i => i.type === 'pdf' || (i.fileUrl && !i.fileUrl.includes('youtube'))).length;
  const htmlCount = items.filter(i => i.type === 'html').length;

  const filteredItems = items.filter(item => {
    // If searching, search across all items in course
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    } else {
      // Filter by folder hierarchy
      if (currentFolderId === null) {
        if (item.parentId) return false;
      } else {
        if (item.parentId !== currentFolderId) return false;
      }
    }

    if (activeFilter === 'video') return item.type === 'youtube' || item.fileUrl?.includes('youtube.com') || item.fileUrl?.includes('youtu.be');
    if (activeFilter === 'pdf') return item.type === 'pdf' || (item.fileUrl && !item.fileUrl.includes('youtube') && item.type !== 'html');
    if (activeFilter === 'html') return item.type === 'html';
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">

      {/* ========================================================= */}
      {/* 100% NATIVE FULLSCREEN LANDSCAPE CSS FOR MOBILE           */}
      {/* Real device orientation without artificial CSS rotate     */}
      {/* ========================================================= */}
      <style>{`
        .immersive-fullscreen-landscape {
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
        .immersive-fullscreen-landscape iframe {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          display: block !important;
        }
      `}</style>
      
      {/* ---------------- STICKY TOP APP BAR ---------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-indigo-900/40 pt-safe">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Top Line: Back & Title */}
          <div className="flex items-center justify-between w-full sm:w-auto min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-1">
              <button 
                onClick={onBack} 
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold text-slate-200 active:scale-95 shrink-0"
                title="Back to All Courses"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="h-5 w-px bg-slate-700/60 hidden sm:block shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 shrink-0">
                    {course.branch || 'Course'}
                  </span>
                  <h1 className="font-extrabold text-xs sm:text-base truncate max-w-[170px] sm:max-w-xs md:max-w-md">
                    {course.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Mobile Enrollment Status */}
            <div className="sm:hidden shrink-0">
              {canAccess ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Enrolled</span>
                </span>
              ) : (
                <button
                  onClick={onOpenPremiumLogin}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95 shadow-xs"
                >
                  <Lock className="w-3 h-3 text-white" />
                  <span>Unlock</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            {/* View Mode Switcher: Live Class vs Curriculum */}
            <div className="flex items-center bg-slate-900/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-700 text-xs w-full sm:w-auto justify-around sm:justify-start">
              <button
                onClick={() => setActiveCourseTab('live')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg sm:rounded-xl font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeCourseTab === 'live'
                    ? (course.isLive ? 'bg-red-600 text-white shadow-sm animate-pulse' : 'bg-indigo-600 text-white')
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${course.isLive ? 'text-white' : 'text-slate-400'}`} />
                <span>Live Class</span>
                {course.isLive && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setActiveCourseTab('curriculum')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg sm:rounded-xl font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeCourseTab === 'curriculum'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Materials</span>
                <span>({items.length})</span>
              </button>
            </div>

            {/* Desktop Enrollment Status */}
            <div className="hidden sm:block">
              {canAccess ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active Enrollment</span>
                </span>
              ) : (
                <button
                  onClick={onOpenPremiumLogin}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>Unlock Course</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        
        {/* ---------------- LIVE CLASS ROOM (IF ACTIVE TAB OR CURRENTLY LIVE) ---------------- */}
        {(activeCourseTab === 'live' || course.isLive) && (
          <div className="space-y-3">
            <LiveClassPlayer
              course={course}
              canAccess={canAccess}
              user={user}
              isAdmin={isAdmin}
              onOpenPremiumLogin={onOpenPremiumLogin}
              onScrollToCurriculum={() => {
                setActiveCourseTab('curriculum');
                curriculumRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ---------------- COURSE HERO DASHBOARD ---------------- */}
        <div ref={curriculumRef} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
          {course.bannerUrl && (
            <div className="w-full aspect-[16/9] max-h-56 sm:max-h-72 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
              <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                {course.branch || 'Polytechnic Diploma'}
              </span>
              <span className="text-xs font-bold text-slate-400">&bull;</span>
              {canAccess ? (
                <span className="text-xs font-bold text-emerald-600">Full Course Access</span>
              ) : (
                <span className="text-xs font-bold text-amber-600 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked Preview (Student ID Required)</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {course.name}
            </h2>

            {course.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {course.description}
              </p>
            )}
          </div>

          {/* Quick Learning Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
              <span className="text-lg sm:text-2xl font-black text-indigo-900 block leading-tight">{items.length}</span>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-700">Total Topics</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
              <span className="text-lg sm:text-2xl font-black text-rose-900 block leading-tight">{videoCount}</span>
              <span className="text-[10px] sm:text-xs font-bold text-rose-700">Video Lectures</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-red-50/70 border border-red-100 text-center">
              <span className="text-lg sm:text-2xl font-black text-red-900 block leading-tight">{pdfCount}</span>
              <span className="text-[10px] sm:text-xs font-bold text-red-700">PDF Handouts</span>
            </div>

            <div className="hidden sm:block p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-lg sm:text-2xl font-black text-emerald-900 block leading-tight">{htmlCount}</span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700">HTML Notes</span>
            </div>
          </div>
        </div>

        {/* ---------------- SEARCH & CATEGORY FILTER TABS ---------------- */}
        <div className="space-y-3">
          {/* Course Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search lectures, topics, numericals, notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-base sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Content ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer ${
                activeFilter === 'video'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Video Classes ({videoCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('pdf')}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer ${
                activeFilter === 'pdf'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Notes ({pdfCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('html')}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer ${
                activeFilter === 'html'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Notes ({htmlCount})</span>
            </button>
          </div>
        </div>

        {/* ---------------- FOLDER BREADCRUMBS BAR ---------------- */}
        <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setCurrentFolderId(null)}
              className={`font-bold hover:text-indigo-600 transition-colors cursor-pointer flex items-center space-x-1 ${
                currentFolderId === null ? 'text-indigo-700 font-extrabold' : 'text-slate-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Curriculum</span>
            </button>

            {currentFolderId && (() => {
              const currentFolder = items.find(i => i.id === currentFolderId);
              return (
                <>
                  <span className="text-slate-400 font-bold">/</span>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center space-x-1 border border-amber-200">
                    <Folder className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>{currentFolder?.name || 'Folder'}</span>
                  </span>
                </>
              );
            })()}
          </div>

          {currentFolderId && (
            <button
              onClick={() => {
                const curr = items.find(i => i.id === currentFolderId);
                setCurrentFolderId(curr?.parentId || null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Up / Back</span>
            </button>
          )}
        </div>

        {/* ---------------- MODULES / COURSE CONTENT LIST ---------------- */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-xs text-slate-400 font-bold">Loading course curriculum...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">
              {currentFolderId ? 'Folder is Empty' : 'No Matching Materials Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? `No content matches "${searchQuery}". Try different keywords.` : 'No study materials in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => {
              const isFolder = item.type === 'folder';
              const isVideo = item.type === 'youtube' || item.fileUrl?.includes('youtube.com') || item.fileUrl?.includes('youtu.be');
              const isPdf = item.type === 'pdf' || (item.fileUrl && !item.fileUrl.includes('youtube') && item.type !== 'html');
              const isHtml = item.type === 'html';
              const ytId = isVideo ? (extractYoutubeId(item.fileUrl) || extractYoutubeId(item.content)) : null;
              const ytThumb = ytId ? getYoutubeThumbnailUrl(ytId) : null;
              const folderChildCount = isFolder ? items.filter(ci => ci.parentId === item.id).length : 0;

              // 1. FOLDER CARD
              if (isFolder) {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between bg-gradient-to-br from-amber-50/20 to-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 border border-amber-200">
                          <Folder className="w-6 h-6 fill-amber-500/20" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            📁 Folder Directory
                          </span>
                          <span className="text-[10px] text-amber-700 block font-bold mt-0.5">
                            {folderChildCount} items inside
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-black text-amber-700 group-hover:text-amber-800 flex items-center space-x-1.5">
                        <Folder className="w-4 h-4 fill-amber-500/30" />
                        <span>Explore Folder</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Open &rarr;
                      </span>
                    </div>
                  </div>
                );
              }

              // 2. FILE CARD (VIDEO / PDF / HTML / LINK)
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer group flex flex-col justify-between ${
                    !canAccess 
                      ? 'border-slate-200 hover:border-amber-400 hover:shadow-md bg-slate-50/30' 
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Thumbnail / Header */}
                    {isVideo && ytThumb ? (
                      <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-900 relative group-hover:opacity-95 transition-opacity">
                        <img src={ytThumb} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        {/* Lock overlay if student is not approved */}
                        {!canAccess ? (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-white">
                            <div className="w-10 h-10 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-lg mb-1">
                              <Lock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded text-amber-300">
                              🔒 Premium Locked
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <PlayCircle className="w-6 h-6" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          !canAccess ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          isVideo ? 'bg-rose-50 text-rose-600' :
                          isPdf ? 'bg-red-50 text-red-600' :
                          isHtml ? 'bg-emerald-50 text-emerald-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {!canAccess ? <Lock className="w-5 h-5 text-amber-600" /> :
                           isVideo ? <Youtube className="w-6 h-6" /> :
                           isPdf ? <FileText className="w-6 h-6" /> :
                           isHtml ? <Code className="w-6 h-6" /> :
                           <BookOpen className="w-6 h-6" />}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            !canAccess ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            isVideo ? 'bg-rose-100 text-rose-800' :
                            isPdf ? 'bg-red-100 text-red-800' :
                            isHtml ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {!canAccess ? '🔒 Locked (Premium)' : isVideo ? 'Video Lecture' : isPdf ? 'PDF Notes' : isHtml ? 'HTML Guide' : 'Resource'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Topic #{index + 1}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {!canAccess ? (
                      <span className="font-black text-amber-600 group-hover:text-amber-700 flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock to {isVideo ? 'Watch' : isPdf ? 'Read PDF' : 'Open'}</span>
                      </span>
                    ) : (
                      <span className="font-black text-indigo-600 group-hover:text-indigo-700 flex items-center space-x-1.5">
                        {isVideo ? (
                          <>
                            <PlayCircle className="w-4 h-4 text-rose-600" />
                            <span>Watch Lecture</span>
                          </>
                        ) : isPdf ? (
                          <>
                            <FileText className="w-4 h-4 text-red-600" />
                            <span>Read PDF</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                            <span>Open Notes</span>
                          </>
                        )}
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {!canAccess ? '🔒 Locked &rarr;' : 'Unlocked &rarr;'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ---------------- MODAL: LOCKED CONTENT NOTICE ---------------- */}
      {lockedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                🔒 Premium Locked
              </span>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {lockedModalItem.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This is premium course curriculum. To access this {lockedModalItem.type === 'youtube' ? 'video lecture' : 'study resource'}, please enroll in this course or enter your student admission ID.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setLockedModalItem(null);
                  if (onOpenPremiumLogin) onOpenPremiumLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Unlock Course / Enter Admission ID</span>
              </button>
              <button
                onClick={() => setLockedModalItem(null)}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 100% PURE FULLSCREEN LANDSCAPE YOUTUBE VIDEO PLAYER       */}
      {/* Zero top/bottom clutter, bracket [ ] icon only, phone back*/}
      {/* ========================================================= */}
      {activeVideoItem && (
        <div 
          id="video-immersive-container"
          className="immersive-fullscreen-landscape select-none"
        >
          {(() => {
            const ytId = extractYoutubeId(activeVideoItem.fileUrl) || extractYoutubeId(activeVideoItem.content);
            const videoData = parseVideoEmbed(activeVideoItem.fileUrl || activeVideoItem.content);
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            const embedUrl = ytId 
              ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&controls=1&fs=1${currentOrigin ? `&origin=${encodeURIComponent(currentOrigin)}` : ''}`
              : videoData.embedUrl;

            if (!embedUrl) {
              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white space-y-3 bg-black">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                  <p className="text-sm font-bold">Invalid or Missing Video Link / Iframe Code</p>
                  <button 
                    onClick={closeImmersiveViewer}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                  >
                    Go Back
                  </button>
                </div>
              );
            }

            return (
              <>
                {/* Edge-to-Edge Pure Video Canvas */}
                <iframe
                  src={embedUrl}
                  title={activeVideoItem.name}
                  className="absolute inset-0 w-full h-full border-0 block bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Minimal Floating Back Icon (Back Arrow) */}
                <button
                  onClick={closeImmersiveViewer}
                  className="absolute top-3 left-3 z-[100000000] p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all cursor-pointer border border-white/20 active:scale-90"
                  style={{ 
                    top: 'max(env(safe-area-inset-top, 0px), 12px)', 
                    left: 'max(env(safe-area-inset-left, 0px), 12px)' 
                  }}
                  title="Back"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>

                {/* YouTube Direct Fallback if ytId exists */}
                {ytId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${ytId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-16 z-[100000000] px-2.5 py-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold backdrop-blur-md shadow-lg transition-all flex items-center space-x-1 border border-white/20 active:scale-95"
                    style={{ 
                      top: 'max(env(safe-area-inset-top, 0px), 12px)'
                    }}
                    title="Watch directly on YouTube if playback is disabled by owner"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Watch on YouTube</span>
                  </a>
                )}

                {/* Bracket Fullscreen Icon ONLY (NO TEXT - Just [ ]) */}
                <button
                  onClick={toggleManualFullscreenLandscape}
                  className="absolute bottom-3 right-3 z-[100000000] p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all cursor-pointer border border-white/20 active:scale-90"
                  style={{ 
                    bottom: 'max(env(safe-area-inset-bottom, 0px), 12px)', 
                    right: 'max(env(safe-area-inset-right, 0px), 12px)' 
                  }}
                  title="Fullscreen"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 100% PURE FULLSCREEN LANDSCAPE HTML NOTE READER           */}
      {/* Zero top/bottom clutter, readable across screen, phone back*/}
      {/* ========================================================= */}
      {activeHtmlItem && (
        <div 
          id="html-immersive-container"
          className="immersive-fullscreen-landscape select-none bg-slate-950 text-slate-100 flex flex-col"
        >
          {/* Minimal Floating Back Icon */}
          <button
            onClick={closeImmersiveViewer}
            className="fixed top-3 left-3 z-[100000000] p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-2xl transition-all cursor-pointer border border-white/20 active:scale-90"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Fullscreen Reading Canvas */}
          <div className="flex-1 w-full h-full overflow-y-auto p-6 sm:p-12 md:p-16 max-w-5xl mx-auto">
            <h1 className="text-xl sm:text-3xl font-black text-white mb-4 border-b border-slate-800 pb-3">
              {activeHtmlItem.name}
            </h1>
            {activeHtmlItem.content ? (
              <div 
                className="prose prose-invert prose-indigo max-w-none text-slate-200 text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activeHtmlItem.content }}
              />
            ) : (
              <p className="text-xs text-slate-500 italic">No text content written in this note.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PremiumCourseView;
