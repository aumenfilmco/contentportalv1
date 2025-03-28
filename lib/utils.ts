import { MediaFile } from './types';

// Extract unique tags from a list of media files
export function extractUniqueTags(files: MediaFile[]): string[] {
  const tagsSet = new Set<string>();
  
  files.forEach(file => {
    if (file.tags && Array.isArray(file.tags)) {
      file.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  
  return Array.from(tagsSet).sort();
}

// Generate appropriate file thumbnails based on file type
export function getFileThumbnail(file: MediaFile, width = 300, height = 200): string {
  if (!file.url) return '';
  
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  
  if (file.fileType === 'image') {
    return `${urlEndpoint}${file.filePath}?tr=w-${width},h-${height},fo-auto`;
  } else if (file.fileType === 'video') {
    return `${urlEndpoint}${file.filePath}?tr=w-${width},h-${height},fo-auto,f-jpg`;
  } else {
    // For other file types, return a placeholder icon based on file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return `/icons/${extension}.svg`;
  }
}

// Build search query for ImageKit API
export function buildSearchQuery(params: {
  clientId?: string;
  projectId?: string;
  path?: string;
  search?: string;
  tags?: string[];
}): string {
  let query = '';
  
  // Add path filtering
  if (params.clientId && params.projectId) {
    query = `filePath LIKE "/clients/${params.clientId}/projects/${params.projectId}/%"`;
  } else if (params.path) {
    query = `filePath LIKE "${params.path}%"`;
  }
  
  // Add name search
  if (params.search) {
    if (query) query += ' AND ';
    query += `name LIKE "%${params.search}%"`;
  }
  
  // Add tag filtering
  if (params.tags && params.tags.length > 0) {
    if (query) query += ' AND ';
    query += `tags IN [${params.tags.map(t => `"${t}"`).join(',')}]`;
  }
  
  return query;
}