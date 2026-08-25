const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

const userCode = `

  // Premium Users
  private premiumUsersPath = 'premium_users';

  public async getPremiumUsers(): Promise<any[]> {
    const snapshot = await getDocs(collection(db, this.premiumUsersPath));
    return snapshot.docs.map(doc => doc.data()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPremiumUser(id: string): Promise<any | null> {
    const docRef = doc(db, this.premiumUsersPath, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  public async getPremiumUserByEmailOrMobile(identifier: string): Promise<any | null> {
    const users = await this.getPremiumUsers();
    return users.find(u => u.email === identifier || u.mobile === identifier || u.id === identifier) || null;
  }

  public async createPremiumUser(data: any): Promise<any> {
    const newId = 'req-' + Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const user = {
      ...data,
      internalId: newId,
      id: '', // Will be assigned by admin
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, this.premiumUsersPath, newId), cleanUndefined(user));
    return user;
  }

  public async updatePremiumUser(internalId: string, updates: any): Promise<void> {
    const docRef = doc(db, this.premiumUsersPath, internalId);
    await updateDoc(docRef, cleanUndefined(updates));
  }

  public async deletePremiumUser(internalId: string): Promise<void> {
    await deleteDoc(doc(db, this.premiumUsersPath, internalId));
  }
`;

content = content.replace(
  "// Premium Courses",
  userCode + "\n\n  // Premium Courses"
);

fs.writeFileSync('server/storage.ts', content);
