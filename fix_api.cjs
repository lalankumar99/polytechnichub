const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');
content = content.replace("type: 'pdf' | 'html' | 'youtube'", "type: 'pdf' | 'html' | 'youtube' | 'link'");
fs.writeFileSync('src/services/api.ts', content);
