import { Users } from "lucide-react";
import { cn } from "../../utils/cn.js";

/**
 * Component AttendanceKpiStrip
 * Cụm thẻ hiệu suất chuyên cần công ty & các thẻ ngoại lệ tương tác
 *
 * @param {Object} companySummary - Tổng hợp số liệu { totalStaff, avgUnitsPerStaff, totalLateIncidents, totalMissingCheckOut }
 * @param {number} standardWorkDays - Ngày công chuẩn
 * @param {string} activeTab - Tab đang lọc ('all' | 'late' | 'missing' | 'full')
 * @param {Function} onTabChange - Callback chuyển tab lọc
 * @param {number} fullComplianceCount - Số lượng nhân viên đạt chuẩn công
 */
export default function AttendanceKpiStrip({
  companySummary,
  standardWorkDays = 22,
  activeTab = "all",
  onTabChange,
  fullComplianceCount = 0,
}) {
  const complianceRate = Math.round(
    (companySummary.avgUnitsPerStaff / (standardWorkDays || 22)) * 100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Cột trái (4/12): Thẻ trọng tâm hiệu suất công ty */}
      <div className="lg:col-span-4 bg-canvas border border-hairline-soft rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-stone uppercase tracking-wider block">
              Hiệu suất chuyên cần toàn công ty
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-ink-deep font-mono tabular-nums">
                {companySummary.avgUnitsPerStaff}
              </span>
              <span className="text-xs font-semibold text-steel">
                / {standardWorkDays} công chuẩn TB
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-hairline-soft flex items-center justify-between text-xs">
          <span className="text-steel">
            Quy mô: <strong className="text-ink-deep">{companySummary.totalStaff} nhân viên</strong>
          </span>
          <span className="font-mono font-bold text-primary">
            {complianceRate}% đạt chuẩn
          </span>
        </div>
      </div>

      {/* Cột phải (8/12): Dải thẻ tương tác trực tiếp (Interactive Exception Strip) */}
      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {/* Thẻ 1: Lượt đi muộn */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTabChange(activeTab === "late" ? "all" : "late")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange(activeTab === "late" ? "all" : "late");
            }
          }}
          className={cn(
            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "late"
              ? "bg-amber-500/15 border-amber-500 shadow-xs ring-1 ring-amber-500"
              : "bg-canvas border-hairline-soft hover:border-amber-500/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Đi muộn
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-800 font-mono tabular-nums">
              {companySummary.totalLateIncidents}
            </span>
            <span className="text-[10px] text-steel block mt-0.5 truncate">
              {activeTab === "late" ? "Đang lọc" : "Lọc danh sách"}
            </span>
          </div>
        </div>

        {/* Thẻ 2: Quên Check-out */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTabChange(activeTab === "missing" ? "all" : "missing")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange(activeTab === "missing" ? "all" : "missing");
            }
          }}
          className={cn(
            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "missing"
              ? "bg-rose-500/15 border-rose-500 shadow-xs ring-1 ring-rose-500"
              : "bg-canvas border-hairline-soft hover:border-rose-500/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Thiếu Out
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-700 font-mono tabular-nums">
              {companySummary.totalMissingCheckOut}
            </span>
            <span className="text-[10px] text-steel block mt-0.5 truncate">
              {activeTab === "missing" ? "Đang lọc" : "Lọc danh sách"}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Thiếu giờ (< 4h) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTabChange(activeTab === "under_hours" ? "all" : "under_hours")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange(activeTab === "under_hours" ? "all" : "under_hours");
            }
          }}
          className={cn(
            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "under_hours"
              ? "bg-fuchsia-500/15 border-fuchsia-500 shadow-xs ring-1 ring-fuchsia-500"
              : "bg-canvas border-hairline-soft hover:border-fuchsia-500/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Thiếu giờ
            </span>
            <span className="w-2 h-2 rounded-full bg-fuchsia-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-fuchsia-800 font-mono tabular-nums">
              {companySummary.totalUnderHours || 0}
            </span>
            <span className="text-[10px] text-steel block mt-0.5 truncate">
              {activeTab === "under_hours" ? "Đang lọc" : "Lọc danh sách"}
            </span>
          </div>
        </div>

        {/* Thẻ 4: Vắng mặt */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTabChange(activeTab === "absent" ? "all" : "absent")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange(activeTab === "absent" ? "all" : "absent");
            }
          }}
          className={cn(
            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "absent"
              ? "bg-slate-200/60 border-slate-400 shadow-xs ring-1 ring-slate-400"
              : "bg-canvas border-hairline-soft hover:border-slate-400/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Vắng mặt
            </span>
            <span className="w-2 h-2 rounded-full bg-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-700 font-mono tabular-nums">
              {companySummary.totalAbsentDays || 0}
            </span>
            <span className="text-[10px] text-steel block mt-0.5 truncate">
              {activeTab === "absent" ? "Đang lọc" : "Lọc danh sách"}
            </span>
          </div>
        </div>

        {/* Thẻ 5: Đạt chuẩn công */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTabChange(activeTab === "full" ? "all" : "full")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange(activeTab === "full" ? "all" : "full");
            }
          }}
          className={cn(
            "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98] col-span-2 sm:col-span-1",
            activeTab === "full"
              ? "bg-emerald-500/15 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
              : "bg-canvas border-hairline-soft hover:border-emerald-500/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Đạt chuẩn
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {fullComplianceCount}
            </span>
            <span className="text-[10px] text-steel block mt-0.5 truncate">
              {activeTab === "full" ? "Đang lọc" : "Lọc danh sách"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
