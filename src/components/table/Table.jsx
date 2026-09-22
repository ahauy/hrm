import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

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
  emptyAction,
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
        "bg-canvas border border-hairline-soft rounded-2xl shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Container cuộn ngang khi bảng rộng */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-surface-soft border-b border-hairline-soft">
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
                      "px-6 py-3.5 text-[11px] font-bold text-slate uppercase tracking-wider",
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
          <tbody className="divide-y divide-hairline-soft text-sm text-ink">
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-td-${cIdx}`} className="px-6 py-4">
                      <div className="h-4 bg-hairline-soft rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Actionable Empty State
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-6 py-12 text-center text-steel"
                >
                  <div className="flex flex-col items-center justify-center gap-3 max-w-xs mx-auto">
                    <div className="w-10 h-10 rounded-full bg-surface-soft border border-hairline-soft flex items-center justify-center text-stone">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-steel leading-relaxed">{emptyText}</span>
                    {emptyAction && (
                      <div className="pt-1">
                        {emptyAction}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className="hover:bg-surface-soft/60 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-hairline-soft bg-surface-soft/40 text-xs text-steel">
          <div>
            Trang{" "}
            <span className="font-semibold text-ink-deep">
              {pagination.currentPage || 1}
            </span>{" "}
            /{" "}
            <span className="font-semibold text-ink-deep">
              {pagination.totalPages || 1}
            </span>
            {pagination.totalItems !== undefined && (
              <span className="ml-1 text-stone">
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
              className="p-1.5 rounded-lg border border-hairline bg-canvas text-ink hover:bg-surface-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg border border-hairline bg-canvas text-ink hover:bg-surface-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
