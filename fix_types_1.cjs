const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

const feedbackType = `
export interface FeedbackSubmission {
  id: string;
  name: string;
  email: string;
  mobile: string;
  suggestion: string;
  createdAt: string;
}
`;

if (!content.includes('FeedbackSubmission')) {
  fs.writeFileSync('src/types.ts', content + feedbackType);
}
