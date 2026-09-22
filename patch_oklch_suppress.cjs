const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

const replacement = `      // Temporarily suppress console.error for html2canvas oklch parsing errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('oklch')) return;
        originalConsoleError(...args);
      };

      try {
        await html2pdf().set(opt).from(element).save();
      } finally {
        console.error = originalConsoleError;
      }`;

content = content.replace(/await html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\);/, replacement);

fs.writeFileSync('src/components/StudyViewer.tsx', content);
