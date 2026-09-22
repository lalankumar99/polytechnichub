const fs = require('fs');
let content = fs.readFileSync('src/components/BrowseView.tsx', 'utf-8');

// folder names
content = content.replace(
  '<h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">\n                        {folder.name}\n                      </h3>',
  '<h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">\n                        {folder.name} {folder.isPremium && <span className="ml-1 inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Premium</span>}\n                      </h3>'
);
content = content.replace(
  '<span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 truncate block">\n                        {folder.name}\n                      </span>',
  '<span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 truncate flex items-center gap-2">\n                        {folder.name} {folder.isPremium && <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Premium</span>}\n                      </span>'
);

// file names
content = content.replace(
  '<h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">\n                        {file.name}\n                      </h3>',
  '<h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">\n                        {file.name} {file.isPremium && <span className="ml-1 inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Premium</span>}\n                      </h3>'
);
content = content.replace(
  '<span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 truncate block">\n                        {file.name}\n                      </span>',
  '<span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 truncate flex items-center gap-2">\n                        {file.name} {file.isPremium && <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Premium</span>}\n                      </span>'
);

fs.writeFileSync('src/components/BrowseView.tsx', content);
