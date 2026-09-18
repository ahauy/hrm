export function formatTime(isoString) {
  if (!isoString) return "--:--";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function getWorkDuration(checkIn, checkOut) {
  if (!checkIn) {
    return {
      totalMinutes: 0,
      hours: 0,
      minutes: 0,
      durationText: "0h 00m",
      isEnough8Hours: false,
      shortageText: "8h 00m",
      lunchDeduction: 0,
    };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = checkOut ? new Date(checkOut) : new Date();

  const diffMs = Math.max(0, checkOutDate.getTime() - checkInDate.getTime());
  const elapsedMinutes = Math.floor(diffMs / (1000 * 60));

  // Trừ 90 phút nghỉ trưa (12:00 - 13:30 = 720 - 810 phút trong ngày)
  const inMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
  const outMinutes = checkOutDate.getHours() * 60 + checkOutDate.getMinutes();
  const lunchOverlap = Math.max(
    0,
    Math.min(outMinutes, 810) - Math.max(inMinutes, 720)
  );

  const totalMinutes = Math.max(0, elapsedMinutes - lunchOverlap);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Chuẩn 8 tiếng = 480 phút
  const isEnough8Hours = totalMinutes >= 480;
  const durationText = `${hours}h ${String(minutes).padStart(2, "0")}m`;

  const shortageMinutes = Math.max(0, 480 - totalMinutes);
  const shortageH = Math.floor(shortageMinutes / 60);
  const shortageM = shortageMinutes % 60;
  const shortageText = `${shortageH}h ${String(shortageM).padStart(2, "0")}m`;

  return {
    totalMinutes,
    hours,
    minutes,
    durationText,
    isEnough8Hours,
    shortageText,
    lunchDeduction: lunchOverlap,
  };
}
