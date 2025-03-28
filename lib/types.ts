export interface ImageKitType {
    publicKey: string;
    urlEndpoint: string;
  }
  
  export interface MediaFile {
    fileId: string;
    name: string;
    filePath: string;
    fileType: string;
    mimeType: string;
    height?: number;
    width?: number;
    size: number;
    tags?: string[];
    isPrivateFile: boolean;
    url: string;
    thumbnail?: string;
    AITags?: string[];
    customMetadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MediaResponse {
    files: MediaFile[];
    totalCount: number;
  }
  
  export interface SearchParams {
    clientId?: string;
    projectId?: string;
    path?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }