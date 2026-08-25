const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// I'll replace `// Premium Courses` with `  }\n\n  // Premium Courses` but make sure I don't add too many `}`. 
// Right now there is only ONE `}` for the catch block, but NO `}` for the method `updateStudiverseVideos`!
// And NO `}` for `fix_storage_4`'s change either because `fix_storage_4` matched exactly `"  // Premium Courses"`, and here it might have `"  // Premium Courses"` but my replace didn't work.

content = content.replace("    }\n  // Premium Courses", "    }\n  }\n\n  // Premium Courses");
// Wait, if it failed, I will use regex:
content = content.replace(/}\n\s*\/\/ Premium Courses/, "}\n  }\n\n  // Premium Courses");

fs.writeFileSync('server/storage.ts', content);
