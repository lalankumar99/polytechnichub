const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const userRoutes = `
// Premium Users Endpoints
app.post('/api/premium-users/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const existing = await storage.getPremiumUserByEmailOrMobile(email);
    const existing2 = await storage.getPremiumUserByEmailOrMobile(mobile);
    if (existing || existing2) {
      return res.status(400).json({ success: false, error: 'Email or Mobile already registered' });
    }
    const user = await storage.createPremiumUser({ name, email, mobile, password });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/premium-users/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'ID and Password are required' });
    }
    const user = await storage.getPremiumUserByEmailOrMobile(identifier);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid ID or Password' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid ID or Password' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({ success: false, error: 'Account pending approval from admin' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, error: 'Account access has been revoked' });
    }
    // We omit real JWT for simplicity, returning user object is enough for frontend persistence here
    res.json({ success: true, user: { id: user.id, internalId: user.internalId, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/premium-users', adminAuthMiddleware, async (req, res) => {
  try {
    const users = await storage.getPremiumUsers();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/premium-users/:internalId', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, id } = req.body;
    await storage.updatePremiumUser(req.params.internalId, { status, id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/premium-users/:internalId', adminAuthMiddleware, async (req, res) => {
  try {
    await storage.deletePremiumUser(req.params.internalId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!content.includes('/api/premium-users/register')) {
  content = content.replace(
    "// ----------------------------------------------------\n// Premium API",
    userRoutes + "\n\n// ----------------------------------------------------\n// Premium API"
  );
  fs.writeFileSync('server.ts', content);
}
