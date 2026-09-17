import { CheckCircle2, AlertCircle, Clock, Check } from "lucide-react";
import { cn } from "../../utils/cn.js";

/**
 * Badge hiển thị trạng thái ngày công (Đủ công / Thiếu công)
 */
export function WorkDaysBadge({ actual = 0, standard = 26, className }) {
  const isEnough = Number(actual) >= Number(standard);

  if (isEnough) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-[#227c37] border border-success/30",
          className
        )}
      >
        <Check className="w-3 h-3" />
        <span>Đủ công</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-attention/10 text-[#a06800] border border-attention/30",
        className
      )}
    >
      <AlertCircle className="w-3 h-3" />
      <span>Thiếu công</span>
    </span>
  );
}

/**
 * Badge hiển thị trạng thái bảng lương (Đã chốt / Chưa chốt)
 */
export function PayrollStatusBadge({ isFinalized = false, className }) {
  if (isFinalized) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shadow-2xs",
          className
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Đã chốt lương</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-soft text-slate border border-hairline-soft shadow-2xs",
        className
      )}
    >
      <Clock className="w-3.5 h-3.5 text-stone" />
      <span>Chưa chốt</span>
    </span>
  );
}
