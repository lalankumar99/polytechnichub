const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Add Feedback type to state
content = content.replace("useState<'manager' | 'overview' | 'all-files' | 'studiverse' | 'premium'>", "useState<'manager' | 'overview' | 'all-files' | 'studiverse' | 'premium' | 'feedback'>");

// 2. Add Feedback tab button
const feedbackTabBtn = `
        <button
          onClick={() => setActiveTab('feedback')}
          className={\`pb-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'feedback' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
        >
          User Feedback
        </button>
      </div>`;
content = content.replace("</div>\n\n      {activeTab === 'premium'", feedbackTabBtn + "\n\n      {activeTab === 'premium'");

// 3. Import FeedbackSubmission 
if (content.includes("PremiumAccessRequest")) {
  content = content.replace("PremiumAccessRequest", "PremiumAccessRequest, FeedbackSubmission");
}

// 4. Create a state for feedback data
const feedbackState = `
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedbacks();
    }
  }, [activeTab]);

  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const data = await api.getFeedback();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };
`;
// Insert before `const handleLogout`
content = content.replace("const handleLogout =", feedbackState + "\n  const handleLogout =");

// 5. Add Feedback Tab Content
const feedbackTabContent = `
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">User Feedback & Suggestions</h2>
              <p className="text-slate-500 text-sm mt-1">Review feedback submitted via the About page.</p>
            </div>
            <button 
              onClick={loadFeedbacks}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="p-6">
            {loadingFeedbacks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No feedback submissions found.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((item) => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                          <span>📧 {item.email}</span>
                          <span>📱 {item.mobile}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-3 text-slate-700 bg-white p-3 rounded border border-slate-100 text-sm">
                      {item.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
`;

content = content.replace("{activeTab === 'manager' && (", feedbackTabContent + "\n      {activeTab === 'manager' && (");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
