import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Coffee,
  Info,
  Timer,
  LogIn,
  LogOut,
} from "lucide-react";
import Modal from "../modal/Modal.jsx";
import { formatTime, formatDate } from "../../utils/formatTime.js";
import { cn } from "../../utils/cn.js";

const POLICY_EXPLANATIONS = {
  ON_TIME:
    "Check-in đúng giờ (≤ 08:30) và làm đủ ca ≥ 8.0 giờ -> Đạt 1.0 công trọn vẹn.",
  LATE_GRACE:
    "Check-in trong khung ân hạn (08:30 - 08:45) -> Vẫn tính trọn 1.0 công nhưng hệ thống ghi nhận 1 lần đi muộn.",
  LATE_PENALTY:
    "Đi muộn 15 - 60 phút (08:45 - 09:30) -> Trừ 0.25 công theo quy định, ghi nhận 0.75 công.",
  HALF_DAY:
    "Đi muộn sau 09:30 hoặc làm việc từ 4.0h đến < 8.0h -> Ghi nhận nửa công (0.5 công).",
  UNDER_HOURS:
    "Thời gian làm việc thực tế < 4.0 giờ -> Không đủ điều kiện tính công (0 công).",
  MISSING_CHECKOUT:
    "Có check-in nhưng không check-out khi hết ngày -> Tạm tính 0 công (Cần gửi đơn giải trình để Quản trị viên duyệt bù).",
  WEEKEND: "Ngày nghỉ cuối tuần theo quy chế công ty (Thứ Bảy / Chủ Nhật).",
  ABSENT: "Không có dữ liệu chấm công được ghi nhận cho ngày làm việc này.",
  IN_PROGRESS:
    "Ca làm việc đang diễn ra, số công sẽ được chốt sau khi chấm công ra (Check-out).",
};

