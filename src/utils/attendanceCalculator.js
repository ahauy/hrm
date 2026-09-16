/**
 * Quy chuẩn ca làm việc & Quy tắc tính công HRM:
 * - Giờ vào ca chuẩn: 08:30 (510 phút)
 * - Giờ tan ca chuẩn: 18:00 (1080 phút)
 * - Nghỉ trưa: 90 phút (12:00 - 13:30, 720 - 810 phút)
 * - Thời gian làm việc chuẩn: 8 tiếng (480 phút)
 * - Đi muộn <= 15 phút (08:30 - 08:45): 1.0 công (Ân hạn, ghi nhận vi phạm đi muộn)
 * - Đi muộn 15 - 60 phút (08:45 - 09:30): 0.75 công (Trừ 0.25 công)
 * - Đi muộn > 60 phút hoặc làm 4h - < 8h: 0.5 công
 * - Làm < 4h: 0 công
 * - Thiếu check-out (ngày trong quá khứ có check-in nhưng không check-out): 0 công
 * - Thứ 7, Chủ Nhật: Nghỉ cuối tuần
 */

export const SHIFT_CONFIG = {
  START_HOUR: 8,
  START_MINUTE: 30, // 08:30 (510 mins)
  END_HOUR: 18,
  END_MINUTE: 0, // 18:00 (1080 mins)
  GRACE_MINUTES: 15, // Đến 08:45
  LATE_PENALTY_THRESHOLD_MINUTES: 60, // Đến 09:30
  LUNCH_START_HOUR: 12,
  LUNCH_START_MINUTE: 0,
  LUNCH_END_HOUR: 13,
  LUNCH_END_MINUTE: 30,
  LUNCH_DURATION_MINUTES: 90, // 1.5 hours
  STANDARD_WORK_MINUTES: 480, // 8 hours
  HALF_DAY_MIN_MINUTES: 240, // 4 hours
};

export const ATTENDANCE_STATUS = {
  ON_TIME: {
    key: "ON_TIME",
    label: "Đúng giờ",
    credit: 1.0,
    creditText: "1.0 công",
    badgeClass: "bg-success/10 text-success border-success/30",
    dotClass: "bg-success",
  },
  LATE_GRACE: {
    key: "LATE_GRACE",
    label: "Đi muộn ≤ 15p",
    credit: 1.0,
    creditText: "1.0 công",
    badgeClass: "bg-attention/15 text-attention border-attention/40",
    dotClass: "bg-attention",
  },
  LATE_PENALTY: {
    key: "LATE_PENALTY",
    label: "Đi muộn > 15p",
    credit: 0.75,
    creditText: "0.75 công",
    badgeClass: "bg-warning/20 text-ink border-warning/50",
    dotClass: "bg-warning",
  },
  HALF_DAY: {
    key: "HALF_DAY",
    label: "Nửa công",
    credit: 0.5,
    creditText: "0.5 công",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    dotClass: "bg-primary",
  },
  UNDER_HOURS: {
    key: "UNDER_HOURS",
    label: "Không đủ công (< 4h)",
    credit: 0.0,
    creditText: "0 công",
    badgeClass: "bg-critical/10 text-critical border-critical/30",
    dotClass: "bg-critical",
  },
  MISSING_CHECKOUT: {
    key: "MISSING_CHECKOUT",
    label: "Thiếu check-out",
    credit: 0.0,
    creditText: "0 công",
    badgeClass: "bg-critical/15 text-critical font-medium border-critical/40",
    dotClass: "bg-critical-strong",
  },
  IN_PROGRESS: {
    key: "IN_PROGRESS",
    label: "Đang làm việc",
    credit: 0.0,
    creditText: "Đang tính",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    dotClass: "bg-primary",
  },
  WEEKEND: {
    key: "WEEKEND",
    label: "Nghỉ cuối tuần",
    credit: 0.0,
    creditText: "--",
    badgeClass: "bg-surface-soft text-stone border-hairline-soft",
    dotClass: "bg-hairline",
  },
  ABSENT: {
    key: "ABSENT",
    label: "Vắng mặt",
    credit: 0.0,
    creditText: "0 công",
    badgeClass: "bg-stone/10 text-steel border-stone/30",
    dotClass: "bg-stone",
  },
  FUTURE: {
    key: "FUTURE",
    label: "Chưa tới ngày",
    credit: 0.0,
    creditText: "--",
    badgeClass: "bg-transparent text-stone/60 border-hairline-soft/50",
    dotClass: "bg-hairline-soft",
  },
  NOT_CHECKED_IN: {
    key: "NOT_CHECKED_IN",
    label: "Chưa chấm công",
    credit: 0.0,
    creditText: "--",
    badgeClass: "bg-attention/10 text-attention border-attention/30",
    dotClass: "bg-attention",
  },
};

