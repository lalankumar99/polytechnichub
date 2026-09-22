const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const premiumRoutes = `
// ----------------------------------------------------
// Premium API
// ----------------------------------------------------
app.get('/api/premium/courses', async (req, res) => {
  try {
    const courses = await storage.getPremiumCourses();
    res.json({ success: true, courses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/premium/courses/:id', async (req, res) => {
  try {
    const course = await storage.getPremiumCourse(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    res.json({ success: true, course });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/premium/items/:courseId', async (req, res) => {
  try {
    const items = await storage.getPremiumItems(req.params.courseId);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/premium/requests', adminAuthMiddleware, async (req, res) => {
  try {
    const requests = await storage.getPremiumRequests();
    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/premium/requests/user/:userId', async (req, res) => {
  try {
    const requests = await storage.getUserPremiumRequests(req.params.userId);
    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/premium/courses', adminAuthMiddleware, async (req, res) => {
  try {
    const course = await storage.createPremiumCourse(req.body);
    res.json({ success: true, course });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/premium/courses/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.updatePremiumCourse(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/premium/courses/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.deletePremiumCourse(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/premium/items', adminAuthMiddleware, async (req, res) => {
  try {
    const item = await storage.createPremiumItem(req.body);
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/premium/items/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.updatePremiumItem(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/premium/items/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.deletePremiumItem(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/premium/requests', async (req, res) => {
  try {
    const request = await storage.createPremiumRequest(req.body);
    res.json({ success: true, request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/premium/requests/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.updatePremiumRequest(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!content.includes('/api/premium/courses')) {
    content = content.replace(
        "async function startServer() {",
        premiumRoutes + "\nasync function startServer() {"
    );
    fs.writeFileSync('server.ts', content);
}
