const fs = require('fs');

let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

// Theme toggler
content = content.replace(/\{!isPdf && \(/g, "{(!isPdf && !isYoutube) && (");

fs.writeFileSync('src/components/StudyViewer.tsx', content);
