import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);

  const handlePageChange = useCallback(newPage => {
    setPage(newPage);
  }, []);

  return {
    page,
    handlePageChange,
  };
};

export default usePagination;
