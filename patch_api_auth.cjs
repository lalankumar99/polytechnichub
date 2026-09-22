const fs = require('fs');

let apiCode = fs.readFileSync('src/services/api.ts', 'utf-8');

apiCode = apiCode.replace(
  /async loginPremiumUser\(data: any\): Promise<any> \{([\s\S]*?)return res\.json\(\);\s*\}/,
  `async loginPremiumUser(data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error || 'Login failed');
    return result.user;
  }`
);

apiCode = apiCode.replace(
  /async registerPremiumUser\(data: any\): Promise<any> \{([\s\S]*?)return res\.json\(\);\s*\}/,
  `async registerPremiumUser(data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/register\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error || 'Registration failed');
    return result.user;
  }`
);

fs.writeFileSync('src/services/api.ts', apiCode);
console.log('Patched api.ts for login/register premium user');
