const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf-8');

// I need to add FeedbackSubmission to the imports if it's imported from src/types.
// Actually `FeedbackSubmission` might not be imported. So let's import it:
if (content.includes("PremiumAccessRequest")) {
  content = content.replace("PremiumAccessRequest", "PremiumAccessRequest, FeedbackSubmission");
}

const feedbackMethods = `
  // Feedback Methods
  private feedbackPath = 'feedback';

  public async getFeedback(): Promise<FeedbackSubmission[]> {
    const snapshot = await getDocs(collection(db, this.feedbackPath));
    return snapshot.docs.map(doc => doc.data() as FeedbackSubmission).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'createdAt'>): Promise<FeedbackSubmission> {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newFeedback: FeedbackSubmission = {
      ...feedback,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, this.feedbackPath, id), cleanUndefined(newFeedback));
    return newFeedback;
  }
`;

if (!content.includes('public async getFeedback()')) {
  // Find the last method (updatePremiumRequest)
  content = content.replace(/public async updatePremiumRequest[\s\S]*?\}\s*\n/, match => match + feedbackMethods + "\n");
  fs.writeFileSync('server/storage.ts', content);
}
