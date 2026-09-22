const fs = require('fs');

let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

console.log(content.slice(0, 500));
