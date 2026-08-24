import { StudyItem, LibraryStats } from '../src/types';


import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const cleanUndefined = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

class LibraryStorage {
  private collectionPath = 'studyItems';

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionPath));
      if (snapshot.empty) {
        console.log('No initial seeding for production.');
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  }

  private async getItems(): Promise<StudyItem[]> {
    try {
      const snapshot = await getDocs(collection(db, this.collectionPath));
      return snapshot.docs.map(d => d.data() as StudyItem);
    } catch (err) {
      console.error('Error fetching items:', err);
      return [];
    }
  }

  public async getAllAdminItems(): Promise<StudyItem[]> {
    const items = await this.getItems();
    return items.map(item => this.enrichItem(item, items));
  }

  public async getPublishedItems(): Promise<StudyItem[]> {
    const items = await this.getItems();

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
    const items = await this.getItems();
    const item = items.find(i => i.id === id);
    return item ? this.enrichItem(item, items) : undefined;
  }

  public async incrementViews(id: string): Promise<void> {
    try {
      const item = await this.getItemById(id);
      if (item) {
        await updateDoc(doc(db, this.collectionPath, id), {
          viewsCount: (item.viewsCount || 0) + 1
        });
      }
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  }

  public async incrementDownloads(id: string): Promise<void> {
    try {
      const item = await this.getItemById(id);
      if (item) {
        await updateDoc(doc(db, this.collectionPath, id), {
          downloadsCount: (item.downloadsCount || 0) + 1
        });
      }
    } catch (err) {
      console.error('Failed to increment downloads:', err);
    }
  }

  public async getBreadcrumbs(itemId: string | null): Promise<Array<{ id: string | null; name: string }>> {
    const items = await this.getItems();
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
  }): Promise<StudyItem> {
    const items = await this.getItems();
    let branch: string = data.branch || 'General';
    let semester: string = data.semester || 'All Semesters';
    let subject: string | undefined;

    if (data.parentId) {
      const parent = items.find(p => p.id === data.parentId);
      if (parent) {
        if (!data.branch && parent.branch) branch = parent.branch;
        if (!data.semester && parent.semester) semester = parent.semester;
        subject = parent.subject;
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
      downloadsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, this.collectionPath, newFolder.id), cleanUndefined(newFolder));
    return this.enrichItem(newFolder, [...items, newFolder]);
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
  }): Promise<StudyItem> {
    const items = await this.getItems();
    let branch: string = data.branch || 'General';
    let semester: string = data.semester || 'All Semesters';
    let subject: string | undefined;
    let unit: string | undefined;

    if (data.parentId) {
      const parent = items.find(p => p.id === data.parentId);
      if (parent) {
        if (!data.branch && parent.branch) branch = parent.branch;
        if (!data.semester && parent.semester) semester = parent.semester;
        subject = parent.subject;
        unit = parent.unit;
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

    await setDoc(doc(db, this.collectionPath, newFile.id), cleanUndefined(newFile));
    return this.enrichItem(newFile, [...items, newFile]);
  }

  public async updateItem(id: string, updates: Partial<StudyItem>): Promise<StudyItem> {
    const items = await this.getItems();
    const current = items.find(i => i.id === id);
    if (!current) {
      throw new Error(`Item with id ${id} not found`);
    }

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

    await updateDoc(doc(db, this.collectionPath, id), cleanUndefined(updated));
    return this.enrichItem(updated, items.map(i => i.id === id ? updated : i));
  }

  public async deleteItem(id: string): Promise<{ deletedIds: string[]; count: number }> {
    const items = await this.getItems();
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

    for (const deletedId of Array.from(idsToDelete)) {
      await deleteDoc(doc(db, this.collectionPath, deletedId));
    }

    return {
      deletedIds: Array.from(idsToDelete),
      count: idsToDelete.size
    };
  }

  public async getStats(): Promise<LibraryStats> {
    const items = await this.getItems();
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

  public async getStudiverseData(): Promise<{ liveEmbed: string, videos: any[] }> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'studiverse'));
      if (snap.exists()) {
        return snap.data() as { liveEmbed: string, videos: any[] };
      }
      return { liveEmbed: '', videos: [] };
    } catch (err) {
      console.error('Error fetching studiverse data:', err);
      return { liveEmbed: '', videos: [] };
    }
  }

  public async updateStudiverseLive(liveEmbed: string): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'studiverse'), { liveEmbed }, { merge: true });
    } catch (err) {
      console.error('Error updating live embed:', err);
      throw err;
    }
  }

  public async updateStudiverseVideos(videos: any[]): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'studiverse'), { videos }, { merge: true });
    } catch (err) {
      console.error('Error updating videos:', err);
      throw err;
    }
  }
}


const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
export const UPLOADS_PATH = UPLOADS_DIR;

export const storage = new LibraryStorage();

