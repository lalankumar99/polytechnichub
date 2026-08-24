const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Fix Link2 missing import
if (!content.includes('Link2')) {
    // try to find where lucide-react imports are
    content = content.replace("import {\n  Folder,", "import {\n  Folder,\n  Link2,");
    if (!content.includes('Link2')) {
        content = content.replace("import { Folder,", "import { Folder, Link2,");
    }
}

// Check if we need to replace setIsLoading
content = content.replace(/setIsLoading\(/g, "setLoading(");

// Check if we need to replace loadTree with loadAdminData
content = content.replace(/loadTree\(\)/g, "loadAdminData()");

// Check if isLoading is used
content = content.replace(/isLoading/g, "loading");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
