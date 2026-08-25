const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace state
content = content.replace(
  'const [selectedPremiumCourse, setSelectedPremiumCourse] = useState<any | null>(null);',
  'const [showPremiumPortal, setShowPremiumPortal] = useState(false);\n  const [premiumUser, setPremiumUser] = useState<any>(null);'
);

// handleOpenPremiumCourse
content = content.replace(
  `const handleOpenPremiumCourse = (course: any) => {
    setSelectedPremiumCourse(course);
    setCurrentView('premium');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`,
  `const handleOpenPremiumCourse = () => {
    setShowPremiumPortal(true);
  };`
);

// load initial premium user
content = content.replace(
  'const [studentUser, setStudentUser] = useState<any>(null);',
  `const [studentUser, setStudentUser] = useState<any>(null);
  
  useEffect(() => {
    const savedPremium = localStorage.getItem('polytechnic_premium_user');
    if (savedPremium) {
      try {
        setPremiumUser(JSON.parse(savedPremium));
      } catch (e) {}
    }
  }, []);`
);

// render components
content = content.replace(
  `{currentView === 'premium' && selectedPremiumCourse && (
          <PremiumCourseView 
            course={selectedPremiumCourse} 
            onBack={() => handleNavigate('home')} 
            user={studentUser}
            onOpenFile={handleInitiateOpenFile}
          />
        )}`,
  ``
);

// Add PremiumPortal Modal
content = content.replace(
  `{showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(user) => {
            setAdminUser(user);
            setShowLoginModal(false);
            setCurrentView('admin');
          }}
        />
      )}`,
  `{showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(user) => {
            setAdminUser(user);
            setShowLoginModal(false);
            setCurrentView('admin');
          }}
        />
      )}
      
      {showPremiumPortal && (
        <PremiumPortal 
          onClose={() => setShowPremiumPortal(false)}
          onLoginSuccess={(user) => {
            setPremiumUser(user);
            setShowPremiumPortal(false);
          }}
        />
      )}`
);

// Imports
content = content.replace(
  "import { PremiumCourseView } from './components/PremiumCourseView';",
  "import { PremiumPortal } from './components/PremiumPortal';"
);

fs.writeFileSync('src/App.tsx', content);
