const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// The HTML upload route inside server.ts:
content = content.replace(
  'isPremium: isPremium === "true" || isPremium === true,',
  'isPremium: isPremium === "true" || isPremium === true,\n      accessType,'
);

content = content.replace(
  'isPremium: isPremium === "true" || isPremium === true\n    });',
  'isPremium: isPremium === "true" || isPremium === true,\n      accessType\n    });'
);

content = content.replace(
  'const { name, htmlContent, parentId, status, description, branch, semester, isPremium, accessType } = req.body;',
  'const { name, htmlContent, parentId, status, description, branch, semester, isPremium, accessType } = req.body;'
);

content = content.replace(
  'isPremium\n    });',
  'isPremium,\n      accessType\n    });'
);

fs.writeFileSync('server.ts', content);
