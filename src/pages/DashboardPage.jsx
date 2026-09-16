import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import TableLeaveRequests from "../components/table/TableLeaveRequests.jsx";
import { leaveRequestsServices } from "../services/leaveRequestsServices.js";
import { attendanceServices } from "../services/attendanceServices.js";
import { useAttendanceAction } from "../hooks/useAttendanceAction.js";
import api from "../utils/axios.js";
import { toast } from "sonner";
import { FileText, RefreshCw, CalendarCheck, Plus, Search } from "lucide-react";
import AttendanceBadge from "../components/attendance/AttendanceBadge.jsx";
import Attendance from "../components/attendance/Attendance.jsx";
import { cn } from "../utils/cn.js";

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const [requests, setRequests] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const EMPLOYEE = "employee";
  const ADMIN = "admin";

  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes(ADMIN);
  const isEmployee = role.includes(EMPLOYEE);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Tải đơn nghỉ phép
        const reqPromise = leaveRequestsServices.getLeaveRequests();
        // Tải thông tin chấm công
        const attPromise = attendanceServices.getAttendance();

        const [leaveData, attData] = await Promise.all([
          reqPromise,
          attPromise,
        ]);

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

  // Quản lý chấm công hôm nay & các hành động Check-in / Check-out qua custom hook
  const {
    attendanceProps,
    todayAttendance,
    hasCheckedIn,
    hasCheckedOut,
    todayStr,
  } = useAttendanceAction({
    attendances,
    setAttendances,
    currentUserId: profile?.id,
    isAdmin,
    onReload: handleRefresh,
    isLoading,
    isRefreshing,
  });

  // Duyệt đơn nghỉ phép (admin)
  const handleApprove = async (row) => {
    try {
      await leaveRequestsServices.updateStatus(row.id, "approved");
      toast.success(`Đã duyệt đơn nghỉ phép #${row.id}`);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: "approved" } : item,
        ),
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
          item.id === row.id ? { ...item, status: "rejected" } : item,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi từ chối đơn:", error);
      toast.error("Từ chối đơn nghỉ phép thất bại");
    }
  };

  // Thống kê nhanh đơn nghỉ
  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => (r.status || "").toLowerCase() === "pending",
    ).length,
    approved: requests.filter(
      (r) => (r.status || "").toLowerCase() === "approved",
    ).length,
    rejected: requests.filter(
      (r) => (r.status || "").toLowerCase() === "rejected",
    ).length,
  };

  const FILTER_LEAVE_REQUESTS = [
    { id: "all", label: "Tất cả", count: stats.total },
    {
      id: "pending",
      label: "Chờ duyệt",
      count: stats.pending,
      dot: "bg-attention",
    },
    {
      id: "approved",
      label: "Đã duyệt",
      count: stats.approved,
      dot: "bg-success",
    },
    {
      id: "rejected",
      label: "Từ chối",
      count: stats.rejected,
      dot: "bg-critical",
    },
  ];

  // Thống kê điểm danh hôm nay cho admin
  const todayAdminAttendanceCount = attendances.filter(
    (a) => a.date === todayStr && a.checkIn,
  ).length;

  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = requests.filter((r) => {
    const status = (r.status || "").toLowerCase();
    const matchStatus = statusFilter === "all" || status === statusFilter;
    if (!matchStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const emp = employeesMap[r.employeeId];
    const empName = (emp?.fullName || "").toLowerCase();
    const reason = (r.reason || "").toLowerCase();
    const idStr = String(r.id);
    return empName.includes(q) || reason.includes(q) || idStr.includes(q);
  });

  if (!isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  const emptyAction = (
    <div>
      {statusFilter !== "all" || searchQuery ? (
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setSearchQuery("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-canvas hover:bg-surface-soft text-ink text-xs font-medium transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>
      ) : isEmployee ? (
        <button
          type="button"
          onClick={() => navigate("/leave-requests")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo đơn xin nghỉ phép</span>
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header chào mừng */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-ink-deep">
              {isAdmin
                ? "Bảng điều khiển Quản trị viên"
                : "Bảng điều khiển Nhân viên"}
            </h1>

            {/* Huy hiệu trạng thái chấm công nhanh dành cho nhân viên */}
            {isEmployee && (
              <AttendanceBadge
                hasCheckedIn={hasCheckedIn}
                hasCheckedOut={hasCheckedOut}
                todayAttendance={todayAttendance}
              />
            )}
          </div>
          <p className="text-xs text-steel mt-1">
            Xin chào,{" "}
            <span className="font-semibold text-ink">
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
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft active:scale-[0.98] transition-all shadow-2xs self-start cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-steel"}`}
          />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KHỐI CHẤM CÔNG HÔM NAY DÀNH CHO NHÂN VIÊN */}
      {isEmployee && (
        <Attendance {...attendanceProps} />
      )}

      {/* KHỐI CHỈ SỐ & TRẠNG THÁI PHÂN CẤP (Asymmetric Metric Layout - No Card Soup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Thẻ chỉ số trọng tâm - 4/12 cột */}
        <div className="lg:col-span-4 bg-canvas p-5 rounded-2xl border border-hairline-soft shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone uppercase tracking-wider">
              {isAdmin ? "Điểm danh hôm nay" : "Tổng đơn nghỉ phép"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {isAdmin ? (
                <CalendarCheck className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink-deep font-mono tabular-nums">
                {isAdmin ? todayAdminAttendanceCount : stats.total}
              </span>
              <span className="text-xs text-steel">
                {isAdmin ? "nhân viên có mặt" : "đơn trong hồ sơ"}
              </span>
            </div>
            <p className="text-[11px] text-steel mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              {isAdmin
                ? "Dữ liệu được cập nhật tự động theo thời gian thực"
                : `Có ${stats.pending} đơn đang chờ người duyệt phản hồi`}
            </p>
          </div>
        </div>

        {/* Dải trạng thái xét duyệt tương tác (Interactive Workflow Strip) - 8/12 cột */}
        <div className="lg:col-span-8 bg-canvas p-5 rounded-2xl border border-hairline-soft shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-hairline-soft pb-2.5">
            <span className="text-[11px] font-bold text-stone uppercase tracking-wider">
              Tình trạng xét duyệt đơn nghỉ phép
            </span>
            <span className="text-xs text-steel font-medium">
              Bấm vào từng mục để lọc nhanh bảng bên dưới
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3">
            {/* Chờ duyệt */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === "pending" ? "all" : "pending")
              }
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98]",
                statusFilter === "pending"
                  ? "bg-attention/10 border-attention/50 ring-2 ring-attention/20"
                  : "bg-surface-soft border-transparent hover:border-hairline",
              )}
            >
              <div className="flex items-center gap-1.5 text-[#a06800]">
                <span className="w-2 h-2 rounded-full bg-attention" />
                <span className="text-xs font-semibold">Chờ duyệt</span>
              </div>
              <p className="text-2xl font-bold text-ink-deep font-mono tabular-nums mt-1">
                {stats.pending}
              </p>
            </button>

            {/* Đã duyệt */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  statusFilter === "approved" ? "all" : "approved",
                )
              }
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98]",
                statusFilter === "approved"
                  ? "bg-success/10 border-success/50 ring-2 ring-success/20"
                  : "bg-surface-soft border-transparent hover:border-hairline",
              )}
            >
              <div className="flex items-center gap-1.5 text-[#227c37]">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-semibold">Đã duyệt</span>
              </div>
              <p className="text-2xl font-bold text-ink-deep font-mono tabular-nums mt-1">
                {stats.approved}
              </p>
            </button>

            {/* Từ chối */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  statusFilter === "rejected" ? "all" : "rejected",
                )
              }
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98]",
                statusFilter === "rejected"
                  ? "bg-critical/10 border-critical/50 ring-2 ring-critical/20"
                  : "bg-surface-soft border-transparent hover:border-hairline",
              )}
            >
              <div className="flex items-center gap-1.5 text-critical">
                <span className="w-2 h-2 rounded-full bg-critical" />
                <span className="text-xs font-semibold">Từ chối</span>
              </div>
              <p className="text-2xl font-bold text-ink-deep font-mono tabular-nums mt-1">
                {stats.rejected}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách đơn nghỉ phép với Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4.5 h-4.5 text-steel" />
            <h2 className="text-sm font-bold text-ink-deep">
              {isAdmin
                ? "Danh sách đơn xin nghỉ phép"
                : "Đơn nghỉ phép của tôi"}
            </h2>
          </div>

          {/* Ô tìm kiếm bảng danh sách */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc theo nhân viên, lý do..."
              className="w-full bg-canvas pl-9 pr-3 py-1.5 text-xs text-ink rounded-lg border border-hairline-soft focus:border-primary outline-none transition-all placeholder:text-stone shadow-2xs"
            />
          </div>
        </div>

        {/* Thanh Tab chuyển trạng thái (Interactive Filter Tabs) */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas border border-hairline-soft rounded-xl w-fit overflow-x-auto shadow-2xs">
          {FILTER_LEAVE_REQUESTS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                statusFilter === tab.id
                  ? "bg-surface-soft text-ink-deep font-semibold shadow-2xs"
                  : "text-steel hover:text-ink hover:bg-surface-soft/60",
              )}
            >
              {tab.dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full", tab.dot)} />
              )}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded-full",
                  statusFilter === tab.id
                    ? "bg-canvas text-ink-deep font-bold"
                    : "text-stone",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <TableLeaveRequests
          requests={filteredRequests}
          isLoading={isLoading}
          isAdmin={isAdmin}
          employeesMap={employeesMap}
          onApprove={handleApprove}
          onReject={handleReject}
          emptyText={
            statusFilter !== "all" || searchQuery
              ? "Không tìm thấy đơn nào khớp với bộ lọc hiện tại."
              : isAdmin
                ? "Hiện tại không có đơn xin nghỉ phép nào trong hệ thống."
                : "Bạn chưa tạo đơn xin nghỉ phép nào."
          }
          emptyAction={emptyAction}
        />
      </div>
    </div>
  );
}
