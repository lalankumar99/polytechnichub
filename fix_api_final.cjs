const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

// Replace all instances of }\n  async with },\n  async
content = content.replace(/\}\s*async/g, '},\n  async');
content = content.replace(/},\s*},\s*async/g, '},\n  async');

fs.writeFileSync('src/services/api.ts', content);
console.log("Fixed missing commas in api.ts");
