import React, { useState, useEffect } from 'react';
import { PremiumCourse } from '../types';
import { Radio, ArrowRight, X, Sparkles } from 'lucide-react';

interface LiveClassNotificationBannerProps {
  courses: PremiumCourse[];
  onJoinLiveCourse: (course: PremiumCourse) => void;
  user?: any;
}

export const LiveClassNotificationBanner: React.FC<LiveClassNotificationBannerProps> = ({
  courses,
  onJoinLiveCourse,
  user
}) => {
  const [dismissedCourseIds, setDismissedCourseIds] = useState<string[]>([]);

  // Find active live courses that haven't been dismissed
  const liveCourses = courses.filter(c => c.isLive && c.liveYoutubeUrl && !dismissedCourseIds.includes(c.id));

  if (liveCourses.length === 0) return null;

  const currentLive = liveCourses[0];

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedCourseIds(prev => [...prev, currentLive.id]);
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white px-3 sm:px-4 py-2 shadow-md relative z-30 font-sans animate-fade-in border-b border-red-500/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Live Beacon & Info */}
        <div 
          onClick={() => onJoinLiveCourse(currentLive)}
          className="flex items-center space-x-2 min-w-0 cursor-pointer group flex-1"
        >
          {/* Animated Pulsing Beacon */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-sm" />
          </div>

          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/30 border border-white/20 shrink-0">
            LIVE
          </span>

          <p className="text-xs font-black truncate text-white group-hover:underline">
            {currentLive.liveTopic ? `${currentLive.name}: ${currentLive.liveTopic}` : currentLive.name}
          </p>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => onJoinLiveCourse(currentLive)}
            className="px-2.5 sm:px-3.5 py-1 rounded-xl bg-white text-red-600 hover:bg-slate-100 font-extrabold text-xs shadow-sm transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <span>Join</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
