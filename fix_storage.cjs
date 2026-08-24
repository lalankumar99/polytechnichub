const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');
content = content.replace("const youtubeVideos = items.filter(i => i.type === 'youtube');", 
  "const youtubeVideos = items.filter(i => i.type === 'youtube');\n    const links = items.filter(i => i.type === 'link');");
content = content.replace("totalYoutubeVideos: youtubeVideos.length,", 
  "totalYoutubeVideos: youtubeVideos.length,\n      totalLinks: links.length,");
fs.writeFileSync('server/storage.ts', content);
