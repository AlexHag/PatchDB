import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  maxVisiblePages?: number;
  showInfo?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  disabled = false,
  maxVisiblePages = 5,
  showInfo = true,
  className = ''
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      // Show first pages
      for (let i = 1; i <= maxVisiblePages; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
      // Show last pages
      for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = currentPage - Math.floor(maxVisiblePages / 2);
      for (let i = start; i < start + maxVisiblePages; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`mt-4 ${className}`}>
      <nav aria-label="Pagination">
        <ul className="pagination justify-content-center">
          {/* Previous Button */}
          <li className={`page-item ${currentPage <= 1 || disabled ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || disabled}
              aria-label="Previous page"
            >
              Previous
            </button>
          </li>
          
          {/* First page + ellipsis if needed */}
          {pageNumbers[0] > 1 && (
            <>
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(1)}
                  disabled={disabled}
                >
                  1
                </button>
              </li>
              {pageNumbers[0] > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          
          {/* Page numbers */}
          {pageNumbers.map((pageNum) => (
            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            </li>
          ))}
          
          {/* Last page + ellipsis if needed */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(totalPages)}
                  disabled={disabled}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}
          
          {/* Next Button */}
          <li className={`page-item ${currentPage >= totalPages || disabled ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || disabled}
              aria-label="Next page"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Page info */}
      {showInfo && (
        <div className="text-center text-muted small">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
      )}
    </div>
  );
};
