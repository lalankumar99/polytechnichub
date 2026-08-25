import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { storage, UPLOADS_PATH } from './server/storage';
import { ensureSamplePdfExists, generateValidNotePdf } from './server/samplePdf';

// Ensure sample PDF is available
ensureSamplePdfExists(UPLOADS_PATH);

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer storage setup for uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.html' || ext === '.htm') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf and .html files are supported'));
    }
  }
});

// Admin server-side credentials
const ADMIN_ID = process.env.ADMIN_ID || 'polytechnichub.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@Hub929678997353';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'polytechnic-hub-sec-auth-929678997353-tok';

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
  next();
}

// ----------------------------------------------------
// PUBLIC API ENDPOINTS (For Students)
// ----------------------------------------------------

// 1. Get published library tree
app.get('/api/public/tree', async (req, res) => {
  try {
    const items = await storage.getPublishedItems();
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get single public item details + increment views
app.get('/api/public/item/:id', async (req, res) => {
  try {
    const item = await storage.getItemById(req.params.id);
    if (!item || item.status !== 'published') {
      return res.status(404).json({ success: false, error: 'Study material not found or unpublished' });
    }
    await storage.incrementViews(req.params.id);
    const breadcrumbs = await storage.getBreadcrumbs(item.id);
    res.json({ success: true, item, breadcrumbs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Public library stats
app.get('/api/public/stats', async (req, res) => {
  try {
    const stats = await storage.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Download / stream file content
app.get('/api/files/:id', async (req, res) => {
  try {
    const item = await storage.getItemById(req.params.id);
    if (!item) {
      return res.status(404).send('File not found');
    }

    await storage.incrementDownloads(item.id);

    // If file is stored on disk
    if (item.fileUrl && item.fileUrl.startsWith('/uploads/')) {
      const diskFilename = path.basename(item.fileUrl);
      const filePath = path.join(UPLOADS_PATH, diskFilename);
      if (fs.existsSync(filePath)) {
        if (item.type === 'pdf') {
          res.setHeader('Content-Type', 'application/pdf');
        } else {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.name)}"`);
        return res.sendFile(filePath);
      }
    }

    // If content is embedded HTML
    if (item.type === 'html' && item.content) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(item.content);
    }

    // Dynamic generation for seeded PDF item if no disk file uploaded
    if (item.type === 'pdf') {
      const pdfBuffer = generateValidNotePdf(
        item.name,
        `Branch: ${item.branch || 'Polytechnic Engineering'} | Subject: ${item.subject || item.name} | Semester: ${item.semester || 'Academic Year'}`,
        [
          item.description || 'Verified syllabus-aligned study notes published on POLYTECHNIC HUB.',
          'Format: Certified Digital PDF Study Material',
          'Document ID: ' + item.id,
          'Branch/Discipline: ' + (item.branch || 'General Engineering'),
          'Subject: ' + (item.subject || item.name),
          'Unit/Module: ' + (item.unit || 'Standard Curriculum'),
          'Verified by: POLYTECHNIC HUB Editorial & Faculty Panel'
        ]
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.name)}"`);
      return res.send(pdfBuffer);
    }

    res.status(404).send('File content not available');
  } catch (err: any) {
    res.status(500).send('Error serving file: ' + err.message);
  }
});

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, adminId, username, password } = req.body;
  const inputId = (adminId || email || username || '').trim().toLowerCase();

  if (!inputId || !password) {
    return res.status(400).json({ success: false, error: 'Admin ID and password are required' });
  }

  // Validate credentials securely server-side
  if (inputId === ADMIN_ID.toLowerCase() && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      user: {
        id: 'admin-primary',
        name: 'Polytechnic Hub Admin',
        adminId: ADMIN_ID,
        role: 'admin',
        token: ADMIN_TOKEN
      }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid admin credentials. Access denied.' });
});

app.get('/api/auth/verify', adminAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'admin-primary',
      name: 'Polytechnic Hub Admin',
      adminId: ADMIN_ID,
      role: 'admin'
    }
  });
});

// ----------------------------------------------------
// ADMIN PROTECTED API ENDPOINTS
// ----------------------------------------------------

// 1. Get all items (published, draft, unpublished)
app.get('/api/admin/tree', adminAuthMiddleware, async (req, res) => {
  try {
    const items = await storage.getAllAdminItems();
    const stats = await storage.getStats();
    res.json({ success: true, items, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create new folder (supports unlimited nesting)
app.post('/api/admin/folders', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, parentId, status, description, branch, semester, isPremium, accessType } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }

    const folder = await storage.createFolder({
      name: name.trim(),
      parentId: parentId || null,
      status: status || 'published',
      description,
      branch,
      semester,
      isPremium,
      accessType
    });

    res.json({ success: true, folder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create File Record (bypassing local disk multer)
app.post('/api/admin/create-file-record', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, type, parentId, status, size, fileUrl, description, branch, semester, isPremium } = req.body;
    
    if (!name || !type || !fileUrl) {
      return res.status(400).json({ success: false, error: 'Name, type, and fileUrl are required' });
    }

    const fileItem = await storage.createFile({
      name: name.trim(),
      type,
      parentId: parentId || null,
      status: status || 'published',
      size: size || 0,
      fileUrl,
      description,
      branch,
      semester,
      isPremium
    });
    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Upload file (PDF or HTML)
app.post('/api/admin/upload', adminAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { parentId, status, description, isPremium, accessType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const type = ext === '.pdf' ? 'pdf' : 'html';
    const originalName = req.file.originalname;

    let content: string | undefined = undefined;
    if (type === 'html') {
      try {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } catch (e) {
        console.error('Could not read HTML content:', e);
      }
    }

    const fileItem = await storage.createFile({
      name: originalName,
      type,
      parentId: parentId || null,
      status: status === 'draft' ? 'draft' : 'published',
      size: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      content,
      description,
      isPremium: isPremium === "true" || isPremium === true,
      accessType
    });

    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create HTML Note directly from text/markdown/HTML editor
app.post('/api/admin/create-html-note', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, parentId, status, content, description, branch, semester, isPremium, accessType } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, error: 'Name and content are required' });
    }

    const formattedName = name.toLowerCase().endsWith('.html') ? name : `${name}.html`;
    const size = Buffer.byteLength(content, 'utf-8');

    const fileItem = await storage.createFile({
      name: formattedName,
      type: 'html',
      parentId: parentId || null,
      status: status || 'published',
      size,
      content,
      description,
      branch,
      semester,
      isPremium,
      accessType
    });

    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update item (rename, publish/unpublish/draft, move to folder)
app.put('/api/admin/items/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, status, parentId, description, isPremium } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name.trim();
    if (status !== undefined) updates.status = status;
    if (parentId !== undefined) updates.parentId = parentId === '' ? null : parentId;
    if (description !== undefined) updates.description = description;
    if (isPremium !== undefined) updates.isPremium = isPremium;

    const updated = await storage.updateItem(req.params.id, updates);
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Delete item (file or folder with all descendants)
app.delete('/api/admin/items/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await storage.deleteItem(req.params.id);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Reset to demo curriculum

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


// Serve static uploads
app.use('/uploads', express.static(UPLOADS_PATH));

// ----------------------------------------------------
// VITE INTEGRATION & SERVER START
// ----------------------------------------------------



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

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`POLYTECHNIC APP server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
