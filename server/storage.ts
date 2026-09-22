import { StudyItem, LibraryStats, PremiumCourse, PremiumItem, PremiumAccessRequest, FeedbackSubmission } from '../src/types';
import fs from 'fs';
import path from 'path';
import { INITIAL_ITEMS } from './initialData';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
export const UPLOADS_PATH = UPLOADS_DIR;

const DB_FILE = path.join(UPLOADS_DIR, 'library_db.json');

interface DatabaseSchema {
  studyItems: StudyItem[];
  premiumUsers: any[];
  premiumCourses: PremiumCourse[];
  premiumItems: PremiumItem[];
  premiumRequests: PremiumAccessRequest[];
  feedback: FeedbackSubmission[];
  studiverse: {
    liveEmbed: string;
    videos: any[];
  };
}

class LibraryStorage {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          studyItems: Array.isArray(parsed.studyItems) && parsed.studyItems.length > 0 ? parsed.studyItems : [...INITIAL_ITEMS],
          premiumUsers: Array.isArray(parsed.premiumUsers) ? parsed.premiumUsers : [],
          premiumCourses: Array.isArray(parsed.premiumCourses) ? parsed.premiumCourses : [],
          premiumItems: Array.isArray(parsed.premiumItems) ? parsed.premiumItems : [],
          premiumRequests: Array.isArray(parsed.premiumRequests) ? parsed.premiumRequests : [],
          feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
          studiverse: parsed.studiverse || { liveEmbed: '', videos: [] }
        };
      }
    } catch (err) {
      console.error('[Storage] Error reading database file, initializing with defaults:', err);
    }

    const initialData: DatabaseSchema = {
      studyItems: [...INITIAL_ITEMS],
      premiumUsers: [],
      premiumCourses: [],
      premiumItems: [],
      premiumRequests: [],
      feedback: [],
      studiverse: { liveEmbed: '', videos: [] }
    };
    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema): void {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error persisting database file:', err);
    }
  }

  private getItems(): StudyItem[] {
    return this.data.studyItems || [];
  }

  public async getAllAdminItems(): Promise<StudyItem[]> {
    const items = this.getItems();
    return items.map(item => this.enrichItem(item, items));
  }

  public async getPublishedItems(): Promise<StudyItem[]> {
    const items = this.getItems();

    const isAncestorPublished = (item: StudyItem): boolean => {
      if (item.status !== 'published') return false;
      let currParentId = item.parentId;
      while (currParentId) {
        const parent = items.find(p => p.id === currParentId);
        if (!parent || parent.status !== 'published') return false;
        currParentId = parent.parentId;
      }
      return true;
    };

    return items
      .filter(isAncestorPublished)
      .map(item => this.enrichItem(item, items, true));
  }

  private enrichItem(item: StudyItem, allItems: StudyItem[], publishedOnly = false): StudyItem {
    if (item.type === 'folder') {
      const childCount = allItems.filter(i => {
        if (i.parentId !== item.id) return false;
        if (publishedOnly) return i.status === 'published';
        return true;
      }).length;
      return { ...item, itemCount: childCount };
    }
    return item;
  }

  public async getItemById(id: string): Promise<StudyItem | undefined> {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    return item ? this.enrichItem(item, items) : undefined;
  }

  public async incrementViews(id: string): Promise<void> {
    const item = this.data.studyItems.find(i => i.id === id);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      this.saveDatabase();
    }
  }

  public async incrementDownloads(id: string): Promise<void> {
    const item = this.data.studyItems.find(i => i.id === id);
    if (item) {
      item.downloadsCount = (item.downloadsCount || 0) + 1;
      this.saveDatabase();
    }
  }

  public async getBreadcrumbs(itemId: string | null): Promise<Array<{ id: string | null; name: string }>> {
    const items = this.getItems();
    const crumbs: Array<{ id: string | null; name: string }> = [{ id: null, name: 'Library' }];
    if (!itemId) return crumbs;

    const pathItems: Array<{ id: string; name: string }> = [];
    let currId: string | null = itemId;

    while (currId) {
      const current = items.find(i => i.id === currId);
      if (!current) break;
      pathItems.unshift({ id: current.id, name: current.name });
      currId = current.parentId;
    }

    return [...crumbs, ...pathItems];
  }

  public async createFolder(data: {
    name: string;
    parentId: string | null;
    status?: 'published' | 'draft';
    description?: string;
    branch?: string;
    semester?: string;
    isPremium?: boolean;
    accessType?: "free" | "premium" | "both";
  }): Promise<StudyItem> {
    const items = this.getItems();
    let branch: string = data.branch || 'General';
    let semester: string = data.semester || 'All Semesters';
    let subject: string | undefined;
    let isPremium = data.isPremium || false;
    let accessType = data.accessType || "both";

    if (data.parentId) {
      const parent = items.find(p => p.id === data.parentId);
      if (parent) {
        if (!data.branch && parent.branch) branch = parent.branch;
        if (!data.semester && parent.semester) semester = parent.semester;
        subject = parent.subject;
        if (parent.isPremium) isPremium = true;
        if (parent.accessType) accessType = parent.accessType;
      }
    }

    const newFolder: StudyItem = {
      id: 'f-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: data.name.trim(),
      type: 'folder',
      parentId: data.parentId || null,
      status: data.status || 'published',
      size: 0,
      branch,
      semester,
      subject,
      description: data.description,
      isPremium,
      accessType,
      downloadsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.studyItems.push(newFolder);
    this.saveDatabase();
    return this.enrichItem(newFolder, this.data.studyItems);
  }

  public async createFile(data: {
    name: string;
    type: 'pdf' | 'html';
    parentId: string | null;
    status?: 'published' | 'draft';
    size: number;
    fileUrl?: string;
    content?: string;
    description?: string;
    branch?: string;
    semester?: string;
    isPremium?: boolean;
    accessType?: "free" | "premium" | "both";
  }): Promise<StudyItem> {
    const items = this.getItems();
    let branch: string = data.branch || 'General';
    let semester: string = data.semester || 'All Semesters';
    let subject: string | undefined;
    let unit: string | undefined;
    let isPremium = data.isPremium || false;
    let accessType = data.accessType || "both";

    if (data.parentId) {
      const parent = items.find(p => p.id === data.parentId);
      if (parent) {
        if (!data.branch && parent.branch) branch = parent.branch;
        if (!data.semester && parent.semester) semester = parent.semester;
        subject = parent.subject;
        unit = parent.unit;
        if (parent.isPremium) isPremium = true;
      }
    }

    const newFile: StudyItem = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: data.name.trim(),
      type: data.type,
      parentId: data.parentId || null,
      status: data.status || 'published',
      size: data.size || 0,
      fileUrl: data.fileUrl,
      content: data.content,
      isPremium,
      accessType,
      branch,
      semester,
      subject,
      unit,
      description: data.description,
      downloadsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.studyItems.push(newFile);
    this.saveDatabase();
    return this.enrichItem(newFile, this.data.studyItems);
  }

  public async updateItem(id: string, updates: Partial<StudyItem>): Promise<StudyItem> {
    const items = this.getItems();
    const index = this.data.studyItems.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    const current = this.data.studyItems[index];

    if (updates.parentId !== undefined && updates.parentId !== current.parentId) {
      if (updates.parentId === id) {
        throw new Error('Cannot move a folder into itself.');
      }
      if (current.type === 'folder' && updates.parentId !== null) {
        let checkId: string | null = updates.parentId;
        while (checkId) {
          if (checkId === id) {
            throw new Error('Cannot move a folder into one of its subfolders.');
          }
          const parent = items.find(i => i.id === checkId);
          checkId = parent ? parent.parentId : null;
        }
      }
    }

    const updated: StudyItem = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.studyItems[index] = updated;
    this.saveDatabase();
    return this.enrichItem(updated, this.data.studyItems);
  }

  public async deleteItem(id: string): Promise<{ deletedIds: string[]; count: number }> {
    const items = this.getItems();
    const itemToDelete = items.find(i => i.id === id);
    if (!itemToDelete) {
      throw new Error(`Item with id ${id} not found`);
    }

    const idsToDelete = new Set<string>();

    const collectDescendants = (parentId: string) => {
      idsToDelete.add(parentId);
      const children = items.filter(i => i.parentId === parentId);
      for (const child of children) {
        collectDescendants(child.id);
      }
    };

    collectDescendants(id);

    this.data.studyItems = this.data.studyItems.filter(i => !idsToDelete.has(i.id));
    this.saveDatabase();

    return {
      deletedIds: Array.from(idsToDelete),
      count: idsToDelete.size
    };
  }

  public async getStats(): Promise<LibraryStats> {
    const items = this.getItems();
    const folders = items.filter(i => i.type === 'folder');
    const files = items.filter(i => i.type !== 'folder');
    const pdfs = items.filter(i => i.type === 'pdf');
    const htmls = items.filter(i => i.type === 'html');
    const youtubeVideos = items.filter(i => i.type === 'youtube');
    const links = items.filter(i => i.type === 'link');
    const published = items.filter(i => i.status === 'published');
    const draft = items.filter(i => i.status === 'draft');
    const unpublished = items.filter(i => i.status === 'unpublished');
    const totalViews = items.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

    return {
      totalFolders: folders.length,
      totalFiles: files.length,
      totalPdfs: pdfs.length,
      totalHtmls: htmls.length,
      totalYoutubeVideos: youtubeVideos.length,
      totalLinks: links.length,
      publishedCount: published.length,
      draftCount: draft.length,
      unpublishedCount: unpublished.length,
      totalViews
    };
  }

  public async getStudiverseData(): Promise<{ liveEmbed: string; videos: any[] }> {
    return this.data.studiverse || { liveEmbed: '', videos: [] };
  }

  public async updateStudiverseLive(liveEmbed: string): Promise<void> {
    this.data.studiverse = {
      ...(this.data.studiverse || { videos: [] }),
      liveEmbed
    };
    this.saveDatabase();
  }

  public async updateStudiverseVideos(videos: any[]): Promise<void> {
    this.data.studiverse = {
      ...(this.data.studiverse || { liveEmbed: '' }),
      videos
    };
    this.saveDatabase();
  }

  // Premium Users
  public async getPremiumUsers(): Promise<any[]> {
    return [...(this.data.premiumUsers || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPremiumUser(id: string): Promise<any | null> {
    return this.data.premiumUsers.find(u => u.internalId === id || u.id === id) || null;
  }

  public async getPremiumUserByEmailOrMobile(identifier: string): Promise<any | null> {
    return this.data.premiumUsers.find(u => u.email === identifier || u.mobile === identifier || u.id === identifier) || null;
  }

  public async createPremiumUser(data: any): Promise<any> {
    const newId = 'req-' + Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const user = {
      ...data,
      internalId: newId,
      id: '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.premiumUsers.push(user);
    this.saveDatabase();
    return user;
  }

  public async updatePremiumUser(internalId: string, updates: any): Promise<void> {
    const index = this.data.premiumUsers.findIndex(u => u.internalId === internalId);
    if (index !== -1) {
      this.data.premiumUsers[index] = { ...this.data.premiumUsers[index], ...updates };
      this.saveDatabase();
    }
  }

  public async deletePremiumUser(internalId: string): Promise<void> {
    this.data.premiumUsers = this.data.premiumUsers.filter(u => u.internalId !== internalId);
    this.saveDatabase();
  }

  // Premium Courses
  public async getPremiumCourses(): Promise<PremiumCourse[]> {
    return [...(this.data.premiumCourses || [])];
  }

  public async getPremiumCourse(id: string): Promise<PremiumCourse | null> {
    return this.data.premiumCourses.find(c => c.id === id) || null;
  }

  public async createPremiumCourse(course: Omit<PremiumCourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumCourse> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newCourse: PremiumCourse = {
      ...course,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.premiumCourses.push(newCourse);
    this.saveDatabase();
    return newCourse;
  }

  public async updatePremiumCourse(id: string, updates: Partial<PremiumCourse>): Promise<void> {
    const index = this.data.premiumCourses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.premiumCourses[index] = {
        ...this.data.premiumCourses[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveDatabase();
    }
  }

  public async deletePremiumCourse(id: string): Promise<void> {
    this.data.premiumCourses = this.data.premiumCourses.filter(c => c.id !== id);
    this.data.premiumItems = this.data.premiumItems.filter(i => i.courseId !== id);
    this.saveDatabase();
  }

  // Premium Items
  public async getPremiumItems(courseId: string): Promise<PremiumItem[]> {
    return (this.data.premiumItems || []).filter(i => i.courseId === courseId);
  }

  public async createPremiumItem(item: Omit<PremiumItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumItem> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newItem: PremiumItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.premiumItems.push(newItem);
    this.saveDatabase();
    return newItem;
  }

  public async updatePremiumItem(id: string, updates: Partial<PremiumItem>): Promise<void> {
    const index = this.data.premiumItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.data.premiumItems[index] = {
        ...this.data.premiumItems[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveDatabase();
    }
  }

  public async deletePremiumItem(id: string): Promise<void> {
    this.data.premiumItems = this.data.premiumItems.filter(i => i.id !== id);
    this.saveDatabase();
  }

  // Premium Requests
  public async getPremiumRequests(courseId?: string): Promise<PremiumAccessRequest[]> {
    const all = this.data.premiumRequests || [];
    return courseId ? all.filter(r => r.courseId === courseId) : [...all];
  }

  public async getUserPremiumRequests(userId: string): Promise<PremiumAccessRequest[]> {
    return (this.data.premiumRequests || []).filter(r => r.userId === userId);
  }

  public async createPremiumRequest(request: Omit<PremiumAccessRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumAccessRequest> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newRequest: PremiumAccessRequest = {
      ...request,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.premiumRequests.push(newRequest);
    this.saveDatabase();
    return newRequest;
  }

  public async updatePremiumRequest(id: string, updates: Partial<PremiumAccessRequest>): Promise<void> {
    const index = this.data.premiumRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.premiumRequests[index] = {
        ...this.data.premiumRequests[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveDatabase();
    }
  }

  // Feedback Methods
  public async getFeedback(): Promise<FeedbackSubmission[]> {
    return [...(this.data.feedback || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'createdAt'>): Promise<FeedbackSubmission> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newFeedback: FeedbackSubmission = {
      ...feedback,
      id,
      createdAt: new Date().toISOString()
    };
    this.data.feedback.push(newFeedback);
    this.saveDatabase();
    return newFeedback;
  }
}

export const db = null as any;
export const storage = new LibraryStorage();
