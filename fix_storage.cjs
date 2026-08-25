const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// deduplicate accessType declarations
content = content.replace(/(\s*accessType\?: "free" \| "premium" \| "both";)+/g, '\n    accessType?: "free" | "premium" | "both";');
content = content.replace(/(\s*let accessType = data\.accessType \|\| "both";)+/g, '\n    let accessType = data.accessType || "both";');
content = content.replace(/(\s*if \(parent\.accessType\) accessType = parent\.accessType;)+/g, '\n        if (parent.accessType) accessType = parent.accessType;');

fs.writeFileSync('server/storage.ts', content);
