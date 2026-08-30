import React from 'react';
import {
  FolderTree,
  Search,
  BookOpen,
  FileText,
  Code,
  Zap,
  Cpu,
  Wrench,
  Compass,
  Laptop,
  Radio,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Maximize2,
  FolderOpen,
  Download
} from 'lucide-react';
import { StudyItem, LibraryStats } from '../types';
import { formatFileSize, formatDate } from '../utils/formatters';
import { usePWAInstall } from '../hooks/usePWAInstall';



interface HomePageProps {
  onOpenPremiumCourse?: () => void;
  onNavigateBrowse: (folderId?: string | null) => void;
  onOpenSearch: () => void;
  onOpenFile: (file: StudyItem) => void;
  stats: LibraryStats | null;
  items: StudyItem[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateBrowse,
  onOpenSearch,
  onOpenFile,
  stats,
  items,
  onOpenPremiumCourse
}) => {
  const { isInstallable, promptInstall } = usePWAInstall();
  // Recent published files
  const recentFiles = items
    .filter(i => i.type !== 'folder' && i.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Polytechnic Branches
  const branches = [
    {
      id: 'f-electrical',
      name: 'Electrical Engineering',
      code: 'EE',
      icon: Zap,
      color: 'from-amber-500 to-yellow-600',
      border: 'hover:border-amber-500/50',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Circuits, KCL/KVL, AC networks, machines, and measurements.'
    },
    {
      id: 'f-mechanical',
      name: 'Mechanical Engineering',
      code: 'ME',
      icon: Wrench,
      color: 'from-rose-500 to-red-600',
      border: 'hover:border-rose-500/50',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Thermodynamics, heat engines, SOM, TOM, and manufacturing.'
    },
    {
      id: 'f-civil',
      name: 'Civil Engineering',
      code: 'CE',
      icon: Compass,
      color: 'from-emerald-500 to-teal-600',
      border: 'hover:border-emerald-500/50',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Advanced surveying, concrete tech, structural analysis, hydraulics.'
    },
    {
      id: 'f-cse',
      name: 'Computer Science & Engg',
      code: 'CSE',
      icon: Laptop,
      color: 'from-cyan-500 to-blue-600',
      border: 'hover:border-cyan-500/50',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Data structures, algorithms, logic design, databases, networks.'
    },
    {
      id: 'f-ece',
      name: 'Electronics & Comm.',
      code: 'ECE',
      icon: Radio,
      color: 'from-indigo-500 to-purple-600',
      border: 'hover:border-indigo-500/50',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description: 'Electronic devices, analog circuits, signals and microprocessors.'
    }
  ];

  // Popular Subjects cards
  const popularSubjects = [
    {
      name: 'Electrical Circuit & Network',
      branch: 'Electrical Engg',
      sem: 'Semester 3',
      icon: Zap,
      folderId: 'f-ee-s3-ecn',
      tags: ['KCL/KVL', 'Theorems', 'AC Circuits']
    },
    {
      name: 'Data Structures & Algorithms',
      branch: 'Computer Science',
      sem: 'Semester 3',
      icon: Code,
      folderId: 'f-cse-s3-dsa',
      tags: ['Trees', 'Sorting', 'Big-O']
    },
    {
      name: 'Applied Thermodynamics',
      branch: 'Mechanical Engg',
      sem: 'Semester 3',
      icon: Wrench,
      folderId: 'f-me-s3-thermo',
      tags: ['Carnot Cycle', 'Steam Tables', 'Entropy']
    },
    {
      name: 'Advanced Surveying & Levelling',
      branch: 'Civil Engg',
      sem: 'Semester 3',
      icon: Compass,
      folderId: 'f-ce-s3-survey',
      tags: ['Theodolite', 'Traversing', 'Total Station']
    }
  ];

  return (
    <div id="polytechnic-home-view" className="space-y-16 pb-16">
      
      {/* APP-STYLE DASHBOARD HERO */}
      <section className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to <span className="text-blue-600">PolyHub</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-md">
              Your digital study library. Browse notes, previous year questions, and curriculum files effortlessly.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button
              onClick={() => onOpenPremiumCourse && onOpenPremiumCourse()}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 shadow-sm transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Premium</span>
            </button>
            {isInstallable && (
              <button
                id="hero-install-btn"
                onClick={promptInstall}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-2xl font-extrabold text-blue-600 font-mono">{stats?.totalFolders ?? 18}+</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Folders</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-2xl font-extrabold text-cyan-600 font-mono">{stats?.totalFiles ?? 8}+</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Docs</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">{stats?.totalFiles ?? 4}+</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Guides</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">{stats?.totalViews ?? 3400}+</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Reads</span>
          </div>
        </div>
      </section>

      {/* QUICK BROWSE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Major Study Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500">Select your diploma branch to explore semester folders and unit notes</p>
          </div>
          <button
            onClick={() => onNavigateBrowse(null)}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All Root Folders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {branches.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                onClick={() => onNavigateBrowse(b.id)}
                className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${b.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${b.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${b.badge}`}>
                      {b.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {b.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600">
                  <span>Explore Semesters</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR SUBJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Featured Curriculum</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Popular Subjects & Unit Packs</h2>
            </div>
            <button
              onClick={() => onNavigateBrowse(null)}
              className="text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open Library Tree</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularSubjects.map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigateBrowse(sub.folderId)}
                  className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold mb-2">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span>{sub.branch}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors leading-snug">
                      {sub.name}
                    </h3>
                    <span className="inline-block text-[11px] text-slate-500 mt-1">{sub.sem}</span>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {sub.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-600 font-semibold">
                    <span>Open Unit Folders</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RECENT STUDY MATERIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Recent Study Materials</h2>
            <p className="text-xs sm:text-sm text-slate-500">Recently published lecture notes, documents and reference guides</p>
          </div>
          <button
            onClick={() => onNavigateBrowse(null)}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentFiles.map((file) => {
            const isPdf = file.type === 'pdf';
            return (
              <div
                key={file.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isPdf
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      }`}>
                        {<FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          isPdf
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        }`}>
                          "DOC"
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {file.name.replace(/\.(pdf|html)$/i, '')}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {file.description || `Comprehensive study notes for ${file.subject || file.branch || 'Polytechnic Engineering'}.`}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{formatDate(file.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{file.viewsCount || 0} reads</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onOpenFile(file)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Open in Study Viewer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      
    </div>
  );
};
