const fs = require('fs');
let content = fs.readFileSync('src/components/BrowseView.tsx', 'utf-8');

// Fix duplicate ExternalLink
const occurrences = (content.match(/ExternalLink/g) || []).length;
if (occurrences > 1) {
  content = content.replace(",\n  ExternalLink,", ","); // assuming it was added correctly the first time or we just remove one
  content = content.replace("  ExternalLink,\n", "");
  // Actually, better to just remove all and add one cleanly
  content = content.replace(/,\s*ExternalLink/g, "");
  content = content.replace(/ExternalLink\s*,/g, "");
  content = content.replace("import {", "import { ExternalLink,");
}

fs.writeFileSync('src/components/BrowseView.tsx', content);
