const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add import
if (!code.includes('PremiumCoursesView')) {
  code = code.replace("import { PremiumPortal } from './components/PremiumPortal';", "import { PremiumPortal } from './components/PremiumPortal';\nimport { PremiumCoursesView } from './components/PremiumCoursesView';");
}

// 2. Add 'premium-courses' to currentView state
code = code.replace(
  "const [currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about' | 'premium'>('home');",
  "const [currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses'>('home');"
);

// 3. Update the view router
const coursesViewStr = `
        {currentView === 'premium-courses' && (
          <PremiumCoursesView 
            onOpenLogin={() => setShowPremiumPortal(true)} 
            premiumUser={premiumUser} 
          />
        )}
`;
code = code.replace("{currentView === 'about' && <About />}", "{currentView === 'about' && <About />}\n" + coursesViewStr);

// 4. Also update BottomNavigation and Header to include this? Or just the buttons in HomePage
// Let's also check BottomNavigation types if any error

fs.writeFileSync('src/App.tsx', code);
