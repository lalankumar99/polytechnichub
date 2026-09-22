const fs = require('fs');

let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');
const isPdfIndex = content.indexOf('const isPdf = file.type');
console.log(content.slice(isPdfIndex, isPdfIndex + 1000));
