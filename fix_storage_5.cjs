const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// I'll replace `  // Premium Courses` with `  }\n\n  // Premium Courses`
// But I might have already added one `}`? No, in fix_storage_4 I added `}`. Wait! I replaced `"  // Premium Courses"` with `"  }\n\n  // Premium Courses"` but maybe it matched the wrong one, or the formatting was weird! Let's do it manually.

content = content.replace("    }\n  // Premium Courses", "    }\n  }\n\n  // Premium Courses");

fs.writeFileSync('server/storage.ts', content);
