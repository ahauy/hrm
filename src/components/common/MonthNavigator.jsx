import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "../../utils/cn.js";

/**
 * Component MonthNavigator dùng chung
 * Cụm điều hướng tháng (Tháng trước, hiển thị tháng, Tháng sau, nút Hôm nay, nút Làm mới)
 *
 * @param {string} formattedMonth - Chuỗi hiển thị tháng (vd: "Tháng 09 / 2026")
 * @param {Function} onPrev - Hàm lùi về tháng trước
 * @param {Function} onNext - Hàm tiến đến tháng sau
 * @param {Function} [onCurrent] - Hàm quay về tháng hiện tại
 * @param {boolean} [isCurrent=true] - Đang ở tháng hiện tại hay không
 * @param {Function} [onRefresh] - Hàm làm mới dữ liệu
 * @param {boolean} [isRefreshing=false] - Trạng thái đang làm mới
 * @param {ReactNode} [children] - Các nút tùy biến bổ sung (vd: Chuyển chế độ xem)
 * @param {string} [className] - Class tùy biến container
 */
export default function MonthNavigator({
  formattedMonth,
  onPrev,
  onNext,
  onCurrent,
  isCurrent = true,
  onRefresh,
  isRefreshing = false,
  children,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Tháng trước"
          className="p-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="px-4 py-1.5 rounded-xl border border-hairline bg-surface-soft/60 font-bold text-xs text-ink-deep min-w-[130px] text-center font-mono select-none shadow-2xs">
          {formattedMonth}
        </div>

        <button
          type="button"
          onClick={onNext}
          aria-label="Tháng sau"
          className="p-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer shadow-2xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!isCurrent && onCurrent && (
        <button
          type="button"
          onClick={onCurrent}
          className="text-xs font-semibold text-primary hover:text-primary-deep px-3 py-1.5 rounded-xl border border-primary/30 hover:bg-primary/5 transition-all cursor-pointer shadow-2xs"
        >
          Hôm nay
        </button>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu"
          className="p-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")} />
        </button>
      )}

      {children}
    </div>
  );
}
