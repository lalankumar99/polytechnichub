import React from 'react';
import { Home, FolderTree, Search, User, LogOut, Shield, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses';
  onNavigate: (view: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses', folderId?: string | null) => void;
  onOpenSearch: () => void;
  isAdmin: boolean;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  isAdmin
}) => {
  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] touch-manipulation select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <nav className="flex items-center justify-between h-14 sm:h-16 px-1 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full transition-colors cursor-pointer active:scale-95 ${
            currentView === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight truncate mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onNavigate('browse')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full transition-colors cursor-pointer active:scale-95 ${
            currentView === 'browse' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Library"
        >
          <FolderTree className={`w-5 h-5 ${currentView === 'browse' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight truncate mt-0.5">Library</span>
        </button>

        <button
          onClick={() => onNavigate('premium-courses')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full transition-colors cursor-pointer active:scale-95 ${
            currentView === 'premium-courses' || currentView === 'premium' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Premium Courses"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${currentView === 'premium-courses' || currentView === 'premium' ? 'text-amber-500 fill-amber-400/40 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight truncate mt-0.5">Courses</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer active:scale-95"
          aria-label="Search"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight truncate mt-0.5">Search</span>
        </button>

        <button
          onClick={() => onNavigate('about')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full transition-colors cursor-pointer active:scale-95 ${
            currentView === 'about' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="About"
        >
          <User className={`w-5 h-5 ${currentView === 'about' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight truncate mt-0.5">About</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 h-full transition-colors cursor-pointer active:scale-95 ${
              currentView === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Admin Dashboard"
          >
            <Shield className={`w-5 h-5 ${currentView === 'admin' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight truncate mt-0.5">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
};
