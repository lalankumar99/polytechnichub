const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Add `renameUrlValue`
content = content.replace("const [renameValue, setRenameValue] = useState('');", "const [renameValue, setRenameValue] = useState('');\n  const [renameUrlValue, setRenameUrlValue] = useState('');");

// Update onClick
content = content.replace("setRenameItem(item);\n                              setRenameValue(item.name);", "setRenameItem(item);\n                              setRenameValue(item.name);\n                              setRenameUrlValue(item.fileUrl || '');");

// Update handleRenameSubmit
content = content.replace("await api.updateItem(renameItem.id, { name: finalName });", 
  "await api.updateItem(renameItem.id, { name: finalName, ...(renameItem.type === 'youtube' ? { fileUrl: renameUrlValue.trim() } : {}) });");

// Update the modal UI
const renameModalUI = `
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">New Name</label>
                <input 
                  type="text" 
                  value={renameValue} 
                  onChange={e => setRenameValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              {renameItem?.type === 'youtube' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">YouTube URL</label>
                  <input 
                    type="url" 
                    value={renameUrlValue} 
                    onChange={e => setRenameUrlValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    required
                  />
                </div>
              )}
`;
content = content.replace(/<form onSubmit=\{handleRenameSubmit\} className="space-y-4">[\s\S]*?<input [\s\S]*?autoFocus\s*\/>\s*<\/div>/, renameModalUI);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
