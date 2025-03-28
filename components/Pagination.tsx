interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
  }: PaginationProps) {
    if (totalPages <=interface PaginationProps {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
      }
      
      export default function Pagination({
        currentPage,
        totalPages,
        onPageChange,
      }: PaginationProps) {
        if (totalPages <= 1) {
          return null;
        }
        
        // Generate pagination links
        const getPageNumbers = () => {
          const pageNumbers = [];
          
          // Always show first page
          pageNumbers.push(1);
          
          // Add current page and surrounding pages
          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (pageNumbers.indexOf(i) === -1) {
              pageNumbers.push(i);
            }
          }
          
          // Always show last page
          if (totalPages > 1) {
            pageNumbers.push(totalPages);
          }
          
          // Add ellipsis where needed
          const result = [];
          let prev = 0;
          
          for (const page of pageNumbers) {
            if (page - prev > 1) {
              result.push(-1); // -1 represents ellipsis
            }
            result.push(page);
            prev = page;
          }
          
          return result;
        };
        
        return (
          <div className="flex justify-center items-center space-x-2 my-6">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              &laquo;
            </button>
            
            {getPageNumbers().map((page, index) => 
              page === -1 ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  &hellip;
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              &raquo;
            </button>
          </div>
        );
      }