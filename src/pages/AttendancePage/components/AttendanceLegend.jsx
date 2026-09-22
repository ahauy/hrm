/**
 * Component AttendanceLegend
 * Thanh chú thích quy chuẩn màu sắc trạng thái chấm công
 */
export default function AttendanceLegend() {
  return (
    <div className="pt-3 border-t border-hairline-soft flex flex-wrap items-center gap-x-5 gap-y-2 text-xs select-none">
      <span className="text-[11px] font-bold text-stone uppercase tracking-wider">
        Quy chuẩn màu sắc:
      </span>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
        <span className="text-ink font-medium">Đúng giờ (1.0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
        <span className="text-ink font-medium">Muộn ≤ 15p (1.0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
        <span className="text-ink font-medium">Muộn 15-60p (0.75)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />
        <span className="text-ink font-medium">Nửa công (0.5)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20 animate-pulse" />
        <span className="text-ink font-medium">Đang trong ca</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-500/20" />
        <span className="text-ink font-medium text-rose-700 font-semibold">Thiếu check-out (0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-600 ring-2 ring-fuchsia-500/20" />
        <span className="text-ink font-medium text-fuchsia-800">Thiếu giờ (&lt; 4h) (0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-500 ring-2 ring-slate-400/20" />
        <span className="text-ink font-medium">Vắng mặt</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-500/20" />
        <span className="text-ink font-medium">Chưa chấm công</span>
      </div>
    </div>
  );
}
