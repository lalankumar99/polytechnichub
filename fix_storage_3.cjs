const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

const regex = /}\s*}\s*const UPLOADS_DIR = path\.join\(process\.cwd\(\), 'uploads'\);\s*if \(\!fs\.existsSync\(UPLOADS_DIR\)\) {\s*fs\.mkdirSync\(UPLOADS_DIR, { recursive: true }\);\s*}\s*export const UPLOADS_PATH = UPLOADS_DIR;\s*/;

const match = content.match(regex);
if (match) {
    let uploadsCode = `
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
export const UPLOADS_PATH = UPLOADS_DIR;
`;
    // We only want to remove one `}` which belongs to the class, not the method.
    // Actually `match[0]` contains two `}`.
    // The first one is the end of the method. The second one is the end of the class.
    
    let newContent = content.replace(match[0], "\n  }\n"); // keeps the method's closing brace
    newContent += `\n}\n${uploadsCode}`;
    
    fs.writeFileSync('server/storage.ts', newContent);
    console.log("Storage fixed");
} else {
    console.log("Regex didn't match");
}
