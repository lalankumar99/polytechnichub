const fs = require('fs');

let content = fs.readFileSync('server/storage.ts', 'utf-8');

const studiverseMethods = `
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
`;

content = content.replace(/^}$/m, studiverseMethods);
fs.writeFileSync('server/storage.ts', content);
