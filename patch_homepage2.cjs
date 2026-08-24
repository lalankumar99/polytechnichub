const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

const target = `<button
              onClick={onOpenSearch}
              className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800/80 text-white font-bold transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Search Notes & PDFs</span>
            </button>`;

const replacement = `<button
              onClick={onOpenSearch}
              className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800/80 text-white font-bold transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Search Notes & PDFs</span>
            </button>

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800/80 text-white font-bold transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5 text-cyan-400" />
                <span>Install App</span>
              </button>
            )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/HomePage.tsx', content);
