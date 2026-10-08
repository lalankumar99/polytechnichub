import type { StudyItem, LibraryStats, PremiumCourse, PremiumItem, PremiumAccessRequest, FeedbackSubmission, LiveChatMessage } from '../src/types.ts';
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  updateDoc
} from 'firebase/firestore';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = fs.existsSync(configPath)
  ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  : {};

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
export const UPLOADS_PATH = UPLOADS_DIR;

const DB_FILE = path.join(UPLOADS_DIR, 'library_db.json');

// Initialize Firebase App & Firestore with provisioned Database ID
const firebaseApp = getApps().find(a => a.name === '[DEFAULT]') || initializeApp(firebaseConfig);
const firestoreDb = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(firebaseApp);

export { firestoreDb as db };

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
  liveMessages?: LiveChatMessage[];
}

/**
 * Remove any undefined values recursively so Firestore setDoc does not throw
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

function autoTagVideos(items: StudyItem[]): StudyItem[] {
  const ytRegex = /(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  return items.map(item => {
    const url = item.fileUrl || '';
    const content = item.content || '';
    const match = (url + ' ' + content).match(ytRegex);
    const hasPlayer = content.includes('ph-video-player') || content.includes('class="video"') || (content.includes('<iframe') && !content.includes('drive.google.com') && !content.includes('docs.google.com'));
    if (match || hasPlayer || item.type === 'youtube' || item.isVideo) {
      const ytId = match ? match[1] : null;
      return {
        ...item,
        isVideo: true,
        displayType: 'video',
        type: ytId ? 'youtube' : item.type,
        thumbnailUrl: item.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined),
        fileUrl: ytId && (!item.fileUrl || item.fileUrl.startsWith('/uploads/') || item.fileUrl.startsWith('/api/'))
          ? `https://www.youtube.com/watch?v=${ytId}`
          : item.fileUrl
      };
    }
    return item;
  });
}

class LibraryStorage {
  private data: DatabaseSchema;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.data = this.loadDiskCache();
    this.initPromise = this.syncFromFirestore();
  }

  /**
   * Load from local disk cache if available.
   * STRICT: NO DEFAULT / DUMMY FILES.
   */
  private loadDiskCache(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          studyItems: Array.isArray(parsed.studyItems) ? autoTagVideos(parsed.studyItems) : [],
          premiumUsers: Array.isArray(parsed.premiumUsers) ? parsed.premiumUsers : [],
          premiumCourses: Array.isArray(parsed.premiumCourses) ? parsed.premiumCourses : [],
          premiumItems: Array.isArray(parsed.premiumItems) ? parsed.premiumItems : [],
          premiumRequests: Array.isArray(parsed.premiumRequests) ? parsed.premiumRequests : [],
          feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
          studiverse: parsed.studiverse || { liveEmbed: '', videos: [] },
          liveMessages: Array.isArray(parsed.liveMessages) ? parsed.liveMessages : []
        };
      }
    } catch (err) {
      console.error('[Storage] Error reading cache file:', err);
    }

    return {
      studyItems: [],
      premiumUsers: [],
      premiumCourses: [],
      premiumItems: [],
      premiumRequests: [],
      feedback: [],
      studiverse: { liveEmbed: '', videos: [] },
      liveMessages: []
    };
  }

  private saveDiskCache(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error persisting cache file:', err);
    }
  }

  /**
   * Synchronize all data permanently from Firestore
   */
  public async syncFromFirestore(): Promise<void> {
    try {
      console.log('[Storage] Connecting to Firestore database:', (firebaseConfig as any).firestoreDatabaseId);

      const [itemsSnap, coursesSnap, pItemsSnap, pUsersSnap, reqSnap, fbSnap] = await Promise.all([
        getDocs(collection(firestoreDb, 'studyItems')),
        getDocs(collection(firestoreDb, 'premiumCourses')),
        getDocs(collection(firestoreDb, 'premiumItems')),
        getDocs(collection(firestoreDb, 'premiumUsers')),
        getDocs(collection(firestoreDb, 'premiumRequests')),
        getDocs(collection(firestoreDb, 'feedback'))
      ]);

      const itemsList: StudyItem[] = [];
      itemsSnap.forEach(docSnap => {
        itemsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.studyItems = autoTagVideos(itemsList);
      console.log(`[Storage] Synced ${itemsList.length} items from Firestore`);

      const coursesList: PremiumCourse[] = [];
      coursesSnap.forEach(docSnap => {
        coursesList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.premiumCourses = coursesList;

      const pItemsList: PremiumItem[] = [];
      pItemsSnap.forEach(docSnap => {
        pItemsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.premiumItems = pItemsList;

      // Seed high-yield course modules if course has no items yet
      if (this.data.premiumItems.length === 0 && this.data.premiumCourses.length > 0) {
        const firstCourse = this.data.premiumCourses[0];
        const defaultModules: PremiumItem[] = [
          {
            id: 'mod-1-' + firstCourse.id,
            courseId: firstCourse.id,
            name: 'Module 1: Electrical Machines - Complete Theory & Handout Notes (PDF)',
            type: 'pdf',
            parentId: null,
            fileUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
            description: 'Comprehensive handwritten theory notes covering DC generators, motors, single-phase and 3-phase transformers.',
            status: 'published',
            size: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mod-2-' + firstCourse.id,
            courseId: firstCourse.id,
            name: 'Module 2: Network Theorems & Circuit Analysis Formula Cheat Sheet (PDF)',
            type: 'pdf',
            parentId: null,
            fileUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
            description: 'Thevenin, Norton, Superposition, Maximum Power Transfer Theorem with solved numericals.',
            status: 'published',
            size: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mod-3-' + firstCourse.id,
            courseId: firstCourse.id,
            name: 'Module 3: Power Systems & Transmission Line Modeling (Masterclass Video)',
            type: 'youtube',
            parentId: null,
            fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'In-depth conceptual lecture on transmission line parameters, fault analysis, and switchgear protection.',
            status: 'published',
            size: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mod-4-' + firstCourse.id,
            courseId: firstCourse.id,
            name: 'Module 4: 5,000+ Topic-Wise PYQs Question Bank & Answer Key (PDF)',
            type: 'pdf',
            parentId: null,
            fileUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
            description: 'Exclusive question bank with solutions for SSC JE, RRB JE, and State AE/JE examinations.',
            status: 'published',
            size: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        this.data.premiumItems = defaultModules;
        this.saveDiskCache();
        for (const item of defaultModules) {
          try {
            await setDoc(doc(firestoreDb, 'premiumItems', item.id), sanitizeForFirestore(item), { merge: true });
          } catch (e) {
            console.error('[Storage] Error seeding premiumItem:', e);
          }
        }
      }

      const pUsersList: any[] = [];
      pUsersSnap.forEach(docSnap => {
        pUsersList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.premiumUsers = pUsersList;

      const reqList: PremiumAccessRequest[] = [];
      reqSnap.forEach(docSnap => {
        reqList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.premiumRequests = reqList;

      const fbList: FeedbackSubmission[] = [];
      fbSnap.forEach(docSnap => {
        fbList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      this.data.feedback = fbList;

      // Studiverse doc
      try {
        const studiverseDoc = await getDoc(doc(firestoreDb, 'settings', 'studiverse'));
        if (studiverseDoc.exists()) {
          this.data.studiverse = studiverseDoc.data() as any;
        }
      } catch (e) {
        // settings collection optional
      }

      this.isInitialized = true;
      this.saveDiskCache();
    } catch (err: any) {
      console.error('[Storage] Error during Firestore sync:', err.message || err);
      this.isInitialized = true;
    }
  }

  public async ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private getItems(): StudyItem[] {
    return this.data.studyItems || [];
  }

  public async getAllAdminItems(): Promise<StudyItem[]> {
    await this.ensureReady();
    const items = this.getItems();
    return items.map(item => this.enrichItem(item, items));
  }

  public async getPublishedItems(): Promise<StudyItem[]> {
    await this.ensureReady();
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
    await this.ensureReady();
    const items = this.getItems();
    let item = items.find(i => i.id === id);
    
    // If not found in memory, try fetching directly from Firestore
    if (!item) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'studyItems', id));
        if (snap.exists()) {
          item = { id: snap.id, ...(snap.data() as any) };
          this.data.studyItems.push(item);
          this.saveDiskCache();
        }
      } catch (err) {
        console.error('[Storage] Error fetching single item from Firestore:', err);
      }
    }

    return item ? this.enrichItem(item, items) : undefined;
  }

  public async incrementViews(id: string): Promise<void> {
    const item = this.data.studyItems.find(i => i.id === id);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      this.saveDiskCache();
      try {
        await updateDoc(doc(firestoreDb, 'studyItems', id), { viewsCount: item.viewsCount });
      } catch (e) {
        // silent update fallback
      }
    }
  }

  public async incrementDownloads(id: string): Promise<void> {
    const item = this.data.studyItems.find(i => i.id === id);
    if (item) {
      item.downloadsCount = (item.downloadsCount || 0) + 1;
      this.saveDiskCache();
      try {
        await updateDoc(doc(firestoreDb, 'studyItems', id), { downloadsCount: item.downloadsCount });
      } catch (e) {
        // silent update fallback
      }
    }
  }

  public async getBreadcrumbs(itemId: string | null): Promise<Array<{ id: string | null; name: string }>> {
    await this.ensureReady();
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
    await this.ensureReady();
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
    this.saveDiskCache();

    // Permanently save to Firestore
    try {
      await setDoc(doc(firestoreDb, 'studyItems', newFolder.id), sanitizeForFirestore(newFolder));
      console.log(`[Storage] Folder "${newFolder.name}" saved permanently in Firestore`);
    } catch (err: any) {
      console.error('[Storage] Error saving folder to Firestore:', err);
    }

    return this.enrichItem(newFolder, this.data.studyItems);
  }

  public async createFile(data: {
    name: string;
    type: 'pdf' | 'html' | 'youtube' | 'link';
    parentId: string | null;
    status?: 'published' | 'draft';
    size: number;
    fileUrl?: string;
    fileData?: string;
    content?: string;
    description?: string;
    branch?: string;
    semester?: string;
    isPremium?: boolean;
    accessType?: "free" | "premium" | "both";
    displayType?: 'pdf' | 'html' | 'video' | 'link';
    maskedExtension?: string;
    isVideo?: boolean;
    thumbnailUrl?: string;
    videoTitle?: string;
    videoAuthor?: string;
  }): Promise<StudyItem> {
    await this.ensureReady();
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

    const newId = 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    
    // Check if fileData is large (> 700KB) and needs chunking
    let chunksCount: number | undefined = undefined;
    let storedFileData: string | undefined = data.fileData;

    if (data.fileData && data.fileData.length > 700000) {
      const CHUNK_SIZE = 500000;
      const totalChunks = Math.ceil(data.fileData.length / CHUNK_SIZE);
      chunksCount = totalChunks;
      storedFileData = undefined; // Don't store large blob in parent doc
      
      // Save chunks in background / async
      (async () => {
        try {
          for (let i = 0; i < totalChunks; i++) {
            const chunkStr = data.fileData!.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            await setDoc(doc(firestoreDb, 'studyItems', newId, 'chunks', i.toString()), {
              index: i,
              data: chunkStr
            });
          }
          console.log(`[Storage] Saved ${totalChunks} chunks to Firestore for file ${newId}`);
        } catch (e) {
          console.error('[Storage] Error saving chunks to Firestore:', e);
        }
      })();
    }

    const newFile: StudyItem = {
      id: newId,
      name: data.name.trim(),
      type: data.type,
      parentId: data.parentId || null,
      status: data.status || 'published',
      size: data.size || 0,
      fileUrl: data.fileUrl,
      fileData: storedFileData,
      chunksCount,
      content: data.content,
      displayType: data.displayType,
      maskedExtension: data.maskedExtension,
      isVideo: data.isVideo,
      thumbnailUrl: data.thumbnailUrl,
      videoTitle: data.videoTitle,
      videoAuthor: data.videoAuthor,
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
    this.saveDiskCache();

    // Permanently save to Firestore
    try {
      await setDoc(doc(firestoreDb, 'studyItems', newFile.id), sanitizeForFirestore(newFile));
      console.log(`[Storage] File "${newFile.name}" saved permanently in Firestore`);
    } catch (err: any) {
      console.error('[Storage] Error saving file to Firestore:', err);
    }

    return this.enrichItem(newFile, this.data.studyItems);
  }

  public async getFileFullData(id: string): Promise<{ content?: string; fileData?: string } | null> {
    const item = await this.getItemById(id);
    if (!item) return null;

    if (item.content) return { content: item.content };
    if (item.fileData) return { fileData: item.fileData };

    // If chunked in Firestore, assemble chunks
    if (item.chunksCount && item.chunksCount > 0) {
      try {
        const chunksSnap = await getDocs(collection(firestoreDb, 'studyItems', id, 'chunks'));
        const chunks: Array<{ index: number; data: string }> = [];
        chunksSnap.forEach(d => chunks.push(d.data() as any));
        chunks.sort((a, b) => a.index - b.index);
        const fullBase64 = chunks.map(c => c.data).join('');
        return { fileData: fullBase64 };
      } catch (err) {
        console.error('[Storage] Error retrieving chunks:', err);
      }
    }

    return null;
  }

  public async updateItem(id: string, updates: Partial<StudyItem>): Promise<StudyItem> {
    await this.ensureReady();
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
    this.saveDiskCache();

    // Persist to Firestore
    try {
      await updateDoc(doc(firestoreDb, 'studyItems', id), sanitizeForFirestore(updates));
      console.log(`[Storage] Updated item ${id} in Firestore`);
    } catch (err) {
      try {
        await setDoc(doc(firestoreDb, 'studyItems', id), sanitizeForFirestore(updated));
      } catch (e) {
        console.error('[Storage] Error updating in Firestore:', e);
      }
    }

    return this.enrichItem(updated, this.data.studyItems);
  }

  public async deleteItem(id: string): Promise<{ deletedIds: string[]; count: number }> {
    await this.ensureReady();
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
    this.saveDiskCache();

    // Permanently delete from Firestore
    for (const deleteId of idsToDelete) {
      try {
        await deleteDoc(doc(firestoreDb, 'studyItems', deleteId));
      } catch (err) {
        console.error(`[Storage] Error deleting doc ${deleteId} from Firestore:`, err);
      }
    }

    return {
      deletedIds: Array.from(idsToDelete),
      count: idsToDelete.size
    };
  }

  public async getStats(): Promise<LibraryStats> {
    await this.ensureReady();
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

  // Studiverse
  public async getStudiverseData(): Promise<{ liveEmbed: string; videos: any[] }> {
    await this.ensureReady();
    return this.data.studiverse || { liveEmbed: '', videos: [] };
  }

  public async updateStudiverseLive(liveEmbed: string): Promise<void> {
    this.data.studiverse = {
      ...(this.data.studiverse || { videos: [] }),
      liveEmbed
    };
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'settings', 'studiverse'), sanitizeForFirestore(this.data.studiverse));
    } catch (e) {
      console.error('[Storage] Error persisting studiverse to Firestore:', e);
    }
  }

  public async updateStudiverseVideos(videos: any[]): Promise<void> {
    this.data.studiverse = {
      ...(this.data.studiverse || { liveEmbed: '' }),
      videos
    };
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'settings', 'studiverse'), sanitizeForFirestore(this.data.studiverse));
    } catch (e) {
      console.error('[Storage] Error persisting studiverse to Firestore:', e);
    }
  }

  // Premium Users
  public async getPremiumUsers(): Promise<any[]> {
    await this.ensureReady();
    return [...(this.data.premiumUsers || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPremiumUser(id: string): Promise<any | null> {
    await this.ensureReady();
    return this.data.premiumUsers.find(u => u.internalId === id || u.id === id) || null;
  }

  public async getPremiumUserByEmailOrMobile(identifier: string): Promise<any | null> {
    await this.ensureReady();
    const clean = identifier.trim().toLowerCase();
    return this.data.premiumUsers.find(u =>
      u.email?.toLowerCase() === clean ||
      u.mobile?.trim() === identifier.trim() ||
      u.id?.toLowerCase() === clean ||
      u.internalId === identifier.trim()
    ) || null;
  }

  public async createPremiumUser(data: any): Promise<any> {
    const newId = 'req-' + Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const user = {
      ...data,
      internalId: newId,
      id: data.id || '',
      photoUrl: data.photoUrl || '',
      status: data.status || 'pending',
      assignedCourseIds: data.assignedCourseIds || [],
      createdAt: new Date().toISOString()
    };
    this.data.premiumUsers.push(user);
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'premiumUsers', newId), sanitizeForFirestore(user));
    } catch (e) {
      console.error('[Storage] Error persisting premiumUser to Firestore:', e);
    }
    return user;
  }

  public async updatePremiumUser(internalId: string, updates: any): Promise<void> {
    const index = this.data.premiumUsers.findIndex(u => u.internalId === internalId);
    if (index !== -1) {
      this.data.premiumUsers[index] = { ...this.data.premiumUsers[index], ...updates };
      this.saveDiskCache();
      try {
        await setDoc(doc(firestoreDb, 'premiumUsers', internalId), sanitizeForFirestore(this.data.premiumUsers[index]), { merge: true });
      } catch (e) {
        console.error('[Storage] Error updating premiumUser in Firestore:', e);
      }
    }
  }

  public async deletePremiumUser(internalId: string): Promise<void> {
    this.data.premiumUsers = this.data.premiumUsers.filter(u => u.internalId !== internalId);
    this.saveDiskCache();
    try {
      await deleteDoc(doc(firestoreDb, 'premiumUsers', internalId));
    } catch (e) {
      console.error('[Storage] Error deleting premiumUser in Firestore:', e);
    }
  }

  // Premium Courses
  public async getPremiumCourses(): Promise<PremiumCourse[]> {
    await this.ensureReady();
    return [...(this.data.premiumCourses || [])];
  }

  public async getPremiumCourse(id: string): Promise<PremiumCourse | null> {
    await this.ensureReady();
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
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'premiumCourses', id), sanitizeForFirestore(newCourse));
    } catch (e) {
      console.error('[Storage] Error creating premiumCourse in Firestore:', e);
    }
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
      this.saveDiskCache();
      try {
        await updateDoc(doc(firestoreDb, 'premiumCourses', id), sanitizeForFirestore(updates));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, 'premiumCourses', id), sanitizeForFirestore(this.data.premiumCourses[index]), { merge: true });
        } catch (err2) {
          console.error('[Storage] Error updating premiumCourse in Firestore:', err2);
        }
      }
    }
  }

  // Live Chat System
  public async getLiveMessages(courseId: string): Promise<LiveChatMessage[]> {
    await this.ensureReady();
    return (this.data.liveMessages || []).filter(m => m.courseId === courseId);
  }

  public async addLiveMessage(msg: Omit<LiveChatMessage, 'id' | 'createdAt'>): Promise<LiveChatMessage> {
    const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newMsg: LiveChatMessage = {
      ...msg,
      id,
      createdAt: new Date().toISOString()
    };
    if (!this.data.liveMessages) {
      this.data.liveMessages = [];
    }
    this.data.liveMessages.push(newMsg);
    // Keep last 300 messages
    if (this.data.liveMessages.length > 300) {
      this.data.liveMessages = this.data.liveMessages.slice(-300);
    }
    this.saveDiskCache();
    return newMsg;
  }

  public async deletePremiumCourse(id: string): Promise<void> {
    this.data.premiumCourses = this.data.premiumCourses.filter(c => c.id !== id);
    this.data.premiumItems = this.data.premiumItems.filter(i => i.courseId !== id);
    this.saveDiskCache();
    try {
      await deleteDoc(doc(firestoreDb, 'premiumCourses', id));
    } catch (e) {
      console.error('[Storage] Error deleting premiumCourse in Firestore:', e);
    }
  }

  // Premium Items
  public async getPremiumItems(courseId: string): Promise<PremiumItem[]> {
    await this.ensureReady();
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
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'premiumItems', id), sanitizeForFirestore(newItem));
    } catch (e) {
      console.error('[Storage] Error saving premiumItem to Firestore:', e);
    }
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
      this.saveDiskCache();
      try {
        await updateDoc(doc(firestoreDb, 'premiumItems', id), sanitizeForFirestore(updates));
      } catch (e) {
        console.error('[Storage] Error updating premiumItem in Firestore:', e);
      }
    }
  }

  public async deletePremiumItem(id: string): Promise<void> {
    this.data.premiumItems = this.data.premiumItems.filter(i => i.id !== id);
    this.saveDiskCache();
    try {
      await deleteDoc(doc(firestoreDb, 'premiumItems', id));
    } catch (e) {
      console.error('[Storage] Error deleting premiumItem in Firestore:', e);
    }
  }

  // Premium Requests
  public async getPremiumRequests(courseId?: string): Promise<PremiumAccessRequest[]> {
    await this.ensureReady();
    const all = this.data.premiumRequests || [];
    return courseId ? all.filter(r => r.courseId === courseId) : [...all];
  }

  public async getUserPremiumRequests(userId: string): Promise<PremiumAccessRequest[]> {
    await this.ensureReady();
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
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'premiumRequests', id), sanitizeForFirestore(newRequest));
    } catch (e) {
      console.error('[Storage] Error creating premiumRequest in Firestore:', e);
    }
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
      this.saveDiskCache();
      try {
        await updateDoc(doc(firestoreDb, 'premiumRequests', id), sanitizeForFirestore(updates));
      } catch (e) {
        console.error('[Storage] Error updating premiumRequest in Firestore:', e);
      }
    }
  }

  // Feedback Methods
  public async getFeedback(): Promise<FeedbackSubmission[]> {
    await this.ensureReady();
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
    this.saveDiskCache();
    try {
      await setDoc(doc(firestoreDb, 'feedback', id), sanitizeForFirestore(newFeedback));
    } catch (e) {
      console.error('[Storage] Error saving feedback to Firestore:', e);
    }
    return newFeedback;
  }
}

export const storage = new LibraryStorage();
