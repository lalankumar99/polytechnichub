const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const returnStatement = `  return (
    <div className="min-h-screen bg-slate-50 pb-20">`;

const newReturnStatement = `  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center space-x-6 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('manager')}
            className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'manager' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            File Manager
          </button>
          <button 
            onClick={() => setActiveTab('premium')}
            className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-1 \${activeTab === 'premium' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Lock className="w-4 h-4 mr-1"/>
            Premium Courses
          </button>
        </div>
      </div>

      {activeTab === 'premium' && (
        <AdminPremiumManager />
      )}

      {activeTab === 'manager' && (`;

if (content.includes(returnStatement)) {
    content = content.replace(returnStatement, newReturnStatement);
    
    // find the last div before the modals and close the manager block
    const modalsStart = `{/* ========================================================================= */}
      {/* MODAL 1: NEW FOLDER */}`;
    const newModalsStart = `
      )}
      
      {/* ========================================================================= */}
      {/* MODAL 1: NEW FOLDER */}`;
      
    content = content.replace(modalsStart, newModalsStart);
    
    if (!content.includes('AdminPremiumManager')) {
       content = content.replace(
           "import { StudyItem, LibraryStats, BreadcrumbItem } from '../types';",
           "import { StudyItem, LibraryStats, BreadcrumbItem } from '../types';\nimport { AdminPremiumManager } from './AdminPremiumManager';"
       );
    }
    
    fs.writeFileSync('src/components/AdminDashboard.tsx', content);
    console.log("Updated AdminDashboard successfully.");
} else {
    console.log("Could not find return statement");
}
