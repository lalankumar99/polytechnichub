const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf-8');

const swRegex = /if \('serviceWorker' in navigator\) \{[\s\S]*?\}\)/;
content = content.replace(swRegex, '');

fs.writeFileSync('src/main.tsx', content);
