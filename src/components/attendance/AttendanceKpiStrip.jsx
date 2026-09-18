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
      {/* Cột trái (5/12): Thẻ trọng tâm hiệu suất công ty */}
      <div className="lg:col-span-5 bg-canvas border border-hairline-soft rounded-2xl p-5 shadow-xs flex flex-col justify-between">
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

      {/* Cột phải (7/12): Dải thẻ tương tác trực tiếp (Interactive Exception Strip) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "late"
              ? "bg-attention/15 border-attention shadow-xs ring-1 ring-attention"
              : "bg-canvas border-hairline-soft hover:border-attention/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Lượt đi muộn
            </span>
            <span className="w-2 h-2 rounded-full bg-attention" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-attention font-mono tabular-nums">
              {companySummary.totalLateIncidents}
            </span>
            <span className="text-[11px] text-steel block mt-0.5">
              {activeTab === "late" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
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
            "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "missing"
              ? "bg-critical/15 border-critical shadow-xs ring-1 ring-critical"
              : "bg-canvas border-hairline-soft hover:border-critical/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Quên Check-out
            </span>
            <span className="w-2 h-2 rounded-full bg-critical" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-critical font-mono tabular-nums">
              {companySummary.totalMissingCheckOut}
            </span>
            <span className="text-[11px] text-steel block mt-0.5">
              {activeTab === "missing" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Đạt chuẩn công */}
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
            "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
            activeTab === "full"
              ? "bg-success/15 border-success shadow-xs ring-1 ring-success"
              : "bg-canvas border-hairline-soft hover:border-success/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
              Đạt chuẩn công
            </span>
            <span className="w-2 h-2 rounded-full bg-success" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-success font-mono tabular-nums">
              {fullComplianceCount}
            </span>
            <span className="text-[11px] text-steel block mt-0.5">
              {activeTab === "full" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
