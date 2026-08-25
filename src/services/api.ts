import { FeedbackSubmission, StudyItem, LibraryStats, AdminUser } from '../types';

const API_BASE = '/api';

export const authState = {
  getToken(): string | null {
    return localStorage.getItem('polytechnic_admin_token');
  },
  setToken(token: string) {
    localStorage.setItem('polytechnic_admin_token', token);
  },
  clearToken() {
    localStorage.removeItem('polytechnic_admin_token');
  },
  getUser(): AdminUser | null {
    const raw = localStorage.getItem('polytechnic_admin_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: AdminUser) {
    localStorage.setItem('polytechnic_admin_user', JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem('polytechnic_admin_user');
  }
};

function getAuthHeaders(): HeadersInit {
  const token = authState.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {

  // Feedback
  async submitFeedback(feedback: { name: string, email: string, mobile: string, suggestion: string }) {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  async getFeedback(): Promise<FeedbackSubmission[]> {
    const res = await fetch('/api/feedback', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return res.json();
  },


  // Premium Courses
  async getPremiumCourses(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/courses`);
    const data = await res.json();
    return data.courses || [];
  },

  async getPremiumCourse(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/courses/${id}`);
    const data = await res.json();
    return data.course;
  },

  async createPremiumCourse(courseData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(courseData)
    });
    return (await res.json()).course;
  },
  async updatePremiumCourse(id: string, updates: any): Promise<void> {
    await fetch(`${API_BASE}/premium/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  },
  async deletePremiumCourse(id: string): Promise<void> {
    await fetch(`${API_BASE}/premium/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  // Premium Items
  async getPremiumItems(courseId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/items/${courseId}`);
    const data = await res.json();
    return data.items || [];
  },
  async createPremiumItem(itemData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(itemData)
    });
    return (await res.json()).item;
  },
  async updatePremiumItem(id: string, updates: any): Promise<void> {
    await fetch(`${API_BASE}/premium/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  },
  async deletePremiumItem(id: string): Promise<void> {
    await fetch(`${API_BASE}/premium/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  // Premium Requests
  async getPremiumRequests(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/requests`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.requests || [];
  },

  async getUserPremiumRequests(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/requests/user/${userId}`);
    const data = await res.json();
    return data.requests || [];
  },

  async createPremiumRequest(requestData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return (await res.json()).request;
  },
  async updatePremiumRequest(id: string, updates: any): Promise<void> {
    await fetch(`${API_BASE}/premium/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
  },
  // Public APIs
  async getPublicTree(): Promise<StudyItem[]> {
    const res = await fetch(`${API_BASE}/public/tree`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch library tree');
    return data.items;
  },

  async getPublicItem(id: string): Promise<{ item: StudyItem; breadcrumbs: Array<{ id: string | null; name: string }> }> {
    const res = await fetch(`${API_BASE}/public/item/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Study material not found');
    return { item: data.item, breadcrumbs: data.breadcrumbs };
  },

  async getPublicStats(): Promise<LibraryStats> {
    const res = await fetch(`${API_BASE}/public/stats`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch library statistics');
    return data.stats;
  },

  // Auth APIs
  async login(adminIdOrEmail: string, password: string): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: adminIdOrEmail, email: adminIdOrEmail, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Authentication failed');
    if (data.user?.token) {
      authState.setToken(data.user.token);
    }
    authState.setUser(data.user);
    return data.user;
  },

  async verifyAuth(): Promise<AdminUser | null> {
    const token = authState.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.user) {
        return data.user;
      }
      authState.clearToken();
      authState.clearUser();
      return null;
    } catch {
      authState.clearToken();
      authState.clearUser();
      return null;
    }
  },

  logout() {
    authState.clearToken();
    authState.clearUser();
  },

  // Admin APIs
  async getAdminTree(): Promise<{ items: StudyItem[]; stats: LibraryStats }> {
    const res = await fetch(`${API_BASE}/admin/tree`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch admin file manager data');
    return { items: data.items, stats: data.stats };
  },

  async createFolder(name: string, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, parentId, status, description, branch, semester })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create folder');
    return data.folder;
  },

  async createFileRecord(name: string, type: 'pdf' | 'html' | 'youtube' | 'link', fileUrl: string, size: number, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/create-file-record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, type, fileUrl, size, parentId, status, description, branch, semester })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create file record');
    return data.file;
  },

  async uploadFile(file: File, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string): Promise<StudyItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    formData.append('status', status);
    if (description) formData.append('description', description);

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.file;
  },

  async createHtmlNote(name: string, content: string, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/create-html-note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, content, parentId, status, description, branch, semester })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create HTML note');
    return data.file;
  },

  async updateItem(id: string, updates: Partial<StudyItem>): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update item');
    return data.item;
  },

  async deleteItem(id: string): Promise<{ deletedIds: string[]; count: number }> {
    const res = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete item');
    return { deletedIds: data.deletedIds, count: data.count };
  },

  async resetDemo(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to reset demo data');
    return data.items;
  },

  async getStudiverseData(): Promise<{ liveEmbed: string, videos: any[] }> {
    const res = await fetch(`${API_BASE}/studiverse`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch studiverse data');
    return data.data;
  },

  async updateStudiverseLive(liveEmbed: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/studiverse/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ liveEmbed })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update live embed');
  },

  async updateStudiverseVideos(videos: any[]): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/studiverse/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ videos })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update videos');
  }
};
