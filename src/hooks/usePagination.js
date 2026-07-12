import { useState } from 'react';

export const usePagination = (initialSize = 5) => {
  const [pageSize, setPageSize] = useState(initialSize);
  const [currentPage, setCurrentPage] = useState(1);

  return { 
    pageSize, 
    setPageSize, 
    currentPage, 
    setCurrentPage 
  };
};

export default usePagination;
