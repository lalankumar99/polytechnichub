const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf-8');

const feedbackMethods = `
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
    const res = await fetch('/api/feedback', { headers: getAdminAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return res.json();
  },
`;

if (!content.includes('submitFeedback(')) {
  // Find "export const api = {" and insert inside
  content = content.replace("export const api = {", "export const api = {\n" + feedbackMethods);
  
  if (content.includes("PremiumAccessRequest")) {
    content = content.replace("PremiumAccessRequest", "PremiumAccessRequest, FeedbackSubmission");
  } else {
    content = content.replace("import {", "import { FeedbackSubmission,");
  }
  
  fs.writeFileSync('src/services/api.ts', content);
}
