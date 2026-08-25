const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('PremiumCourseView')) {
    content = content.replace(
        "import { PremiumCourse } from './types';",
        "import { PremiumCourse } from './types';\nimport { PremiumCourseView } from './components/PremiumCourseView';"
    );
    
    content = content.replace(
        "</main>",
        `
        {currentView === 'premium' && selectedPremiumCourse && (
          <PremiumCourseView 
            course={selectedPremiumCourse} 
            user={studentUser} 
            onBack={() => setCurrentView('home')} 
            onOpenFile={handleInitiateOpenFile} 
          />
        )}
      </main>`
    );
    
    fs.writeFileSync('src/App.tsx', content);
}
