const fs = require('fs');

let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

// handleDownload
content = content.replace("if (isPdf) {", "if (isYoutube) {\n      window.open(fileApiUrl, '_blank');\n      setIsDownloading(false);\n      return;\n    }\n    if (isPdf) {");

fs.writeFileSync('src/components/StudyViewer.tsx', content);
