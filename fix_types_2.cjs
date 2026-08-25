const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');
if (!content.includes('mobile?: string;')) {
  content = content.replace("userName: string;", "userName: string;\n  mobile?: string;");
  fs.writeFileSync('src/types.ts', content);
}
