import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveRequests } from "@/pages/LeaveRequestsPage/hooks/useLeaveRequests";
import { attendanceServices } from "@/pages/AttendancePage/services/attendanceServices";
import { useAttendanceAction } from "@/pages/AttendancePage/hooks/useAttendanceAction";
import { usePagination } from "@/hooks/usePagination";
import NotAuthorPage from "@/pages/NotAuthorPage";
import TableLeaveRequests from "@/components/table/TableLeaveRequests";
import AttendanceBadge from "@/components/attendance/AttendanceBadge";
import Attendance from "@/components/attendance/Attendance";
import SearchInput from "@/components/common/SearchInput";
import { FileText, RefreshCw, CalendarCheck, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

const LEAVE_PAGE_SIZE = 8;

export default function DashboardPage() {
  const { profile, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();

  // Dữ liệu chấm công
  const [attendances, setAttendances] = useState([]);
  const [isAttLoading, setIsAttLoading] = useState(true);
  const [isAttRefreshing, setIsAttRefreshing] = useState(false);

  // Quản lý đơn nghỉ phép qua custom hook dùng chung
  const {
    requests,
    employeesMap,
    isLoading: isLeaveLoading,
    isRefreshing: isLeaveRefreshing,
    stats,
    handleRefresh: handleRefreshLeave,
    handleApprove,
    handleReject,
  } = useLeaveRequests({ isAdmin, autoFetch: isAdmin || isEmployee });

  // Tải dữ liệu chấm công
  const fetchAttendanceData = useCallback(async () => {
    try {
      const attData = await attendanceServices.getAttendance();
      setAttendances(Array.isArray(attData) ? attData : []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chấm công:", error);
      toast.error("Không thể tải dữ liệu chấm công");
    } finally {
      setIsAttLoading(false);
      setIsAttRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if ((isAdmin || isEmployee) && isMounted) {
        await fetchAttendanceData();
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, isEmployee, fetchAttendanceData]);

  // Làm mới toàn bộ dashboard
  const handleRefresh = async () => {
    setIsAttRefreshing(true);
    await Promise.all([handleRefreshLeave(), fetchAttendanceData()]);
  };

  const isLoading = isAttLoading || isLeaveLoading;
  const isRefreshing = isAttRefreshing || isLeaveRefreshing;

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
  // const todayAdminAttendanceCount = useMemo(() => {
  //   const checkInsTodays =  attendances.filter((a) => a.date === todayStr && a.checkIn).map((a) => a.employeeId);
  //   console.log(checkInsTodays)
  //   return new Set(checkInsTodays).size
  // }, [attendances, todayStr]);
  const todayAdminAttendanceCount = useMemo(() => {
    if (!isAdmin || !Array.isArray(attendances)) return 0;

    const checkInsTodays = attendances
      .filter((a) => a.date === todayStr && a.checkIn)
      .map((a) => a.employeeId || a.employee_id)
      .filter(Boolean);

    return new Set(checkInsTodays).size;
  }, [attendances, todayStr, isAdmin]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
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
  }, [requests, statusFilter, searchQuery, employeesMap]);

  // Quản lý phân trang cho danh sách đơn nghỉ phép trên dashboard
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedRequests,
  } = usePagination(filteredRequests, LEAVE_PAGE_SIZE);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
            setCurrentPage(1);
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
      {isEmployee && <Attendance {...attendanceProps} />}

      {/* KHỐI CHỈ SỐ & TRẠNG THÁI PHÂN CẤP */}
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
                handleStatusFilterChange(
                  statusFilter === "pending" ? "all" : "pending",
                )
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
                handleStatusFilterChange(
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
                handleStatusFilterChange(
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
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <CalendarCheck className="w-4.5 h-4.5 text-steel" />
            <h2 className="text-sm font-bold text-ink-deep">
              {isAdmin
                ? "Danh sách đơn xin nghỉ phép"
                : "Đơn nghỉ phép của tôi"}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-3 w-full xl:w-auto">
            {/* Ô tìm kiếm bảng danh sách dùng chung SearchInput */}
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                isAdmin
                  ? "Lọc theo nhân viên, lý do..."
                  : "Lọc theo lý do, mã đơn..."
              }
              containerClassName="w-full sm:w-64 xl:w-72 max-w-none flex-none"
            />

            {/* Thanh Tab chuyển trạng thái (Interactive Filter Tabs) */}
            <div className="flex items-center gap-1.5 p-1 bg-canvas border border-hairline-soft rounded-xl overflow-x-auto shadow-2xs shrink-0">
              {FILTER_LEAVE_REQUESTS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusFilterChange(tab.id)}
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
          </div>
        </div>

        <TableLeaveRequests
          requests={paginatedRequests}
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
          pagination={
            filteredRequests.length > 0
              ? {
                  currentPage,
                  totalPages,
                  totalItems: filteredRequests.length,
                  onPageChange: (newPage) => setCurrentPage(newPage),
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
