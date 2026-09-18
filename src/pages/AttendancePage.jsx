import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import Attendance from "../components/attendance/Attendance.jsx";
import AttendanceCalendar from "../components/attendance/AttendanceCalendar.jsx";
import AdminAttendanceTable from "../components/attendance/AdminAttendanceTable.jsx";
import EmployeeAttendanceModal from "../components/attendance/EmployeeAttendanceModal.jsx";
import { attendanceServices } from "../services/attendanceServices.js";
import { employeeServices } from "../services/employeeServices.js";
import { settingsServices } from "../services/settingsServices.js";
import { useAttendanceAction } from "../hooks/useAttendanceAction.js";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import RegulationsModal from "../components/modal/RegulationsModal.jsx";

export default function AttendancePage() {
  const { profile, isAdmin, isEmployee } = useAuth();

  // Dữ liệu chung
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [standardWorkDays, setStandardWorkDays] = useState(22);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab chuyển đổi dành cho Quản trị viên (Admin): 'employees' | 'personal'
  const [adminViewMode, setAdminViewMode] = useState("employees");

  // Modal xem lịch sử chấm công của nhân viên được chọn (dành cho Admin)
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] =
    useState(null);

  // Modal xem quy chế ca làm việc & ân hạn đi muộn
  const [showPolicyModal, setShowPolicyModal] = useState(false);

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

  // Dùng custom hook quản lý toàn bộ logic chấm công cá nhân
  const { attendanceProps, myAttendances } = useAttendanceAction({
    attendances,
    setAttendances,
    currentUserId: profile?.id,
    isAdmin,
    onReload: fetchData,
    isLoading,
    isRefreshing,
  });

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
              <span>Xem quy chế tính công</span>
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
          <Attendance {...attendanceProps} />

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
        <RegulationsModal onClose={() => setShowPolicyModal(false)} />
      )}
    </div>
  );
}
