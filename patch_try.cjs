const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');
content = content.replace("await html2pdf().set(opt).from(element).save();\n    } finally {", "await html2pdf().set(opt).from(element).save();\n      }\n    } finally {");
fs.writeFileSync('src/components/StudyViewer.tsx', content);
