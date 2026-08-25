const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Add premium to activeTab type
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'manager' | 'overview' | 'all-files' | 'studiverse'>('manager');",
  "const [activeTab, setActiveTab] = useState<'manager' | 'overview' | 'all-files' | 'studiverse' | 'premium'>('manager');"
);

// 2. Add tab button
const oldTabs = `<button
            onClick={() => setActiveTab('studiverse')}
            className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'studiverse' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            Studiverse Sync
          </button>`;
const newTabs = `<button
            onClick={() => setActiveTab('studiverse')}
            className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'studiverse' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            Studiverse Sync
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-1 \${activeTab === 'premium' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          >
            <Lock className="w-4 h-4 mr-1"/>
            Premium Courses
          </button>`;

if (content.includes(oldTabs)) {
    content = content.replace(oldTabs, newTabs);
} else {
    console.log("Could not find studiverse tab");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
