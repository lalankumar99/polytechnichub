const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

content = content.replace("export const storage = new LibraryStorage();\n}", "}\nexport const storage = new LibraryStorage();");
fs.writeFileSync('server/storage.ts', content);
