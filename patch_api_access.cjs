const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

content = content.replace(
  "async createFolder(name: string, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string, isPremium?: boolean)",
  "async createFolder(name: string, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string, isPremium?: boolean, accessType: 'free' | 'premium' | 'both' = 'both')"
);

content = content.replace(
  "body: JSON.stringify({ name, parentId, status, description, branch, semester, isPremium })",
  "body: JSON.stringify({ name, parentId, status, description, branch, semester, isPremium, accessType })"
);

content = content.replace(
  "async uploadFile(file: File, folderId: string, customName?: string, description?: string, branch?: string, semester?: string, isPremium?: boolean)",
  "async uploadFile(file: File, folderId: string, customName?: string, description?: string, branch?: string, semester?: string, isPremium?: boolean, accessType: 'free' | 'premium' | 'both' = 'both')"
);

content = content.replace(
  "formData.append('isPremium', isPremium ? 'true' : 'false');",
  "formData.append('isPremium', isPremium ? 'true' : 'false');\n    if (accessType) formData.append('accessType', accessType);"
);

content = content.replace(
  "async createFileRecord(data: any)",
  "async createFileRecord(data: any)" // no change needed here, data is passthrough
);

content = content.replace(
  "async createHtmlNote(name: string, htmlContent: string, folderId: string, description?: string, branch?: string, semester?: string, isPremium?: boolean)",
  "async createHtmlNote(name: string, htmlContent: string, folderId: string, description?: string, branch?: string, semester?: string, isPremium?: boolean, accessType: 'free' | 'premium' | 'both' = 'both')"
);

content = content.replace(
  "body: JSON.stringify({ name, htmlContent, parentId: folderId, description, branch, semester, isPremium })",
  "body: JSON.stringify({ name, htmlContent, parentId: folderId, description, branch, semester, isPremium, accessType })"
);

fs.writeFileSync('src/services/api.ts', content);
