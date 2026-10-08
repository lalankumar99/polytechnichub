import React, { useState, useEffect, useRef } from 'react';
import { PremiumCourse, LiveChatMessage } from '../types';
import { api } from '../services/api';
import { extractYoutubeId } from '../utils/formatters';
import { 
  Radio, 
  Maximize2, 
  Minimize2, 
  Tv, 
  MessageSquare, 
  Send, 
  Lock, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  Users,
  Sparkles,
  RefreshCw,
  VideoOff,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LiveClassPlayerProps {
  course: PremiumCourse;
  canAccess: boolean;
  user: any; // premiumUser
  isAdmin?: boolean;
  onOpenPremiumLogin?: () => void;
  onScrollToCurriculum?: () => void;
}

export const LiveClassPlayer: React.FC<LiveClassPlayerProps> = ({
  course,
  canAccess,
  user,
  isAdmin,
  onOpenPremiumLogin,
  onScrollToCurriculum
}) => {
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [activeChatTab, setActiveChatTab] = useState<'inapp' | 'youtube'>('inapp');
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showDomainHelp, setShowDomainHelp] = useState<boolean>(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isChatCollapsedOnMobile, setIsChatCollapsedOnMobile] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID
  const videoId = course.liveYoutubeUrl ? extractYoutubeId(course.liveYoutubeUrl) : null;
  const isLiveActive = Boolean(course.isLive && videoId);

  // Determine embed origin and domain safely
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const currentHref = typeof window !== 'undefined' ? window.location.href : '';

  // ----------------------------------------------------
  // CASE 3: ACTIVE LIVE STREAM PLAYER
  // ----------------------------------------------------
  // Construct YouTube live stream embed URL with proper origin and parameters
  const embedPlayerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1${currentOrigin ? `&origin=${encodeURIComponent(currentOrigin)}` : ''}&widget_referrer=${encodeURIComponent(currentHref)}`;
  const youtubeDirectWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const youtubeChatEmbedUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${encodeURIComponent(currentDomain)}`;
  const youtubeChatPopoutUrl = `https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`;
  useEffect(() => {
    if (!course.id || !isLiveActive) return;

    let isMounted = true;
    const fetchChat = async () => {
      try {
        const msgs = await api.getLiveChatMessages(course.id);
        if (isMounted) {
          setChatMessages(msgs);
        }
      } catch (err) {
        // Silent catch for live poll
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [course.id, isLiveActive]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeChatTab === 'inapp') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatTab]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Send in-app chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const senderName = isAdmin 
      ? 'Instructor (Admin)' 
      : (user?.name || `Student ${user?.id || ''}`).trim();
    
    const senderRole = isAdmin ? 'instructor' : 'student';

    setIsSending(true);
    try {
      const saved = await api.sendLiveChatMessage(course.id, {
        userName: senderName,
        userRole: senderRole,
        message: inputMessage.trim(),
        userId: user?.id || (isAdmin ? 'admin' : undefined)
      });
      setChatMessages(prev => [...prev, saved]);
      setInputMessage('');
    } catch (err: any) {
      alert('Could not send message: ' + (err.message || 'Error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // ----------------------------------------------------
  // CASE 1: ACCESS RESTRICTION (Not enrolled & not admin)
  // ----------------------------------------------------
  if (!canAccess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl mx-auto text-center space-y-4 py-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Restricted Live Broadcast</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Enrollment Required for Live Classes
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              This interactive live masterclass stream is strictly reserved for enrolled students of <strong className="text-white">{course.name}</strong>.
            </p>
          </div>

          {course.isLive && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-center space-x-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
              <span className="font-extrabold uppercase tracking-wider">A Class is Live Right Now!</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenPremiumLogin && (
              <button
                onClick={onOpenPremiumLogin}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Sign In With Student ID to Access</span>
              </button>
            )}
            {onScrollToCurriculum && (
              <button
                onClick={onScrollToCurriculum}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                View Syllabus & Topics Below
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CASE 2: FALLBACK STATE (Class is not currently live)
  // ----------------------------------------------------
  if (!isLiveActive) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden font-sans">
        <div className="max-w-3xl mx-auto space-y-5">
          
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <VideoOff className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Live Stream Channel
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  No Live Class Currently Running
                </h3>
              </div>
            </div>

            {isAdmin && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 self-start sm:self-auto">
                Admin Mode: Toggle "Is Live" in Course Editor to Broadcast
              </span>
            )}
          </div>

          {/* Schedule / Topic Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Next Scheduled Session</span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {course.liveScheduledTime || 'Will be announced by the instructor soon'}
              </p>
              <p className="text-[11px] text-slate-400">
                Please check back at the scheduled time or stay logged in.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Upcoming Topic / Class Focus</span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {course.liveTopic || `${course.name} - Interactive Doubt & Problem Class`}
              </p>
              <p className="text-[11px] text-slate-400">
                Unlisted stream link is automatically delivered to enrolled students.
              </p>
            </div>
          </div>

          {/* Clean Guidance Notice */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-indigo-200">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Check scheduled timing above or watch recorded lectures and notes below.</span>
            </div>

            {onScrollToCurriculum && (
              <button
                onClick={onScrollToCurriculum}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Watch Recorded Lectures Below &darr;
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CASE 3: ACTIVE LIVE STREAM PLAYER
  // ----------------------------------------------------
  return (
    <div 
      ref={playerContainerRef}
      className={`bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white transition-all font-sans ${
        isTheaterMode ? 'w-full max-w-full' : 'max-w-7xl mx-auto'
      }`}
    >
      {/* ---------------- LIVE BAR / TOP METRICS ---------------- */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-3">
          {/* Pulsing Live Beacon */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span>LIVE NOW</span>
          </div>

          <div>
            <h2 className="font-black text-xs sm:text-base text-white truncate max-w-[130px] sm:max-w-md md:max-w-lg leading-tight">
              {course.liveTopic || course.name}
            </h2>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {course.branch} • Unlisted Student Broadcast
            </span>
          </div>
        </div>

        {/* Player Controls (Theater Mode, Fullscreen, Popout Chat) */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsTheaterMode(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              isTheaterMode 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle Theater Mode"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isTheaterMode ? 'Normal View' : 'Theater View'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Fullscreen Video"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Share Class"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copiedLink && (
            <span className="text-[10px] font-bold text-emerald-400">Link Copied!</span>
          )}
        </div>
      </div>

      {/* ---------------- MAIN STAGE: VIDEO & LIVE CHAT ---------------- */}
      <div className={`grid ${
        isTheaterMode 
          ? 'grid-cols-1' 
          : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        
        {/* Video Player Column */}
        <div className={`${isTheaterMode ? 'w-full' : 'lg:col-span-8'} bg-black relative flex flex-col justify-center`}>
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={embedPlayerUrl}
              title={`Live Class - ${course.name}`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Under-Video Quick Info & Playback Controls */}
          <div className="p-3.5 sm:p-4 bg-slate-900/95 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                  Official Polytechnic Live Class
                </span>
                <p className="font-extrabold text-white text-sm">
                  {course.name}
                </p>
              </div>

              {/* Action Buttons: Direct YouTube Watch & Handouts */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1-Click Direct YouTube Fallback Button */}
                <a
                  href={youtubeDirectWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 border border-red-500/50"
                  title="Open video directly on YouTube in new tab or app"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch on YouTube</span>
                </a>

                {onScrollToCurriculum && (
                  <button
                    onClick={onScrollToCurriculum}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Notes & Handouts &darr;
                  </button>
                )}
              </div>
            </div>

            {/* Troubleshooting & Embedding Diagnostics Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTroubleshoot(prev => !prev)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>'Playback on other websites has been disabled by the video owner' एरर का समाधान?</span>
                {showTroubleshoot ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Origin: <code className="text-slate-400">{currentDomain}</code> • Referrer: <code>no-referrer-when-downgrade</code>
              </span>
            </div>

            {/* Expandable Troubleshooting Card */}
            {showTroubleshoot && (
              <div className="mt-2 p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-slate-200 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>YouTube पर "Playback disabled by video owner" आने का कारण और 100% समाधान:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <p className="font-bold text-emerald-400">1. YouTube Studio में "Allow embedding" ON करें (Teacher/Admin)</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>YouTube Studio खोलें &rarr; Content &rarr; <strong>Live</strong> टैब पर जाएँ।</li>
                      <li>स्ट्रीम/वीडियो पर क्लिक करके <strong>Edit (Details)</strong> खोलें।</li>
                      <li>नीचे स्क्रॉल करके <strong>"Show More"</strong> पर क्लिक करें।</li>
                      <li><strong>License and distribution</strong> में <strong className="text-white">"Allow embedding" (एम्बेड करने की अनुमति दें)</strong> को टिक (ON) करें।</li>
                      <li>ऊपर <strong>Save</strong> पर क्लिक करें।</li>
                    </ol>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <p className="font-bold text-emerald-400">2. Age-restriction & Audience सेटिंग्स जांचें</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li><strong>Audience:</strong> "No, it's not made for kids" सेट रखें।</li>
                      <li><strong>Age restriction:</strong> "No, don't restrict my video to viewers over 18" सेट रखें। (18+ वाले वीडियो अन्य साइट्स पर ब्लॉक होते हैं)।</li>
                      <li><strong>Visibility:</strong> <strong>"Unlisted"</strong> रखें। ("Private" वीडियो बाहरी वेबसाइटों पर एम्बेड नहीं हो सकते)।</li>
                    </ul>
                  </div>
                </div>

                {/* Direct Workaround For Students */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">
                    💡 <strong>छात्रों के लिए तुरंत देखने का उपाय:</strong> अगर यह वीडियो अभी भी यहाँ नहीं चल रहा, तो नीचे दिए गए बटन से सीधे YouTube पर देखें:
                  </span>
                  <a
                    href={youtubeDirectWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs inline-flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Open in YouTube App / Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Column */}
        <div className={`${isTheaterMode ? 'w-full max-w-4xl mx-auto border-t' : 'lg:col-span-4 border-t lg:border-t-0 lg:border-l'} border-slate-800 bg-slate-900 flex flex-col ${isChatCollapsedOnMobile ? 'h-auto' : 'h-[360px] sm:h-[440px] lg:h-[540px]'}`}>
          
          {/* Chat Header & Mode Switcher */}
          <div className="p-2 sm:p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setActiveChatTab('inapp');
                  setIsChatCollapsedOnMobile(false);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeChatTab === 'inapp'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Class Q&A ({chatMessages.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveChatTab('youtube');
                  setIsChatCollapsedOnMobile(false);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeChatTab === 'youtube'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>YouTube Chat</span>
              </button>
            </div>

            {/* Right Buttons: Mobile Collapse & External Popout */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsChatCollapsedOnMobile(prev => !prev)}
                className="lg:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isChatCollapsedOnMobile ? 'Expand Chat' : 'Collapse Chat'}
              >
                {isChatCollapsedOnMobile ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <a
                href={youtubeChatPopoutUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Open YouTube Chat in Popout Window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* TAB A: IN-APP LIVE CHAT & Q&A */}
          {!isChatCollapsedOnMobile && activeChatTab === 'inapp' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-800/40 text-[11px] text-indigo-300 text-center leading-relaxed">
                  👋 <strong>Welcome to the Live Class Discussion!</strong> Ask questions, post numerical doubts, and interact with the faculty in real-time.
                </div>

                {chatMessages.map(msg => {
                  const isInstructor = msg.userRole === 'instructor' || msg.userRole === 'admin';
                  return (
                    <div 
                      key={msg.id} 
                      className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
                        isInstructor 
                          ? 'bg-indigo-950/80 border-indigo-500/50 shadow-xs' 
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold ${isInstructor ? 'text-indigo-400' : 'text-slate-200'}`}>
                            {msg.userName}
                          </span>
                          {isInstructor && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-500 text-white">
                              Faculty
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs break-words leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}

                {chatMessages.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No questions posted yet. Be the first to ask!
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-2 sm:p-2.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Ask a question or type doubt..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  maxLength={300}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB B: OFFICIAL YOUTUBE LIVE CHAT */}
          {!isChatCollapsedOnMobile && activeChatTab === 'youtube' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 relative">
              <iframe
                src={youtubeChatEmbedUrl}
                title="YouTube Live Chat"
                className="w-full flex-1 border-0"
                allow="autoplay; clipboard-write; encrypted-media"
              />

              {/* Embed Domain Helper Bar */}
              <div className="p-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <button 
                  onClick={() => setShowDomainHelp(prev => !prev)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer font-bold"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Chat not loading? Check domain instructions</span>
                  {showDomainHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <a 
                  href={youtubeChatPopoutUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                >
                  <span>Open Popout</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Domain Permission Instructions Callout */}
              {showDomainHelp && (
                <div className="p-3 bg-slate-900/95 border-t border-slate-800 text-[11px] text-slate-300 space-y-1.5 animate-fade-in">
                  <p className="font-bold text-white">How YouTube Live Chat Embed Domain Works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>YouTube requires the <code>embed_domain</code> parameter to match the exact hostname (Current: <strong className="text-white">{currentDomain}</strong>).</li>
                    <li>Students must allow 3rd-party cookies in their browser or be logged into a Google account on YouTube.</li>
                    <li>If YouTube blocks the embed on mobile browsers, switch to the <strong>"Class Q&A"</strong> tab above or click <strong>"Open Popout"</strong>!</li>
                  </ol>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
