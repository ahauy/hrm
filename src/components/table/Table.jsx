import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Generic Table Component
 *
 * @param {Array<Object>} columns - Danh sách cấu hình các cột:
 *   - header: string | ReactNode (Tiêu đề cột)
 *   - accessor: string (Key lấy dữ liệu từ row, vd: 'fullName')
 *   - align: 'left' | 'center' | 'right' (Mặc định: 'left')
 *   - className: string (Class tùy biến cho cột)
 *   - render: (value, row, index) => ReactNode (Hàm tùy biến nội dung ô)
 * @param {Array<Object>} data - Mảng dữ liệu hiển thị
 * @param {string|function} rowKey - Trường duy nhất làm key (mặc định 'id') hoặc hàm (row, index) => string
 * @param {boolean} isLoading - Trạng thái loading
 * @param {string} emptyText - Thông báo khi không có dữ liệu
 * @param {Object} pagination - Thông tin phân trang (tùy chọn)
 *   - currentPage: number
 *   - totalPages: number
 *   - totalItems: number
 *   - onPageChange: (newPage: number) => void
 * @param {string} className - Class tùy biến cho container bảng
 */
export default function Table({
  columns = [],
  data = [],
  rowKey = "id",
  isLoading = false,
  emptyText = "Không có dữ liệu",
  pagination,
  className,
}) {
  // Lấy key duy nhất cho mỗi dòng
  const getRowKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row?.[rowKey] ?? index;
  };

  return (
    <div
      className={cn(
        "bg-white border border-neutral-100 rounded-2xl shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Container cuộn ngang khi bảng rộng */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-100">
              {columns.map((col, idx) => {
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";

                return (
                  <th
                    key={col.accessor || idx}
                    className={cn(
                      "px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider",
                      alignClass,
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-td-${cIdx}`} className="px-6 py-4">
                      <div className="h-4 bg-neutral-200/70 rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-6 py-12 text-center text-neutral-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 stroke-1 text-neutral-300" />
                    <span className="text-sm font-medium">{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className="hover:bg-neutral-50/70 transition-colors"
                >
                  {columns.map((col, colIndex) => {
                    const value = col.accessor ? row[col.accessor] : undefined;
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";

                    return (
                      <td
                        key={col.accessor || colIndex}
                        className={cn(
                          "px-6 py-4 whitespace-nowrap",
                          alignClass,
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(value, row, rowIndex)
                          : (value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/40 text-xs text-neutral-500">
          <div>
            Trang{" "}
            <span className="font-semibold text-neutral-800">
              {pagination.currentPage || 1}
            </span>{" "}
            /{" "}
            <span className="font-semibold text-neutral-800">
              {pagination.totalPages || 1}
            </span>
            {pagination.totalItems !== undefined && (
              <span className="ml-1 text-neutral-400">
                ({pagination.totalItems} kết quả)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                pagination.onPageChange?.(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage <= 1}
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                pagination.onPageChange?.(pagination.currentPage + 1)
              }
              disabled={
                pagination.currentPage >= (pagination.totalPages || 1)
              }
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Trang kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
