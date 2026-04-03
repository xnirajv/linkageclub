import { useCallback, useMemo, useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage || 1);
  const [limit, setLimit] = useState(options.initialLimit || 10);
  const total = options.total || 0;

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const nextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.min(Math.max(newPage, 1), totalPages));
  }, [totalPages]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  };
}