const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(
  /const stored = localStorage\.getItem\('polytechnic_premium_user'\);\s*return stored \? JSON\.parse\(stored\) : null;/,
  `const stored = localStorage.getItem('polytechnic_premium_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.success && parsed.user) {
          localStorage.setItem('polytechnic_premium_user', JSON.stringify(parsed.user));
          return parsed.user;
        }
        return parsed;
      }
      return null;`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log('Patched App.tsx to handle old user format');
