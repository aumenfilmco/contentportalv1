import Image from 'next/image';
import { useState } from 'react';
import { MediaFile } from '@/lib/types';

interface MediaItemProps {
  item: MediaFile;
  onAddTag?: (fileId: string, tag: string) => Promise<void>;
  onRemoveTag?: (fileId: string, tag: string) => Promise<void>;
  onGenerateAITags?: (fileId: string) => Promise<void>;
}

export default function MediaItem({
  item,
  onAddTag,
  onRemoveTag,
  onGenerateAITags,
}: MediaItemProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddTag = async () => {
    if (!newTag.trim() || !onAddTag) return;
    
    setIsLoading(true);
    try {
      await onAddTag(item.fileId, newTag.trim());
      setNewTag('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveTag = async (tag: string) => {
    if (!onRemoveTag) return;
    
    setIsLoading(true);
    try {
      await onRemoveTag(item.fileId, tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAITags = async () => {
    if (!onGenerateAITags) return;
    
    setIsLoading(true);
    try {
      await onGenerateAITags(item.fileId);
    } catch (error) {
      console.error('Failed to generate AI tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine thumbnail and preview based on file type
  const getThumbnail = () => {
    if (item.fileType === 'image') {
      return `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${item.filePath}?tr=w-300,h-200,fo-auto`;
    } else if (item.fileType === 'video') {
      return `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${item.filePath}?tr=w-300,h-200,fo-auto,f-jpg`;
    } else {
      // For non-image files, return file type icon
      return `/icons/${item.fileType}.svg`;
    }
  };
  
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Preview */}
      <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
        {item.fileType === 'image' ? (
          <div
            className="w-full h-full bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url("${getThumbnail()}")` }}
            onClick={() => setIsDetailOpen(true)}
          />
        ) : item.fileType === 'video' ? (
          <div
            className="relative w-full h-full bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url("${getThumbnail()}")` }}
            onClick={() => setIsDetailOpen(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl text-gray-400">📄</div>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-1">{item.name}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags && item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              {onRemoveTag && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="mt-4 flex justify-between">
          
            href={item.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            Download
          </a>
          
          {onGenerateAITags && (
            <button
              onClick={handleGenerateAITags}
              disabled={isLoading}
              className="text-sm text-purple-500 hover:underline disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Generate AI Tags'}
            </button>
          )}
        </div>
        
        {/* Add tag input (if onAddTag is provided) */}
        {onAddTag && (
          <div className="mt-4 flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim() || isLoading}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              Add
            </button>
          </div>
        )}
      </div>
      
      {/* Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="max-w-4xl w-full max-h-screen p-4 bg-white rounded-lg overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* Media preview */}
            <div className="mb-4">
              {item.fileType === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : item.fileType === 'video' ? (
                <video
                  src={item.url}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="text-6xl text-gray-400 mb-4">📄</div>
                  <p>This file type cannot be previewed.</p>
                </div>
              )}
            </div>
            
            {/* Metadata table */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">File Information</h3>
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <td className="py-2">{item.name}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <td className="py-2">{item.fileType}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Size</th>
                    <td className="py-2">{(item.size / 1024 / 1024).toFixed(2)} MB</td>
                  </tr>
                  {item.width && item.height && (
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-medium">Dimensions</th>
                      <td className="py-2">
                        {item.width} × {item.height}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Created</th>
                    <td className="py-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Last Modified</th>
                    <td className="py-2">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2 pr-4 font-medium">Path</th>
                    <td className="py-2">{item.filePath}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Tag management */}
            <div>
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags && item.tags.length > 0 ? (
                  item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      {onRemoveTag && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No tags</p>
                )}
              </div>
              
              {/* Add tag input */}
              {onAddTag && (
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    Add
                  </button>
                </div>
              )}
              
              {/* Generate AI tags button */}
              {onGenerateAITags && (
                <button
                  onClick={handleGenerateAITags}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
                >
                  {isLoading ? 'Processing...' : 'Generate AI Tags'}
                </button>
              )}
            </div>
            
            {/* Download button */}
            <div className="mt-6 flex justify-end">
              
                href={item.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}