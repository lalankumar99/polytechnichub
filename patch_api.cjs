const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf-8');

const premiumCoursesApiStr = `
  // Premium Courses
  async getPremiumCourses(): Promise<PremiumCourse[]> {
    const res = await fetch(\`\${API_BASE}/premium-courses\`);
    return await res.json();
  },
  async createPremiumCourse(data: any): Promise<PremiumCourse> {
    const res = await fetch(\`\${API_BASE}/admin/premium-courses\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async updatePremiumCourse(id: string, data: any): Promise<void> {
    await fetch(\`\${API_BASE}/admin/premium-courses/\${id}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
  },
  async deletePremiumCourse(id: string): Promise<void> {
    await fetch(\`\${API_BASE}/admin/premium-courses/\${id}\`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
`;

if (!code.includes('getPremiumCourses()')) {
  code = code.replace('export const api = {', 'export const api = {' + premiumCoursesApiStr);
  fs.writeFileSync('src/services/api.ts', code);
}
