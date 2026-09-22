const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about' | 'premium', folderId: string | null = null) => {",
  "const handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about' | 'premium' | 'premium-courses', folderId: string | null = null) => {"
);

fs.writeFileSync('src/App.tsx', code);