/**
 * Trả về phút tính từ 00:00 của một đối tượng Date
 */
function getDayMinutes(dateObj) {
  return dateObj.getHours() * 60 + dateObj.getMinutes() + dateObj.getSeconds() / 60;
}

/**
 * Tính số phút nghỉ trưa trùng khớp giữa [in, out] và [12:00, 13:30]
 */
function getLunchOverlapMinutes(inDate, outDate) {
  const inMinutes = getDayMinutes(inDate);
  const outMinutes = getDayMinutes(outDate);

  const lunchStart = 12 * 60; // 720 mins
  const lunchEnd = 13 * 60 + 30; // 810 mins

  const overlapStart = Math.max(inMinutes, lunchStart);
  const overlapEnd = Math.min(outMinutes, lunchEnd);

  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Đánh giá chi tiết 1 ngày chấm công
 * @param {Object|null} record - Bản ghi chấm công từ API { id, date, checkIn, checkOut, ... }
 * @param {string} dateStr - YYYY-MM-DD
 * @param {Date} [now] - Thời gian hiện tại
 */
export function evaluateDayAttendance(record, dateStr, now = new Date()) {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const todayStr = now.toLocaleDateString("en-CA");
  const isToday = dateStr === todayStr;
  const isFuture = dateStr > todayStr;

  // Nếu không có record chấm công
  if (!record || !record.checkIn) {
    if (isWeekend) {
      return {
        dateStr,
        record: null,
        status: ATTENDANCE_STATUS.WEEKEND,
        credit: 0,
        isLate: false,
        isWeekend: true,
        isMissingCheckout: false,
        workMinutes: 0,
        lateMinutes: 0,
        checkInTime: null,
        checkOutTime: null,
      };
    }
    if (isFuture) {
      return {
        dateStr,
        record: null,
        status: ATTENDANCE_STATUS.FUTURE,
        credit: 0,
        isLate: false,
        isWeekend: false,
        isMissingCheckout: false,
        workMinutes: 0,
        lateMinutes: 0,
        checkInTime: null,
        checkOutTime: null,
      };
    }
    if (isToday) {
      return {
        dateStr,
        record: null,
        status: ATTENDANCE_STATUS.NOT_CHECKED_IN,
        credit: 0,
        isLate: false,
        isWeekend: false,
        isMissingCheckout: false,
        workMinutes: 0,
        lateMinutes: 0,
        checkInTime: null,
        checkOutTime: null,
      };
    }
    // Ngày trong quá khứ là ngày làm việc nhưng không chấm công
    return {
      dateStr,
      record: null,
      status: ATTENDANCE_STATUS.ABSENT,
      credit: 0,
      isLate: false,
      isWeekend: false,
      isMissingCheckout: false,
      workMinutes: 0,
      lateMinutes: 0,
      checkInTime: null,
      checkOutTime: null,
    };
  }

  // Trường hợp CÓ record chấm công
  const checkInDate = new Date(record.checkIn);
  const checkInMinutes = getDayMinutes(checkInDate);
  const standardStartMinutes = SHIFT_CONFIG.START_HOUR * 60 + SHIFT_CONFIG.START_MINUTE; // 510
  const graceMinutes = standardStartMinutes + SHIFT_CONFIG.GRACE_MINUTES; // 525 (08:45)
  const latePenaltyMinutes = standardStartMinutes + SHIFT_CONFIG.LATE_PENALTY_THRESHOLD_MINUTES; // 570 (09:30)

  const lateMinutes = Math.max(0, Math.floor(checkInMinutes - standardStartMinutes));
  const isLate = lateMinutes > 0;

  // Chưa có Check-out
  if (!record.checkOut) {
    if (isToday) {
      return {
        dateStr,
        record,
        status: ATTENDANCE_STATUS.IN_PROGRESS,
        credit: 0,
        isLate,
        isWeekend,
        isMissingCheckout: false,
        workMinutes: 0,
        lateMinutes,
        checkInTime: record.checkIn,
        checkOutTime: null,
      };
    }
    // Quá khứ mà không check-out: Thiếu check-out (0 công)
    return {
      dateStr,
      record,
      status: ATTENDANCE_STATUS.MISSING_CHECKOUT,
      credit: 0,
      isLate,
      isWeekend,
      isMissingCheckout: true,
      workMinutes: 0,
      lateMinutes,
      checkInTime: record.checkIn,
      checkOutTime: null,
    };
  }

  // ĐÃ CÓ CẢ CHECK-IN VÀ CHECK-OUT
  const checkOutDate = new Date(record.checkOut);
  const elapsedMinutes = Math.max(
    0,
    Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60))
  );

  const lunchDeduction = getLunchOverlapMinutes(checkInDate, checkOutDate);
  const effectiveWorkMinutes = Math.max(0, elapsedMinutes - lunchDeduction);

  // 1. Nếu tổng thời gian làm việc < 4 tiếng (240 phút) -> Không đủ công (0 công)
  if (effectiveWorkMinutes < SHIFT_CONFIG.HALF_DAY_MIN_MINUTES) {
    return {
      dateStr,
      record,
      status: ATTENDANCE_STATUS.UNDER_HOURS,
      credit: ATTENDANCE_STATUS.UNDER_HOURS.credit,
      isLate,
      isWeekend,
      isMissingCheckout: false,
      workMinutes: effectiveWorkMinutes,
      elapsedMinutes,
      lunchDeduction,
      lateMinutes,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
    };
  }

  // 2. Đi muộn > 60 phút (sau 09:30) HOẶC làm từ 4h đến < 8h (240 đến < 450 phút)
  // Quy định: 0.5 công
  if (checkInMinutes > latePenaltyMinutes || effectiveWorkMinutes < 450) {
    return {
      dateStr,
      record,
      status: ATTENDANCE_STATUS.HALF_DAY,
      credit: ATTENDANCE_STATUS.HALF_DAY.credit,
      isLate: true,
      isWeekend,
      isMissingCheckout: false,
      workMinutes: effectiveWorkMinutes,
      elapsedMinutes,
      lunchDeduction,
      lateMinutes,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
    };
  }

  // 3. Đi muộn trong khoảng 15p - 60p (08:45 - 09:30): Trừ 0.25 công -> 0.75 công
  if (checkInMinutes > graceMinutes && checkInMinutes <= latePenaltyMinutes) {
    return {
      dateStr,
      record,
      status: ATTENDANCE_STATUS.LATE_PENALTY,
      credit: ATTENDANCE_STATUS.LATE_PENALTY.credit,
      isLate: true,
      isWeekend,
      isMissingCheckout: false,
      workMinutes: effectiveWorkMinutes,
      elapsedMinutes,
      lunchDeduction,
      lateMinutes,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
    };
  }

  // 4. Đi muộn trong khoảng ân hạn <= 15p (08:30 - 08:45): Vẫn tính trọn 1.0 công
  if (checkInMinutes > standardStartMinutes && checkInMinutes <= graceMinutes) {
    return {
      dateStr,
      record,
      status: ATTENDANCE_STATUS.LATE_GRACE,
      credit: ATTENDANCE_STATUS.LATE_GRACE.credit,
      isLate: true,
      isWeekend,
      isMissingCheckout: false,
      workMinutes: effectiveWorkMinutes,
      elapsedMinutes,
      lunchDeduction,
      lateMinutes,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
    };
  }

  // 5. Đến đúng giờ (trước hoặc đúng 08:30) và làm đủ công: 1.0 công
  return {
    dateStr,
    record,
    status: ATTENDANCE_STATUS.ON_TIME,
    credit: ATTENDANCE_STATUS.ON_TIME.credit,
    isLate: false,
    isWeekend,
    isMissingCheckout: false,
    workMinutes: effectiveWorkMinutes,
    elapsedMinutes,
    lunchDeduction,
    lateMinutes: 0,
    checkInTime: record.checkIn,
    checkOutTime: record.checkOut,
  };
}

