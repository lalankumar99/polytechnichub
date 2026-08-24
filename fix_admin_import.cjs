const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
if (!content.includes('import { Link2 }')) {
  // Try to insert it in lucide-react import
  content = content.replace("Folder,", "Folder, Link2,");
}
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
