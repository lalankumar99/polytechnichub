const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');
content = content.replace(
  "  async getPremiumCourses(): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/courses`);\n    const data = await res.json();\n    return data.courses || [];\n  }\n\n  async getPremiumCourse",
  "  async getPremiumCourses(): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/courses`);\n    const data = await res.json();\n    return data.courses || [];\n  },\n\n  async getPremiumCourse"
);

content = content.replace(
  "  async getPremiumCourse(id: string): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses/${id}`);\n    const data = await res.json();\n    return data.course;\n  }\n\n  async createPremiumCourse",
  "  async getPremiumCourse(id: string): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses/${id}`);\n    const data = await res.json();\n    return data.course;\n  },\n\n  async createPremiumCourse"
);

content = content.replace(
  "  async createPremiumCourse(courseData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(courseData)\n    });\n    const data = await res.json();\n    return data.course;\n  }\n\n  async updatePremiumCourse",
  "  async createPremiumCourse(courseData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(courseData)\n    });\n    const data = await res.json();\n    return data.course;\n  },\n\n  async updatePremiumCourse"
);

content = content.replace(
  "  async updatePremiumCourse(id: string, courseData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses/${id}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(courseData)\n    });\n    const data = await res.json();\n    return data.course;\n  }\n\n  async getPremiumItems",
  "  async updatePremiumCourse(id: string, courseData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/courses/${id}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(courseData)\n    });\n    const data = await res.json();\n    return data.course;\n  },\n\n  async getPremiumItems"
);

content = content.replace(
  "  async getPremiumItems(courseId: string): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/courses/${courseId}/items`);\n    const data = await res.json();\n    return data.items || [];\n  }\n\n  async createPremiumItem",
  "  async getPremiumItems(courseId: string): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/courses/${courseId}/items`);\n    const data = await res.json();\n    return data.items || [];\n  },\n\n  async createPremiumItem"
);

content = content.replace(
  "  async createPremiumItem(itemData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/items`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(itemData)\n    });\n    const data = await res.json();\n    return data.item;\n  }\n\n  async getPremiumRequests",
  "  async createPremiumItem(itemData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/items`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify(itemData)\n    });\n    const data = await res.json();\n    return data.item;\n  },\n\n  async getPremiumRequests"
);

content = content.replace(
  "  async getPremiumRequests(): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/requests`, {\n      headers: getAuthHeaders()\n    });\n    const data = await res.json();\n    return data.requests || [];\n  }\n\n  async getUserPremiumRequests",
  "  async getPremiumRequests(): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/requests`, {\n      headers: getAuthHeaders()\n    });\n    const data = await res.json();\n    return data.requests || [];\n  },\n\n  async getUserPremiumRequests"
);

content = content.replace(
  "  async getUserPremiumRequests(userId: string): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/requests/user/${userId}`);\n    const data = await res.json();\n    return data.requests || [];\n  }\n\n  async createPremiumRequest",
  "  async getUserPremiumRequests(userId: string): Promise<any[]> {\n    const res = await fetch(`${API_BASE}/premium/requests/user/${userId}`);\n    const data = await res.json();\n    return data.requests || [];\n  },\n\n  async createPremiumRequest"
);

content = content.replace(
  "  async createPremiumRequest(requestData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/requests`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(requestData)\n    });\n    const data = await res.json();\n    return data.request;\n  }\n\n  async updatePremiumRequest",
  "  async createPremiumRequest(requestData: any): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/requests`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(requestData)\n    });\n    const data = await res.json();\n    return data.request;\n  },\n\n  async updatePremiumRequest"
);

content = content.replace(
  "  async updatePremiumRequest(requestId: string, status: string): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/requests/${requestId}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify({ status })\n    });\n    const data = await res.json();\n    return data.request;\n  }\n\n  // Auth",
  "  async updatePremiumRequest(requestId: string, status: string): Promise<any> {\n    const res = await fetch(`${API_BASE}/premium/requests/${requestId}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },\n      body: JSON.stringify({ status })\n    });\n    const data = await res.json();\n    return data.request;\n  },\n\n  // Auth"
);


fs.writeFileSync('src/services/api.ts', content);
