import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PaginationButton = ({ children, onClick, disabled, active, variant = 'gray' }) => {
  const baseStyles = 'px-3 py-1 rounded-lg text-sm font-medium transition-colors';
  const variantStyles = {
    gray: {
      active: 'bg-primary text-white cursor-pointer',
      disabled: 'text-gray-400 cursor-not-allowed',
      default: 'text-gray-600 hover:bg-gray-100 cursor-pointer',
    },
    white: {
      active: 'bg-white text-primary shadow-md cursor-pointer',
      disabled: 'text-gray-400 cursor-not-allowed',
      default: 'text-white hover:bg-white/40 cursor-pointer',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${active ? styles.active : disabled ? styles.disabled : styles.default}`}>
      {children}
    </button>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, variant = 'gray' }) => {
  const { i18n } = useTranslation();

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <PaginationButton key="1" onClick={() => onPageChange(1)} variant={variant}>
          1
        </PaginationButton>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationButton key={i} onClick={() => onPageChange(i)} active={currentPage === i} variant={variant}>
          {i}
        </PaginationButton>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <PaginationButton key={totalPages} onClick={() => onPageChange(totalPages)} variant={variant}>
          {totalPages}
        </PaginationButton>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <PaginationButton onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} variant={variant}>
        {i18n.language === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </PaginationButton>
      {renderPagination()}
      <PaginationButton onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} variant={variant}>
        {i18n.language === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </PaginationButton>
    </div>
  );
};

export default Pagination;
