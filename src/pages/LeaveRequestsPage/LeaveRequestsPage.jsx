import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { usePagination } from "@/hooks/usePagination";
import NotAuthorPage from "@/pages/NotAuthorPage";
import TableLeaveRequests from "@/components/table/TableLeaveRequests";
import CreateLeaveRequestModal from "./dialogs/CreateLeaveRequestModal";
import ConfirmLeaveRequestModal from "./dialogs/ConfirmLeaveRequestModal";
import StatCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import {
  CalendarPlus,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 8;

export default function LeaveRequestsPage() {
  const { isAdmin, isEmployee } = useAuth();

  // Quản lý dữ liệu đơn nghỉ phép qua custom hook
  const {
    requests,
    employeesMap,
    isLoading,
    isRefreshing,
    stats,
    fetchData,
    handleRefresh,
    handleApprove,
    handleReject,
  } = useLeaveRequests({ isAdmin });

  // Bộ lọc & Tìm kiếm
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState("");

  // Trạng thái modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState(null); // { request, actionType: 'approve' | 'reject' }
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

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

  // Quản lý phân trang qua custom hook
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedRequests,
  } = usePagination(filteredRequests, PAGE_SIZE);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Xác nhận Duyệt / Từ chối qua modal
  const handleOpenConfirmModal = (request, actionType) => {
    setConfirmModalData({ request, actionType });
  };

  const handleExecuteAction = async () => {
    if (!confirmModalData) return;
    const { request, actionType } = confirmModalData;
    try {
      setIsActionSubmitting(true);
      if (actionType === "approve") {
        await handleApprove(request.id);
      } else {
        await handleReject(request.id);
      }
      setConfirmModalData(null);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Kiểm tra quyền truy cập
  if (!isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  const FILTER_TABS = [
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Trang & Nút Hành Động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-deep flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-primary" />
            <span>{isAdmin ? "Quản lý Đơn Nghỉ Phép" : "Đơn Xin Nghỉ Phép Của Tôi"}</span>
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

      {/* 2. Dải thẻ thống kê tương tác dùng StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title={isAdmin ? "Tổng đơn toàn công ty" : "Tổng đơn đã gửi"}
          value={stats.total}
          subtext="Toàn bộ đơn trong hệ thống"
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-surface-soft text-slate border border-hairline-soft"
          isActive={activeTab === "all"}
          onClick={() => handleTabChange("all")}
        />

        <StatCard
          title="Chờ phê duyệt"
          value={stats.pending}
          subtext="Cần xem xét xử lý"
          icon={<Clock className="w-4 h-4 text-attention" />}
          iconBg="bg-attention/10 text-attention border border-attention/30"
          isActive={activeTab === "pending"}
          onClick={() => handleTabChange("pending")}
        />

        <StatCard
          title="Đã chấp thuận"
          value={stats.approved}
          subtext="Đơn hợp lệ đã duyệt"
          icon={<CheckCircle2 className="w-4 h-4 text-success" />}
          iconBg="bg-success/10 text-success border border-success/30"
          isActive={activeTab === "approved"}
          onClick={() => handleTabChange("approved")}
        />

        <StatCard
          title="Bị từ chối"
          value={stats.rejected}
          subtext="Không được duyệt"
          icon={<XCircle className="w-4 h-4 text-critical" />}
          iconBg="bg-critical/10 text-critical border border-critical/30"
          isActive={activeTab === "rejected"}
          onClick={() => handleTabChange("rejected")}
        />
      </div>

      {/* 3. Thanh Tìm Kiếm & Tabs Trạng Thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Ô Tìm kiếm dùng SearchInput */}
        <SearchInput
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={isAdmin ? "Tìm theo mã đơn, nhân viên, phòng ban, lý do..." : "Tìm kiếm theo lý do, mã đơn..."}
          containerClassName="w-full sm:max-w-sm"
        />

        {/* Cụm Tabs Lọc Trạng Thái */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas border border-hairline-soft rounded-xl overflow-x-auto shadow-2xs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-surface-soft text-ink-deep font-semibold shadow-2xs"
                  : "text-steel hover:text-ink hover:bg-surface-soft/60"
              )}
            >
              {tab.dot && <span className={cn("w-1.5 h-1.5 rounded-full", tab.dot)} />}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded-full",
                  activeTab === tab.id ? "bg-canvas text-ink-deep font-bold" : "text-stone"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bảng Danh Sách Đơn Nghỉ Phép */}
      <TableLeaveRequests
        requests={paginatedRequests}
        isLoading={isLoading}
        isAdmin={isAdmin}
        employeesMap={employeesMap}
        onApprove={(row) => handleOpenConfirmModal(row, "approve")}
        onReject={(row) => handleOpenConfirmModal(row, "reject")}
        emptyText={
          searchTerm || activeTab !== "all"
            ? "Không tìm thấy đơn nghỉ phép nào phù hợp với bộ lọc."
            : isAdmin
            ? "Hiện tại không có đơn xin nghỉ phép nào cần xử lý."
            : "Bạn chưa gửi bất kỳ đơn xin nghỉ phép nào."
        }
        emptyAction={
          !isAdmin && !searchTerm && activeTab === "all" ? (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Gửi đơn xin nghỉ phép đầu tiên</span>
            </button>
          ) : undefined
        }
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredRequests.length,
          onPageChange: (newPage) => setCurrentPage(newPage),
        }}
      />

      {/* 5. Modal Tạo Đơn Nghỉ Phép Mới */}
      <CreateLeaveRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* 6. Modal Xác Nhận Duyệt / Từ Chối */}
      <ConfirmLeaveRequestModal
        isOpen={Boolean(confirmModalData)}
        onClose={() => setConfirmModalData(null)}
        request={confirmModalData?.request}
        actionType={confirmModalData?.actionType}
        onConfirm={handleExecuteAction}
        isLoading={isActionSubmitting}
      />
    </div>
  );
}
