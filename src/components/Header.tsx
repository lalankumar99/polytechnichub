import React from 'react';
import {
  BookOpen,
  FolderTree,
  Search,
  Shield,
  LogOut,
  SlidersHorizontal,
  GraduationCap,
  FileText,
  Sparkles,
  KeyRound,
  CheckCircle
} from 'lucide-react';
import { AdminUser, PremiumCourse } from '../types';
import { StudentNotificationCenter } from './StudentNotificationCenter';

interface HeaderProps {
  currentView: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses';
  onNavigate: (view: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses', folderId?: string | null) => void;
  adminUser: AdminUser | null;
  premiumUser?: any;
  onPremiumLogout?: () => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onOpenAdminAddDrivePdf?: () => void;
  onOpenPremiumLogin?: () => void;
  courses?: PremiumCourse[];
  onJoinLiveCourse?: (course: PremiumCourse) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onOpenLogin,
  onOpenSearch,
  onLogout,
  premiumUser,
  onPremiumLogout,
  onOpenAdminAddDrivePdf,
  onOpenPremiumLogin,
  courses = [],
  onJoinLiveCourse
}) => {
  return (
    <header id="polytechnic-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 text-slate-900 shadow-xs pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer min-w-0 shrink" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="font-extrabold text-sm sm:text-xl tracking-tight text-slate-900 truncate">Polytechnic Hub</span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md shrink-0">PRO</span>
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

            <button
              onClick={() => onNavigate('premium-courses')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                currentView === 'premium-courses' || currentView === 'premium'
                  ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                  : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
              }`}
              title="Explore Premium Polytechnic Courses"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Premium Courses</span>
            </button>
          </nav>

          {/* Right Action / Admin Authentication & Student Profile */}
          <div className="flex items-center space-x-2">
            {/* Student Notification Center Bell */}
            <StudentNotificationCenter
              courses={courses}
              onOpenCourse={(c) => {
                if (onJoinLiveCourse) onJoinLiveCourse(c);
                else onNavigate('premium-courses');
              }}
              user={premiumUser}
            />

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

                {onOpenAdminAddDrivePdf && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      onOpenAdminAddDrivePdf();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                    title="Add Google Drive PDF and select location"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-200" />
                    <span>+ Drive PDF</span>
                  </button>
                )}

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
            
            {/* Desktop Student Profile Display */}
            {premiumUser && !adminUser && (
              <div className="hidden md:flex items-center space-x-2 bg-emerald-50/90 border border-emerald-300 rounded-2xl p-1.5 pl-2 shadow-xs">
                <button
                  onClick={() => onNavigate('premium-courses')}
                  className="flex items-center space-x-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
                  title="View Your Premium Courses"
                >
                  {premiumUser.photoUrl ? (
                    <img
                      src={premiumUser.photoUrl}
                      alt={premiumUser.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                      {premiumUser.name ? premiumUser.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-bold text-slate-900 max-w-[130px] truncate leading-tight">
                      {premiumUser.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{premiumUser.id || 'Approved Student'}</span>
                    </span>
                  </div>
                </button>
                <button
                  onClick={onPremiumLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                  title="Logout from Premium"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Mobile Header Student Profile & Actions */}
            {premiumUser && !adminUser ? (
              <div className="md:hidden flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 rounded-full py-1 px-2.5 shadow-xs">
                <button
                  onClick={() => onNavigate('premium-courses')}
                  className="flex items-center space-x-1.5 text-left cursor-pointer"
                  title="Approved Student Profile & Courses"
                >
                  {premiumUser.photoUrl ? (
                    <img
                      src={premiumUser.photoUrl}
                      alt={premiumUser.name}
                      className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {premiumUser.name ? premiumUser.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-emerald-950 max-w-[85px] truncate leading-none">
                      {premiumUser.name}
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-700 leading-none flex items-center space-x-0.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Approved</span>
                    </span>
                  </div>
                </button>
                <button
                  onClick={onPremiumLogout}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : !adminUser && (
              <div className="md:hidden flex items-center space-x-1">
                <button
                  onClick={() => onOpenPremiumLogin ? onOpenPremiumLogin() : onNavigate('premium')}
                  className="px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs flex items-center space-x-1 cursor-pointer active:scale-95 transition-transform"
                  title="Already Approved Student Login"
                >
                  <KeyRound className="w-3 h-3 text-amber-300" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onNavigate('premium-courses')}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                >
                  Courses
                </button>
              </div>
            )}

            {!adminUser && !premiumUser && (
              <button
                onClick={onOpenLogin}
                className="md:hidden p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-50"
                title="Admin Login"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {adminUser && (
              <div className="md:hidden flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl p-1 pl-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Admin</span>
                </button>
                {onOpenAdminAddDrivePdf && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      onOpenAdminAddDrivePdf();
                    }}
                    className="p-1 rounded-lg bg-cyan-600 text-white cursor-pointer"
                    title="Add Google Drive PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
