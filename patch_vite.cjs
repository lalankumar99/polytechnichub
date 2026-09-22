const fs = require('fs');

let config = fs.readFileSync('vite.config.ts', 'utf-8');

// Remove import
config = config.replace(/import \{ VitePWA \} from 'vite-plugin-pwa';\n?/, '');

// Remove plugin
config = config.replace(/VitePWA\(\{[\s\S]*?\}\),/g, '');

fs.writeFileSync('vite.config.ts', config);
console.log('Removed VitePWA from vite.config.ts');
