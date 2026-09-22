const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Add "studiverse" to activeTab
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'manager' | 'overview' | 'all-files'>('manager');",
  "const [activeTab, setActiveTab] = useState<'manager' | 'overview' | 'all-files' | 'studiverse'>('manager');\n  const [liveEmbed, setLiveEmbed] = useState<string>('');\n  const [videos, setVideos] = useState<any[]>([]);\n  const [studiverseLoading, setStudiverseLoading] = useState(false);\n  const [newVideoTitle, setNewVideoTitle] = useState('');\n  const [newVideoUrl, setNewVideoUrl] = useState('');\n  const [newVideoDesc, setNewVideoDesc] = useState('');\n\n  const loadStudiverse = async () => {\n    try {\n      const data = await api.getStudiverseData();\n      setLiveEmbed(data.liveEmbed || '');\n      setVideos(data.videos || []);\n    } catch (err) {\n      console.error(err);\n    }\n  };\n  useEffect(() => { loadStudiverse(); }, []);\n"
);

// 2. Add Tab Button
const tabButtons = `
          {/* Navigation Tabs */}
          <div className="flex space-x-1 p-1 bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('manager')}
              className={\`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all \${
                activeTab === 'manager'
                  ? 'bg-cyan-500 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }\`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Drive Manager</span>
            </button>
`;

const newTabButtons = `
          {/* Navigation Tabs */}
          <div className="flex space-x-1 p-1 bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('manager')}
              className={\`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all \${
                activeTab === 'manager'
                  ? 'bg-cyan-500 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }\`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Drive Manager</span>
            </button>
            <button
              onClick={() => setActiveTab('studiverse')}
              className={\`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all \${
                activeTab === 'studiverse'
                  ? 'bg-cyan-500 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }\`}
            >
              <MonitorPlay className="w-4 h-4" />
              <span>Studiverse</span>
            </button>
`;

content = content.replace(tabButtons, newTabButtons);

// 3. Import MonitorPlay
if (!content.includes('MonitorPlay')) {
  content = content.replace('import {', 'import {\n  MonitorPlay,\n  Youtube,\n  Trash,\n  Save,\n');
}

// 4. Add Studiverse content rendering
const renderCode = `
      {/* ----------------- TAB CONTENT ----------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        
        {activeTab === 'overview' && (
`;

const studiverseTabCode = `
      {/* ----------------- TAB CONTENT ----------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

        {activeTab === 'studiverse' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-cyan-100 rounded-xl text-cyan-600">
                  <MonitorPlay className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Live Classroom</h2>
                  <p className="text-sm text-slate-500">Update the embed code for the current live session.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Iframe Embed Code / URL</label>
                  <textarea
                    value={liveEmbed}
                    onChange={(e) => setLiveEmbed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 p-4 h-32 font-mono"
                    placeholder="<iframe src='...' ...></iframe>"
                  />
                </div>
                <button
                  onClick={async () => {
                    setStudiverseLoading(true);
                    try {
                      await api.updateStudiverseLive(liveEmbed);
                      alert('Live session updated successfully!');
                    } catch (e: any) {
                      alert('Error: ' + e.message);
                    } finally {
                      setStudiverseLoading(false);
                    }
                  }}
                  disabled={studiverseLoading}
                  className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{studiverseLoading ? 'Saving...' : 'Save Live Classroom'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Video Vault</h2>
                  <p className="text-sm text-slate-500">Add recorded YouTube videos to the vault.</p>
                </div>
              </div>

              {/* Add New Video */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 space-y-4">
                <h3 className="font-bold text-slate-800">Add New Video</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                      placeholder="Physics Chapter 1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">YouTube URL</label>
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={newVideoDesc}
                      onChange={(e) => setNewVideoDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                      placeholder="A brief summary of the lesson..."
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!newVideoTitle || !newVideoUrl) return alert('Title and URL required');
                    const newVideo = { id: Date.now().toString(), title: newVideoTitle, url: newVideoUrl, description: newVideoDesc };
                    const updated = [newVideo, ...videos];
                    setStudiverseLoading(true);
                    try {
                      await api.updateStudiverseVideos(updated);
                      setVideos(updated);
                      setNewVideoTitle(''); setNewVideoUrl(''); setNewVideoDesc('');
                    } catch (e: any) {
                      alert('Error: ' + e.message);
                    } finally {
                      setStudiverseLoading(false);
                    }
                  }}
                  disabled={studiverseLoading}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>

              {/* List Videos */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Current Videos ({videos.length})</h3>
                {videos.length === 0 ? (
                  <p className="text-slate-500 text-sm">No videos in the vault yet.</p>
                ) : (
                  videos.map((vid, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                        <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{vid.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-md">{vid.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('Remove this video?')) return;
                          const updated = videos.filter(v => v.id !== vid.id);
                          setStudiverseLoading(true);
                          try {
                            await api.updateStudiverseVideos(updated);
                            setVideos(updated);
                          } catch (e: any) {
                            alert('Error: ' + e.message);
                          } finally {
                            setStudiverseLoading(false);
                          }
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
`;

content = content.replace(renderCode, studiverseTabCode);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);

