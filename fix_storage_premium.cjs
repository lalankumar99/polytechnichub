const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

if (!content.includes('PremiumCourse')) {
    content = content.replace("import { StudyItem, LibraryStats } from '../src/types';", "import { StudyItem, LibraryStats, PremiumCourse, PremiumItem, PremiumAccessRequest } from '../src/types';");
}

if (!content.includes('premiumCoursesPath')) {
    content = content.replace(
        "private collectionPath = 'studyItems';",
        "private collectionPath = 'studyItems';\n  private premiumCoursesPath = 'premiumCourses';\n  private premiumItemsPath = 'premiumItems';\n  private premiumRequestsPath = 'premiumRequests';"
    );
}

const addPremiumMethods = `
  // Premium Courses
  public async getPremiumCourses(): Promise<PremiumCourse[]> {
    const snapshot = await getDocs(collection(db, this.premiumCoursesPath));
    return snapshot.docs.map(doc => doc.data() as PremiumCourse);
  }

  public async getPremiumCourse(id: string): Promise<PremiumCourse | null> {
    const docRef = doc(db, this.premiumCoursesPath, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as PremiumCourse : null;
  }

  public async createPremiumCourse(course: Omit<PremiumCourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumCourse> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newCourse: PremiumCourse = {
      ...course,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, this.premiumCoursesPath, id), cleanUndefined(newCourse));
    return newCourse;
  }

  public async updatePremiumCourse(id: string, updates: Partial<PremiumCourse>): Promise<void> {
    const docRef = doc(db, this.premiumCoursesPath, id);
    await updateDoc(docRef, { ...cleanUndefined(updates), updatedAt: new Date().toISOString() });
  }

  public async deletePremiumCourse(id: string): Promise<void> {
    await deleteDoc(doc(db, this.premiumCoursesPath, id));
    // Also delete items in this course?
    const items = await this.getPremiumItems(id);
    for (const item of items) {
      await this.deletePremiumItem(item.id);
    }
  }

  // Premium Items
  public async getPremiumItems(courseId: string): Promise<PremiumItem[]> {
    const snapshot = await getDocs(collection(db, this.premiumItemsPath));
    const all = snapshot.docs.map(doc => doc.data() as PremiumItem);
    return all.filter(i => i.courseId === courseId);
  }

  public async createPremiumItem(item: Omit<PremiumItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumItem> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newItem: PremiumItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, this.premiumItemsPath, id), cleanUndefined(newItem));
    return newItem;
  }

  public async updatePremiumItem(id: string, updates: Partial<PremiumItem>): Promise<void> {
    const docRef = doc(db, this.premiumItemsPath, id);
    await updateDoc(docRef, { ...cleanUndefined(updates), updatedAt: new Date().toISOString() });
  }

  public async deletePremiumItem(id: string): Promise<void> {
    await deleteDoc(doc(db, this.premiumItemsPath, id));
  }

  // Premium Requests
  public async getPremiumRequests(courseId?: string): Promise<PremiumAccessRequest[]> {
    const snapshot = await getDocs(collection(db, this.premiumRequestsPath));
    const all = snapshot.docs.map(doc => doc.data() as PremiumAccessRequest);
    return courseId ? all.filter(r => r.courseId === courseId) : all;
  }

  public async getUserPremiumRequests(userId: string): Promise<PremiumAccessRequest[]> {
    const snapshot = await getDocs(collection(db, this.premiumRequestsPath));
    const all = snapshot.docs.map(doc => doc.data() as PremiumAccessRequest);
    return all.filter(r => r.userId === userId);
  }

  public async createPremiumRequest(request: Omit<PremiumAccessRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PremiumAccessRequest> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newRequest: PremiumAccessRequest = {
      ...request,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, this.premiumRequestsPath, id), cleanUndefined(newRequest));
    return newRequest;
  }

  public async updatePremiumRequest(id: string, updates: Partial<PremiumAccessRequest>): Promise<void> {
    const docRef = doc(db, this.premiumRequestsPath, id);
    await updateDoc(docRef, { ...cleanUndefined(updates), updatedAt: new Date().toISOString() });
  }
`;

if (!content.includes('getPremiumCourses')) {
    content = content.replace(
        "export const storage = new LibraryStorage();",
        addPremiumMethods + "\nexport const storage = new LibraryStorage();"
    );
    fs.writeFileSync('server/storage.ts', content);
}
