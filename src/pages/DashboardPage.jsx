import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import TableLeaveRequests from "../components/table/TableLeaveRequests.jsx";
import { leaveRequestsServices } from "../services/leaveRequestsServices.js";
import { attendanceServices } from "../services/attendanceServices.js";
import api from "../utils/axios.js";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  CalendarCheck,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { formatTime } from "../utils/formatTime.js" 

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const [requests, setRequests] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const EMPLOYEE = "employee";
  const ADMIN = "admin";

  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes(ADMIN);
  const isEmployee = role.includes(EMPLOYEE);

  // Đồng hồ chạy thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ngày hôm nay theo định dạng YYYY-MM-DD
  const todayStr = new Date().toLocaleDateString("en-CA");

  // Tìm bản ghi chấm công của hôm nay
  const todayAttendance = attendances
    .filter((a) => a.date === todayStr)
    .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null;

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Tải đơn nghỉ phép
        const reqPromise = leaveRequestsServices.getLeaveRequests();
        // Tải thông tin chấm công
        const attPromise = attendanceServices.getAttendance();

        const [leaveData, attData] = await Promise.all([reqPromise, attPromise]);

        if (!isMounted) return;

        setRequests(Array.isArray(leaveData) ? leaveData : []);
        setAttendances(Array.isArray(attData) ? attData : []);

        // Nếu là admin, tải thêm danh sách nhân viên
        if (isAdmin) {
          try {
            const empRes = await api.get("/api/employees");
            if (isMounted && Array.isArray(empRes.data)) {
              const map = {};
              empRes.data.forEach((emp) => {
                map[emp.id] = emp;
              });
              setEmployeesMap(map);
            }
          } catch {
            // Bỏ qua lỗi nhân viên
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
        toast.error("Không thể tải thông tin trang bảng điều khiển");
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    if (isAdmin || isEmployee) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isEmployee]);

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [leaveData, attData] = await Promise.all([
        leaveRequestsServices.getLeaveRequests(),
        attendanceServices.getAttendance(),
      ]);
      setRequests(Array.isArray(leaveData) ? leaveData : []);
      setAttendances(Array.isArray(attData) ? attData : []);
      toast.success("Đã làm mới dữ liệu");
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
      toast.error("Không thể làm mới dữ liệu");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Xử lý chấm công vào (Check-in)
  const handleCheckIn = async () => {
    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkIn();
      toast.success("Chấm công vào thành công!");
      setAttendances((prev) => [res, ...prev.filter((a) => a.id !== res.id)]);
    } catch (error) {
      console.error("Lỗi khi chấm công vào:", error);
      toast.error("Chấm công vào thất bại, vui lòng thử lại");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Xử lý chấm công ra (Check-out)
  const handleCheckOut = async () => {
    try {
      setIsActionLoading(true);
      const res = await attendanceServices.checkOut();
      toast.success("Chấm công ra thành công!");
      setAttendances((prev) =>
        prev.map((item) => (item.id === res.id ? res : item))
      );
    } catch (error) {
      console.error("Lỗi khi chấm công ra:", error);
      toast.error("Chấm công ra thất bại, vui lòng thử lại");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Duyệt đơn nghỉ phép (admin)
  const handleApprove = async (row) => {
    try {
      await leaveRequestsServices.updateStatus(row.id, "approved");
      toast.success(`Đã duyệt đơn nghỉ phép #${row.id}`);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: "approved" } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      toast.error("Duyệt đơn nghỉ phép thất bại");
    }
  };

  // Từ chối đơn nghỉ phép (admin)
  const handleReject = async (row) => {
    try {
      await leaveRequestsServices.updateStatus(row.id, "rejected");
      toast.success(`Đã từ chối đơn nghỉ phép #${row.id}`);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: "rejected" } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi từ chối đơn:", error);
      toast.error("Từ chối đơn nghỉ phép thất bại");
    }
  };

  // Thống kê nhanh đơn nghỉ
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => (r.status || "").toLowerCase() === "pending")
      .length,
    approved: requests.filter(
      (r) => (r.status || "").toLowerCase() === "approved"
    ).length,
    rejected: requests.filter(
      (r) => (r.status || "").toLowerCase() === "rejected"
    ).length,
  };

  // Thống kê điểm danh hôm nay cho admin
  const todayAdminAttendanceCount = attendances.filter(
    (a) => a.date === todayStr && a.checkIn
  ).length;

  if (!isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header chào mừng */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {isAdmin ? "Bảng điều khiển Quản trị viên" : "Bảng điều khiển Nhân viên"}
            </h1>

            {/* Huy hiệu trạng thái chấm công nhanh dành cho nhân viên */}
            {isEmployee && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  hasCheckedIn
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasCheckedIn
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                {hasCheckedIn
                  ? hasCheckedOut
                    ? `Đã hoàn thành ca (${formatTime(todayAttendance.checkIn)} - ${formatTime(todayAttendance.checkOut)})`
                    : `Đã chấm công (${formatTime(todayAttendance.checkIn)})`
                  : "Chưa chấm công hôm nay"}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Xin chào,{" "}
            <span className="font-semibold text-neutral-700">
              {profile?.fullName || profile?.username}
            </span>
            !{" "}
            {isAdmin
              ? "Theo dõi tổng thể ngày công và các yêu cầu nghỉ phép của toàn công ty."
              : "Theo dõi tình trạng chấm công và quản lý các đơn nghỉ phép của bạn."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-colors shadow-xs self-start cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KHỐI CHẤM CÔNG HÔM NAY DÀNH CHO NHÂN VIÊN */}
      {isEmployee && (
        <div className="bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Cột trái: Thông tin ngày & Đồng hồ thời gian thực */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  hasCheckedIn
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                    : "bg-amber-500/10 text-amber-600 border-amber-200"
                }`}
              >
                {hasCheckedIn ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertCircle className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    {currentTime.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-mono text-neutral-700 font-bold">
                    {currentTime.toLocaleTimeString("vi-VN")}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  Trạng thái chấm công:{" "}
                  {hasCheckedIn ? (
                    <span className="text-emerald-600 font-semibold">
                      {hasCheckedOut ? "Đã hoàn thành ca làm việc" : "Đã vào ca làm việc"}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      Chưa chấm công hôm nay
                    </span>
                  )}
                </h3>

                <p className="text-xs text-neutral-500 mt-0.5">
                  {hasCheckedIn
                    ? `Bắt đầu lúc: ${formatTime(todayAttendance.checkIn)} ${
                        todayAttendance.checkOut
                          ? `| Kết thúc lúc: ${formatTime(todayAttendance.checkOut)}`
                          : "| Đang làm việc..."
                      }`
                    : "Hãy bấm nút chấm công bên cạnh để ghi nhận giờ vào ca hôm nay của bạn."}
                </p>
              </div>
            </div>

            {/* Cột phải: Khối thống kê giờ và Nút thao tác Chấm công */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Thẻ giờ vào */}
              <div className="bg-white border border-neutral-100 rounded-xl px-4 py-2.5 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-400 uppercase block">
                  Giờ vào ca
                </span>
                <span className="text-sm font-bold text-neutral-800 font-mono">
                  {formatTime(todayAttendance?.checkIn)}
                </span>
              </div>

              {/* Thẻ giờ ra */}
              <div className="bg-white border border-neutral-100 rounded-xl px-4 py-2.5 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-400 uppercase block">
                  Giờ tan ca
                </span>
                <span className="text-sm font-bold text-neutral-800 font-mono">
                  {formatTime(todayAttendance?.checkOut)}
                </span>
              </div>

              {/* Nút hành động */}
              {!hasCheckedIn ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 active:bg-neutral-950 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isActionLoading ? "Đang xử lý..." : "Chấm công vào"}</span>
                </button>
              ) : !hasCheckedOut ? (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 active:bg-amber-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isActionLoading ? "Đang xử lý..." : "Chấm công ra (Check-out)"}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-100/70 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã chấm công đủ ca</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Điểm danh hôm nay
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                {todayAdminAttendanceCount}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Đơn của tôi
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                {stats.total}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600/80 uppercase tracking-wider">
              Chờ duyệt
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-600/80 uppercase tracking-wider">
              Đã duyệt
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {stats.approved}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-rose-600/80 uppercase tracking-wider">
              Từ chối
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {stats.rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Bảng danh sách đơn nghỉ phép */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-800">
              {isAdmin ? "Danh sách đơn xin nghỉ phép gần đây" : "Đơn nghỉ phép của tôi"}
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            {isAdmin ? "Hiển thị toàn bộ đơn xin nghỉ" : "Chỉ hiển thị đơn của bạn"}
          </span>
        </div>

        <TableLeaveRequests
          requests={requests}
          isLoading={isLoading}
          isAdmin={isAdmin}
          employeesMap={employeesMap}
          onApprove={handleApprove}
          onReject={handleReject}
          emptyText={
            isAdmin
              ? "Hiện tại không có đơn xin nghỉ phép nào trong hệ thống."
              : "Bạn chưa tạo đơn xin nghỉ phép nào."
          }
        />
      </div>
    </div>
  );
}