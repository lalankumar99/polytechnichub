import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { storage, UPLOADS_PATH } from './server/storage.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

    // If external link or video
    if (item.fileUrl && (item.fileUrl.startsWith('http://') || item.fileUrl.startsWith('https://'))) {
      return res.redirect(item.fileUrl);
    }

    // Retrieve file data or content (from memory or Firestore)
    const fileDataObj = await storage.getFileFullData(item.id);
    const htmlContent = fileDataObj?.content || item.content;
    const base64Data = fileDataObj?.fileData || item.fileData;

    // 1. If content is embedded HTML
    if (htmlContent) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.name)}"`);
      return res.send(htmlContent);
    }

    // 2. If fileData is stored in Firestore (base64)
    if (base64Data) {
      const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
      const buffer = Buffer.from(cleanBase64, 'base64');
      const isPdf = item.type === 'pdf' || item.name.toLowerCase().endsWith('.pdf');
      res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.name)}"`);
      return res.send(buffer);
    }

    // 3. If file is cached on disk
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

    // No default or dummy file generated!
    res.status(404).send('File content not available');
  } catch (err: any) {
    res.status(500).send('Error serving file: ' + err.message);
  }
});

// Helper to extract Google Drive file ID from URLs or raw IDs
function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];
  return null;
}

// 4b. Stream Google Drive PDF without CORS / Drive headers
app.get('/api/proxy/drive-pdf', async (req, res) => {
  try {
    const rawInput = (req.query.fileId as string) || (req.query.url as string) || '';
    const fileId = extractDriveFileId(rawInput) || rawInput;

    if (!fileId) {
      return res.status(400).json({ error: 'Missing or invalid Google Drive file ID or URL' });
    }

    const driveDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const driveResp = await fetch(driveDownloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*'
      },
      redirect: 'follow'
    });

    if (!driveResp.ok) {
      return res.status(driveResp.status).send(`Failed to fetch PDF from Google Drive (${driveResp.status})`);
    }

    const contentType = driveResp.headers.get('content-type') || 'application/pdf';

    // If Google returned a virus scan confirmation HTML page for large files:
    if (contentType.includes('text/html')) {
      const htmlText = await driveResp.text();
      const confirmMatch = htmlText.match(/confirm=([a-zA-Z0-9_-]+)/) || htmlText.match(/name="confirm"\s+value="([a-zA-Z0-9_-]+)"/);
      if (confirmMatch && confirmMatch[1]) {
        const confirmedUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
        const retryResp = await fetch(confirmedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          },
          redirect: 'follow'
        });
        if (retryResp.ok) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          const arrayBuffer = await retryResp.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        }
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const arrayBuffer = await driveResp.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Error proxying Google Drive PDF:', err);
    res.status(500).send('Proxy error: ' + err.message);
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
    const { name, type, parentId, status, size, fileUrl, description, branch, semester, isPremium, accessType, displayType, isVideo, thumbnailUrl, videoTitle } = req.body;
    
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
      isPremium,
      accessType: accessType || (isPremium ? 'premium' : 'both'),
      displayType,
      isVideo: isVideo === true || isVideo === 'true' || type === 'youtube',
      thumbnailUrl,
      videoTitle
    });
    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Upload file (PDF or HTML)
