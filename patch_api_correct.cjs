const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf-8');

// The `api` object ends at the end of the file.
// We can just replace `\n};\n` with our methods + `\n};\n`.
const apiMethods = `,
  async getStudiverseData(): Promise<{ liveEmbed: string, videos: any[] }> {
    const res = await fetch(\`\${API_BASE}/studiverse\`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch studiverse data');
    return data.data;
  },
  async updateStudiverseLive(liveEmbed: string): Promise<void> {
    const res = await fetch(\`\${API_BASE}/admin/studiverse/live\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ liveEmbed })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update live embed');
  },
  async updateStudiverseVideos(videos: any[]): Promise<void> {
    const res = await fetch(\`\${API_BASE}/admin/studiverse/videos\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ videos })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update videos');
  }
};
`;

// Replace the LAST closing brace
content = content.replace(/};\s*$/, apiMethods);
fs.writeFileSync('src/services/api.ts', content);
