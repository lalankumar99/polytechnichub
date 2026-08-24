const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
content = content.replace("totalVideos: data.stats.totalYoutubeVideos", "totalVideos: data.stats.totalYoutubeVideos,\n        totalLinks: data.stats.totalLinks");
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
