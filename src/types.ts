export type ItemType = 'folder' | 'pdf' | 'html' | 'youtube' | 'link';
export type ItemStatus = 'published' | 'draft' | 'unpublished';

export interface StudyItem {
  isPremium?: boolean;
  accessType?: 'free' | 'premium' | 'both';
  id: string;
  name: string;
  type: ItemType;
  displayType?: 'pdf' | 'html' | 'video' | 'link'; // Masked type presented to end users
  maskedExtension?: string; // e.g. '.pdf' for HTML documents masked as PDF
  isVideo?: boolean; // Option/checkbox to designate uploads as Video
  thumbnailUrl?: string; // High-res thumbnail (e.g. YouTube oEmbed or video poster)
  videoTitle?: string; // External video title from oEmbed standard
  videoAuthor?: string;
  parentId: string | null;
  status: ItemStatus;
  size: number; // in bytes
  fileUrl?: string;
  fileData?: string; // Base64 data URL or encoded buffer for permanent Firestore storage
  chunksCount?: number;
  content?: string; // HTML or note text
  description?: string;
  branch?: string;
  semester?: string;
  subject?: string;
  unit?: string;
  tags?: string[];
  downloadsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  itemCount?: number; // computed child count for folders
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  token?: string;
}

export interface LibraryStats {
  totalFolders: number;
  totalFiles: number;
  totalPdfs: number;
  totalHtmls: number;
  totalYoutubeVideos: number;
  totalLinks: number;
  publishedCount: number;
  draftCount: number;
  unpublishedCount: number;
  totalViews: number;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc';

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
  mobile?: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSubmission {
  id: string;
  name: string;
  email: string;
  mobile: string;
  suggestion: string;
  createdAt: string;
}

export interface PremiumUser {
  id: string; // The ID assigned by Admin
  internalId?: string;
  name: string;
  email: string;
  mobile: string;
  photoUrl?: string; // Student's original profile photo
  password?: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedCourseIds?: string[]; // IDs of specific premium courses granted by Admin
  createdAt: string;
}
