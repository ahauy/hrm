import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { attendanceServices } from "../services/attendanceServices";
import { getWorkDuration } from "@/utils/formatTime";

/**
 * Custom hook quản lý trạng thái chấm công hôm nay & các hành động Check-in / Check-out
 * Dùng chung cho cả AttendancePage và DashboardPage
 */
export function useAttendanceAction({
  attendances = [],
  setAttendances,
  currentUserId,
  isAdmin = false,
  onReload,
  isLoading = false,
  isRefreshing = false,
  isReloading = false,
}) {
  // 1. Đồng hồ thời gian thực
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Ngày hôm nay theo chuẩn YYYY-MM-DD
  const todayStr = new Date().toLocaleDateString("en-CA");

  // 3. Danh sách chấm công của chính người dùng hiện tại (nếu admin thì lọc theo id)
  const myAttendances = useMemo(() => {
    if (!isAdmin) return attendances;
    const uid = Number(currentUserId);
    return attendances.filter(
      (a) => Number(a.employeeId || a.employee_id) === uid
    );
  }, [attendances, isAdmin, currentUserId]);

  // 4. Bản ghi chấm công hôm nay của chính người dùng
  const todayAttendance = useMemo(() => {
    return (
      myAttendances
        .filter((a) => a.date === todayStr || a.date?.startsWith(todayStr))
        .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null
    );
  }, [myAttendances, todayStr]);

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isBusy = Boolean(isActionLoading || isLoading || isRefreshing || isReloading);

  // 5. Xử lý Chấm công vào (Check-in)
  const handleCheckIn = useCallback(async () => {
    if (isBusy) return;
    if (todayAttendance && hasCheckedIn) {
      if (hasCheckedOut) {
        toast.info("Hôm nay bạn đã hoàn thành ca làm việc và check-out.");
      }
      return;
    }
    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkIn();
      toast.success("Chấm công vào thành công!");

      if (res && res.id) {
        setAttendances?.((prev) => [res, ...prev]);
      } else if (onReload) {
        await onReload();
      }
    } catch (error) {
      console.error("Lỗi chấm công vào:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chấm công vào";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  }, [isBusy, todayAttendance, hasCheckedIn, hasCheckedOut, setAttendances, onReload]);

  // 6. Xử lý Chấm công ra (Check-out)
  const handleCheckOut = useCallback(async () => {
    if (isBusy) return;
    if (!todayAttendance || !hasCheckedIn || hasCheckedOut) return;

    const duration = getWorkDuration(todayAttendance.checkIn);
    if (!duration.isEnough8Hours) {
      const confirm = window.confirm(
        `Bạn chưa làm đủ 8 giờ công chuẩn (mới đạt ${duration.durationText} thực tế, còn thiếu ${duration.shortageText})! Bạn có chắc chắn muốn chấm công ra?`
      );
      if (!confirm) {
        return;
      }
    }

    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkOut();
      toast.success("Chấm công ra thành công!");

      if (res && res.id) {
        setAttendances?.((prev) =>
          prev.map((item) => (item.id === res.id ? res : item))
        );
      } else if (onReload) {
        await onReload();
      }
    } catch (error) {
      console.error("Lỗi chấm công ra:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chấm công ra";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  }, [isBusy, todayAttendance, hasCheckedIn, hasCheckedOut, setAttendances, onReload]);

  // Props tiện lợi để truyền nhanh vào component <Attendance />
  const attendanceProps = {
    currentTime,
    todayAttendance,
    hasCheckedIn,
    hasCheckedOut,
    isActionLoading,
    isLoading,
    isRefreshing,
    isReloading,
    handleCheckIn,
    handleCheckOut,
  };

  return {
    currentTime,
    todayAttendance,
    hasCheckedIn,
    hasCheckedOut,
    isActionLoading,
    isLoading,
    isRefreshing,
    isReloading,
    isBusy,
    handleCheckIn,
    handleCheckOut,
    myAttendances,
    todayStr,
    attendanceProps,
  };
}
