import { getWorkDuration } from "@/utils/formatTime";

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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-800 border border-teal-500/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        Chưa chấm công
      </span>
    );
  }

  // 2. Đã chấm công (đang trong ca làm việc hoặc quá giờ chưa check-out)
  if (!hasCheckedOut) {
    const isPastShift = new Date().getHours() >= 18;
    if (isPastShift) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-700 border border-rose-500/40 shadow-2xs animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Chưa Check-out (Quá giờ)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Đang làm việc
      </span>
    );
  }

  // 3. Làm đủ công (>= 8 tiếng)
  if (duration.isEnough8Hours) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Làm đủ công
      </span>
    );
  }

  // 4. Làm thiếu công (< 8 tiếng)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-800 border border-fuchsia-500/30 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-600" />
      Làm thiếu công
    </span>
  );
}
