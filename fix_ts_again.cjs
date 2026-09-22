const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
if (!app.includes('import { PremiumCourseView')) {
    app = "import { PremiumCourseView } from './components/PremiumCourseView';\n" + app;
    fs.writeFileSync('src/App.tsx', app);
}

// About.tsx
let about = fs.readFileSync('src/components/About.tsx', 'utf-8');
if (!about.includes('Sparkles')) {
    about = "import { Sparkles } from 'lucide-react';\n" + about;
    fs.writeFileSync('src/components/About.tsx', about);
}

// AdminDashboard.tsx
let admin = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
if (!admin.includes('import { AdminPremiumManager')) {
    admin = "import { AdminPremiumManager } from './AdminPremiumManager';\n" + admin;
}
if (!admin.includes('const loadFeedbacks = async () => {')) {
    // wait I injected loadFeedbacks in fix_admin_1.cjs inside the component.
    // Let me check if loadFeedbacks exists
    if (!admin.includes('loadFeedbacks = async')) {
      // it was probably not injected or wiped. I need to re-inject it if missing.
    }
}
fs.writeFileSync('src/components/AdminDashboard.tsx', admin);
