import { cn } from "../../utils/cn.js";

/**
 * Component StatusBadge dùng chung
 * Hiển thị huy hiệu trạng thái chuẩn (Đã duyệt, Từ chối, Chờ duyệt...)
 *
 * @param {string} status - Trạng thái chuỗi
 * @param {string} [label] - Nhãn hiển thị tùy biến
 * @param {string} [className] - Class tùy biến
 */
export default function StatusBadge({ status = "", label, className }) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved" || normalized === "success") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-success/10 text-[#227c37] border border-success/30 shadow-2xs select-none",
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span>{label || "Đã duyệt"}</span>
      </span>
    );
  }

  if (normalized === "rejected" || normalized === "critical" || normalized === "danger") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-critical/10 text-critical border border-critical/30 shadow-2xs select-none",
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-critical" />
        <span>{label || "Từ chối"}</span>
      </span>
    );
  }

  // Mặc định hoặc pending / waiting
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-attention/10 text-[#a06800] border border-attention/30 shadow-2xs select-none",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-attention" />
      <span>{label || "Chờ duyệt"}</span>
    </span>
  );
}
