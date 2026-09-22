const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const premiumCoursesAPI = `
// Premium Courses
app.get('/api/premium-courses', async (req, res) => {
  try {
    const courses = await storage.getPremiumCourses();
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/premium-courses', adminAuthMiddleware, async (req, res) => {
  try {
    const course = await storage.createPremiumCourse(req.body);
    res.status(201).json(course);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/premium-courses/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.updatePremiumCourse(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/premium-courses/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.deletePremiumCourse(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
`;

if (!code.includes('/api/premium-courses')) {
  code = code.replace('// Premium Users Endpoints', premiumCoursesAPI + '\n// Premium Users Endpoints');
  fs.writeFileSync('server.ts', code);
}