export default function DayAttendanceDetailModal({
  isOpen,
  onClose,
  dayData,
  employee = null,
}) {
  if (!dayData) return null;

  // Lấy thứ trong tuần từ dateStr (YYYY-MM-DD)
  const dateObj = new Date(dayData.dateStr + "T00:00:00");
  const weekday = dateObj.toLocaleDateString("vi-VN", { weekday: "long" });
  const formattedDate = formatDate(dayData.dateStr);

  const status = dayData.status || {};
  const credit = dayData.credit ?? 0;
  const workMinutes = dayData.workMinutes || 0;
  const elapsedMinutes = dayData.elapsedMinutes || 0;
  const lunchDeduction = dayData.lunchDeduction || 0;
  const lateMinutes = dayData.lateMinutes || 0;

  const policyText =
    POLICY_EXPLANATIONS[status.key] ||
    "Thông tin chấm công được tính tự động theo quy chế hiện hành.";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={<CalendarDays className="w-5 h-5" />}
      title="Chi tiết chấm công ngày"
      description={`${weekday.charAt(0).toUpperCase() + weekday.slice(1)} • Ngày ${formattedDate}`}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-ink text-white font-medium text-xs hover:bg-charcoal active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          Đã hiểu & Đóng
        </button>
      }
    >
      <div className="space-y-4 text-xs">
        {/* 1. Thẻ thông tin nhân viên (nếu có) */}
        {employee && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {employee.fullName
                  ? employee.fullName
                      .split(" ")
                      .filter(Boolean)
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")
                  : "NV"}
              </div>
              <div>
                <span className="font-bold text-ink-deep block">
                  {employee.fullName || employee.username}
                </span>
                <span className="text-[11px] text-steel">
                  {employee.department ? `${employee.department} • ` : ""}
                  Mã NV: #{employee.id}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-charcoal px-2 py-0.5 rounded-md bg-surface border border-hairline">
              {employee.role || "Nhân viên"}
            </span>
          </div>
        )}

        {/* 2. Đánh giá trạng thái & Số công chốt */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-soft/80 border border-hairline-soft">
          <div>
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
              Kết quả đánh giá ngày
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "font-bold text-xs px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5",
                  status.badgeClass ||
                    "bg-surface-soft text-charcoal border-hairline",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    status.dotClass || "bg-stone",
                  )}
                />
                {status.label || "Chưa xác định"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
              Số công ghi nhận
            </span>
            <span
              className={cn(
                "text-lg font-extrabold font-mono tabular-nums block mt-0.5",
                credit > 0 ? "text-success" : "text-steel",
              )}
            >
              {credit > 0 ? `+${credit} công` : "0.0 công"}
            </span>
          </div>
        </div>

        {/* 3. Lưới thời gian Giờ vào / Giờ ra (Check-in / Check-out) */}
        <div className="p-4 rounded-2xl bg-surface-soft/60 border border-hairline-soft grid grid-cols-2 divide-x divide-hairline-soft">
          {/* Cột Giờ vào */}
          <div className="pr-3 space-y-1">
            <div className="flex items-center gap-1.5 text-stone font-bold text-[10px] uppercase tracking-wider">
              <LogIn className="w-3.5 h-3.5 text-primary" />
              <span>Giờ vào (Check-in)</span>
            </div>
            <div className="text-base font-bold font-mono text-ink-deep">
              {formatTime(dayData.checkInTime)}
            </div>
            {lateMinutes > 0 ? (
              <span className="text-[11px] text-attention font-semibold inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Trễ {lateMinutes}p (chuẩn 08:30)
              </span>
            ) : dayData.checkInTime ? (
              <span className="text-[11px] text-success font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Đúng giờ quy định
              </span>
            ) : (
              <span className="text-[11px] text-stone">Không có dữ liệu</span>
            )}
          </div>

          {/* Cột Giờ ra */}
          <div className="pl-3 space-y-1">
            <div className="flex items-center gap-1.5 text-stone font-bold text-[10px] uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5 text-ink-deep" />
              <span>Giờ ra (Check-out)</span>
            </div>
            <div className="text-base font-bold font-mono text-ink-deep">
              {formatTime(dayData.checkOutTime)}
            </div>
            {dayData.checkOutTime ? (
              <span className="text-[11px] text-steel">
                Tan ca chuẩn: 18:00
              </span>
            ) : dayData.checkInTime ? (
              <span className="text-[11px] text-critical font-medium inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Chưa chấm công ra
              </span>
            ) : (
              <span className="text-[11px] text-stone">Không có dữ liệu</span>
            )}
          </div>
        </div>

        {/* 4. Phân tích chi tiết thời gian làm việc */}
        {workMinutes > 0 && (
          <div className="p-3.5 rounded-xl bg-surface-soft/40 border border-hairline-soft space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-ink-deep text-xs">
              <Timer className="w-3.5 h-3.5 text-primary" />
              <span>Phân tích thời lượng làm việc:</span>
            </div>

            <div className="space-y-1.5 text-steel text-xs">
              <div className="flex justify-between items-center">
                <span>Tổng thời gian hiện diện:</span>
                <span className="font-mono font-medium text-ink">
                  {Math.floor(elapsedMinutes / 60)}h{" "}
                  {String(elapsedMinutes % 60).padStart(2, "0")}m
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-stone" />
                  Nghỉ trưa theo quy định (12:00 - 13:30):
                </span>
                <span className="font-mono text-stone font-medium">
                  - {lunchDeduction} phút
                </span>
              </div>

              <div className="pt-2 border-t border-hairline-soft flex justify-between items-center font-bold text-ink-deep">
                <span>Thời gian tính công thực tế:</span>
                <span className="font-mono text-primary text-sm font-extrabold">
                  {Math.floor(workMinutes / 60)}h{" "}
                  {String(workMinutes % 60).padStart(2, "0")}m
                  <span className="text-[10px] text-steel font-normal ml-1.5">
                    (chuẩn: 8.0h)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Ghi chú quy chế tính công */}
        <div className="p-3 rounded-xl bg-surface-soft border border-hairline-soft text-[11px] flex items-start gap-2.5 text-charcoal">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink-deep block">
              Quy tắc tính công áp dụng:
            </span>
            <p className="mt-0.5 text-steel leading-relaxed">{policyText}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
