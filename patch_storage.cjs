const fs = require('fs');

let content = fs.readFileSync('server/storage.ts', 'utf-8');
content = content.replace(
  'subject: string | undefined;',
  'subject: string | undefined;\n    let isPremium = data.isPremium || false;'
);

content = content.replace(
  'if (!data.semester && parent.semester) semester = parent.semester;\n        subject = parent.subject;',
  'if (!data.semester && parent.semester) semester = parent.semester;\n        subject = parent.subject;\n        if (parent.isPremium) isPremium = true;'
);

content = content.replace(
  'description: data.description,',
  'description: data.description,\n      isPremium,'
);

// File creation
content = content.replace(
  'fileUrl?: string;\n    content?: string;\n    description?: string;\n    branch?: string;\n    semester?: string;\n    isPremium?: boolean;',
  'fileUrl?: string;\n    content?: string;\n    description?: string;\n    branch?: string;\n    semester?: string;\n    isPremium?: boolean;'
);

content = content.replace(
  'let semester: string = data.semester || \'All Semesters\';\n    let subject: string | undefined;',
  'let semester: string = data.semester || \'All Semesters\';\n    let subject: string | undefined;\n    let isPremium = data.isPremium || false;'
);

content = content.replace(
  'if (!data.semester && parent.semester) semester = parent.semester;\n        subject = parent.subject;',
  'if (!data.semester && parent.semester) semester = parent.semester;\n        subject = parent.subject;\n        if (parent.isPremium) isPremium = true;'
);

fs.writeFileSync('server/storage.ts', content);