app.post('/api/admin/upload', adminAuthMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { parentId, status, description, isPremium, accessType, displayType, isVideo } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const type = ext === '.pdf' ? 'pdf' : 'html';
    const originalName = req.file.originalname;

    let content: string | undefined = undefined;
    let fileData: string | undefined = undefined;

    if (type === 'html') {
      try {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } catch (e) {
        console.error('Could not read HTML content:', e);
      }
    } else {
      try {
        const buf = fs.readFileSync(req.file.path);
        fileData = buf.toString('base64');
      } catch (e) {
        console.error('Could not read binary file data:', e);
      }
    }

    const fileItem = await storage.createFile({
      name: originalName,
      type,
      parentId: parentId || null,
      status: status === 'draft' ? 'draft' : 'published',
      size: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      fileData,
      content,
      description,
      isPremium: isPremium === "true" || isPremium === true,
      accessType,
      displayType: displayType || (type === 'html' ? 'pdf' : type),
      isVideo: isVideo === 'true' || isVideo === true
    });

    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create HTML Note directly from text/markdown/HTML editor
app.post('/api/admin/create-html-note', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, parentId, status, content, description, branch, semester, isPremium, accessType, displayType, isVideo } = req.body;
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
      accessType,
      displayType: displayType || 'pdf', // default masking as PDF for document notes
      isVideo: isVideo === true || isVideo === 'true'
    });

    res.json({ success: true, file: fileItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper API: YouTube oEmbed Standard Info Fetcher
app.get('/api/utils/youtube-oembed', async (req, res) => {
  try {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = videoUrl.match(regExp);
    const videoId = match ? match[1] : null;

    let title = '';
    let author = '';
    let thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        title = oembedData.title || '';
        author = oembedData.author_name || '';
        if (oembedData.thumbnail_url) {
          thumbnailUrl = oembedData.thumbnail_url;
        }
      }
    } catch (e) {
      // fallback
    }

    if (videoId && !thumbnailUrl) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    res.json({
      success: true,
      videoId,
      title,
      author,
      thumbnailUrl
    });
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

// Premium Users Endpoints
app.post('/api/premium-users/register', async (req, res) => {
  try {
    const { name, email, mobile, password, photoUrl } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'All fields (Name, Email, Mobile, Password) are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();
    const existing = await storage.getPremiumUserByEmailOrMobile(cleanEmail);
    const existing2 = await storage.getPremiumUserByEmailOrMobile(cleanMobile);
    if (existing || existing2) {
      return res.status(400).json({ success: false, error: 'Email or Mobile already registered' });
    }
    const user = await storage.createPremiumUser({
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      password,
      photoUrl: photoUrl || ''
    });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/premium-users/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Login ID / Email / Mobile and Password are required' });
    }
    const user = await storage.getPremiumUserByEmailOrMobile(identifier);
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this ID / Mobile / Email. Please check or register.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Approval Pending: Your registration request has been submitted to the admin. You will be able to log in once the admin approves your account.'
      });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        error: 'Account access has been declined or revoked by the admin. Please contact the administrator.'
      });
    }
    res.json({
      success: true,
      user: {
        id: user.id || user.internalId,
        internalId: user.internalId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photoUrl: user.photoUrl || '',
        status: user.status,
        assignedCourseIds: user.assignedCourseIds || []
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sync user session/status
app.get('/api/premium-users/sync/:internalId', async (req, res) => {
  try {
    const user = await storage.getPremiumUser(req.params.internalId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user.id || user.internalId,
        internalId: user.internalId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photoUrl: user.photoUrl || '',
        status: user.status,
        assignedCourseIds: user.assignedCourseIds || []
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update student profile (e.g. photo or name)
app.post('/api/premium-users/update-profile', async (req, res) => {
  try {
    const { internalId, photoUrl, name } = req.body;
    if (!internalId) {
      return res.status(400).json({ success: false, error: 'Student ID is required' });
    }
    const updates: any = {};
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (name) updates.name = name.trim();
    await storage.updatePremiumUser(internalId, updates);
    const updated = await storage.getPremiumUser(internalId);
    res.json({
      success: true,
      user: {
        id: updated.id || updated.internalId,
        internalId: updated.internalId,
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile,
        photoUrl: updated.photoUrl || '',
        status: updated.status,
        assignedCourseIds: updated.assignedCourseIds || []
      }
    });
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
    const { status, id, assignedCourseIds } = req.body;
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (id !== undefined) updates.id = id;
    if (assignedCourseIds !== undefined) updates.assignedCourseIds = assignedCourseIds;
    await storage.updatePremiumUser(req.params.internalId, updates);
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

// Studiverse APIs
app.get('/api/studiverse', async (req, res) => {
  try {
    const data = await storage.getStudiverseData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/studiverse/live', adminAuthMiddleware, async (req, res) => {
  try {
    const { liveEmbed } = req.body;
    await storage.updateStudiverseLive(liveEmbed || '');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/studiverse/videos', adminAuthMiddleware, async (req, res) => {
  try {
    const { videos } = req.body;
    await storage.updateStudiverseVideos(videos || []);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Explicit JSON 404 handler for all undefined /api/* routes to prevent returning index.html
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.method} ${req.path} not found` });
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`POLYTECHNIC APP server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
export { app };
