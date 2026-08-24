const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf-8');

// Replace `type: 'pdf' | 'html'` with `type: 'pdf' | 'html' | 'youtube'`
content = content.replace("async createFileRecord(name: string, type: 'pdf' | 'html',", "async createFileRecord(name: string, type: 'pdf' | 'html' | 'youtube',");

fs.writeFileSync('src/services/api.ts', content);
