import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse, PremiumItem, StudyItem } from '../types';
import { 
  Lock, 
  PlayCircle, 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Layers,
  FileText,
  Youtube,
  Search,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Filter,
  Radio,
  Clock
} from 'lucide-react';

interface PremiumCoursesViewProps {
  onOpenLogin: () => void;
  premiumUser: any;
  isAdmin?: boolean;
  onOpenFile?: (file: StudyItem) => void;
  onOpenCourse: (courseId: string) => void;
}

export const PremiumCoursesView: React.FC<PremiumCoursesViewProps> = ({ 
  onOpenLogin, 
  premiumUser, 
  isAdmin, 
  onOpenFile,
  onOpenCourse 
}) => {
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [courseModules, setCourseModules] = useState<Record<string, PremiumItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  useEffect(() => {
    const fetchCoursesAndContent = async () => {
      try {
        setLoading(true);
        const data = await api.getPremiumCourses();
        const publishedCourses = (data || []).filter((c: PremiumCourse) => isAdmin || c.status === 'published');
        setCourses(publishedCourses);

        // Fetch modules/content for each course so content is visible right away
        const modulesMap: Record<string, PremiumItem[]> = {};
        await Promise.all(
          publishedCourses.map(async (c: PremiumCourse) => {
            try {
              const items = await api.getPremiumItems(c.id);
              modulesMap[c.id] = (items || []).filter((i: any) => isAdmin || i.status === 'published');
            } catch (e) {
              modulesMap[c.id] = [];
            }
          })
        );
        setCourseModules(modulesMap);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesAndContent();
  }, [isAdmin]);

  const isApprovedStudent = premiumUser && premiumUser.status === 'approved';
  const assignedIds: string[] = Array.isArray(premiumUser?.assignedCourseIds) ? premiumUser.assignedCourseIds : [];

  // Filter courses by assigned status, search query, and branch
  const assignedCourses = isAdmin 
    ? courses 
    : courses.filter(c => assignedIds.includes(c.id));
    
  const otherCourses = isAdmin 
    ? [] 
    : courses.filter(c => !assignedIds.includes(c.id));

  // Extract unique branches for filter pills
  const availableBranches = Array.from(new Set(courses.map(c => c.branch).filter(Boolean)));

  const filterCourseList = (list: PremiumCourse[]) => {
    return list.filter(course => {
      const matchesSearch = !searchQuery.trim() || 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.branch && course.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (courseModules[course.id] || []).some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBranch = selectedBranch === 'all' || course.branch?.toLowerCase().includes(selectedBranch.toLowerCase());

      return matchesSearch && matchesBranch;
    });
  };

  const handleModuleClick = (course: PremiumCourse, module: PremiumItem, hasAccess: boolean) => {
    if (!hasAccess) {
      onOpenLogin();
      return;
    }

    if (onOpenFile) {
      const studyItem: StudyItem = {
        id: module.id,
        name: module.name,
        type: module.type,
        fileUrl: module.fileUrl,
        description: module.description,
        status: module.status,
        size: module.size || 0,
        parentId: module.parentId,
        isPremium: false,
        accessType: 'premium',
        isVideo: module.type === 'youtube',
        downloadsCount: 0,
        viewsCount: 0,
        createdAt: module.createdAt || new Date().toISOString(),
        updatedAt: module.updatedAt || new Date().toISOString()
      };
      onOpenFile(studyItem);
    } else {
      onOpenCourse(course.id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-3 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-xs text-slate-500 font-bold">Loading Polytechnic Hub Premium...</p>
      </div>
    );
  }

  const displayedMyCourses = filterCourseList(assignedCourses);
  const displayedOtherCourses = filterCourseList(otherCourses);
  const displayedAllCourses = filterCourseList(courses);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-5">
      
      {/* ---------------- MOBILE FIRST HERO & STUDENT HEADER ---------------- */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Premium Study Hub</span>
            </div>

            {isApprovedStudent && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3" />
                <span>ID: {premiumUser.id || 'Active'}</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            {isApprovedStudent 
              ? `Welcome, ${premiumUser.name}!` 
              : 'Polytechnic Premium Courses & Notes'
            }
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-2xl">
            {isApprovedStudent 
              ? `Here are your assigned masterclasses, complete theory notes, and formula sheets. Tap any module to study directly on your phone.`
              : `Handwritten theory notes, complete numerical solutions, previous year questions (PYQs), and video classes designed for polytechnic diploma.`
            }
          </p>

          {/* Quick Stats Chips */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-white border border-white/10 flex items-center space-x-1">
              <BookMarked className="w-3.5 h-3.5 text-indigo-300" />
              <span>{courses.length} Available Courses</span>
            </span>
            {isApprovedStudent && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{assignedCourses.length} Allotted to You</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- MOBILE NOTICE: ALREADY APPROVED BY ADMIN? ---------------- */}
      {!isApprovedStudent && (
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/15 border-2 border-amber-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md font-black text-xl">
              🔑
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                Already approved by Admin?
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                एडमिन द्वारा अप्रूव्ड छात्र सीधे अपने मोबाइल नंबर से लॉगिन करें (Accounts are permanently safe)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenLogin}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Log In with Mobile / ID</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Check Status
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MOBILE SEARCH & BRANCH FILTER BAR ---------------- */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, chapters, topics or branches (e.g. Electrical, Machines, Math)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-base sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Branch Filter Pills (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedBranch('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedBranch === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Branches
          </button>
          {availableBranches.map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedBranch === branch
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* Tab Toggle for Logged In Students */}
        {isApprovedStudent && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'my'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Assigned Courses ({displayedMyCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Institute Courses ({displayedAllCourses.length})
            </button>
          </div>
        )}
      </div>

      {/* ---------------- COURSE LIST WITH DIRECT CONTENT DISPLAY ---------------- */}
      <div className="space-y-6">
        
        {/* If Active Tab is 'my' and user is student */}
        {isApprovedStudent && activeTab === 'my' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>Your Unlocked Courses & Materials</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {displayedMyCourses.length} Assigned
                </span>
              </h2>
            </div>

            {displayedMyCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 text-center space-y-3 shadow-xs">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-extrabold text-base text-slate-900">
                  No Courses Assigned Yet
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your account is active (ID: <code className="font-bold text-slate-900">{premiumUser.id}</code>), but no courses have been allocated to you by the administrator yet.
                  Please contact the administrator or instructor to assign courses to your account.
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  Browse All Available Courses & Content &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedMyCourses.map(course => {
                  const modules = courseModules[course.id] || [];

                  return (
                    <div 
                      key={course.id}
                      className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-400 hover:shadow-md transition-all duration-200"
                    >
                      {/* Course Header Banner */}
                      <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                        {course.bannerUrl ? (
                          <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-indigo-300" />
                          </div>
                        )}
                        
                        {/* Live Now Pulsing Badge or Scheduled or Unlocked Status */}
                        {course.isLive ? (
                          <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1.5 animate-pulse z-10 border border-red-400">
                            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                            <span>LIVE NOW</span>
                          </div>
                        ) : course.liveScheduledTime ? (
                          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur text-slate-200 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center space-x-1 z-10">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{course.liveScheduledTime}</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Unlocked & Active</span>
                          </div>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {course.branch && (
                            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-1">
                              {course.branch}
                            </span>
                          )}
                          <h3 className="font-black text-base text-slate-900 leading-snug">
                            {course.name}
                          </h3>
                          {course.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {course.description}
                            </p>
                          )}
                          {course.isLive && course.liveTopic && (
                            <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center space-x-1">
                              <Radio className="w-3 h-3 animate-pulse" />
                              <span>Live Class: {course.liveTopic}</span>
                            </p>
                          )}
                        </div>

                        {/* Course Overview Stats */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center space-x-1.5 font-semibold">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span>{modules.length} Study Items & Lectures</span>
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Full Access
                          </span>
                        </div>

                        {/* Open Full Course / Join Live Button */}
                        <div className="space-y-2 mt-2">
                          {course.isLive ? (
                            <button
                              onClick={() => onOpenCourse(course.id)}
                              className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer animate-pulse"
                            >
                              <Radio className="w-4 h-4" />
                              <span>Join Live Class Now 🔴</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenCourse(course.id)}
                              className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Open Full Course & Lectures</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* All Courses / Public Catalog */
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>{isApprovedStudent ? 'All Available Polytechnic Courses' : 'Premium Courses & Content'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {displayedAllCourses.length} Courses
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedAllCourses.map(course => {
                const modules = courseModules[course.id] || [];
                const isAssignedToUser = isAdmin || assignedIds.includes(course.id);

                return (
                  <div 
                    key={course.id}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-400 hover:shadow-md transition-all duration-200"
                  >
                    {/* Course Banner */}
                    <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                      {course.bannerUrl ? (
                        <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-xs font-mono font-bold text-xs text-slate-900 z-10">
                        ₹{course.price}
                      </div>

                      {/* Live Now Pulsing Badge or Scheduled or Status */}
                      {course.isLive ? (
                        <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1.5 animate-pulse z-10 border border-red-400">
                          <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                          <span>LIVE NOW</span>
                        </div>
                      ) : course.liveScheduledTime ? (
                        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur text-slate-200 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center space-x-1 z-10">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{course.liveScheduledTime}</span>
                        </div>
                      ) : isAssignedToUser ? (
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Unlocked</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-slate-900/80 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1 backdrop-blur-xs">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Premium</span>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {course.branch && (
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-1">
                            {course.branch}
                          </span>
                        )}
                        <h3 className="font-black text-base text-slate-900 leading-snug">
                          {course.name}
                        </h3>
                        {course.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                        {course.isLive && course.liveTopic && (
                          <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center space-x-1">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>Live Class: {course.liveTopic}</span>
                          </p>
                        )}
                      </div>

                      {/* Course Overview Stats */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center space-x-1.5 font-semibold">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>{modules.length} Study Items & Lectures</span>
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isAssignedToUser 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {isAssignedToUser ? 'Unlocked' : 'Curriculum Available'}
                        </span>
                      </div>

                      {/* Course Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {course.isLive ? (
                          <button
                            onClick={() => onOpenCourse(course.id)}
                            className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer animate-pulse"
                          >
                            <Radio className="w-4 h-4" />
                            <span>Join Live Class Now 🔴</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenCourse(course.id)}
                            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Open Full Course & Lectures</span>
                          </button>
                        )}
                        {!isAssignedToUser && !isApprovedStudent && (
                          <button
                            onClick={onOpenLogin}
                            className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Login with Student ID</span>
                          </button>
                        )}
                        {!isAssignedToUser && isApprovedStudent && (
                          <p className="text-center text-[11px] text-slate-500 font-medium">
                            🔒 Contact Admin to allocate this course
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default PremiumCoursesView;
