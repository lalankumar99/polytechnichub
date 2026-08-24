const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalSearchModal.tsx', 'utf-8');

// remove PDF and HTML from the filter buttons
content = content.replace(/\{\(\['all', 'pdf', 'html', 'folder'\] as const\)\.map\(t => \(/g, "{(['all', 'folder'] as const).map(t => (");
content = content.replace(/isPdf\s*\?\s*'bg-rose-50 text-rose-600'\s*:\s*'bg-emerald-50 text-emerald-600'/g, "'bg-indigo-50 text-indigo-600'");

fs.writeFileSync('src/components/GlobalSearchModal.tsx', content);

content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');
content = content.replace(/isPdf\s*\?\s*'bg-rose-500\/20 text-rose-400 border-rose-500\/30'\s*:\s*'bg-emerald-500\/20 text-emerald-400 border-emerald-500\/30'/g, "'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'");
fs.writeFileSync('src/components/StudyViewer.tsx', content);

