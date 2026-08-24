const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

// Fix duplicate ExternalLink
const occurrences = (content.match(/ExternalLink/g) || []).length;
if (occurrences > 1) {
  content = content.replace(/,\s*ExternalLink/g, "");
  content = content.replace(/ExternalLink\s*,/g, "");
  content = content.replace("import {", "import { ExternalLink,");
}

fs.writeFileSync('src/components/StudyViewer.tsx', content);
