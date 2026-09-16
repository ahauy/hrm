import { getWorkDuration } from "../../utils/formatTime";

export default function AttendanceBadge({
  hasCheckedIn,
  hasCheckedOut,
  todayAttendance,
}) {
  const duration = getWorkDuration(
    todayAttendance?.checkIn,
    todayAttendance?.checkOut,
  );

  // 1. Chưa chấm công
  if (!hasCheckedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-attention/10 text-[#a06800] border border-attention/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-attention" />
        Chưa chấm công
      </span>
    );
  }

  // 2. Đã chấm công (đang trong ca làm việc)
  if (!hasCheckedOut) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Đang làm việc
      </span>
    );
  }

  // 3. Làm đủ công (>= 8 tiếng)
  if (duration.isEnough8Hours) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-success/10 text-[#227c37] border border-success/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Làm đủ công
      </span>
    );
  }

  // 4. Làm thiếu công (< 8 tiếng)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-critical/10 text-critical border border-critical/30 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-critical" />
      Làm thiếu công
    </span>
  );
}
