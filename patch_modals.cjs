const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// New Folder Modal
content = content.replace(
  '<label className="text-xs font-bold text-slate-700 block mb-1">Status</label>',
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={newFolderIsPremium} onChange={e => setNewFolderIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>`
);

// Upload File Modal
content = content.replace(
  '<label className="text-xs font-bold text-slate-700 block mb-1 mt-4">Description (Optional)</label>',
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={uploadIsPremium} onChange={e => setUploadIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>
                <label className="text-xs font-bold text-slate-700 block mb-1 mt-4">Description (Optional)</label>`
);

// Create HTML Note Modal
content = content.replace(
  '<label className="text-xs font-bold text-slate-700 block mb-1">HTML Content *</label>',
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={htmlNoteIsPremium} onChange={e => setHtmlNoteIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>
                <label className="text-xs font-bold text-slate-700 block mb-1">HTML Content *</label>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
