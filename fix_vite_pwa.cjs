const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf-8');

// Find VitePWA({ and add maximumFileSizeToCacheInBytes
if (content.includes('VitePWA({')) {
  content = content.replace("registerType: 'autoUpdate',", "registerType: 'autoUpdate',\n      workbox: {\n        maximumFileSizeToCacheInBytes: 5000000\n      },");
  fs.writeFileSync('vite.config.ts', content);
}
