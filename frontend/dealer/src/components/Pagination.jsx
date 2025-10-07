import { useState, useMemo } from 'react'

const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 10, 
  onPageChange = () => {},
  showFirstLast = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = ''
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    if (!showPageNumbers || totalPages <= 1) return []

    const pages = []
    const halfRange = Math.floor(maxPageNumbers / 2)
    
    let startPage = Math.max(1, currentPage - halfRange)
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1)
    }
    
    // Add ellipsis and first page if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }, [currentPage, totalPages, maxPageNumbers, showPageNumbers])

  // Don't render if there's only one page or no items
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const ButtonBase = ({ onClick, disabled, children, isActive = false, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center min-w-[40px] h-10 px-3 text-sm font-medium
        border border-slate-200 dark:border-slate-600
        transition-all duration-200
        ${disabled 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
          : isActive
          ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        }
        focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500/50
        active:scale-95
      `}
      {...props}
    >
      {children}
    </button>
  )

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items info */}
      <div className="text-sm text-slate-600 dark:text-slate-400 order-2 sm:order-1">
        Hiển thị <span className="font-semibold text-slate-900 dark:text-slate-100">{startItem}</span> đến{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-100">{endItem}</span> của{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</span> kết quả
      </div>

      {/* Pagination controls */}
      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination Navigation">
        {/* First page button */}
        {showFirstLast && (
          <ButtonBase
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            aria-label="Chuyển đến trang đầu tiên"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </ButtonBase>
        )}

        {/* Previous page button */}
        <ButtonBase
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
          aria-label="Chuyển đến trang trước"
          className="rounded-l-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline ml-1">Trước</span>
        </ButtonBase>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center">
            {visiblePages.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="inline-flex items-center justify-center min-w-[40px] h-10 px-3 text-slate-500 dark:text-slate-400">
                    ...
                  </span>
                ) : (
                  <ButtonBase
                    onClick={() => handlePageChange(page)}
                    isActive={page === currentPage}
                    title={`Trang ${page}`}
                    aria-label={`Chuyển đến trang ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </ButtonBase>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Next page button */}
        <ButtonBase
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang sau"
          aria-label="Chuyển đến trang sau"
          className="rounded-r-lg"
        >
          <span className="hidden sm:inline mr-1">Sau</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </ButtonBase>

        {/* Last page button */}
        {showFirstLast && (
          <ButtonBase
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Trang cuối"
            aria-label="Chuyển đến trang cuối cùng"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </ButtonBase>
        )}
      </nav>

      {/* Mobile page info */}
      <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden order-3">
        Trang {currentPage} / {totalPages}
      </div>
    </div>
  )
}

// Hook for pagination logic
export const usePagination = (items = [], itemsPerPage = 10, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Reset to first page when items change
  useState(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalItems])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of container when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)

  return {
    currentPage,
    totalPages,
    totalItems,
    currentItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setCurrentPage
  }
}

// Simple pagination component for basic use cases
export const SimplePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
        aria-label="Trang trước"
      >
        ←
      </button>
      
      <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">
        {currentPage} / {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
        aria-label="Trang sau"
      >
        →
      </button>
    </div>
  )
}

export default Pagination