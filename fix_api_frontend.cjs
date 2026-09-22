const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

const premiumMethods = `
  // Premium Courses
  async getPremiumCourses(): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/premium/courses\`);
    const data = await res.json();
    return data.courses || [];
  }

  async getPremiumCourse(id: string): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium/courses/\${id}\`);
    const data = await res.json();
    return data.course;
  }

  async createPremiumCourse(courseData: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium/courses\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(courseData)
    });
    return (await res.json()).course;
  }

  async updatePremiumCourse(id: string, updates: any): Promise<void> {
    await fetch(\`\${API_BASE}/premium/courses/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  }

  async deletePremiumCourse(id: string): Promise<void> {
    await fetch(\`\${API_BASE}/premium/courses/\${id}\`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  }

  // Premium Items
  async getPremiumItems(courseId: string): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/premium/items/\${courseId}\`);
    const data = await res.json();
    return data.items || [];
  }

  async createPremiumItem(itemData: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium/items\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(itemData)
    });
    return (await res.json()).item;
  }

  async updatePremiumItem(id: string, updates: any): Promise<void> {
    await fetch(\`\${API_BASE}/premium/items/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  }

  async deletePremiumItem(id: string): Promise<void> {
    await fetch(\`\${API_BASE}/premium/items/\${id}\`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  }

  // Premium Requests
  async getPremiumRequests(): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/premium/requests\`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.requests || [];
  }

  async getUserPremiumRequests(userId: string): Promise<any[]> {
    const res = await fetch(\`\${API_BASE}/premium/requests/user/\${userId}\`);
    const data = await res.json();
    return data.requests || [];
  }

  async createPremiumRequest(requestData: any): Promise<any> {
    const res = await fetch(\`\${API_BASE}/premium/requests\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return (await res.json()).request;
  }

  async updatePremiumRequest(id: string, updates: any): Promise<void> {
    await fetch(\`\${API_BASE}/premium/requests/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  }
`;

if (!content.includes('getPremiumCourses')) {
    content = content.replace(
        "export const api = {",
        "export const api = {\n" + premiumMethods
    );
    fs.writeFileSync('src/services/api.ts', content);
}
