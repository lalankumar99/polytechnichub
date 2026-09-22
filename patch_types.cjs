const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace("export type ItemType = 'folder' | 'pdf' | 'html' | 'youtube';", "export type ItemType = 'folder' | 'pdf' | 'html' | 'youtube' | 'link';");
content = content.replace("totalYoutubeVideos: number;", "totalYoutubeVideos: number;\n  totalLinks: number;");
fs.writeFileSync('src/types.ts', content);
