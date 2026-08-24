const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

content = content.replace(
  /const element = document\.createElement\('div'\);\s*element\.innerHTML =/,
  "const element = document.createElement('div');\n      element.style.color = '#0f172a'; // Explicitly set hex color to avoid oklch inheritance error in html2canvas\n      element.style.backgroundColor = '#ffffff';\n      element.innerHTML ="
);

fs.writeFileSync('src/components/StudyViewer.tsx', content);
