const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const feedbackState = `
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
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

content = content.replace("const [newVideoDesc, setNewVideoDesc] = useState('');", "const [newVideoDesc, setNewVideoDesc] = useState('');\n" + feedbackState);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
