const fs = require('fs');

let content = fs.readFileSync('src/components/BrowseView.tsx', 'utf-8');

content = content.replace(/isPdf\s*\?\s*'bg-rose-50 text-rose-600 border border-rose-200'\s*:\s*'bg-emerald-50 text-emerald-600 border border-emerald-200'/g, "'bg-indigo-50 text-indigo-600 border border-indigo-200'");
content = content.replace(/isPdf\s*\?\s*'bg-rose-50 text-rose-600 border-rose-200'\s*:\s*'bg-emerald-50 text-emerald-600 border-emerald-200'/g, "'bg-indigo-50 text-indigo-600 border-indigo-200'");
content = content.replace(/isPdf\s*\?\s*'bg-slate-900 hover:bg-rose-600'\s*:\s*'bg-slate-900 hover:bg-emerald-600'/g, "'bg-slate-900 hover:bg-indigo-600'");
content = content.replace(/\{file\.type\.toUpperCase\(\)\}/g, '"DOC"');

fs.writeFileSync('src/components/BrowseView.tsx', content);

content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
content = content.replace(/isPdf\s*\?\s*'bg-rose-50 text-rose-600 border border-rose-200'\s*:\s*'bg-emerald-50 text-emerald-600 border border-emerald-200'/g, "'bg-indigo-50 text-indigo-600 border border-indigo-200'");
content = content.replace(/isPdf\s*\?\s*'bg-rose-50 text-rose-600 border-rose-200'\s*:\s*'bg-emerald-50 text-emerald-600 border-emerald-200'/g, "'bg-indigo-50 text-indigo-600 border-indigo-200'");
fs.writeFileSync('src/components/AdminDashboard.tsx', content);

