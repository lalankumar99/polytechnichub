const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'const { name, parentId, status, description, branch, semester, isPremium } = req.body;',
  'const { name, parentId, status, description, branch, semester, isPremium, accessType } = req.body;'
);
content = content.replace(
  'const folder = await storage.createFolder({ name, parentId, status, description, branch, semester, isPremium });',
  'const folder = await storage.createFolder({ name, parentId, status, description, branch, semester, isPremium, accessType });'
);

content = content.replace(
  'const { name, htmlContent, parentId, status, description, branch, semester, isPremium } = req.body;',
  'const { name, htmlContent, parentId, status, description, branch, semester, isPremium, accessType } = req.body;'
);
content = content.replace(
  'const file = await storage.createFile({ name, type: "html", content: htmlContent, parentId, status, description, branch, semester, isPremium });',
  'const file = await storage.createFile({ name, type: "html", content: htmlContent, parentId, status, description, branch, semester, isPremium, accessType });'
);

// upload logic might use multer body, let's find it.
fs.writeFileSync('server.ts', content);
