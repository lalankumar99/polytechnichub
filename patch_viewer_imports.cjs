const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

if (!content.includes('Youtube')) {
  content = content.replace('ArrowLeft,', 'ArrowLeft, Youtube,');
}

fs.writeFileSync('src/components/StudyViewer.tsx', content);
