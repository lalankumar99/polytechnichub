const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const returnStatement = `  return (
    <div id="polytechnic-admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">`;

const newReturnStatement = `  return (
    <div id="polytechnic-admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Tabs */}
      <div className="flex items-center space-x-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('manager')}
          className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'manager' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
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

      {activeTab === 'premium' && (
        <AdminPremiumManager />
      )}

      {activeTab === 'manager' && (
        <>
`;

if (content.includes(returnStatement)) {
    content = content.replace(returnStatement, newReturnStatement);
    
    const modalsStart = `{/* ========================================================================= */}
      {/* MODAL 1: NEW FOLDER */}`;
    const newModalsStart = `
        </>
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
    console.log("Updated correctly.");
} else {
    console.log("Could not find return statement");
}
