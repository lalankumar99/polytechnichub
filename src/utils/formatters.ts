import { StudyItem } from '../types';

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Extract YouTube 11-character Video ID from various link formats, iframe codes, or embedded HTML snippets
 * Supports iframe embeds, youtu.be, m.youtube.com, youtube.com/watch, embed, shorts, and query params
 */
export function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // 1. Direct regex match across any text or HTML content (matches 11-char YouTube ID)
  const regExp = /(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = cleanUrl.match(regExp);
  if (match && match[1]) return match[1];

  // 2. Check if string contains an iframe src
  if (cleanUrl.includes('<iframe')) {
    const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      const srcId = extractYoutubeId(srcMatch[1]);
      if (srcId) return srcId;
    }
  }

  // 3. Fallback URL parser
  try {
    const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0].split('?')[0];
      if (id && id.length === 11) return id;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
      if (parsed.pathname.includes('/embed/')) {
        const id = parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
        if (id && id.length === 11) return id;
      }
      if (parsed.pathname.includes('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
        if (id && id.length === 11) return id;
      }
    }
  } catch (e) {
    // Continue
  }

  return null;
}

/**
 * Parse Video Embed: Supports full <iframe> HTML embed code, YouTube watch URL, shorts, or direct embed URL
 */
export function parseVideoEmbed(input?: string): { embedUrl: string; youtubeId: string | null; rawIframe?: string } {
  if (!input) return { embedUrl: '', youtubeId: null };
  const trimmed = input.trim();

  // 1. Direct YouTube ID extraction from input (URL, iframe, or HTML snippet)
  const ytId = extractYoutubeId(trimmed);
  if (ytId) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&controls=1&fs=1`,
      youtubeId: ytId
    };
  }

  // 2. If input is an <iframe> HTML tag (non-YouTube embed like Vimeo, etc.)
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1];
      const subYtId = extractYoutubeId(src);
      if (subYtId) {
        return {
          embedUrl: `https://www.youtube-nocookie.com/embed/${subYtId}?autoplay=1&rel=0&playsinline=1&controls=1&fs=1`,
          youtubeId: subYtId,
          rawIframe: trimmed
        };
      }
      return { embedUrl: src, youtubeId: null, rawIframe: trimmed };
    }
  }

  return { embedUrl: trimmed, youtubeId: null };
}

/**
 * Generate standard high-res or HQ YouTube thumbnail URL
 */
export function getYoutubeThumbnailUrl(url?: string, highRes = true): string | null {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return highRes 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Dynamic File Masking & Type Handling:
 * The application stores & processes content internally as HTML (.html).
 * However, the display name/file extension presented to end-users is dynamically masked
 * based on admin selection (e.g. displaying as .pdf for text/document resources).
 */
export function getMaskedDisplayName(item: StudyItem): string {
  if (!item || !item.name) return '';

  const effType = getEffectiveDisplayType(item);

  if (effType === 'video') {
    // If designated as video or YouTube, remove technical .html/.pdf extensions
    return item.name.replace(/\.(html|htm|pdf)$/i, '');
  }

  if (effType === 'pdf') {
    // Mask as PDF document: replace .html with .pdf or append .pdf
    let clean = item.name.replace(/\.(html|htm)$/i, '');
    if (!clean.toLowerCase().endsWith('.pdf')) {
      clean = `${clean}.pdf`;
    }
    return clean;
  }

  if (effType === 'html') {
    // Explicit HTML presentation
    let clean = item.name.replace(/\.pdf$/i, '');
    if (!clean.toLowerCase().endsWith('.html') && !clean.toLowerCase().endsWith('.htm')) {
      clean = `${clean}.html`;
    }
    return clean;
  }

  return item.name;
}

/**
 * Determine the user-facing masked type (e.g. 'pdf' vs 'video' vs 'html' vs 'link')
 */
export function getEffectiveDisplayType(item: StudyItem): 'pdf' | 'html' | 'video' | 'link' {
  if (!item) return 'html';
  if (item.isVideo || item.displayType === 'video' || item.type === 'youtube' || (item as any).type === 'video') {
    return 'video';
  }

  // Auto-detect video from URL or content
  const ytId = extractYoutubeId(item.fileUrl) || extractYoutubeId(item.content);
  if (ytId) {
    return 'video';
  }

  const content = (item.content || '').toLowerCase();
  const url = (item.fileUrl || '').toLowerCase();
  if (
    content.includes('ph-video-player') ||
    content.includes('class="video"') ||
    content.includes('<video') ||
    (content.includes('<iframe') && !content.includes('drive.google.com') && !content.includes('docs.google.com')) ||
    (url.includes('<iframe') && !url.includes('drive.google.com') && !url.includes('docs.google.com'))
  ) {
    return 'video';
  }

  if (item.displayType === 'pdf' || item.type === 'pdf') {
    return 'pdf';
  }
  if (item.displayType === 'html') {
    return 'html';
  }
  if (item.type === 'link') {
    return 'link';
  }
  // Default for text notes & uploaded HTML: mask as PDF unless explicitly set to html
  return 'pdf';
}

export async function requestFullscreenAndLandscape(element: HTMLElement): Promise<{
  fullscreenGranted: boolean;
  orientationGranted: boolean;
}> {
  let fullscreenGranted = false;
  let orientationGranted = false;

  // 1. Fullscreen
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      fullscreenGranted = true;
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
      fullscreenGranted = true;
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
      fullscreenGranted = true;
    }
  } catch (err) {
    console.warn('Fullscreen request bypassed or not supported:', err);
  }

  // 2. Screen Orientation API (Landscape)
  try {
    if (screen.orientation && (screen.orientation as any).lock) {
      await (screen.orientation as any).lock('landscape');
      orientationGranted = true;
    }
  } catch (err) {
    console.warn('Orientation lock not supported by browser or requires user gesture:', err);
  }

  return { fullscreenGranted, orientationGranted };
}

export function exitFullscreen(): void {
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  } catch (err) {
    console.warn('Exit fullscreen error:', err);
  }
}
