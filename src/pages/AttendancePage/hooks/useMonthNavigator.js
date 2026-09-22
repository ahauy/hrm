import { useState, useMemo, useCallback } from "react";

/**
 * Custom Hook useMonthNavigator
 * Quản lý trạng thái và thao tác chuyển đổi tháng/năm
 *
 * @param {number} [initialYear] - Năm khởi tạo (mặc định năm hiện tại)
 * @param {number} [initialMonth] - Tháng khởi tạo 1..12 (mặc định tháng hiện tại)
 */
export function useMonthNavigator(initialYear, initialMonth) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(() => initialYear || today.getFullYear());
  const [month, setMonth] = useState(() => initialMonth || today.getMonth() + 1);

  const monthStr = useMemo(() => {
    return `${year}-${String(month).padStart(2, "0")}`;
  }, [year, month]);

  const formattedMonth = useMemo(() => {
    return `Tháng ${String(month).padStart(2, "0")} / ${year}`;
  }, [year, month]);

  const isCurrentMonth = useMemo(() => {
    return year === today.getFullYear() && month === today.getMonth() + 1;
  }, [year, month, today]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const handlePrevMonth = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 1) {
        setYear((prevYear) => prevYear - 1);
        return 12;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 12) {
        setYear((prevYear) => prevYear + 1);
        return 1;
      }
      return prevMonth + 1;
    });
  }, []);

  const handleCurrentMonth = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, [today]);

  const setYearMonth = useCallback((newYear, newMonth) => {
    if (newYear) setYear(Number(newYear));
    if (newMonth) setMonth(Number(newMonth));
  }, []);

  const setMonthByStr = useCallback((str) => {
    if (typeof str === "string" && str.includes("-")) {
      const [y, m] = str.split("-");
      if (y && m) {
        setYear(parseInt(y, 10));
        setMonth(parseInt(m, 10));
      }
    }
  }, []);

  return {
    year,
    month,
    monthStr,
    formattedMonth,
    daysInMonth,
    isCurrentMonth,
    handlePrevMonth,
    handleNextMonth,
    handleCurrentMonth,
    setYearMonth,
    setMonthByStr,
  };
}
