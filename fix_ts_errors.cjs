const fs = require('fs');

// 1. App.tsx - Import PremiumCourseView
let app = fs.readFileSync('src/App.tsx', 'utf-8');
if (!app.includes('PremiumCourseView')) {
    app = app.replace("import { AdminLoginModal }", "import { PremiumCourseView } from './components/PremiumCourseView';\nimport { AdminLoginModal }");
    fs.writeFileSync('src/App.tsx', app);
}

// 2. About.tsx - Sparkles
let about = fs.readFileSync('src/components/About.tsx', 'utf-8');
if (!about.includes('Sparkles')) {
    about = about.replace("CheckCircle } from 'lucide-react';", "CheckCircle, Sparkles } from 'lucide-react';");
    fs.writeFileSync('src/components/About.tsx', about);
}

// 3. AdminDashboard.tsx - AdminPremiumManager and loadFeedbacks
let admin = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
if (!admin.includes('AdminPremiumManager')) {
    admin = admin.replace("import { ViewingRequirementModal }", "import { AdminPremiumManager } from './AdminPremiumManager';\nimport { ViewingRequirementModal }");
    fs.writeFileSync('src/components/AdminDashboard.tsx', admin);
}

// 4. PremiumCourseView.tsx - Code
let premium = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');
if (!premium.includes('Code,')) {
    premium = premium.replace("Link2 } from 'lucide-react';", "Link2, Code } from 'lucide-react';");
    fs.writeFileSync('src/components/PremiumCourseView.tsx', premium);
}

// 5. api.ts - getAdminAuthHeaders
let apiFile = fs.readFileSync('src/services/api.ts', 'utf-8');
if (!apiFile.includes('getAdminAuthHeaders')) {
    const fn = `const getAdminAuthHeaders = () => {
  const token = authState.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? \`Bearer \${token}\` : ''
  };
};`;
    apiFile = apiFile.replace("export const api = {", fn + "\n\nexport const api = {");
    fs.writeFileSync('src/services/api.ts', apiFile);
}

