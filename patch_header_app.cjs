const fs = require('fs');

// Patch App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
appContent = appContent.replace("import { HomePage } from './components/HomePage';", "import { HomePage } from './components/HomePage';\nimport About from './components/About';");

// Update View State
appContent = appContent.replace("const [currentView, setCurrentView] = useState<'home' | 'browse' | 'admin'>('home');", "const [currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about'>('home');");

// Update navigation handler
appContent = appContent.replace("const handleNavigate = (view: 'home' | 'browse' | 'admin', folderId: string | null = null) => {", "const handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about', folderId: string | null = null) => {");

// Add About render section
const aboutRender = `
        {currentView === 'browse' && (
`;
const newAboutRender = `
        {currentView === 'about' && (
          <About />
        )}
        {currentView === 'browse' && (
`;
appContent = appContent.replace(aboutRender, newAboutRender);

fs.writeFileSync('src/App.tsx', appContent);

// Patch Header.tsx
let headerContent = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Update Interface
headerContent = headerContent.replace("currentView: 'home' | 'browse' | 'admin';", "currentView: 'home' | 'browse' | 'admin' | 'about';");
headerContent = headerContent.replace("onNavigate: (view: 'home' | 'browse' | 'admin', folderId?: string | null) => void;", "onNavigate: (view: 'home' | 'browse' | 'admin' | 'about', folderId?: string | null) => void;");

// Update Desktop Menu
const browseButton = `<button
              onClick={() => onNavigate('browse')}
              className={\`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors \${currentView === 'browse' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Library</span>
            </button>`;

const newDesktopMenu = `<button
              onClick={() => onNavigate('browse')}
              className={\`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors \${currentView === 'browse' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={\`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors \${currentView === 'about' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <BookOpen className="w-4 h-4" />
              <span>About Us</span>
            </button>`;

headerContent = headerContent.replace(browseButton, newDesktopMenu);

// Update Mobile Menu
const mobileBrowseButton = `<button
              onClick={() => { onNavigate('browse'); setMobileMenuOpen(false); }}
              className={\`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-colors \${currentView === 'browse' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <FolderTree className="w-5 h-5" />
              <span>Library</span>
            </button>`;

const newMobileMenu = `<button
              onClick={() => { onNavigate('browse'); setMobileMenuOpen(false); }}
              className={\`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-colors \${currentView === 'browse' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <FolderTree className="w-5 h-5" />
              <span>Library</span>
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className={\`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-colors \${currentView === 'about' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}\`}
            >
              <BookOpen className="w-5 h-5" />
              <span>About Us</span>
            </button>`;

headerContent = headerContent.replace(mobileBrowseButton, newMobileMenu);

fs.writeFileSync('src/components/Header.tsx', headerContent);
