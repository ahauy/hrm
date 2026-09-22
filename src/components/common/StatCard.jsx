import { cn } from "@/utils/cn";

/**
 * Component StatCard dùng chung
 * Hiển thị thẻ chỉ số / KPI chuẩn Meta Design System
 *
 * @param {string} title - Tiêu đề thẻ (viết hoa nhỏ)
 * @param {string|number} value - Giá trị chỉ số lớn
 * @param {ReactNode|string} [subtext] - Dòng giải thích/phụ chú bên dưới
 * @param {ReactNode} [icon] - Biểu tượng
 * @param {string} [iconBg] - Lớp màu nền/viền cho icon
 * @param {ReactNode} [badge] - Huy hiệu bổ trợ ở góc trên
 * @param {Function} [onClick] - Callback khi bấm vào thẻ (nếu thẻ tương tác)
 * @param {boolean} [isActive=false] - Trạng thái đang kích hoạt (active filter)
 * @param {string} [className] - Class tùy biến
 */
export default function StatCard({
  title,
  value,
  subtext,
  icon,
  iconBg = "bg-primary/10 text-primary border border-primary/20",
  badge,
  onClick,
  isActive = false,
  className,
}) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between select-none",
        isInteractive && "cursor-pointer active:scale-[0.98]",
        isActive
          ? "bg-primary/10 border-primary ring-1 ring-primary"
          : "bg-canvas border-hairline-soft hover:border-hairline",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-stone uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-ink-deep font-mono tabular-nums mt-1 tracking-tight truncate">
            {value}
          </div>
        </div>

        {badge && <div className="shrink-0">{badge}</div>}

        {!badge && icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base",
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-3 pt-2.5 border-t border-hairline-soft/60 text-xs text-steel">
          {subtext}
        </div>
      )}
    </div>
  );
}
