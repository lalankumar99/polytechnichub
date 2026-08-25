const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// createFolder
content = content.replace(
  'isPremium?: boolean;',
  'isPremium?: boolean;\n    accessType?: "free" | "premium" | "both";'
);
content = content.replace(
  'let isPremium = data.isPremium || false;',
  'let isPremium = data.isPremium || false;\n    let accessType = data.accessType || "both";'
);
content = content.replace(
  'if (parent.isPremium) isPremium = true;',
  'if (parent.isPremium) isPremium = true;\n        if (parent.accessType) accessType = parent.accessType;'
);
content = content.replace(
  'isPremium,\n      downloadsCount: 0,',
  'isPremium,\n      accessType,\n      downloadsCount: 0,'
);

// createFile
content = content.replace(
  'isPremium?: boolean;',
  'isPremium?: boolean;\n    accessType?: "free" | "premium" | "both";'
);
content = content.replace(
  'let isPremium = data.isPremium || false;',
  'let isPremium = data.isPremium || false;\n    let accessType = data.accessType || "both";'
);
content = content.replace(
  'if (parent.isPremium) isPremium = true;',
  'if (parent.isPremium) isPremium = true;\n        if (parent.accessType) accessType = parent.accessType;'
);
content = content.replace(
  'isPremium,\n      branch,',
  'isPremium,\n      accessType,\n      branch,'
);

fs.writeFileSync('server/storage.ts', content);
