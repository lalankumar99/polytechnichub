const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

const searchBtn = `<button
              id="hero-search-btn"
              onClick={onOpenSearch}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search Materials</span>
            </button>`;

const replacement = `<button
              id="hero-search-btn"
              onClick={onOpenSearch}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search Materials</span>
            </button>
            {isInstallable && (
              <button
                id="hero-install-btn"
                onClick={promptInstall}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-100 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <Download className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>Install App</span>
              </button>
            )}
`;

content = content.replace(searchBtn, replacement);
fs.writeFileSync('src/components/HomePage.tsx', content);
