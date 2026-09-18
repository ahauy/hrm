import { useState, useMemo } from "react";

/**
 * Custom Hook usePagination
 * Quản lý tính toán phân trang client-side tự động
 *
 * @param {Array} items - Danh sách phần tử cần phân trang
 * @param {number} pageSize - Số phần tử trên mỗi trang (mặc định: 8)
 * @param {number} initialPage - Trang khởi tạo (mặc định: 1)
 */
export function usePagination(items = [], pageSize = 8, initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Tự động điều chỉnh trang an toàn, không cần setState trong effect
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return items.slice(startIdx, startIdx + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const goToPage = (page) => {
    const p = Number(page);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const nextPage = () => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  const prevPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  return {
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
  };
}
