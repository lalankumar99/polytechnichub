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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
      <nav className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
            currentView === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'fill-blue-100/50' : ''}`} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => onNavigate('browse')}
          className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
            currentView === 'browse' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderTree className={`w-5 h-5 ${currentView === 'browse' ? 'fill-blue-100/50' : ''}`} />
          <span className="text-[10px] font-semibold">Library</span>
        </button>

        <button
          onClick={() => onNavigate('premium-courses')}
          className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
            currentView === 'premium-courses' || currentView === 'premium' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentView === 'premium-courses' ? 'text-amber-500 fill-amber-100/50' : ''}`} />
          <span className="text-[10px] font-semibold">Premium</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center w-14 h-full space-y-1 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Search</span>
        </button>

        <button
          onClick={() => onNavigate('about')}
          className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
            currentView === 'about' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className={`w-5 h-5 ${currentView === 'about' ? 'fill-blue-100/50' : ''}`} />
          <span className="text-[10px] font-semibold">About</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
              currentView === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-5 h-5 ${currentView === 'admin' ? 'fill-blue-100/50' : ''}`} />
            <span className="text-[10px] font-semibold">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
};
