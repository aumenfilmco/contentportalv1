interface TagFilterProps {
    availableTags: string[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
  }
  
  export default function TagFilter({
    availableTags,
    selectedTags,
    onToggleTag,
  }: TagFilterProps) {
    if (availableTags.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Filter by Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  }