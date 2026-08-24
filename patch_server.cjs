const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace("totalYoutubeVideos: items.filter(i => i.type === 'youtube').length,", "totalYoutubeVideos: items.filter(i => i.type === 'youtube').length,\n      totalLinks: items.filter(i => i.type === 'link').length,");
fs.writeFileSync('server.ts', content);
