const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the line to load from localStorage initially
code = code.replace(
  "const [premiumUser, setPremiumUser] = useState<any>(null);",
  "const [premiumUser, setPremiumUser] = useState<any>(() => {\n    try {\n      const stored = localStorage.getItem('polytechnic_premium_user');\n      return stored ? JSON.parse(stored) : null;\n    } catch (e) { return null; }\n  });"
);

// We should also add a logout option for Premium User? The user didn't ask for a specific button but it's good practice. I'll stick to the requested scope.

fs.writeFileSync('src/App.tsx', code);
