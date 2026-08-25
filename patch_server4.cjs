const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'const { name, parentId, status, content, description, branch, semester, isPremium } = req.body;',
  'const { name, parentId, status, content, description, branch, semester, isPremium, accessType } = req.body;'
);

content = content.replace(
  'branch,\n      semester\n    });',
  'branch,\n      semester,\n      isPremium,\n      accessType\n    });'
);

fs.writeFileSync('server.ts', content);
