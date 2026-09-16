import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import TableLeaveRequests from "../components/table/TableLeaveRequests.jsx";
import CreateLeaveRequestModal from "../components/modal/CreateLeaveRequestModal.jsx";
import ConfirmLeaveRequestModal from "../components/modal/ConfirmLeaveRequestModal.jsx";
import { leaveRequestsServices } from "../services/leaveRequestsServices.js";
import { employeeServices } from "../services/employeeServices.js";
import { toast } from "sonner";
import {
  CalendarPlus,
  RefreshCw,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  CalendarCheck,
} from "lucide-react";
import { cn } from "../utils/cn.js";

const PAGE_SIZE = 8;

export default function LeaveRequestsPage() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes("admin");
  const isEmployee = role.includes("employee") || !isAdmin;

  // Dữ liệu danh sách đơn & nhân viên
  const [requests, setRequests] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bộ lọc & Tìm kiếm & Phân trang
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Trạng thái modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState(null); // { request, actionType: 'approve' | 'reject' }
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Tải dữ liệu từ API
  const fetchData = useCallback(async () => {
    try {
      const reqPromise = leaveRequestsServices.getLeaveRequests();
      const empPromise = isAdmin
        ? employeeServices.getEmployees().catch(() => [])
        : Promise.resolve([]);

      const [reqData, empData] = await Promise.all([reqPromise, empPromise]);

      setRequests(Array.isArray(reqData) ? reqData : []);

      if (isAdmin && Array.isArray(empData)) {
        const map = {};
        empData.forEach((emp) => {
          map[emp.id] = emp;
        });
        setEmployeesMap(map);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn nghỉ phép:", error);
      toast.error("Không thể tải danh sách đơn nghỉ phép");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      if (profile) {
        await fetchData();
      }
    };
    loadData();
  }, [profile, fetchData]);

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success("Đã làm mới danh sách đơn nghỉ phép");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Thống kê số lượng đơn theo trạng thái
  const stats = useMemo(() => {
    const total = requests.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    requests.forEach((req) => {
      const status = (req.status || "").toLowerCase();
      if (status === "pending") pending += 1;
      else if (status === "approved") approved += 1;
      else if (status === "rejected") rejected += 1;
    });

    return { total, pending, approved, rejected };
  }, [requests]);

  // Lọc và tìm kiếm dữ liệu
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Lọc theo tab trạng thái
      const status = (req.status || "").toLowerCase();
      if (activeTab !== "all" && status !== activeTab) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const idMatch = String(req.id).includes(term);
      const reasonMatch = (req.reason || "").toLowerCase().includes(term);

      // Nếu là admin, tìm thêm theo tên & phòng ban nhân viên
      if (isAdmin) {
        const emp = employeesMap[req.employeeId];
        const empNameMatch = (emp?.fullName || "").toLowerCase().includes(term);
        const empDeptMatch = (emp?.department || "").toLowerCase().includes(term);
        const empIdMatch = String(req.employeeId).includes(term);
        return idMatch || reasonMatch || empNameMatch || empDeptMatch || empIdMatch;
      }

      return idMatch || reasonMatch;
    });
  }, [requests, activeTab, searchTerm, isAdmin, employeesMap]);

  // Dữ liệu phân trang
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRequests = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredRequests, safeCurrentPage]);

  // Thao tác mở modal xác nhận Duyệt / Từ chối của Admin
  const handleOpenConfirm = (request, actionType) => {
    setConfirmModalData({ request, actionType });
  };

  // Thực hiện duyệt / từ chối đơn
  const handleConfirmAction = async () => {
    if (!confirmModalData?.request) return;

    const { request, actionType } = confirmModalData;
    const targetStatus = actionType === "approve" ? "approved" : "rejected";

    try {
      setIsActionSubmitting(true);
      await leaveRequestsServices.updateStatus(request.id, targetStatus);
      toast.success(
        actionType === "approve"
          ? `Đã duyệt đơn nghỉ phép #${String(request.id).padStart(3, "0")} thành công!`
          : `Đã từ chối đơn nghỉ phép #${String(request.id).padStart(3, "0")}!`
      );
      setConfirmModalData(null);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn:", error);
      const msg = error.response?.data?.message || "Không thể cập nhật trạng thái đơn";
      toast.error(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Kiểm tra quyền
  if (!isLoading && !isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Tiêu đề trang & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-deep flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-primary" />
            <span>{isAdmin ? "Quản lý Đơn nghỉ phép" : "Đơn xin nghỉ phép của tôi"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-steel mt-1">
            {isAdmin
              ? "Theo dõi, xét duyệt và quản lý toàn bộ các đơn xin nghỉ phép của nhân viên"
              : "Theo dõi trạng thái các đơn đã gửi và tạo đơn xin nghỉ phép mới"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft text-ink text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-steel", isRefreshing && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Nút tạo đơn xin nghỉ cho nhân viên */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Tạo đơn xin nghỉ</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Dải thẻ thống kê tương tác (Metric Summary Strip) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Thẻ 1: Tổng số đơn */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTabChange("all")}
          onKeyDown={(e) => e.key === "Enter" && handleTabChange("all")}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            activeTab === "all"
              ? "border-primary ring-2 ring-primary/10 bg-primary/[0.02]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-steel uppercase tracking-wider">
              {isAdmin ? "Tổng đơn toàn công ty" : "Tổng đơn đã gửi"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-soft text-slate flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-stone">đơn</span>
          </div>
        </div>

        {/* Thẻ 2: Chờ phê duyệt */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTabChange("pending")}
          onKeyDown={(e) => e.key === "Enter" && handleTabChange("pending")}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            activeTab === "pending"
              ? "border-attention ring-2 ring-attention/20 bg-attention/[0.04]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-attention uppercase tracking-wider">
              Chờ phê duyệt
            </span>
            <div className="w-8 h-8 rounded-xl bg-attention/10 text-attention flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.pending}
            </span>
            <span className="text-xs text-attention font-medium">cần xử lý</span>
          </div>
        </div>

        {/* Thẻ 3: Đã được duyệt */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTabChange("approved")}
          onKeyDown={(e) => e.key === "Enter" && handleTabChange("approved")}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            activeTab === "approved"
              ? "border-success ring-2 ring-success/20 bg-success/[0.04]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-success uppercase tracking-wider">
              Đã chấp thuận
            </span>
            <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.approved}
            </span>
            <span className="text-xs text-success font-medium">hợp lệ</span>
          </div>
        </div>

        {/* Thẻ 4: Bị từ chối */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTabChange("rejected")}
          onKeyDown={(e) => e.key === "Enter" && handleTabChange("rejected")}
          className={cn(
            "p-4 rounded-2xl bg-canvas border transition-all cursor-pointer shadow-2xs hover:shadow-xs",
            activeTab === "rejected"
              ? "border-critical ring-2 ring-critical/20 bg-critical/[0.04]"
              : "border-hairline-soft hover:border-hairline"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-critical uppercase tracking-wider">
              Bị từ chối
            </span>
            <div className="w-8 h-8 rounded-xl bg-critical/10 text-critical flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-deep font-mono tabular-nums">
              {stats.rejected}
            </span>
            <span className="text-xs text-critical font-medium">không duyệt</span>
          </div>
        </div>
      </div>

      {/* 3. Thanh Tìm kiếm & Tab lọc trạng thái */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Tab trạng thái */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas border border-hairline-soft rounded-2xl overflow-x-auto">
          {[
            { id: "all", label: "Tất cả", count: stats.total },
            { id: "pending", label: "Chờ duyệt", count: stats.pending },
            { id: "approved", label: "Đã duyệt", count: stats.approved },
            { id: "rejected", label: "Từ chối", count: stats.rejected },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-2xs"
                    : "text-slate hover:text-ink hover:bg-surface-soft"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                    isActive ? "bg-white/20 text-white" : "bg-surface-soft text-steel"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ô Tìm kiếm */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              isAdmin
                ? "Tìm mã đơn, tên NV, lý do..."
                : "Tìm theo mã đơn, lý do..."
            }
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-stone hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bảng danh sách đơn nghỉ phép */}
      <TableLeaveRequests
        requests={paginatedRequests}
        isLoading={isLoading}
        isAdmin={isAdmin}
        employeesMap={employeesMap}
        onApprove={(row) => handleOpenConfirm(row, "approve")}
        onReject={(row) => handleOpenConfirm(row, "reject")}
        emptyText={
          searchTerm || activeTab !== "all"
            ? "Không tìm thấy đơn nghỉ phép phù hợp với điều kiện lọc"
            : isAdmin
            ? "Hiện tại chưa có đơn xin nghỉ phép nào từ nhân viên"
            : "Bạn chưa gửi đơn xin nghỉ phép nào"
        }
        emptyAction={
          !isAdmin && !searchTerm && activeTab === "all" ? (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Tạo đơn xin nghỉ đầu tiên</span>
            </button>
          ) : undefined
        }
        pagination={{
          currentPage: safeCurrentPage,
          totalPages,
          totalItems: filteredRequests.length,
          onPageChange: (newPage) => setCurrentPage(newPage),
        }}
      />

      {/* 5. Modal Tạo đơn xin nghỉ phép (cho Nhân viên) */}
      <CreateLeaveRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* 6. Modal Xác nhận Duyệt / Từ chối (cho Admin) */}
      <ConfirmLeaveRequestModal
        isOpen={Boolean(confirmModalData)}
        onClose={() => setConfirmModalData(null)}
        request={confirmModalData?.request}
        employee={
          confirmModalData?.request
            ? employeesMap[confirmModalData.request.employeeId]
            : null
        }
        actionType={confirmModalData?.actionType || "approve"}
        onConfirm={handleConfirmAction}
        isLoading={isActionSubmitting}
      />
    </div>
  );
}
