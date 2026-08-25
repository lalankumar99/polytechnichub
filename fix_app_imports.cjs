const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
if (!content.includes('PremiumCourseView')) {
    content = content.replace("import { AdminLoginModal } from './components/AdminLoginModal';", "import { AdminLoginModal } from './components/AdminLoginModal';\nimport { PremiumCourseView } from './components/PremiumCourseView';");
    fs.writeFileSync('src/App.tsx', content);
}
