import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatTime } from "../../utils/formatTime.js";
import { calculateMonthlyStats } from "../../utils/attendanceCalculator.js";
import { cn } from "../../utils/cn.js";
import DayAttendanceDetailModal from "./DayAttendanceDetailModal.jsx";

const DAYS_OF_WEEK = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export default function AttendanceCalendar({
  attendances = [],
  employee = null,
  standardWorkDays = 22,
}) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth() + 1);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // Tính toán thống kê cho tháng đang chọn
  const monthStats = useMemo(() => {
    return calculateMonthlyStats(
      attendances,
      currentYear,
      currentMonth,
      standardWorkDays
    );
  }, [attendances, currentYear, currentMonth, standardWorkDays]);

  // Xử lý chuyển tháng
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Tính ngày đầu tiên của tháng rơi vào thứ mấy (0 = Sun, 1 = Mon,... 6 = Sat)
  // Quy đổi để Thứ 2 là cột 0, Chủ Nhật là cột 6
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const leadingOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Danh sách các ngày cần render
  const calendarCells = useMemo(() => {
    const cells = [];
    // Ô trống đệm đầu tháng
    for (let i = 0; i < leadingOffset; i++) {
      cells.push({ isPadding: true, key: `pad-prev-${i}` });
    }
    // Các ngày trong tháng
    for (let d = 1; d <= monthStats.daysInMonth; d++) {
      const dayPadded = String(d).padStart(2, "0");
      const monthPadded = String(currentMonth).padStart(2, "0");
      const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
      const dayData = monthStats.daysMap[dateStr];
      cells.push({
        isPadding: false,
        key: dateStr,
        dayNumber: d,
        dateStr,
        data: dayData,
      });
    }
    return cells;
  }, [leadingOffset, monthStats, currentYear, currentMonth]);

  const todayStr = today.toLocaleDateString("en-CA");

  return (
    <div className="bg-canvas border border-hairline-soft rounded-2xl shadow-xs overflow-hidden">
      {/* 1. Header Toolbar & Điều hướng tháng */}
      <div className="p-5 sm:p-6 border-b border-hairline-soft flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-soft/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-deep leading-tight">
                {employee
                  ? `Lịch chấm công: ${employee.fullName || employee.username}`
                  : "Lịch sử chấm công của tôi"}
              </h2>
            </div>
          </div>
        </div>

        {/* Cụm nút chuyển tháng */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
            className="p-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 rounded-xl border border-hairline bg-canvas font-bold text-sm text-ink-deep min-w-[150px] text-center shadow-2xs font-mono">
            Tháng {String(currentMonth).padStart(2, "0")} / {currentYear}
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Tháng sau"
            className="p-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {(currentYear !== today.getFullYear() ||
            currentMonth !== today.getMonth() + 1) && (
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="ml-1 text-xs font-semibold text-primary hover:text-primary-deep px-3 py-2 rounded-xl border border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
            >
              Hôm nay
            </button>
          )}
        </div>
      </div>

      {/* 2. Thẻ KPI Tóm tắt tháng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-hairline-soft border-b border-hairline-soft bg-canvas">
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-bold text-stone uppercase tracking-wider">
            Tổng số công tích lũy
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {monthStats.totalWorkUnits}
            </span>
            <span className="text-xs font-semibold text-steel">
              / {monthStats.standardWorkDays} công chuẩn
            </span>
          </div>
          <div className="mt-2 w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (monthStats.totalWorkUnits / (monthStats.standardWorkDays || 22)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            Ngày đúng giờ (1.0)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-success font-mono tabular-nums">
              {monthStats.onTimeDays}
            </span>
            <span className="text-xs text-steel font-medium">ngày</span>
          </div>
          <p className="text-[11px] text-stone mt-1">Check-in trước 08:30</p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-attention" />
            Lần đi muộn
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-attention font-mono tabular-nums">
              {monthStats.lateDays}
            </span>
            <span className="text-xs text-steel font-medium">lần</span>
          </div>
          <p className="text-[11px] text-stone mt-1">Gồm ân hạn & phạt trừ</p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-critical" />
            Thiếu Check-out
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-critical font-mono tabular-nums">
              {monthStats.missingCheckOutDays}
            </span>
            <span className="text-xs text-steel font-medium">ngày</span>
          </div>
          <p className="text-[11px] text-stone mt-1">Tính 0 công (Cần giải trình)</p>
        </div>
      </div>

      {/* 3. Dải chú thích trạng thái (Legend) */}
      <div className="px-5 py-3 bg-surface-soft/60 border-b border-hairline-soft flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="text-[11px] font-bold text-stone uppercase tracking-wider">
          Quy chuẩn:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success ring-2 ring-success/20" />
          <span className="text-ink font-medium">Đúng giờ (1.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-attention ring-2 ring-attention/20" />
          <span className="text-ink font-medium">Muộn ≤ 15p (1.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-warning/20" />
          <span className="text-ink font-medium">Muộn 15-60p (0.75)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
          <span className="text-ink font-medium">Nửa công / Muộn &gt; 60p (0.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 animate-pulse" />
          <span className="text-ink font-medium">Đang trong ca</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-critical ring-2 ring-critical/20" />
          <span className="text-ink font-medium">Thiếu check-out (0 công)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone ring-2 ring-stone/20" />
          <span className="text-ink font-medium">Vắng mặt</span>
        </div>
      </div>

      {/* 4. Lưới Lịch Calendar */}
      <div className="p-4 sm:p-6">
        {/* Header các ngày trong tuần */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {DAYS_OF_WEEK.map((dayName, idx) => (
            <div
              key={dayName}
              className={cn(
                "py-2 text-center text-xs font-bold uppercase tracking-wider",
                idx >= 5 ? "text-stone/80" : "text-steel"
              )}
            >
              <span className="hidden sm:inline">{dayName}</span>
              <span className="sm:hidden">{dayName.replace("Thứ ", "T")}</span>
            </div>
          ))}
        </div>

        {/* Các ô ngày trong tháng */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {calendarCells.map((cell) => {
            if (cell.isPadding) {
              return (
                <div
                  key={cell.key}
                  className="min-h-[90px] sm:min-h-[110px] rounded-xl bg-surface-soft/20 border border-hairline-soft/40 opacity-40"
                  aria-hidden="true"
                />
              );
            }

            const { dayNumber, dateStr, data } = cell;
            const isCurrentDay = dateStr === todayStr;
            const isWeekend = data.isWeekend;
            const statusConfig = data.status;

            // Xác định class nền và viền tùy theo tình huống chấm công
            const hasCheckIn = Boolean(data.checkInTime);

            return (
              <div
                key={cell.key}
                role={isWeekend ? undefined : "button"}
                tabIndex={isWeekend ? -1 : 0}
                onClick={
                  isWeekend ? undefined : () => setSelectedDayDetail(data)
                }
                onKeyDown={
                  isWeekend
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDayDetail(data);
                        }
                      }
                }
                className={cn(
                  "min-h-[90px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all select-none relative",
                  isWeekend
                    ? "bg-surface-soft/40 border-hairline-soft/40 cursor-default"
                    : hasCheckIn
                    ? cn(
                        statusConfig.bgClass || "bg-canvas",
                        statusConfig.borderClass || "border-hairline-soft",
                        "border-l-[3.5px]",
                        statusConfig.borderLeftClass || "border-l-primary",
                        "hover:shadow-xs cursor-pointer group"
                      )
                    : statusConfig.key === "ABSENT"
                    ? "bg-stone/[0.04] border-hairline-soft border-l-[3px] border-l-stone/40 hover:bg-stone/[0.08] cursor-pointer group"
                    : statusConfig.key === "NOT_CHECKED_IN"
                    ? "bg-attention/[0.04] border-attention/30 hover:bg-attention/[0.08] cursor-pointer group"
                    : "bg-canvas border-hairline-soft hover:border-hairline hover:shadow-xs cursor-pointer group",
                  isCurrentDay &&
                    "ring-2 ring-primary/70 border-primary/50 shadow-xs"
                )}
              >
                {/* Dòng ngày & Badge số công */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-transform group-hover:scale-105",
                      isCurrentDay
                        ? "bg-primary text-white shadow-2xs"
                        : isWeekend
                        ? "text-stone"
                        : "text-ink-deep"
                    )}
                  >
                    {dayNumber}
                  </span>

                  {data.credit > 0 ? (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md border font-mono shadow-2xs",
                        statusConfig.badgeClass
                      )}
                    >
                      +{data.credit}
                    </span>
                  ) : statusConfig.key === "IN_PROGRESS" ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30 font-mono shadow-2xs animate-pulse">
                      Đang làm
                    </span>
                  ) : data.isMissingCheckout ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-critical/15 text-critical border border-critical/30 font-mono shadow-2xs">
                      0 công
                    </span>
                  ) : statusConfig.key === "UNDER_HOURS" ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-critical/10 text-critical border border-critical/20 font-mono shadow-2xs">
                      0 công
                    </span>
                  ) : null}
                </div>

                {/* Nội dung chi tiết trong ô ngày (Typography sạch, màu sắc chuẩn theo tình huống) */}
                <div className="mt-1.5 flex-1 flex flex-col justify-end text-[11px]">
                  {data.checkInTime ? (
                    <div className="space-y-0.5">
                      <div className="font-mono tabular-nums text-[11px] font-bold text-ink-deep flex items-center justify-between">
                        <span
                          className={cn(
                            statusConfig.textColor || "text-ink-deep"
                          )}
                        >
                          {formatTime(data.checkInTime)}
                        </span>
                        <span className="text-stone/50 font-normal">→</span>
                        <span
                          className={cn(
                            data.isMissingCheckout
                              ? "text-critical font-bold"
                              : data.checkOutTime
                              ? "text-steel font-medium"
                              : "text-primary font-bold animate-pulse"
                          )}
                        >
                          {data.checkOutTime
                            ? formatTime(data.checkOutTime)
                            : data.isMissingCheckout
                            ? "Thiếu out"
                            : "Đang làm"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            statusConfig.dotClass
                          )}
                        />
                        <span
                          className={cn(
                            "truncate text-[10px] font-semibold",
                            statusConfig.textColor || "text-steel"
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  ) : isWeekend ? (
                    <span className="text-[10px] text-stone font-medium italic">
                      Cuối tuần
                    </span>
                  ) : statusConfig.key === "ABSENT" ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone shrink-0" />
                      <span className="text-[10px] text-stone font-medium">
                        Vắng mặt
                      </span>
                    </div>
                  ) : statusConfig.key === "NOT_CHECKED_IN" ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-attention shrink-0" />
                      <span className="text-[10px] text-attention font-medium">
                        Chưa chấm
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal Chi tiết một ngày (sử dụng DayAttendanceDetailModal & createPortal) */}
      <DayAttendanceDetailModal
        isOpen={Boolean(selectedDayDetail)}
        onClose={() => setSelectedDayDetail(null)}
        dayData={selectedDayDetail}
        employee={employee}
      />
    </div>
  );
}
