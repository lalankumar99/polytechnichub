const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldInput = `                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">`;

const newInput = `                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(renameItem?.type === 'youtube' || renameItem?.type === 'link') && (
                <div>
                  <label className="text-xs text-slate-600 block mb-1">URL</label>
                  <input
                    type="url"
                    value={renameUrlValue}
                    onChange={(e) => setRenameUrlValue(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex items-center justify-end space-x-2">`;

content = content.replace(oldInput, newInput);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
