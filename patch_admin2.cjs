const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const linkModal = `
      {/* ========================================================================= */}
      {/* ADD LINK MODAL */}
      {/* ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add External Link</h3>
              </div>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Link Title</label>
                <input 
                  type="text" 
                  value={linkName} 
                  onChange={e => setLinkName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                  placeholder="e.g. Reference Documentation"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL</label>
                <input 
                  type="url" 
                  value={linkUrl} 
                  onChange={e => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Description (Optional)</span>
                </label>
                <textarea 
                  value={linkDesc} 
                  onChange={e => setLinkDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none resize-none h-20"
                  placeholder="What is this link about?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Visibility Status</label>
                <select
                  value={linkStatus}
                  onChange={(e: any) => setLinkStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                >
                  <option value="published">Published (Visible to students)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace("{showYoutubeModal && (", linkModal + "\n      {showYoutubeModal && (");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
