const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf-8');

content = content.replace("      workbox: {\n        globPatterns: ['**/*.{js,css,html,ico,png,svg}']\n      }", "      workbox: {\n        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],\n        maximumFileSizeToCacheInBytes: 5000000\n      }");

content = content.replace("      workbox: {\n        maximumFileSizeToCacheInBytes: 5000000\n      },\n", "");

fs.writeFileSync('vite.config.ts', content);
