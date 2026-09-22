const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf-8');

if (!content.includes('VitePWA')) {
  content = content.replace("import {defineConfig} from 'vite';", "import {defineConfig} from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';");
  const pwaConfig = `
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'POLYTECHNIC HUB',
        short_name: 'PolyHub',
        description: 'Digital Study Library and Notes',
        theme_color: '#020617',
        background_color: '#020617',
        icons: [
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
    }),
  `;
  content = content.replace("plugins: [react(), tailwindcss()],", "plugins: [react(), tailwindcss()," + pwaConfig + "],");
  fs.writeFileSync('vite.config.ts', content);
}
