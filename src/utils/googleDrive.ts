/**
 * Utility functions for Google Drive URL resolution and parsing.
 */

export interface GoogleDriveResolvedUrls {
  fileId: string;
  directDownloadUrl: string;
  embeddedStreamUrl: string;
  proxyStreamUrl: string;
}

/**
 * Extracts a Google Drive file ID from various URL formats or raw ID string.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/...
 * - Raw File ID string (e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)
 */
export function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Raw File ID pattern (typically 20-60 alphanumeric characters, hyphens, or underscores)
  if (/^[a-zA-Z0-9_-]{20,70}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }

  // 2. /file/d/FILE_ID pattern
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // 3. /d/FILE_ID pattern (docs.google.com/spreadsheets/d/..., etc.)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // 4. ?id=FILE_ID or &id=FILE_ID query parameter
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // 5. /folders/FOLDER_ID pattern
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  return null;
}

/**
 * Resolves a Google Drive share URL or File ID into all necessary endpoints.
 */
export function resolveGoogleDriveUrls(input: string): GoogleDriveResolvedUrls | null {
  const fileId = extractDriveFileId(input);
  if (!fileId) return null;

  return {
    fileId,
    // Direct download endpoint (bypasses viewer)
    directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    // Embedded preview endpoint (fallback)
    embeddedStreamUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    // In-app proxy endpoint to avoid CORS and Google branding
    proxyStreamUrl: `/api/proxy/drive-pdf?fileId=${fileId}`
  };
}
