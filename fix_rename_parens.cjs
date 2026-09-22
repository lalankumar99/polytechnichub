const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// The issue might be in how the JSX condition handles `renameItem?.type === 'youtube' || renameItem?.type === 'link'`
content = content.replace(
  "{renameItem?.type === 'youtube' || renameItem?.type === 'link' && (",
  "{(renameItem?.type === 'youtube' || renameItem?.type === 'link') && ("
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
