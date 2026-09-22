const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "premiumUser={premiumUser}",
  "premiumUser={premiumUser}\n            onOpenCourse={(id) => { alert('Course unlocked! The premium materials are now available in your Library.'); handleNavigate('browse'); }}"
);

fs.writeFileSync('src/App.tsx', code);
