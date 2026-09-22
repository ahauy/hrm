import {
  CheckCircle2,
  CalendarDays,
  LogIn,
  LogOut,
  AlertCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatTime, getWorkDuration } from "@/utils/formatTime";
import { cn } from "@/utils/cn";

export default function Attendance({
  hasCheckedIn,
  currentTime,
  hasCheckedOut,
  todayAttendance,
  isActionLoading = false,
  isLoading = false,
  isRefreshing = false,
  isReloading = false,
  handleCheckIn,
  handleCheckOut,
}) {
  const isBusy = Boolean(
    isActionLoading || isLoading || isRefreshing || isReloading
  );
  const now = currentTime instanceof Date ? currentTime : new Date();

  const duration = getWorkDuration(
    todayAttendance?.checkIn,
    todayAttendance?.checkOut
  );

  // Cấu hình trạng thái
  let stateConfig = {
    iconBg: "bg-teal-500/10 text-teal-700 border-teal-500/30",
    Icon: AlertCircle,
    statusText: "Chưa chấm công",
    statusColor: "text-teal-700",
    description:
      "Ghi nhận giờ vào ca hôm nay để bắt đầu tính công làm việc.",
  };

  const isPastShift = now.getHours() >= 18;

  if (isBusy && !todayAttendance) {
    stateConfig = {
      iconBg: "bg-primary/10 text-primary border-primary/20",
      Icon: Clock,
      statusText: "Đang đồng bộ dữ liệu...",
      statusColor: "text-primary",
      description: "Đang kiểm tra trạng thái chấm công hôm nay của bạn...",
    };
  } else if (hasCheckedIn && !hasCheckedOut) {
    if (isPastShift) {
      stateConfig = {
        iconBg: "bg-rose-500/15 text-rose-700 border-rose-500/30",
        Icon: AlertTriangle,
        statusText: "Quá giờ chưa Check-out",
        statusColor: "text-rose-700 font-bold",
        description: `Bắt đầu lúc: ${formatTime(
          todayAttendance?.checkIn
        )} • Đã hết giờ ca chuẩn (18:00). Bạn chưa check-out, vui lòng bấm Chấm công ra ngay!`,
      };
    } else {
      stateConfig = {
        iconBg: "bg-blue-500/10 text-blue-700 border-blue-500/30",
        Icon: Clock,
        statusText: "Đang trong ca làm",
        statusColor: "text-blue-700 font-semibold",
        description: `Bắt đầu lúc: ${formatTime(
          todayAttendance?.checkIn
        )} • Ca làm việc đang diễn ra...`,
      };
    }
  } else if (hasCheckedIn && hasCheckedOut) {
    if (duration.isEnough8Hours) {
      stateConfig = {
        iconBg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
        Icon: CheckCircle2,
        statusText: "Làm đủ công",
        statusColor: "text-emerald-700 font-semibold",
        description: `Giờ vào: ${formatTime(
          todayAttendance?.checkIn
        )} • Giờ ra: ${formatTime(todayAttendance?.checkOut)}`,
      };
    } else {
      stateConfig = {
        iconBg: "bg-fuchsia-500/10 text-fuchsia-800 border-fuchsia-500/30",
        Icon: AlertTriangle,
        statusText: "Làm thiếu công",
        statusColor: "text-fuchsia-800 font-semibold",
        description: `Giờ vào: ${formatTime(
          todayAttendance?.checkIn
        )} • Giờ ra: ${formatTime(todayAttendance?.checkOut)}`,
      };
    }
  }

  const StateIcon = stateConfig.Icon;

  return (
    <div className="bg-canvas border border-hairline-soft rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Cột trái: Thông tin ngày & Đồng hồ thời gian thực */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stateConfig.iconBg}`}
          >
            <StateIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-steel">
              <CalendarDays className="w-3.5 h-3.5 text-stone" />
              <span>
                {now.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span className="text-hairline">•</span>
              <span className="font-mono text-ink-deep font-bold tabular-nums">
                {now.toLocaleTimeString("vi-VN")}
              </span>
            </div>

            <h3 className="text-base font-bold text-ink-deep mt-1">
              Trạng thái:{" "}
              <span className={`font-semibold ${stateConfig.statusColor}`}>
                {stateConfig.statusText}
              </span>
            </h3>

            <p className="text-xs text-steel mt-0.5">
              {stateConfig.description}
            </p>
          </div>
        </div>

        {/* Cột phải: Dữ liệu giờ ca làm phẳng (Flattened) và Nút thao tác */}
        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
          <div className="flex items-center gap-5 sm:gap-6">
            <div>
              <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
                Giờ vào ca
              </span>
              <span className="text-sm font-bold text-ink-deep font-mono tabular-nums mt-0.5 block">
                {formatTime(todayAttendance?.checkIn)}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-hairline-soft" aria-hidden="true" />

            <div>
              <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
                Giờ tan ca
              </span>
              <span className="text-sm font-bold text-ink-deep font-mono tabular-nums mt-0.5 block">
                {formatTime(todayAttendance?.checkOut)}
              </span>
            </div>
          </div>

          {/* Nút hành động với phản hồi xúc giác (Tactile feedback) */}
          {!hasCheckedIn ? (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep active:scale-[0.98] text-white font-medium text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {isActionLoading ? "Đang xử lý..." : "Đang kiểm tra..."}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Chấm công vào</span>
                </>
              )}
            </button>
          ) : !hasCheckedOut ? (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={isBusy}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                isPastShift
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse"
                  : "border-2 border-primary text-primary hover:bg-primary/5 active:scale-[0.98] shadow-2xs"
              )}
            >
              {isBusy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isActionLoading ? "Đang xử lý..." : "Đang kiểm tra..."}
                  </span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>
                    {isPastShift
                      ? "Chấm công ra ngay (Quá giờ)"
                      : "Chấm công ra (Check-out)"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {duration.isEnough8Hours ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-semibold border border-emerald-500/30 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã hoàn thành công</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-800 text-xs font-semibold border border-fuchsia-500/30 shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Thiếu giờ công</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
