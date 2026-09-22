const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// I will insert `}` before `  // Premium Courses`
content = content.replace("  // Premium Courses", "  }\n\n  // Premium Courses");

fs.writeFileSync('server/storage.ts', content);
