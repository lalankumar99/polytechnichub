const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// just remove export const storage from inside
content = content.replace("export const storage = new LibraryStorage();", "");

// find the last } before UPLOADS_DIR and insert it AFTER
content = content.replace("}\n\const UPLOADS_DIR", "}\n\nexport const storage = new LibraryStorage();\n\nconst UPLOADS_DIR");
// Actually, I'll just append it to the file, and remove the extra ones.
content = content.replace(/\s*export const storage = new LibraryStorage\(\);\s*/g, "\n\n");
content = content + "\nexport const storage = new LibraryStorage();\n";

fs.writeFileSync('server/storage.ts', content);
