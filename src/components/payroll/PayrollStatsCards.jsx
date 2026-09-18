import {
  Users,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { cn } from "../../utils/cn.js";

/**
 * Component PayrollStatsCards
 * Hiển thị 4 thẻ KPI bảng lương và Banner cảnh báo phát sinh dữ liệu chấm công mới
 */
export default function PayrollStatsCards({
  stats,
  standardWorkDays = 22,
  onBatchRecalculate,
  isBatchRecalculating = false,
}) {
  const attendanceChangedCount = stats?.attendanceChangedList?.length || 0;

  return (
    <div className="space-y-4">
      {/* 4 Cards Thống kê Chỉ số Lương tháng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng nhân sự & Tiến độ chốt */}
        <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
              Tiến độ chốt lương
            </span>
            <Users className="w-4 h-4 text-steel" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-ink-deep font-mono">
              {stats.finalizedCount} / {stats.totalEmployees}
            </span>
            <span className="text-xs text-steel">nhân sự</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{
                  width: `${
                    stats.totalEmployees > 0
                      ? (stats.finalizedCount / stats.totalEmployees) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-primary font-mono">
              {stats.totalEmployees > 0
                ? Math.round((stats.finalizedCount / stats.totalEmployees) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Card 2: Tỷ lệ đủ ngày công chuẩn */}
        <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
              Tỷ lệ đủ ngày công
            </span>
            <UserCheck className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-success font-mono">
              {stats.enoughRate}%
            </span>
            <span className="text-xs text-steel font-medium">đạt chuẩn công</span>
          </div>
          <p className="text-[11px] text-stone mt-2.5">
            So sánh số ngày có chấm công với chuẩn {standardWorkDays} ngày
          </p>
        </div>

        {/* Card 3: Tổng quỹ lương đã chốt */}
        <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
              Đã chốt thực tế
            </span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-primary font-mono">
              {formatCurrency(stats.totalFinalizedBudget)}
            </span>
          </div>
          <p className="text-[11px] text-stone mt-2.5">
            Tổng số tiền đã chính thức chốt ({stats.finalizedCount} người)
          </p>
        </div>

        {/* Card 4: Tổng quỹ lương dự kiến */}
        <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
              Tổng quỹ dự kiến
            </span>
            <TrendingUp className="w-4 h-4 text-steel" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-ink-deep font-mono">
              {formatCurrency(stats.totalBudget)}
            </span>
          </div>
          <p className="text-[11px] text-stone mt-2.5">
            Bao gồm cả lương dự kiến của {stats.pendingCount} nhân sự chưa chốt
          </p>
        </div>
      </div>

      {/* Banner Cảnh báo khi có nhân sự phát sinh dữ liệu chấm công mới sau khi đã chốt */}
      {attendanceChangedCount > 0 && (
        <div className="bg-attention/10 border border-attention/35 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-attention/20 text-[#a06800] flex items-center justify-center shrink-0">
              <RefreshCw
                className="w-5 h-5 animate-spin text-attention"
                style={{ animationDuration: "3s" }}
              />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-ink-deep flex items-center gap-2">
                <span>
                  Phát hiện {attendanceChangedCount} nhân sự có dữ liệu chấm công mới sau khi đã chốt!
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-attention/25 text-[#a06800]">
                  Cần tính lại
                </span>
              </h4>
              <p className="text-xs text-steel mt-0.5">
                Hệ thống chấm công đã ghi nhận thêm số ngày công thực tế mới so với số công ghi nhận tại thời điểm chốt lương.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBatchRecalculate}
              disabled={isBatchRecalculating}
              className="px-4 py-2.5 rounded-xl bg-attention hover:bg-[#d9940c] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isBatchRecalculating && "animate-spin")} />
              <span>
                {isBatchRecalculating
                  ? "Đang tính lại..."
                  : `Chốt lại cả ${attendanceChangedCount} nhân sự`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
