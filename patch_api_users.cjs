const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

const apiMethods = `
  // Premium Users
  async registerPremiumUser(data: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/register\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  },

  async loginPremiumUser(identifier: string, password: string): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium-users/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  },

  async getAdminPremiumUsers(): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users\`, { headers: getAuthHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.users;
  },

  async updateAdminPremiumUser(internalId: string, status: string, id: string): Promise<void> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users/\${internalId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, id })
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
  },

  async deleteAdminPremiumUser(internalId: string): Promise<void> {
    const res = await fetch(\`\${API_BASE}/admin/premium-users/\${internalId}\`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
  },
`;

if (!content.includes('registerPremiumUser')) {
  content = content.replace(
    "// ----------------------------------------------------\n  // Admin Dashboard Config & Live Control",
    apiMethods + "\n  // ----------------------------------------------------\n  // Admin Dashboard Config & Live Control"
  );
  fs.writeFileSync('src/services/api.ts', content);
}
