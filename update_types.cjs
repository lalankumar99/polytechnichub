const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

if (!content.includes('PremiumCourse')) {
    content += `
export interface PremiumCourse {
  id: string;
  name: string;
  branch: string;
  price: number;
  description: string;
  bannerUrl?: string;
  paymentLink?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface PremiumItem {
  id: string;
  courseId: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  status: ItemStatus;
  size: number;
  fileUrl?: string;
  content?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface PremiumAccessRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
`;
    fs.writeFileSync('src/types.ts', content);
}
