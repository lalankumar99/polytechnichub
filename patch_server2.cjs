const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'const { parentId, status, description, isPremium } = req.body;',
  'const { parentId, status, description, isPremium, accessType } = req.body;'
);
content = content.replace(
  'const fileItem = await storage.createFile({ name: req.body.customName || originalName, type, fileUrl: `/api/files/${req.file.filename}`, content, parentId, status, description, isPremium: isPremium === "true" });',
  'const fileItem = await storage.createFile({ name: req.body.customName || originalName, type, fileUrl: `/api/files/${req.file.filename}`, content, parentId, status, description, isPremium: isPremium === "true", accessType });'
);

fs.writeFileSync('server.ts', content);
