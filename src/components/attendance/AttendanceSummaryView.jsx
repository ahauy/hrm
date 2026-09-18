import { AlertCircle, Eye } from "lucide-react";
import { formatTime } from "../../utils/formatTime.js";
import { cn } from "../../utils/cn.js";

/**
 * Component AttendanceSummaryView
 * Chế độ hiển thị danh sách tổng hợp kèm dải nhật ký tháng mini trực quan
 */
export default function AttendanceSummaryView({
  employees = [],
  monthDayList = [],
  daysInSelectedMonth,
  selectedMonth,
  onSort,
  renderSortIcon,
  onSelectEmployee,
  onSelectDayModal,
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-hairline-soft bg-surface-soft/60 text-[11px] font-bold text-stone uppercase tracking-wider select-none">
            <th
              onClick={() => onSort("name")}
              className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center">
                <span>Nhân viên</span>
                {renderSortIcon("name")}
              </div>
            </th>
            <th
              onClick={() => onSort("department")}
              className="py-3.5 px-4 cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center">
                <span>Phòng ban & Vị trí</span>
                {renderSortIcon("department")}
              </div>
            </th>
            <th className="py-3.5 px-3 min-w-[240px]">
              <span>Nhật ký tháng ({daysInSelectedMonth} ngày)</span>
            </th>
            <th
              onClick={() => onSort("onTime")}
              className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center justify-center">
                <span>Đúng giờ (1.0)</span>
                {renderSortIcon("onTime")}
              </div>
            </th>
            <th
              onClick={() => onSort("late")}
              className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center justify-center">
                <span>Đi muộn</span>
                {renderSortIcon("late")}
              </div>
            </th>
            <th
              onClick={() => onSort("missing")}
              className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center justify-center">
                <span>Thiếu Out</span>
                {renderSortIcon("missing")}
              </div>
            </th>
            <th
              onClick={() => onSort("underHours")}
              className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center justify-center">
                <span>Thiếu giờ</span>
                {renderSortIcon("underHours")}
              </div>
            </th>
            <th
              onClick={() => onSort("absent")}
              className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center justify-center">
                <span>Vắng</span>
                {renderSortIcon("absent")}
              </div>
            </th>
            <th
              onClick={() => onSort("totalUnits")}
              className="py-3.5 px-4 cursor-pointer hover:text-ink transition-colors"
            >
              <div className="flex items-center">
                <span>Tổng công tháng</span>
                {renderSortIcon("totalUnits")}
              </div>
            </th>
            <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-hairline-soft text-xs">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-12 text-center text-stone">
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
              const ratio = Math.min(
                100,
                (stats.totalWorkUnits / (stats.standardWorkDays || 22)) * 100
              );

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className="hover:bg-surface-soft/50 transition-colors cursor-pointer group"
                >
                  {/* Cột 1: Thông tin nhân viên */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {emp.fullName
                          ? emp.fullName
                              .split(" ")
                              .filter(Boolean)
                              .slice(-2)
                              .map((n) => n[0])
                              .join("")
                          : emp.username?.slice(0, 2) || "NV"}
                      </div>
                      <div>
                        <div className="font-bold text-ink-deep group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{emp.fullName || emp.username}</span>
                          <span className="text-[10px] text-stone font-mono font-normal">
                            #{emp.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-steel">
                          {emp.email || emp.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Phòng ban & Chức vụ */}
                  <td className="py-3.5 px-4 text-steel">
                    <div className="font-semibold text-ink">
                      {emp.department || "Chưa phân bổ"}
                    </div>
                    <div className="text-[11px] text-stone">
                      {emp.position || emp.role || "Nhân viên"}
                    </div>
                  </td>

                  {/* Cột 3: Dải chấm công tháng trực quan */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-0.5 overflow-x-auto max-w-[260px] py-1">
                      {monthDayList.map((day) => {
                        const dayData = stats.daysMap?.[day.dateStr];
                        const status = dayData?.status;
                        const key = status?.key;

                        return (
                          <button
                            key={day.dateStr}
                            type="button"
                            disabled={day.isWeekend && !dayData?.checkInTime}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (dayData) {
                                onSelectDayModal({
                                  dayData,
                                  employee: emp,
                                });
                              }
                            }}
                            title={
                              dayData
                                ? `Ngày ${day.dayNumber}/${selectedMonth}: ${
                                    status?.label || ""
                                  } (${dayData.credit} công)\n• Vào: ${
                                    formatTime(dayData.checkInTime) || "--"
                                  }\n• Ra: ${
                                    formatTime(dayData.checkOutTime) ||
                                    (dayData.isMissingCheckout
                                      ? "Thiếu out"
                                      : "--")
                                  }`
                                : `Ngày ${day.dayNumber}/${selectedMonth}`
                            }
                            className={cn(
                              "w-2 h-5.5 rounded-[2px] transition-all select-none shrink-0",
                              key === "ON_TIME"
                                ? "bg-emerald-500 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "LATE_GRACE"
                                ? "bg-amber-500 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "LATE_PENALTY"
                                ? "bg-orange-500 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "HALF_DAY"
                                ? "bg-indigo-500 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "IN_PROGRESS"
                                ? "bg-blue-500 hover:scale-125 cursor-pointer animate-pulse"
                                : key === "MISSING_CHECKOUT"
                                ? "bg-rose-600 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "UNDER_HOURS"
                                ? "bg-fuchsia-600 hover:scale-125 cursor-pointer shadow-2xs"
                                : key === "ABSENT"
                                ? "bg-slate-400 hover:scale-125 cursor-pointer"
                                : key === "NOT_CHECKED_IN"
                                ? "bg-teal-500 hover:scale-125 cursor-pointer"
                                : day.isWeekend
                                ? "bg-surface-soft/60 cursor-default"
                                : "bg-surface-soft/30 cursor-default",
                              day.isToday && "ring-1 ring-blue-500 ring-offset-1"
                            )}
                          />
                        );
                      })}
                    </div>
                  </td>

                  {/* Cột 4: Đúng giờ */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 font-bold font-mono text-xs border border-emerald-500/20">
                      {stats.onTimeDays}
                    </span>
                  </td>

                  {/* Cột 5: Đi muộn */}
                  <td className="py-3.5 px-4 text-center">
                    {stats.lateDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 font-bold font-mono text-xs border border-amber-500/30">
                        {stats.lateDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono">0</span>
                    )}
                  </td>

                  {/* Cột 6: Thiếu check-out */}
                  <td className="py-3.5 px-4 text-center">
                    {stats.missingCheckOutDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 font-bold font-mono text-xs border border-rose-500/30">
                        {stats.missingCheckOutDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono">0</span>
                    )}
                  </td>

                  {/* Cột 7: Thiếu giờ (< 4h) */}
                  <td className="py-3.5 px-4 text-center">
                    {stats.underHoursDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-500/15 text-fuchsia-800 font-bold font-mono text-xs border border-fuchsia-500/30">
                        {stats.underHoursDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono">0</span>
                    )}
                  </td>

                  {/* Cột 8: Vắng mặt */}
                  <td className="py-3.5 px-4 text-center">
                    {stats.absentDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-bold font-mono text-xs border border-slate-300">
                        {stats.absentDays}
                      </span>
                    ) : (
                      <span className="text-stone font-mono">0</span>
                    )}
                  </td>

                  {/* Cột 7: Tổng công trong tháng */}
                  <td className="py-3.5 px-4 min-w-[170px]">
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="font-black text-sm text-ink-deep">
                        {stats.totalWorkUnits}
                      </span>
                      <span className="text-[11px] text-steel">
                        / {stats.standardWorkDays} công
                      </span>
                    </div>
                    <div className="mt-1.5 w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          ratio >= 100
                            ? "bg-success"
                            : ratio >= 80
                            ? "bg-primary"
                            : "bg-warning"
                        )}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </td>

                  {/* Cột 8: Thao tác */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(emp);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline hover:border-primary text-steel hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lịch</span>
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
