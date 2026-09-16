import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Info,
  X,
} from "lucide-react";
import { formatTime, formatDate } from "../../utils/formatTime.js";
import { calculateMonthlyStats } from "../../utils/attendanceCalculator.js";
import { cn } from "../../utils/cn.js";

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
              <p className="text-xs text-steel mt-0.5">
                Ca chuẩn: 08:30 - 18:00 • Nghỉ trưa 90p (12:00 - 13:30) • Chuẩn 8h
              </p>
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
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-ink font-medium">Đúng giờ (1.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-attention" />
          <span className="text-ink font-medium">Muộn ≤ 15p (1.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-ink font-medium">Muộn 15-60p (0.75)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-ink font-medium">Nửa công / Muộn &gt; 60p (0.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-critical" />
          <span className="text-ink font-medium">Thiếu check-out (0 công)</span>
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

            return (
              <div
                key={cell.key}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDayDetail(data)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedDayDetail(data);
                  }
                }}
                className={cn(
                  "min-h-[90px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer group select-none relative",
                  isWeekend
                    ? "bg-surface-soft/40 border-hairline-soft/60 hover:border-hairline"
                    : "bg-canvas border-hairline-soft hover:border-primary/50 hover:shadow-xs",
                  isCurrentDay &&
                    "ring-2 ring-primary/40 border-primary shadow-xs",
                  data.checkInTime &&
                    cn(
                      "border-l-[3px]",
                      isCurrentDay
                        ? "border-l-primary"
                        : data.status.key === "ON_TIME"
                        ? "border-l-success"
                        : data.status.key === "LATE_GRACE"
                        ? "border-l-attention"
                        : data.status.key === "LATE_PENALTY"
                        ? "border-l-warning"
                        : data.isMissingCheckout
                        ? "border-l-critical"
                        : "border-l-primary"
                    )
                )}
              >
                {/* Dòng ngày & Badge số công */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                      isCurrentDay
                        ? "bg-primary text-white"
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
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md border font-mono",
                        statusConfig.badgeClass
                      )}
                    >
                      +{data.credit}
                    </span>
                  ) : data.isMissingCheckout ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-critical/15 text-critical border border-critical/30">
                      0 công
                    </span>
                  ) : null}
                </div>

                {/* Nội dung chi tiết trong ô ngày (Typography sạch, không lặp icon thừa) */}
                <div className="mt-1.5 flex-1 flex flex-col justify-end text-[11px]">
                  {data.checkInTime ? (
                    <div className="space-y-0.5">
                      <div className="font-mono tabular-nums text-[11px] font-bold text-ink-deep flex items-center justify-between">
                        <span>{formatTime(data.checkInTime)}</span>
                        <span className="text-stone/50 font-normal">→</span>
                        <span
                          className={cn(
                            data.isMissingCheckout
                              ? "text-critical font-bold"
                              : "text-steel font-medium"
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
                        <span className="truncate text-[10px] font-medium text-steel">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  ) : isWeekend ? (
                    <span className="text-[10px] text-stone font-medium italic">
                      Cuối tuần
                    </span>
                  ) : statusConfig.key === "ABSENT" ? (
                    <span className="text-[10px] text-critical/80 font-medium">
                      Vắng mặt
                    </span>
                  ) : statusConfig.key === "NOT_CHECKED_IN" ? (
                    <span className="text-[10px] text-attention font-medium">
                      Chưa chấm
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal Chi tiết một ngày (Khi bấm vào ô ngày bất kỳ) */}
      {selectedDayDetail && (
        <div
          className="fixed inset-0 z-50 bg-ink-deep/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div
            className="bg-canvas border border-hairline-soft rounded-2xl p-6 max-w-md w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Chi tiết */}
            <div className="flex items-start justify-between pb-4 border-b border-hairline-soft">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Chi tiết chấm công
                </span>
                <h3 className="text-lg font-bold text-ink-deep mt-0.5">
                  {formatDate(selectedDayDetail.dateStr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thân Modal */}
            <div className="py-4 space-y-3.5 text-xs">
              {/* Trạng thái & Số công */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-soft/60 border border-hairline-soft">
                <span className="text-steel font-medium">Đánh giá ngày:</span>
                <span
                  className={cn(
                    "font-bold px-2.5 py-1 rounded-lg border text-xs",
                    selectedDayDetail.status.badgeClass
                  )}
                >
                  {selectedDayDetail.status.label} (
                  {selectedDayDetail.credit > 0
                    ? `${selectedDayDetail.credit} công`
                    : "0 công"}
                  )
                </span>
              </div>

              {/* Bảng giờ vào/ra làm phẳng (Flattened layout - không lồng thẻ con) */}
              <div className="p-4 rounded-2xl bg-surface-soft/60 border border-hairline-soft grid grid-cols-2 divide-x divide-hairline-soft">
                <div className="pr-3">
                  <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
                    Giờ vào (Check-in)
                  </span>
                  <div className="mt-1 text-base font-bold font-mono text-ink-deep">
                    {formatTime(selectedDayDetail.checkInTime)}
                  </div>
                  {selectedDayDetail.lateMinutes > 0 ? (
                    <span className="text-[10px] text-attention font-semibold mt-1 block">
                      Trễ {selectedDayDetail.lateMinutes}p (chuẩn 08:30)
                    </span>
                  ) : (
                    <span className="text-[10px] text-success font-medium mt-1 block">
                      Đúng giờ quy định
                    </span>
                  )}
                </div>

                <div className="pl-3">
                  <span className="text-[10px] font-bold text-stone uppercase tracking-wider block">
                    Giờ ra (Check-out)
                  </span>
                  <div className="mt-1 text-base font-bold font-mono text-ink-deep">
                    {formatTime(selectedDayDetail.checkOutTime)}
                  </div>
                  <span className="text-[10px] text-steel mt-1 block">
                    Giờ tan ca chuẩn: 18:00
                  </span>
                </div>
              </div>

              {/* Thống kê giờ làm & Nghỉ trưa */}
              {selectedDayDetail.workMinutes > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-surface-soft/40 border border-hairline-soft">
                  <div className="flex justify-between text-steel">
                    <span>Thời gian hiện diện:</span>
                    <span className="font-mono font-medium text-ink">
                      {Math.floor((selectedDayDetail.elapsedMinutes || 0) / 60)}h{" "}
                      {String(
                        (selectedDayDetail.elapsedMinutes || 0) % 60
                      ).padStart(2, "0")}
                      m
                    </span>
                  </div>
                  <div className="flex justify-between text-steel">
                    <span>Nghỉ trưa theo quy chế (12:00 - 13:30):</span>
                    <span className="font-mono font-medium text-ink">
                      - {selectedDayDetail.lunchDeduction || 0} phút
                    </span>
                  </div>
                  <div className="pt-2 border-t border-hairline-soft flex justify-between font-bold text-ink-deep">
                    <span>Thời lượng tính công thực tế:</span>
                    <span className="font-mono text-primary text-sm">
                      {Math.floor(selectedDayDetail.workMinutes / 60)}h{" "}
                      {String(selectedDayDetail.workMinutes % 60).padStart(
                        2,
                        "0"
                      )}
                      m
                    </span>
                  </div>
                </div>
              )}

              {/* Ghi chú giải thích chính sách */}
              <div className="p-3 rounded-xl bg-attention/10 text-attention border border-attention/20 text-[11px] flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Quy tắc tính công:</span>
                  <p className="mt-0.5 text-ink/80">
                    {selectedDayDetail.status.key === "ON_TIME" &&
                      "Check-in đúng giờ (trước 08:30) và làm đủ công -> Nhận 1.0 công."}
                    {selectedDayDetail.status.key === "LATE_GRACE" &&
                      "Đi muộn trong hạn 15 phút (08:30 - 08:45) -> Vẫn được tính trọn 1.0 công nhưng ghi nhận vi phạm đi muộn."}
                    {selectedDayDetail.status.key === "LATE_PENALTY" &&
                      "Đi muộn từ 15 - 60 phút (08:45 - 09:30) -> Trừ 0.25 công, ghi nhận 0.75 công."}
                    {selectedDayDetail.status.key === "HALF_DAY" &&
                      "Đi muộn > 60 phút hoặc làm việc từ 4h đến < 8h -> Ghi nhận nửa công (0.5 công)."}
                    {selectedDayDetail.status.key === "MISSING_CHECKOUT" &&
                      "Quên chấm công ra khi hết ngày -> Tạm tính 0 công (Cần gửi đơn giải trình để Admin duyệt bù)."}
                    {selectedDayDetail.status.key === "WEEKEND" &&
                      "Ngày nghỉ cuối tuần (Thứ Bảy / Chủ Nhật)."}
                    {selectedDayDetail.status.key === "ABSENT" &&
                      "Không có dữ liệu chấm công cho ngày làm việc này."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-hairline-soft flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 rounded-xl bg-ink text-white font-medium text-xs hover:bg-charcoal active:scale-[0.98] transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
