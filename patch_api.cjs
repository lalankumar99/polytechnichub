const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

const additionalMethods = `
  // Premium User Management
  async registerPremiumUser(data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/register\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async loginPremiumUser(data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getAdminPremiumUsers(): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users\`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.users || [];
  },
  async updateAdminPremiumUser(id: string, data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users/\${id}\`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteAdminPremiumUser(id: string): Promise<any> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users/\${id}\`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};`;

content = content.replace(/};\s*$/, additionalMethods);

fs.writeFileSync('src/services/api.ts', content);
