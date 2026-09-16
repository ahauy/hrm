import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import Attendance from "../components/attendance/Attendance.jsx";
import AttendanceCalendar from "../components/attendance/AttendanceCalendar.jsx";
import AdminAttendanceTable from "../components/attendance/AdminAttendanceTable.jsx";
import EmployeeAttendanceModal from "../components/attendance/EmployeeAttendanceModal.jsx";
import { attendanceServices } from "../services/attendanceServices.js";
import { employeeServices } from "../services/employeeServices.js";
import { settingsServices } from "../services/settingsServices.js";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  RefreshCw,
  Info,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../utils/cn.js";

export default function AttendancePage() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes("admin");
  const isEmployee = role.includes("employee");

  // Dữ liệu chung
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [standardWorkDays, setStandardWorkDays] = useState(22);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Tab chuyển đổi dành cho Quản trị viên (Admin): 'employees' | 'personal'
  const [adminViewMode, setAdminViewMode] = useState("employees");

  // Modal xem lịch sử chấm công của nhân viên được chọn (dành cho Admin)
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] =
    useState(null);

  // Modal xem quy chế ca làm việc & ân hạn đi muộn
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Đóng policy modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showPolicyModal) {
        setShowPolicyModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPolicyModal]);

  // Đồng hồ chạy thời gian thực cho khối chấm công
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ngày hôm nay theo chuẩn YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  // Tải dữ liệu từ API
  const fetchData = useCallback(async () => {
    try {
      // 1. Tải danh sách điểm danh (nếu admin: toàn bộ; nếu employee: của chính mình)
      const attPromise = attendanceServices.getAttendance();

      // 2. Tải cấu hình ngày công chuẩn
      const settingsPromise = settingsServices
        .getSettings()
        .catch(() => ({ standardWorkDays: 22 }));

      // 3. Nếu là admin, tải thêm danh sách nhân viên
      const empPromise = isAdmin
        ? employeeServices.getEmployees().catch(() => [])
        : Promise.resolve([]);

      const [attData, settingsData, empData] = await Promise.all([
        attPromise,
        settingsPromise,
        empPromise,
      ]);

      setAttendances(Array.isArray(attData) ? attData : []);
      if (settingsData && settingsData.standardWorkDays) {
        setStandardWorkDays(Number(settingsData.standardWorkDays) || 22);
      }
      if (Array.isArray(empData)) {
        setEmployees(empData);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chấm công:", error);
      toast.error("Không thể tải thông tin chấm công");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      if (!isAdmin && !isEmployee) {
        if (isMounted) setIsLoading(false);
        return;
      }
      await fetchData();
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isEmployee, fetchData]);

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success("Đã làm mới dữ liệu chấm công");
  };

  // Dữ liệu chấm công của cá nhân (dành cho khối Chấm công vào/ra & Calendar của chính mình)
  const myAttendances = useMemo(() => {
    if (!isAdmin) return attendances;
    // Nếu là admin, lọc riêng các bản ghi của chính tài khoản admin đang đăng nhập
    const currentUserId = Number(profile?.id);
    return attendances.filter(
      (a) => Number(a.employeeId || a.employee_id) === currentUserId
    );
  }, [attendances, isAdmin, profile?.id]);

  // Bản ghi chấm công hôm nay của chính người dùng đang đăng nhập
  const todayAttendance = useMemo(() => {
    return (
      myAttendances
        .filter((a) => a.date === todayStr || a.date?.startsWith(todayStr))
        .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null
    );
  }, [myAttendances, todayStr]);

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  // Xử lý Chấm công vào (Check-in)
  const handleCheckIn = async () => {
    if (todayAttendance && hasCheckedIn) return;
    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkIn();
      toast.success("Chấm công vào thành công!");

      if (res && res.id) {
        setAttendances((prev) => [res, ...prev]);
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error("Lỗi chấm công vào:", error);
      const msg = error.response?.data?.message || "Không thể chấm công vào";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Xử lý Chấm công ra (Check-out)
  const handleCheckOut = async () => {
    if (!todayAttendance || !hasCheckedIn || hasCheckedOut) return;
    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkOut();
      toast.success("Chấm công ra thành công!");

      if (res && res.id) {
        setAttendances((prev) =>
          prev.map((item) => (item.id === res.id ? res : item))
        );
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error("Lỗi chấm công ra:", error);
      const msg = error.response?.data?.message || "Không thể chấm công ra";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Kiểm tra quyền truy cập
  if (!isLoading && !isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Tiêu đề trang & Thanh điều khiển */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-deep tracking-tight">
              {isAdmin && adminViewMode === "employees"
                ? "Quản lý chấm công nhân viên"
                : "Bảng chấm công cá nhân"}
            </h1>
            {isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-surface-soft text-charcoal border border-hairline">
                Quản trị viên
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel mt-1.5">
            <span>
              Ca chuẩn: <strong className="text-ink font-semibold">08:30 - 18:00</strong> • Nghỉ trưa <strong className="text-ink font-semibold">90p</strong> (12:00 - 13:30) • Chuẩn 8h
            </span>
            <span className="text-hairline hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-deep font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Xem quy chế tính công & ân hạn</span>
            </button>
          </div>
        </div>

        {/* Nút Làm mới & Chuyển Tab (dành cho Admin) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin && (
            <div className="flex items-center p-1 rounded-xl bg-surface-soft border border-hairline">
              <button
                type="button"
                onClick={() => setAdminViewMode("employees")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  adminViewMode === "employees"
                    ? "bg-canvas text-primary shadow-xs"
                    : "text-steel hover:text-ink"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Toàn bộ nhân viên</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminViewMode("personal")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  adminViewMode === "personal"
                    ? "bg-canvas text-primary shadow-xs"
                    : "text-steel hover:text-ink"
                )}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Công của tôi</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.98] transition-all text-charcoal font-medium text-xs cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* 3. Nội dung trang hiển thị theo vai trò & tab */}
      {isLoading ? (
        <div className="py-20 text-center text-steel space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm font-medium text-ink">
            Đang tải dữ liệu chấm công...
          </p>
        </div>
      ) : isAdmin && adminViewMode === "employees" ? (
        /* GÓC NHÌN ADMIN: BẢNG TOÀN BỘ NHÂN VIÊN VÀ MODAL CALENDAR */
        <div>
          <AdminAttendanceTable
            employees={employees}
            attendances={attendances}
            standardWorkDays={standardWorkDays}
            onSelectEmployee={(emp) => setSelectedEmployeeForModal(emp)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Modal Calendar chi tiết khi click vào nhân viên */}
          <EmployeeAttendanceModal
            isOpen={Boolean(selectedEmployeeForModal)}
            onClose={() => setSelectedEmployeeForModal(null)}
            employee={selectedEmployeeForModal}
            attendances={attendances}
            standardWorkDays={standardWorkDays}
          />
        </div>
      ) : (
        /* GÓC NHÌN NHÂN VIÊN (HOẶC ADMIN XEM CÔNG CỦA CHÍNH MÌNH) */
        <div className="space-y-6">
          {/* Khối Chấm công vào/ra trực quan (giống Dashboard) */}
          <Attendance
            hasCheckedIn={hasCheckedIn}
            currentTime={currentTime}
            hasCheckedOut={hasCheckedOut}
            todayAttendance={todayAttendance}
            isActionLoading={isActionLoading}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
          />

          {/* Lịch Calendar chi tiết bên dưới */}
          <AttendanceCalendar
            attendances={myAttendances}
            employee={profile}
            standardWorkDays={standardWorkDays}
          />
        </div>
      )}

      {/* 4. Modal Quy chế Ca làm việc & Ân hạn (Mở khi người dùng cần xem) */}
      {showPolicyModal && (
        <div
          className="fixed inset-0 z-50 bg-ink-deep/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPolicyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-canvas border border-hairline-soft rounded-3xl p-6 max-w-lg w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-hairline-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink-deep">
                    Quy chế Ca làm việc & Tính công
                  </h3>
                  <p className="text-xs text-steel">
                    Áp dụng toàn thể cán bộ nhân viên công ty
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-charcoal leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-surface-soft/60 border border-hairline-soft space-y-1.5">
                <div className="font-bold text-ink-deep flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Ca chuẩn & Giờ làm việc:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-steel pl-1">
                  <li>Giờ vào ca chuẩn: <strong>08:30</strong></li>
                  <li>Giờ tan ca chuẩn: <strong>18:00</strong></li>
                  <li>Nghỉ trưa theo quy định: <strong>12:00 - 13:30</strong> (90 phút)</li>
                  <li>Thời gian làm việc thực tế: <strong>8.0 giờ / ngày</strong></li>
                  <li>Ngày làm việc: Thứ Hai đến Thứ Sáu (Thứ Bảy & CN nghỉ)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-ink-deep block">
                  Bậc thang tính số công & Xử lý đi muộn:
                </span>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-lg border border-success/30 bg-success/5 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-success font-semibold">Đúng giờ (1.0 công):</strong>
                      <p className="text-[11px] text-steel">Check-in ≤ 08:30 và làm đủ ca ≥ 8h.</p>
                    </div>
                    <span className="font-mono font-bold text-success text-xs shrink-0">+1.0</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-attention/40 bg-attention/5 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-attention font-semibold">Ân hạn ≤ 15 phút (1.0 công):</strong>
                      <p className="text-[11px] text-steel">Check-in 08:30 - 08:45, vẫn trọn 1 công (ghi nhận số lần đi muộn).</p>
                    </div>
                    <span className="font-mono font-bold text-attention text-xs shrink-0">+1.0</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-warning/40 bg-warning/5 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-warning font-semibold">Muộn 15 - 60 phút (0.75 công):</strong>
                      <p className="text-[11px] text-steel">Check-in 08:45 - 09:30 (trừ 0.25 công / ngày).</p>
                    </div>
                    <span className="font-mono font-bold text-warning text-xs shrink-0">+0.75</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-primary font-semibold">Nửa công (0.5 công):</strong>
                      <p className="text-[11px] text-steel">Check-in sau 09:30 hoặc làm việc thực tế từ 4h đến &lt; 8h.</p>
                    </div>
                    <span className="font-mono font-bold text-primary text-xs shrink-0">+0.5</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-critical/30 bg-critical/5 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-critical font-semibold">Quên Check-out (0 công):</strong>
                      <p className="text-[11px] text-steel">Có check-in nhưng không có check-out khi hết ngày (cần gửi đơn giải trình).</p>
                    </div>
                    <span className="font-mono font-bold text-critical text-xs shrink-0">0.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-hairline-soft flex justify-end">
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-charcoal active:scale-[0.98] transition-all cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
