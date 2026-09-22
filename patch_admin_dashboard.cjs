const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// States
content = content.replace(
  'const [newFolderIsPremium, setNewFolderIsPremium] = useState(false);',
  'const [newFolderAccessType, setNewFolderAccessType] = useState<"free"|"premium"|"both">("both");\n  const [newFolderIsPremium, setNewFolderIsPremium] = useState(false);'
);
content = content.replace(
  'const [uploadIsPremium, setUploadIsPremium] = useState(false);',
  'const [uploadAccessType, setUploadAccessType] = useState<"free"|"premium"|"both">("both");\n  const [uploadIsPremium, setUploadIsPremium] = useState(false);'
);
content = content.replace(
  'const [htmlNoteIsPremium, setHtmlNoteIsPremium] = useState(false);',
  'const [htmlNoteAccessType, setHtmlNoteAccessType] = useState<"free"|"premium"|"both">("both");\n  const [htmlNoteIsPremium, setHtmlNoteIsPremium] = useState(false);'
);

// Form submission
content = content.replace(
  'await api.createFolder(newFolderName.trim(), currentFolderId, newFolderStatus, newFolderDesc, newFolderBranch, newFolderSemester, newFolderIsPremium);',
  'await api.createFolder(newFolderName.trim(), currentFolderId, newFolderStatus, newFolderDesc, newFolderBranch, newFolderSemester, newFolderAccessType === "premium", newFolderAccessType);'
);
content = content.replace(
  'setNewFolderIsPremium(false);',
  'setNewFolderIsPremium(false);\n      setNewFolderAccessType("both");'
);

content = content.replace(
  'await api.uploadFile(uploadFileObj, currentFolderId, undefined, uploadDesc, undefined, undefined, uploadIsPremium);',
  'await api.uploadFile(uploadFileObj, currentFolderId, undefined, uploadDesc, undefined, undefined, uploadAccessType === "premium", uploadAccessType);'
);
content = content.replace(
  'setUploadIsPremium(false);',
  'setUploadIsPremium(false);\n      setUploadAccessType("both");'
);

content = content.replace(
  'await api.createHtmlNote(htmlNoteName.trim(), htmlNoteContent, currentFolderId, htmlNoteDesc, undefined, undefined, htmlNoteIsPremium);',
  'await api.createHtmlNote(htmlNoteName.trim(), htmlNoteContent, currentFolderId, htmlNoteDesc, undefined, undefined, htmlNoteAccessType === "premium", htmlNoteAccessType);'
);
content = content.replace(
  'setHtmlNoteIsPremium(false);',
  'setHtmlNoteIsPremium(false);\n      setHtmlNoteAccessType("both");'
);

// JSX Modal Replacements - find the checkbox code and replace it with select
content = content.replace(
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={newFolderIsPremium} onChange={e => setNewFolderIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>`,
  `<div className="mt-4 mb-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select value={newFolderAccessType} onChange={e => setNewFolderAccessType(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white text-sm">
                    <option value="both">Both (Free & Premium Users)</option>
                    <option value="free">Free Users Only</option>
                    <option value="premium">Premium Users Only (Requires Registration)</option>
                  </select>
                </div>`
);

content = content.replace(
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={uploadIsPremium} onChange={e => setUploadIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>`,
  `<div className="mt-4 mb-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select value={uploadAccessType} onChange={e => setUploadAccessType(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white text-sm">
                    <option value="both">Both (Free & Premium Users)</option>
                    <option value="free">Free Users Only</option>
                    <option value="premium">Premium Users Only (Requires Registration)</option>
                  </select>
                </div>`
);

content = content.replace(
  `<label className="flex items-center space-x-2 mt-4 mb-2 cursor-pointer">
                  <input type="checkbox" checked={htmlNoteIsPremium} onChange={e => setHtmlNoteIsPremium(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Premium Content (Requires Registration)</span>
                </label>`,
  `<div className="mt-4 mb-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select value={htmlNoteAccessType} onChange={e => setHtmlNoteAccessType(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white text-sm">
                    <option value="both">Both (Free & Premium Users)</option>
                    <option value="free">Free Users Only</option>
                    <option value="premium">Premium Users Only (Requires Registration)</option>
                  </select>
                </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
