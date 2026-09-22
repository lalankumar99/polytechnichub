const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf-8');

const pwaConfigRegex = /VitePWA\(\{[^]*?\}\)/;
const newPwaConfig = `VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png'],
      manifest: {
        name: 'POLYTECHNIC HUB',
        short_name: 'PolyHub',
        description: 'Digital Study Library and Notes',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        icons: [
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
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })`;

content = content.replace(pwaConfigRegex, newPwaConfig);
fs.writeFileSync('vite.config.ts', content);
