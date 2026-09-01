import React from 'react';
import {
  BookOpen,
  FolderTree,
  Search,
  Shield,
  LogOut,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  currentView: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses' | 'premium' | 'premium-courses';
  onNavigate: (view: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses', folderId?: string | null) => void;
  adminUser: AdminUser | null;
  premiumUser?: any;
  onPremiumLogout?: () => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onOpenLogin,
  onOpenSearch,
  onLogout,
  premiumUser,
  onPremiumLogout
}) => {
  return (
    <header id="polytechnic-header" className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900">PolyHub</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md">PRO</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('browse', null)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                currentView === 'browse'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Library</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">⌘K</kbd>
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                currentView === 'about'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>About</span>
            </button>
          </nav>

          {/* Right Action / Admin Authentication */}
          <div className="flex items-center space-x-2">
            {adminUser ? (
              <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pl-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700">Admin</span>
                </div>

                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    currentView === 'admin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Dash</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="hidden md:flex px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors items-center space-x-1.5 border border-slate-200 cursor-pointer"
                title="Administration Access"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
            
            {/* Mobile Header Icons */}
            {premiumUser && !adminUser && (
              <div className="hidden md:flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-xl p-1 pl-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {premiumUser.name ? premiumUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-indigo-900 max-w-[100px] truncate">{premiumUser.name}</span>
                  {premiumUser.status === 'approved' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Premium Active" />}
                </div>
                <button
                  onClick={onPremiumLogout}
                  className="p-1.5 rounded-lg text-indigo-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {!adminUser && !premiumUser && (
              <button
                onClick={onOpenLogin}
                className="md:hidden p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-50"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
            
            <button className="md:hidden w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
               <span className="text-xs font-bold">M</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
