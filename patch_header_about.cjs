const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Patch Desktop Menu
const desktopSearchBtn = `            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center space-x-1.5 transition-all border border-transparent hover:border-slate-700"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
            </button>`;

const newDesktopBtn = `            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center space-x-1.5 transition-all border border-transparent hover:border-slate-700"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
            </button>
            <button
              id="nav-about-btn"
              onClick={() => onNavigate('about')}
              className={\`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all \${
                currentView === 'about'
                  ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }\`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>About</span>
            </button>`;

content = content.replace(desktopSearchBtn, newDesktopBtn);

// Patch Mobile Menu
const mobileSearchBtn = `          <button
            onClick={() => {
              onOpenSearch();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search All Notes</span>
          </button>`;

const newMobileBtn = `          <button
            onClick={() => {
              onOpenSearch();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search All Notes</span>
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className={\`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 \${
              currentView === 'about' ? 'bg-blue-600/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
            }\`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>About</span>
          </button>`;

content = content.replace(mobileSearchBtn, newMobileBtn);

fs.writeFileSync('src/components/Header.tsx', content);

