const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

const browseButton = `<button
              id="hero-browse-btn"
              onClick={() => onNavigateBrowse(null)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FolderTree className="w-4 h-4" />
              <span>Browse Notes</span>
              <ArrowRight className="w-4 h-4" />
            </button>`;

const premiumButton = `<button
              onClick={() => onOpenPremiumCourse && onOpenPremiumCourse()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Premium Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>`;

content = content.replace(browseButton, browseButton + '\n            ' + premiumButton);

fs.writeFileSync('src/components/HomePage.tsx', content);
