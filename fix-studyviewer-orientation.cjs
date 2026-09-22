const fs = require('fs');
let code = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');
code = code.replace("orientation: 'portrait' }", "orientation: 'portrait' as const }");
fs.writeFileSync('src/components/StudyViewer.tsx', code);
