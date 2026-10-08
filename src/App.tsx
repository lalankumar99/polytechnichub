import { BottomNavigation } from './components/BottomNavigation';
import { PremiumPortal } from './components/PremiumPortal';
import { PremiumCoursesView } from './components/PremiumCoursesView';
import { PremiumCourseView } from './components/PremiumCourseView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LiveClassNotificationBanner } from './components/LiveClassNotificationBanner';
import { LiveClassToast } from './components/LiveClassToast';
import { 
  playNotificationChime, 
  sendBrowserNotification, 
  hasNotifiedForLiveStream, 
  markLiveStreamAsNotified,
  clearLiveStreamNotificationState
} from './utils/notificationService';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import About from './components/About';
import { BrowseView } from './components/BrowseView';
import { AdminDashboard } from './components/AdminDashboard';
import { StudyViewer } from './components/StudyViewer';
import { DrivePdfViewer } from './components/DrivePdfViewer';
import { DriveReaderModal } from './components/DriveReaderModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { api, authState } from './services/api';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { StudyItem, LibraryStats, AdminUser, PremiumCourse } from './types';
import { getEffectiveDisplayType } from './utils/formatters';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses'>('home');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Data
  const [publicItems, setPublicItems] = useState<StudyItem[]>([]);
  const [publicStats, setPublicStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Authentication
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authState.getUser());
  const [studentUser, setStudentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Search Modal
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Viewer & Requirement Flow
  const [selectedFileForRequirement, setSelectedFileForRequirement] = useState<StudyItem | null>(null);
  const [activeViewingFile, setActiveViewingFile] = useState<StudyItem | null>(null);
  const [showPremiumPortal, setShowPremiumPortal] = useState(false);
  const [premiumPortalMode, setPremiumPortalMode] = useState<'login' | 'register'>('login');
  const [selectedPremiumCourse, setSelectedPremiumCourse] = useState<PremiumCourse | null>(null);
  const [showDriveReaderModal, setShowDriveReaderModal] = useState<boolean>(false);
  const [adminTriggerAddDrivePdf, setAdminTriggerAddDrivePdf] = useState<boolean>(false);
  const [activeDriveSource, setActiveDriveSource] = useState<{ source: string; title?: string } | null>(null);
  const [allCourses, setAllCourses] = useState<PremiumCourse[]>([]);
  const [activeToastCourse, setActiveToastCourse] = useState<PremiumCourse | null>(null);
  const [premiumUser, setPremiumUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('polytechnic_premium_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.success && parsed.user) {
          localStorage.setItem('polytechnic_premium_user', JSON.stringify(parsed.user));
          return parsed.user;
        }
        return parsed;
      }
      return null;
    } catch (e) { return null; }
  });
  const [initialFullscreenPref, setInitialFullscreenPref] = useState<boolean>(false);

  // Background sync stored student user profile, status and assigned courses
  useEffect(() => {
    if (premiumUser?.internalId) {
      api.syncPremiumUser(premiumUser.internalId)
        .then(freshUser => {
          if (freshUser) {
            setPremiumUser(freshUser);
            localStorage.setItem('polytechnic_premium_user', JSON.stringify(freshUser));
          }
        })
        .catch(err => console.error('Error background-syncing premium student user:', err));
    }
  }, []);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStudentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load public data
  const loadPublicData = useCallback(async () => {
    try {
      const [items, stats, courses] = await Promise.all([
        api.getPublicTree().catch(() => []),
        api.getPublicStats().catch(() => null),
        api.getPremiumCourses().catch(() => [])
      ]);
      setPublicItems(items);
      setPublicStats(stats);
      setAllCourses(courses || []);
    } catch (err) {
      console.error('Error fetching public library:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll courses in background so all students receive live class notifications in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      api.getPremiumCourses().then(courses => {
        if (courses) setAllCourses(courses);
      }).catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinLiveCourse = (course: PremiumCourse) => {
    setSelectedPremiumCourse(course);
    setCurrentView('premium-courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student Live Alerts: Plays audio chime, dispatches browser notification, and triggers floating toast
  useEffect(() => {
    if (!allCourses || allCourses.length === 0) return;

    allCourses.forEach(course => {
      if (course.isLive && course.liveYoutubeUrl) {
        if (!hasNotifiedForLiveStream(course.id)) {
          markLiveStreamAsNotified(course.id);
          // 1. Melodic sound chime
          playNotificationChime();
          // 2. Real browser / device notification
          sendBrowserNotification(`🔴 LIVE CLASS: ${course.name}`, {
            body: course.liveTopic ? `Topic: ${course.liveTopic}. Tap to join the live stream!` : 'Live class is now broadcasting! Tap to join.',
            tag: `live-${course.id}`,
            data: { courseId: course.id }
          });
          // 3. Floating on-screen toast
          setActiveToastCourse(course);
        }
      } else {
        clearLiveStreamNotificationState(course.id);
      }
    });
  }, [allCourses]);

  useEffect(() => {
    loadPublicData();
    // Check existing auth token validity
    api.verifyAuth().then(user => {
      setAdminUser(user);
    });
  }, [loadPublicData]);

  // Global Keyboard Shortcuts (e.g. Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handlers
  const handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses', folderId: string | null = null) => {
    if (view === 'admin' && !adminUser) {
      setShowLoginModal(true);
      return;
    }
    if (view === 'premium' || view === 'premium-courses') {
      if (!premiumUser || premiumUser.status !== 'approved') {
        setPremiumPortalMode('login');
        setShowPremiumPortal(true);
        return;
      }
      setCurrentView('premium-courses');
      setSelectedPremiumCourse(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    if (view === 'browse') {
      setCurrentFolderId(folderId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPremiumCourse = () => {
    if (!premiumUser || premiumUser.status !== 'approved') {
      setPremiumPortalMode('login');
      setShowPremiumPortal(true);
    } else {
      setCurrentView('premium-courses');
      setSelectedPremiumCourse(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenFolder = (folderId: string) => {
    const folder = publicItems.find(i => i.id === folderId);
    if (folder?.isPremium) {
      if (!premiumUser || premiumUser.status !== 'approved') {
        setShowPremiumPortal(true);
        return;
      }
    }
    setCurrentView('browse');
    setCurrentFolderId(folderId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Directly open file or video without any permission prompt
  const handleInitiateOpenFile = (file: StudyItem) => {
    if (file.isPremium) {
      if (!premiumUser || premiumUser.status !== 'approved') {
        setShowPremiumPortal(true);
        return;
      }
    }

    const effType = getEffectiveDisplayType(file);
    const isVideo = effType === 'video' || file.type === 'youtube' || file.isVideo || (file.fileUrl && (file.fileUrl.includes('youtube.com') || file.fileUrl.includes('youtu.be')));

    // Google Drive direct viewer (Only for actual PDF documents, NOT videos)
    if (!isVideo && file.fileUrl && (file.fileUrl.includes('drive.google.com') || file.fileUrl.includes('docs.google.com'))) {
      setActiveDriveSource({ source: file.fileUrl, title: file.name });
      return;
    }
    if (isVideo) {
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen({ navigationUI: 'hide' } as any).catch(() => {});
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
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
    }

    const fileToOpen = { ...file };
    setInitialFullscreenPref(true);

    // Register authentic reading/view in backend Firestore database
    api.getPublicItem(fileToOpen.id).catch(err => console.error('Failed to increment view:', err));
    fileToOpen.viewsCount = (fileToOpen.viewsCount || 0) + 1;

    setActiveViewingFile(fileToOpen);
  };

  const handleCloseViewer = () => {
    setActiveViewingFile(null);
    loadPublicData(); // Refresh views count across library
  };

  const handleLogout = () => {
    api.logout();
    setAdminUser(null);
    if (currentView === 'admin') {
      setCurrentView('home');
    }
  };

  
  const isPremiumActive = premiumUser && premiumUser.status === 'approved';
  
  const filteredItems = useMemo(() => {
    if (adminUser) return publicItems; // Admin sees all
    
    return publicItems.filter(item => {
      // If marked as premium only, hide from non-premium users
      if (item.accessType === 'premium' || item.isPremium) {
        return isPremiumActive;
      }
      // If marked as free only, hide from premium users (based on some interpretations, but user said "Jo free wala hai vah bhi dikhna chahie premium lene wala ko", meaning premium sees free content. So we don't hide free content from premium.)
      // Therefore, if it's 'free' or 'both', it's visible to everyone.
      return true;
    });
  }, [publicItems, premiumUser, adminUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/30 selection:text-slate-900 w-full overflow-x-hidden max-w-full">
      
      {/* Offline Status Monitor & Popup */}
      <OfflineIndicator onRetryConnection={loadPublicData} />

      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        adminUser={adminUser}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onLogout={handleLogout}
        premiumUser={premiumUser}
        courses={allCourses}
        onJoinLiveCourse={handleJoinLiveCourse}
        onPremiumLogout={() => {
          localStorage.removeItem('polytechnic_premium_user');
          setPremiumUser(null);
        }}
        onOpenAdminAddDrivePdf={() => {
          setCurrentView('admin');
          setAdminTriggerAddDrivePdf(true);
        }}
        onOpenPremiumLogin={() => {
          setPremiumPortalMode('login');
          setShowPremiumPortal(true);
        }}
      />

      {/* Global Live Class Announcement Notification for All Students */}
      <LiveClassNotificationBanner
        courses={allCourses}
        onJoinLiveCourse={handleJoinLiveCourse}
        user={premiumUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0">
        {currentView === 'home' && (
          <HomePage
            onNavigateBrowse={(folderId) => handleNavigate('browse', folderId)}
            onOpenSearch={() => setShowSearchModal(true)}
            onOpenFile={handleInitiateOpenFile}
            onOpenPremiumCourse={handleOpenPremiumCourse}
            stats={publicStats}
            items={filteredItems}
          />
        )}

        {currentView === 'about' && (
          <About />
        )}
        {currentView === 'browse' && (
          <BrowseView
            currentFolderId={currentFolderId}
            items={filteredItems}
            onOpenFolder={handleOpenFolder}
            onNavigateBreadcrumb={(fId) => setCurrentFolderId(fId)}
            onOpenFile={handleInitiateOpenFile}
            isAdmin={!!adminUser}
          />
        )}

        {currentView === 'admin' && adminUser && (
          <AdminDashboard
            onOpenFile={handleInitiateOpenFile}
            onRefreshPublicData={loadPublicData}
            triggerAddDrivePdf={adminTriggerAddDrivePdf}
            onResetTriggerAddDrivePdf={() => setAdminTriggerAddDrivePdf(false)}
          />
        )}

        {/* Premium Polytechnic Courses (Assigned to Student & Admin Control) */}
        {(currentView === 'premium' || currentView === 'premium-courses') && (
          selectedPremiumCourse ? (
            <PremiumCourseView
              course={allCourses.find(c => c.id === selectedPremiumCourse.id) || selectedPremiumCourse}
              onBack={() => setSelectedPremiumCourse(null)}
              user={premiumUser}
              isAdmin={!!adminUser}
              onOpenFile={handleInitiateOpenFile}
              onOpenPremiumLogin={() => setShowPremiumPortal(true)}
            />
          ) : (
            <PremiumCoursesView
              onOpenLogin={() => setShowPremiumPortal(true)}
              premiumUser={premiumUser}
              isAdmin={!!adminUser}
              onOpenFile={handleInitiateOpenFile}
              onOpenCourse={async (courseId) => {
                try {
                  const course = await api.getPremiumCourse(courseId);
                  if (course) {
                    setSelectedPremiumCourse(course);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } catch (err) {
                  console.error('Failed to open course:', err);
                }
              }}
            />
          )
        )}
      
      </main>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer
          onNavigate={handleNavigate}
          onOpenLogin={() => setShowLoginModal(true)}
        />
      </div>

      {/* Immersive Study Viewer (PDF, HTML & Video) */}
      {activeViewingFile && (
        <StudyViewer
          file={activeViewingFile}
          onClose={handleCloseViewer}
          initialFullscreen={initialFullscreenPref}
        />
      )}

      {/* Google Drive PDF Fullscreen Viewer */}
      {activeDriveSource && (
        <DrivePdfViewer
          driveSource={activeDriveSource.source}
          title={activeDriveSource.title}
          onClose={() => setActiveDriveSource(null)}
          autoFullscreen={true}
        />
      )}

      {/* Google Drive Reader Input Modal (Admin Only) */}
      {adminUser && (
        <DriveReaderModal
          isOpen={showDriveReaderModal}
          onClose={() => setShowDriveReaderModal(false)}
          onLaunchViewer={(source, title) => {
            setActiveDriveSource({ source, title });
          }}
        />
      )}

      
      {/* Premium Student Portal (Login/Register) */}
      {showPremiumPortal && (
        <PremiumPortal 
          initialMode={premiumPortalMode}
          onLoginSuccess={(user) => {
            setPremiumUser(user);
            setShowPremiumPortal(false);
            setCurrentView('premium-courses');
            setSelectedPremiumCourse(null);
          }}
          onClose={() => setShowPremiumPortal(false)}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        items={filteredItems}
        onSelectItem={(item) => {
          if (item.type === 'folder') {
            handleOpenFolder(item.id);
          } else {
            handleInitiateOpenFile(item);
          }
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(user) => {
          setAdminUser(user);
          setCurrentView('admin');
        }}
      />

      {/* Floating Live Class Toast Alert */}
      {activeToastCourse && (
        <LiveClassToast
          course={activeToastCourse}
          onJoin={() => {
            handleJoinLiveCourse(activeToastCourse);
            setActiveToastCourse(null);
          }}
          onDismiss={() => setActiveToastCourse(null)}
        />
      )}

      {!activeViewingFile && !activeDriveSource && (
        <BottomNavigation
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setShowSearchModal(true)}
          isAdmin={!!adminUser}
        />
      )}

    </div>
  );
}
