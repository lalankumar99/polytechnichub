const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const feedbackRoutes = `
// Feedback API
app.get('/api/feedback', adminAuthMiddleware, async (req, res) => {
  try {
    const feedback = await storage.getFeedback();
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, mobile, suggestion } = req.body;
    if (!name || !email || !mobile || !suggestion) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newFeedback = await storage.createFeedback({ name, email, mobile, suggestion });
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});
`;

if (!content.includes('/api/feedback')) {
  // Insert before standard `app.get('/api/admin/*')`
  content = content.replace("app.post('/api/admin/reset-demo'", feedbackRoutes + "\n\napp.post('/api/admin/reset-demo'");
  fs.writeFileSync('server.ts', content);
}
