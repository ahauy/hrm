import { Settings, Save, CheckCheck } from "lucide-react";

/**
 * Component StandardWorkDaysConfig
 * Cụm widget cấu hình ngày công chuẩn và nút hành động chốt tất cả
 */
export default function StandardWorkDaysConfig({
  standardDaysInput,
  onStandardDaysInputChange,
  onSaveStandardDays,
  isUpdatingSettings = false,
  unfinalizedCount = 0,
  onOpenBatchModal,
}) {
  return (
    <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-soft border border-hairline-soft flex items-center justify-center text-steel shrink-0">
          <Settings className="w-5 h-5 text-slate" />
        </div>
        <div>
          <span className="text-xs font-bold text-ink-deep block">
            Cấu hình ngày công chuẩn tháng
          </span>
          <span className="text-[11px] text-steel">
            Áp dụng làm mẫu số chia tính đơn giá lương ngày công cho toàn bộ nhân sự
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-surface-soft/60 border border-hairline-soft rounded-xl px-2.5 py-1 shadow-2xs">
          <label htmlFor="std-days-input" className="text-xs font-semibold text-slate whitespace-nowrap">
            Chuẩn:
          </label>
          <input
            id="std-days-input"
            type="number"
            min="1"
            max="31"
            value={standardDaysInput}
            onChange={(e) => onStandardDaysInputChange(e.target.value)}
            className="w-12 text-center text-xs font-bold font-mono bg-canvas border border-hairline rounded-lg py-1 text-ink focus:border-primary outline-none"
          />
          <span className="text-xs text-steel">ngày</span>
        </div>

        <button
          type="button"
          onClick={onSaveStandardDays}
          disabled={isUpdatingSettings}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-soft hover:bg-surface text-ink text-xs font-semibold border border-hairline shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          title="Lưu lại cấu hình ngày công chuẩn"
        >
          <Save className="w-3.5 h-3.5 text-steel" />
          <span>{isUpdatingSettings ? "Đang lưu..." : "Lưu"}</span>
        </button>

        {unfinalizedCount > 0 && (
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer ml-auto sm:ml-2"
            title="Chốt lương đồng loạt cho tất cả nhân sự chưa chốt"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Chốt tất cả ({unfinalizedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
