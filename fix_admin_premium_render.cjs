const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldRender = `{activeTab === 'studiverse' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">`;

const newRender = `{activeTab === 'premium' && (
          <AdminPremiumManager />
        )}

        {activeTab === 'studiverse' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">`;

if (content.includes(oldRender)) {
    content = content.replace(oldRender, newRender);
    content = content.replace(
        "import { StudyItem, LibraryStats } from '../types';",
        "import { StudyItem, LibraryStats } from '../types';\nimport { AdminPremiumManager } from './AdminPremiumManager';"
    );
    fs.writeFileSync('src/components/AdminDashboard.tsx', content);
} else {
    console.log("Could not find studiverse render block");
}
