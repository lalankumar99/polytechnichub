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

async function safeJson<T = any>(res: Response, fallbackError = 'API request failed'): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`[API Error] Received non-JSON response from server (${res.status}):`, text.slice(0, 200));
    throw new Error(`${fallbackError} (${res.status})`);
  }
  return res.json();
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
    return safeJson(res, 'Failed to submit feedback');
  },

  async getFeedback(): Promise<FeedbackSubmission[]> {
    const res = await fetch('/api/feedback', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return safeJson(res, 'Failed to fetch feedback');
  },


  // Premium Courses
  async getPremiumCourses(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/premium/courses`);
      const data = await safeJson(res, 'Failed to fetch courses');
      const courses = data.courses || [];
      try {
        localStorage.setItem('polytechnic_cache_premium_courses', JSON.stringify(courses));
      } catch (e) {}
      return courses;
    } catch (err) {
      try {
        const cached = localStorage.getItem('polytechnic_cache_premium_courses');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      throw err;
    }
  },

  async getPremiumCourse(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/courses/${id}`);
    const data = await safeJson(res, 'Failed to fetch course');
    return data.course;
  },

  async createPremiumCourse(courseData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(courseData)
    });
    const data = await safeJson(res, 'Failed to create course');
    return data.course;
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

  async toggleCourseLive(id: string, isLive?: boolean): Promise<any> {
    const res = await fetch(`/api/admin/courses/${id}/toggle-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(isLive !== undefined ? { isLive } : {})
    });
    const data = await safeJson(res, 'Failed to toggle live state');
    return data.course;
  },

  // Live Chat API
  async getLiveChatMessages(courseId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/live/chat/${courseId}`);
      const data = await safeJson(res, 'Failed to fetch live chat');
      return data.messages || [];
    } catch (err) {
      return [];
    }
  },

  async sendLiveChatMessage(courseId: string, msgData: { userName: string; userRole?: string; message: string; userId?: string }): Promise<any> {
    const res = await fetch(`/api/live/chat/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });
    const data = await safeJson(res, 'Failed to send live message');
    return data.message;
  },

  // Premium Items
  async getPremiumItems(courseId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/premium/items/${courseId}`);
      const data = await safeJson(res, 'Failed to fetch premium items');
      const items = data.items || [];
      try {
        localStorage.setItem(`polytechnic_cache_items_${courseId}`, JSON.stringify(items));
      } catch (e) {}
      return items;
    } catch (err) {
      try {
        const cached = localStorage.getItem(`polytechnic_cache_items_${courseId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  },
  async createPremiumItem(itemData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(itemData)
    });
    const data = await safeJson(res, 'Failed to create premium item');
    return data.item;
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

  // Premium Access Requests
  async getPremiumRequests(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/requests`, {
      headers: getAuthHeaders()
    });
    const data = await safeJson(res, 'Failed to fetch premium requests');
    return data.requests || [];
  },
  async getUserPremiumRequests(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/premium/requests/user/${userId}`);
    const data = await safeJson(res, 'Failed to fetch user requests');
    return data.requests || [];
  },
  async createPremiumRequest(requestData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const data = await safeJson(res, 'Failed to create request');
    return data.request;
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
    try {
      const res = await fetch(`${API_BASE}/public/tree`);
      const data = await safeJson(res, 'Failed to fetch library tree');
      if (!data.success) throw new Error(data.error || 'Failed to fetch library tree');
      try {
        localStorage.setItem('polytechnic_cache_public_tree', JSON.stringify(data.items));
      } catch (e) {}
      return data.items;
    } catch (err) {
      try {
        const cached = localStorage.getItem('polytechnic_cache_public_tree');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      throw err;
    }
  },

  async getPublicItem(id: string): Promise<{ item: StudyItem; breadcrumbs: Array<{ id: string | null; name: string }> }> {
    const res = await fetch(`${API_BASE}/public/item/${id}`);
    const data = await safeJson(res, 'Study material not found');
    if (!data.success) throw new Error(data.error || 'Study material not found');
    return { item: data.item, breadcrumbs: data.breadcrumbs };
  },

  async getPublicStats(): Promise<LibraryStats> {
    try {
      const res = await fetch(`${API_BASE}/public/stats`);
      const data = await safeJson(res, 'Failed to fetch library statistics');
      if (!data.success) throw new Error(data.error || 'Failed to fetch library statistics');
      try {
        localStorage.setItem('polytechnic_cache_public_stats', JSON.stringify(data.stats));
      } catch (e) {}
      return data.stats;
    } catch (err) {
      try {
        const cached = localStorage.getItem('polytechnic_cache_public_stats');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      throw err;
    }
  },

  // Auth APIs
  async login(adminIdOrEmail: string, password: string): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: adminIdOrEmail, email: adminIdOrEmail, password })
    });
    const data = await safeJson(res, 'Authentication failed');
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
      const data = await safeJson(res, 'Verification failed');
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
    const data = await safeJson(res, 'Failed to fetch admin file manager data');
    if (!data.success) throw new Error(data.error || 'Failed to fetch admin file manager data');
    return { items: data.items, stats: data.stats };
  },

  async createFolder(name: string, parentId: string | null, status: 'published' | 'draft' = 'published', description?: string, branch?: string, semester?: string, isPremium?: boolean, accessType: 'free' | 'premium' | 'both' = 'both'): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name, parentId, status, description, branch, semester, isPremium, accessType })
    });
    const data = await safeJson(res, 'Failed to create folder');
    if (!data.success) throw new Error(data.error || 'Failed to create folder');
    return data.folder;
  },

  async createFileRecord(
    name: string,
    type: 'pdf' | 'html' | 'youtube' | 'link',
    fileUrl: string,
    size: number,
    parentId: string | null,
    status: 'published' | 'draft' = 'published',
    description?: string,
    branch?: string,
    semester?: string,
    displayType?: 'pdf' | 'html' | 'video' | 'link',
    isVideo?: boolean,
    thumbnailUrl?: string,
    videoTitle?: string,
    isPremium?: boolean,
    accessType?: 'free' | 'premium' | 'both'
  ): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/create-file-record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        name,
        type,
        fileUrl,
        size,
        parentId,
        status,
        description,
        branch,
        semester,
        displayType,
        isVideo,
        thumbnailUrl,
        videoTitle,
        isPremium,
        accessType
      })
    });
    const data = await safeJson(res, 'Failed to create file record');
    if (!data.success) throw new Error(data.error || 'Failed to create file record');
    return data.file;
  },

  async uploadFile(
    file: File,
    parentId: string | null,
    status: 'published' | 'draft' = 'published',
    description?: string,
    isPremium?: boolean,
    displayType?: 'pdf' | 'html' | 'video' | 'link',
    isVideo?: boolean
  ): Promise<StudyItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    formData.append('status', status);
    if (description) formData.append('description', description);
    if (isPremium !== undefined) formData.append('isPremium', isPremium.toString());
    if (displayType) formData.append('displayType', displayType);
    if (isVideo !== undefined) formData.append('isVideo', isVideo.toString());

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await safeJson(res, 'Upload failed');
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.file;
  },

  async createHtmlNote(
    name: string,
    content: string,
    parentId: string | null,
    status: 'published' | 'draft' = 'published',
    description?: string,
    branch?: string,
    semester?: string,
    displayType: 'pdf' | 'html' | 'video' | 'link' = 'pdf',
    isVideo?: boolean
  ): Promise<StudyItem> {
    const res = await fetch(`${API_BASE}/admin/create-html-note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        name,
        content,
        parentId,
        status,
        description,
        branch,
        semester,
        displayType,
        isVideo
      })
    });
    const data = await safeJson(res, 'Failed to create HTML note');
    if (!data.success) throw new Error(data.error || 'Failed to create HTML note');
    return data.file;
  },

  async fetchYoutubeMetadata(url: string): Promise<{ title: string; thumbnailUrl: string; videoId: string | null; author: string }> {
    const res = await fetch(`${API_BASE}/utils/youtube-oembed?url=${encodeURIComponent(url)}`);
    const data = await safeJson(res, 'Failed to fetch YouTube details');
    return data;
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
    const data = await safeJson(res, 'Failed to update item');
    if (!data.success) throw new Error(data.error || 'Failed to update item');
    return data.item;
  },

  async deleteItem(id: string): Promise<{ deletedIds: string[]; count: number }> {
    const res = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await safeJson(res, 'Failed to delete item');
    if (!data.success) throw new Error(data.error || 'Failed to delete item');
    return { deletedIds: data.deletedIds, count: data.count };
  },

  async getStudiverseData(): Promise<{ liveEmbed: string, videos: any[] }> {
    const res = await fetch(`${API_BASE}/studiverse`);
    const data = await safeJson(res, 'Failed to fetch studiverse data');
    if (!data.success) throw new Error(data.error || 'Failed to fetch studiverse data');
    return data.data;
  },

  async updateStudiverseLive(liveEmbed: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/studiverse/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ liveEmbed })
    });
    const data = await safeJson(res, 'Failed to update live embed');
    if (!data.success) throw new Error(data.error || 'Failed to update live embed');
  },

  async updateStudiverseVideos(videos: any[]): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/studiverse/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ videos })
    });
    const data = await safeJson(res, 'Failed to update videos');
    if (!data.success) throw new Error(data.error || 'Failed to update videos');
  },

  // Premium User Management
  async registerPremiumUser(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium-users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await safeJson(res, 'Registration failed');
    if (!result.success) throw new Error(result.error || 'Registration failed');
    return result.user;
  },
  async loginPremiumUser(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/premium-users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await safeJson(res, 'Login failed');
    if (!result.success) throw new Error(result.error || 'Login failed');
    return result.user;
  },
  async syncPremiumUser(internalId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/premium-users/sync/${encodeURIComponent(internalId)}`);
      const data = await safeJson(res, 'Sync failed');
      return data.success ? data.user : null;
    } catch {
      return null;
    }
  },
  async checkPremiumUserStatus(identifier: string): Promise<{ success: boolean; notFound?: boolean; user?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/premium-users/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      return await safeJson(res, 'Failed to check status');
    } catch (err: any) {
      return { success: false, message: err.message || 'Status check failed' };
    }
  },
  async updatePremiumUserProfile(internalId: string, profileData: { photoUrl?: string; name?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/premium-users/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalId, ...profileData })
    });
    const data = await safeJson(res, 'Failed to update profile');
    if (!data.success) throw new Error(data.error || 'Failed to update profile');
    return data.user;
  },
  async getAdminPremiumUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/premium-users`, {
      headers: getAuthHeaders()
    });
    const data = await safeJson(res, 'Failed to fetch premium users');
    return data.users || [];
  },
  async updateAdminPremiumUser(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/premium-users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return safeJson(res, 'Failed to update premium user');
  },
  async deleteAdminPremiumUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/premium-users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return safeJson(res, 'Failed to delete premium user');
  }
};