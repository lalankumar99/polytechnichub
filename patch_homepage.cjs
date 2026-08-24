const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

// Add hook import
content = content.replace("import { formatFileSize, formatDate } from '../utils/formatters';", "import { formatFileSize, formatDate } from '../utils/formatters';\nimport { usePWAInstall } from '../hooks/usePWAInstall';");

// Add hook usage inside component
content = content.replace("export const HomePage: React.FC<HomePageProps> = ({\n  onNavigateBrowse,\n  onOpenSearch,\n  onOpenFile,\n  stats,\n  items\n}) => {", "export const HomePage: React.FC<HomePageProps> = ({\n  onNavigateBrowse,\n  onOpenSearch,\n  onOpenFile,\n  stats,\n  items\n}) => {\n  const { isInstallable, promptInstall } = usePWAInstall();");

// Add Download icon to lucide-react if needed
if (!content.includes('Download,')) {
    content = content.replace("FolderOpen\n} from 'lucide-react';", "FolderOpen,\n  Download\n} from 'lucide-react';");
}

// Find a good place for the install button - perhaps in the hero section.
// Let's look for "Explore Digital Library" button and put it next to it.
const heroButtonsRegex = /<button\s+onClick=\{onOpenSearch\}[^>]*>\s*<Search[^>]*\/>\s*<span>Search Notes & PDFs<\/span>\s*<\/button>/;
const installButtonHtml = `
            {isInstallable && (
              <button
                onClick={promptInstall}
                className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800/80 text-white font-bold transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5 text-cyan-400" />
                <span>Install App</span>
              </button>
            )}
`;

content = content.replace(heroButtonsRegex, (match) => match + installButtonHtml);

fs.writeFileSync('src/components/HomePage.tsx', content);
