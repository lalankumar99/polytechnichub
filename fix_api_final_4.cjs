const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

content = content.replace(
  /}\n\s*\/\/ Public APIs\n\s*async/g,
  '},\n  // Public APIs\n  async'
);

fs.writeFileSync('src/services/api.ts', content);