/**
 * Tính toán toàn bộ thống kê tháng cho một nhân viên
 * @param {Array} attendances - Danh sách bản ghi chấm công của nhân viên
 * @param {number} year - Năm cần tính (e.g. 2026)
 * @param {number} month - Tháng cần tính 1-12 (e.g. 9)
 * @param {number} [standardWorkDaysConfig] - Cấu hình số ngày công chuẩn (mặc định 22)
 */
export function calculateMonthlyStats(attendances = [], year, month, standardWorkDaysConfig = 22) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthPadded = String(month).padStart(2, "0");

  // Gom các bản ghi theo ngày YYYY-MM-DD
  const recordMap = {};
  attendances.forEach((att) => {
    if (!att || !att.date) return;
    const key = att.date.slice(0, 10);
    // Nếu có nhiều record, ưu tiên bản ghi có ID lớn hơn
    if (!recordMap[key] || (att.id || 0) > (recordMap[key].id || 0)) {
      recordMap[key] = att;
    }
  });

  const daysMap = {};
  let totalWorkUnits = 0;
  let onTimeDays = 0;
  let lateDays = 0;
  let missingCheckOutDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let actualWorkWeekdays = 0;

  const now = new Date();

  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthPadded}-${dayPadded}`;
    const record = recordMap[dateStr] || null;

    const evaluated = evaluateDayAttendance(record, dateStr, now);
    daysMap[dateStr] = evaluated;

    if (!evaluated.isWeekend) {
      actualWorkWeekdays += 1;
    }

    if (evaluated.credit > 0) {
      totalWorkUnits += evaluated.credit;
    }

    if (evaluated.status.key === "ON_TIME") {
      onTimeDays += 1;
    } else if (evaluated.status.key === "LATE_GRACE" || evaluated.status.key === "LATE_PENALTY") {
      lateDays += 1;
    } else if (evaluated.status.key === "HALF_DAY") {
      halfDays += 1;
      if (evaluated.isLate) lateDays += 1;
    } else if (evaluated.status.key === "MISSING_CHECKOUT") {
      missingCheckOutDays += 1;
    } else if (evaluated.status.key === "ABSENT") {
      absentDays += 1;
    }
  }

  // Chuẩn hóa số công (làm tròn 2 chữ số thập phân)
  totalWorkUnits = Math.round(totalWorkUnits * 100) / 100;
  const standardWorkDays = standardWorkDaysConfig || actualWorkWeekdays || 22;

  return {
    year,
    month,
    daysInMonth,
    standardWorkDays,
    actualWorkWeekdays,
    totalWorkUnits,
    onTimeDays,
    lateDays,
    missingCheckOutDays,
    halfDays,
    absentDays,
    daysMap,
  };
}
