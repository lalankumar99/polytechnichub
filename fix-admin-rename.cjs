const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/if \(renameItem\.type === 'pdf'.*?finalName = `\$\{finalName\}\.pdf`;\n    \}/s, '');
code = code.replace(/if \(renameItem\.type === 'html'.*?finalName = `\$\{finalName\}\.html`;\n    \}/s, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
