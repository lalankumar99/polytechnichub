const fs = require('fs');

// Patch vite.config.ts
let viteConfig = fs.readFileSync('vite.config.ts', 'utf-8');

viteConfig = viteConfig.replace("includeAssets: ['icon.svg', 'icon-192.png']", "includeAssets: ['icon-192.png', 'icon-512.png']");

const oldIcons = `icons: [
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]`;

const newIcons = `icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]`;

viteConfig = viteConfig.replace(oldIcons, newIcons);
fs.writeFileSync('vite.config.ts', viteConfig);

// Patch index.html
let indexHtml = fs.readFileSync('index.html', 'utf-8');
indexHtml = indexHtml.replace('<link rel="icon" href="/icon.svg" type="image/svg+xml">', '<link rel="icon" href="/icon-192.png" type="image/png">');
fs.writeFileSync('index.html', indexHtml);

