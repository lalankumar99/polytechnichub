import React from 'react';
import { PremiumCourse } from '../types';
import { Radio, ArrowRight, X, Volume2 } from 'lucide-react';

interface LiveClassToastProps {
  course: PremiumCourse;
  onJoin: () => void;
  onDismiss: () => void;
}

export const LiveClassToast: React.FC<LiveClassToastProps> = ({
  course,
  onJoin,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:max-w-sm w-auto sm:w-full z-50 bg-slate-900 border-2 border-red-500 rounded-3xl p-3.5 sm:p-4 shadow-2xl text-white font-sans animate-bounce-short">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                Live Alert
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <h4 className="font-black text-sm text-white line-clamp-1">
              Class is Live Now!
            </h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-base leading-none"
          title="Dismiss Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 font-semibold line-clamp-1 mb-1">
        {course.name}
      </p>

      {course.liveTopic && (
        <p className="text-[11px] text-indigo-300 mb-3 line-clamp-1">
          Topic: {course.liveTopic}
        </p>
      )}

      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={onJoin}
          className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>Join Broadcast Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDismiss}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </div>
  );
};
