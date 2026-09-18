import { AlertCircle, Eye } from "lucide-react";
import { formatTime } from "../../utils/formatTime.js";
import { cn } from "../../utils/cn.js";

/**
 * Component AttendanceMatrixView
 * Chế độ hiển thị ma trận 31 ngày công chi tiết với Sticky Column bên trái
 */
export default function AttendanceMatrixView({
  employees = [],
  monthDayList = [],
  selectedMonth,
  onSort,
  renderSortIcon,
  onSelectEmployee,
  onSelectDayModal,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1250px]">
        <thead>
          <tr className="border-b border-hairline-soft bg-surface-soft/70 text-[11px] font-bold text-stone uppercase select-none">
            {/* Cột nhân viên (Sticky Left) */}
            <th
              scope="col"
              onClick={() => onSort("name")}
              className="py-3 px-4 sticky left-0 z-20 bg-surface-soft/95 backdrop-blur-xs cursor-pointer hover:text-ink border-r border-hairline-soft min-w-[220px]"
            >
              <div className="flex items-center">
                <span>Nhân viên</span>
                {renderSortIcon("name")}
              </div>
            </th>

            {/* Các cột ngày trong tháng */}
            {monthDayList.map((day) => (
              <th
                key={day.dateStr}
                scope="col"
                className={cn(
                  "py-2 px-1 text-center font-mono min-w-[38px] border-r border-hairline-soft/40 transition-colors",
                  day.isWeekend && "bg-surface-soft/90 text-stone/80",
                  day.isToday && "bg-primary/10 text-primary font-bold"
                )}
              >
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-stone/80 tracking-tight">
                    {day.dayName}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold mt-0.5",
                      day.isToday
                        ? "text-primary"
                        : day.isWeekend
                        ? "text-stone/80"
                        : "text-ink-deep"
                    )}
                  >
                    {String(day.dayNumber).padStart(2, "0")}
                  </span>
                </div>
              </th>
            ))}

            {/* Các cột tổng hợp bên phải */}
            <th
              scope="col"
              onClick={() => onSort("totalUnits")}
              className="py-3 px-3 text-center cursor-pointer hover:text-ink min-w-[110px]"
            >
              <div className="flex items-center justify-center">
                <span>Tổng công</span>
                {renderSortIcon("totalUnits")}
              </div>
            </th>
            <th
              scope="col"
              onClick={() => onSort("onTime")}
              className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
            >
              <div className="flex items-center justify-center">
                <span>Đúng giờ</span>
                {renderSortIcon("onTime")}
              </div>
            </th>
            <th
              scope="col"
              onClick={() => onSort("late")}
              className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
            >
              <div className="flex items-center justify-center">
                <span>Muộn</span>
                {renderSortIcon("late")}
              </div>
            </th>
            <th
              scope="col"
              onClick={() => onSort("missing")}
              className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
            >
              <div className="flex items-center justify-center">
                <span>Thiếu Out</span>
                {renderSortIcon("missing")}
              </div>
            </th>
            <th scope="col" className="py-3 px-4 text-right min-w-[90px]">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-hairline-soft text-xs">
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={monthDayList.length + 6}
                className="py-12 text-center text-stone"
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone/60" />
                <p className="font-semibold text-ink-deep">
                  Không tìm thấy nhân viên phù hợp
                </p>
                <p className="text-xs text-steel mt-0.5">
                  Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.
                </p>
              </td>
            </tr>
          ) : (
            employees.map((emp) => {
              const stats = emp.stats;
              const daysMap = stats?.daysMap || {};

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-surface-soft/30 transition-colors group"
                >
                  {/* Cột thông tin nhân viên (Sticky Left) */}
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-canvas group-hover:bg-surface-soft/70 transition-colors border-r border-hairline-soft">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.fullName
                          ? emp.fullName
                              .split(" ")
                              .filter(Boolean)
                              .slice(-2)
                              .map((n) => n[0])
                              .join("")
                          : emp.username?.slice(0, 2) || "NV"}
                      </div>
                      <div className="min-w-0 max-w-[140px]">
                        <div className="font-bold text-ink-deep truncate">
                          {emp.fullName || emp.username}
                        </div>
                        <div className="text-[10px] text-stone truncate">
                          #{emp.id} • {emp.department || "Chưa phân bổ"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Các ô ngày trong tháng */}
                  {monthDayList.map((day) => {
                    const dayData = daysMap[day.dateStr];
                    const status = dayData?.status;
                    const key = status?.key;

                    return (
                      <td
                        key={day.dateStr}
                        className={cn(
                          "py-1 px-1 text-center border-r border-hairline-soft/30",
                          day.isWeekend && "bg-surface-soft/20",
                          day.isToday && "bg-primary/[0.04]"
                        )}
                      >
                        <button
                          type="button"
                          disabled={day.isWeekend && !dayData?.checkInTime}
                          onClick={() =>
                            dayData &&
                            onSelectDayModal({
                              dayData,
                              employee: emp,
                            })
                          }
                          title={
                            dayData
                              ? `Ngày ${day.dayNumber}/${selectedMonth}: ${
                                  status?.label || ""
                                } (${dayData.credit} công)\n• Check-in: ${
                                  formatTime(dayData.checkInTime) || "Chưa có"
                                }\n• Check-out: ${
                                  formatTime(dayData.checkOutTime) ||
                                  (dayData.isMissingCheckout
                                    ? "Thiếu check-out"
                                    : "Chưa có")
                                }\n(Bấm để xem chi tiết)`
                              : ""
                          }
                          className={cn(
                            "w-7.5 h-7.5 mx-auto rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all select-none",
                            key === "ON_TIME"
                              ? "bg-success/15 hover:bg-success/25 text-[#15692f] border border-success/30 cursor-pointer shadow-2xs"
                              : key === "LATE_GRACE"
                              ? "bg-attention/20 hover:bg-attention/30 text-[#8a5700] border border-attention/40 cursor-pointer shadow-2xs"
                              : key === "LATE_PENALTY"
                              ? "bg-warning/25 hover:bg-warning/35 text-[#914600] border border-warning/50 cursor-pointer shadow-2xs"
                              : key === "HALF_DAY"
                              ? "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 cursor-pointer shadow-2xs"
                              : key === "IN_PROGRESS"
                              ? "bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 cursor-pointer animate-pulse"
                              : key === "MISSING_CHECKOUT"
                              ? "bg-critical/15 hover:bg-critical/25 text-critical border border-critical/40 cursor-pointer shadow-2xs"
                              : key === "UNDER_HOURS"
                              ? "bg-critical/10 hover:bg-critical/20 text-critical border border-critical/30 cursor-pointer"
                              : key === "ABSENT"
                              ? "bg-surface-soft text-stone/70 border border-hairline-soft/40 cursor-pointer hover:bg-stone/15"
                              : key === "NOT_CHECKED_IN"
                              ? "bg-attention/10 text-attention border border-attention/30 cursor-pointer hover:bg-attention/20"
                              : day.isWeekend
                              ? "bg-surface-soft/40 text-stone/40 border border-transparent cursor-default"
                              : "bg-transparent text-stone/25 cursor-default"
                          )}
                        >
                          {key === "ON_TIME"
                            ? "1.0"
                            : key === "LATE_GRACE"
                            ? "1.0"
                            : key === "LATE_PENALTY"
                            ? "0.75"
                            : key === "HALF_DAY"
                            ? "0.5"
                            : key === "IN_PROGRESS"
                            ? "ĐL"
                            : key === "MISSING_CHECKOUT"
                            ? "!Out"
                            : key === "UNDER_HOURS"
                            ? "<4h"
                            : key === "ABSENT"
                            ? "-"
                            : key === "NOT_CHECKED_IN"
                            ? "Chưa"
                            : day.isWeekend
                            ? "CT"
                            : "•"}
                        </button>
                      </td>
                    );
                  })}

                  {/* Cột tổng hợp bên phải */}
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-ink-deep">
                    <span className="text-xs">{stats.totalWorkUnits}</span>
                    <span className="text-[10px] text-steel font-normal">
                      {" "}
                      / {stats.standardWorkDays}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-success/10 text-success font-bold font-mono text-[11px] border border-success/20">
                      {stats.onTimeDays}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {stats.lateDays > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-attention/15 text-attention font-bold font-mono text-[11px] border border-attention/30">
                        {stats.lateDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono text-[11px]">0</span>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {stats.missingCheckOutDays > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-critical/15 text-critical font-bold font-mono text-[11px] border border-critical/30">
                        {stats.missingCheckOutDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono text-[11px]">0</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      title="Xem toàn bộ lịch chấm công của nhân viên này"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hairline hover:border-primary text-steel hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lịch</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
