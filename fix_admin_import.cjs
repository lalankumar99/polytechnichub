const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

if (!content.includes("import { AdminPremiumManager }")) {
  content = content.replace("import { api } from '../services/api';", "import { api } from '../services/api';\nimport { AdminPremiumManager } from './AdminPremiumManager';");
  fs.writeFileSync('src/components/AdminDashboard.tsx', content);
}
