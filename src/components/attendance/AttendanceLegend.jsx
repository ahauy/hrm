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
        <span className="text-ink font-medium">Nửa công (0.5)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 animate-pulse" />
        <span className="text-ink font-medium">Đang trong ca</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-critical ring-2 ring-critical/20" />
        <span className="text-ink font-medium">Thiếu check-out (0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-stone ring-2 ring-stone/20" />
        <span className="text-ink font-medium">Vắng mặt</span>
      </div>
    </div>
  );
}
