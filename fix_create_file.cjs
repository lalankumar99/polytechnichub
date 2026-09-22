const fs = require('fs');

let content = fs.readFileSync('server/storage.ts', 'utf-8');

// fix the injection for createFile
content = content.replace(
  'let unit: string | undefined;',
  'let unit: string | undefined;\n    let isPremium = data.isPremium || false;'
);

content = content.replace(
  'subject = parent.subject;\n        unit = parent.unit;',
  'subject = parent.subject;\n        unit = parent.unit;\n        if (parent.isPremium) isPremium = true;'
);

content = content.replace(
  'content: data.content,',
  'content: data.content,\n      isPremium,'
);

fs.writeFileSync('server/storage.ts', content);
