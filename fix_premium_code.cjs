const fs = require('fs');
let content = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');
if (!content.includes('Code } from')) {
    content = content.replace("Youtube, Link2 } from", "Youtube, Link2, Code } from");
    fs.writeFileSync('src/components/PremiumCourseView.tsx', content);
}
