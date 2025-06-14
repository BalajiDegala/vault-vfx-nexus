
import PostCategories from './PostCategories';

interface CommunityFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  hashtagFilter: string | null;
  onClearFilters: () => void;
}

const CommunityFilters = ({ 
  selectedCategory, 
  onCategoryChange, 
  hashtagFilter, 
  onClearFilters 
}: CommunityFiltersProps) => {
  return (
    <div className="space-y-4">
      <PostCategories 
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
      
      {(hashtagFilter || selectedCategory !== 'all') && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {hashtagFilter && (
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
              #{hashtagFilter}
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
              {selectedCategory}
            </span>
          )}
          <button 
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityFilters;
