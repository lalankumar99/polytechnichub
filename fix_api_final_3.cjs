const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

content = content.replace(
  /}\n\s*\/\/ Premium Items\n\s*async/g,
  '},\n  // Premium Items\n  async'
);

content = content.replace(
  /}\n\s*\/\/ Auth\n\s*async/g,
  '},\n  // Auth\n  async'
);

content = content.replace(
  /}\n\s*\/\/ Premium Requests\n\s*async/g,
  '},\n  // Premium Requests\n  async'
);

fs.writeFileSync('src/services/api.ts', content);
console.log("Fixed missing commas with comments in api.ts");
