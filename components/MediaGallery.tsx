import { useState, useEffect } from 'react';
import { MediaFile } from '@/lib/types';
import { extractUniqueTags } from '@/lib/utils';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import MediaItem from './MediaItem';
import Pagination from './Pagination';

interface MediaGalleryProps {
  clientId?: string;
  projectId?: string;
  path?: string;
}

export default function MediaGallery({
  clientId,
  projectId,
  path,
}: MediaGalleryProps) {
  // State variables
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Fetch media data
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate pagination parameters
        const skip = (currentPage - 1) * itemsPerPage;
        
        // Build API query parameters
        const params = new URLSearchParams();
        if (clientId) params.append('clientId', clientId);
        if (projectId) params.append('projectId', projectId);
        if (path) params.append('path', path);
        if (searchQuery) params.append('search', searchQuery);
        if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
        params.append('limit', itemsPerPage.toString());
        params.append('skip', skip.toString());
        
        // Make API request to your backend
        const response = await fetch(`/api/media/list?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }
        
        const data = await response.json();
        
        setMedia(data.files);
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
        
        // Extract all unique tags from media
        setAvailableTags(extractUniqueTags(data.files));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedia();
  }, [clientId, projectId, path, currentPage, itemsPerPage, searchQuery, selectedTags]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle tag selection
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
    setCurrentPage(1); // Reset to first page on tag filter change
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of gallery
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Add a tag to a file
  const handleAddTag = async (fileId: string, tag: string) => {
    try {
      const response = await fetch('/api/media/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, tags: [tag] }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tag');
      }
      
      const { tags } = await response.json();
      
      // Update the file in local state
      setMedia(prevMedia =>
        prevMedia.map(item =>
          item.fileId === fileId ? { ...item, tags } : item
        )
      );
      
      // Update available tags
      if (!availableTags.includes(tag)) {
        setAvailableTags(prev => [...prev, tag].sort());
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      throw err;
    }
  };
  
  // Remove a tag from a file
  const handleRemoveTag = async (fileId: string, tag: string) => {
    try {
      const response = await fetch(`/api/media/tags?fileId=${fileId}&tag=${tag}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove tag');
      }
      
      const { tags } = await response.json();
      
      // Update the file in local state
      setMedia(prevMedia =>
        prevMedia.map(item =>
          item.fileId === fileId ? { ...item, tags } : item
        )
      );
      
      // Check if tag is still used in any files
      const isTagStillUsed = media.some(
        item => item.fileId !== fileId && item.tags?.includes(tag)
      );
      
      // If tag is no longer used, remove from available tags
      if (!isTagStillUsed) {
        setAvailableTags(prev => prev.filter(t => t !== tag));
        
        // Also remove from selected tags if it's there
        setSelectedTags(prev => prev.filter(t => t !== tag));
      }
    } catch (err) {
      console.error('Error removing tag:', err);
      throw err;
    }
  };
  
  // Generate AI tags for a file
  const handleGenerateAITags = async (fileId: string) => {
    try {
      const response = await fetch('/api/imagekit/ai-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI tags');
      }
      
      const { tags } = await response.json();
      
      // Fetch updated file details to get all tags
      const fileResponse = await fetch(`/api/media/list?fileId=${fileId}`);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch updated file details');
      }
      
      const { files } = await fileResponse.json();
      const updatedFile = files[0];
      
      if (updatedFile) {
        // Update the file in local state
        setMedia(prevMedia =>
          prevMedia.map(item =>
            item.fileId === fileId ? { ...item, tags: updatedFile.tags } : item
          )
        );
        
        // Update available tags
        const newTags = updatedFile.tags?.filter(tag => !availableTags.includes(tag)) || [];
        if (newTags.length > 0) {
          setAvailableTags(prev => [...prev, ...newTags].sort());
        }
      }
    } catch (err) {
      console.error('Error generating AI tags:', err);
      throw err;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">Media Gallery</h1>
      
      {/* Search and filters */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        <TagFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
        />
      </div>
      
      {/* Loading state */}
      {loading && media.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && media.length === 0 && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <h2 className="text-xl font-medium text-gray-600 mb-2">No media files found</h2>
          <p className="text-gray-500">
            {searchQuery || selectedTags.length > 0
              ? 'Try adjusting your search or filters'
              : 'Upload some files to get started'}
          </p>
        </div>
      )}
      
      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map(item => (
            <MediaItem
              key={item.fileId}
              item={item}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onGenerateAITags={handleGenerateAITags}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}