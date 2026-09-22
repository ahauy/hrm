import Table from "@/components/table/Table";
import StatusBadge from "@/components/common/StatusBadge";
import { Check, X, Calendar, Clock, User } from "lucide-react";
import { formatDate } from "@/utils/formatTime";

/**
 * Component TableLeaveRequests
 * Dùng chung Table.jsx để hiển thị danh sách đơn xin nghỉ phép
 */
export default function TableLeaveRequests({
  requests = [],
  isLoading = false,
  isAdmin = false,
  employeesMap = {},
  onApprove,
  onReject,
  emptyText = "Không có đơn nghỉ phép nào",
  emptyAction,
  pagination,
}) {

  // Cấu hình các cột hiển thị
  const columns = [
    {
      header: "Mã đơn",
      accessor: "id",
      className: "w-20",
      render: (id) => (
        <span className="text-steel font-mono text-xs font-medium">
          #{String(id).padStart(3, "0")}
        </span>
      ),
    },
    // Nếu là Admin, hiển thị thông tin nhân viên gửi đơn
    ...(isAdmin
      ? [
          {
            header: "Nhân viên",
            accessor: "employeeId",
            render: (employeeId) => {
              const emp = employeesMap[employeeId];
              return (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-surface-soft text-slate flex items-center justify-center border border-hairline-soft font-bold text-xs">
                    {emp?.fullName ? (
                      emp.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4 text-stone" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-deep leading-tight text-xs">
                      {emp?.fullName || `Nhân viên #${employeeId}`}
                    </p>
                    <p className="text-[11px] text-steel leading-tight mt-0.5">
                      {emp?.department ? `${emp.department} • ` : ""}ID: {employeeId}
                    </p>
                  </div>
                </div>
              );
            },
          },
        ]
      : []),
    {
      header: "Thời gian nghỉ",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs text-ink">
          <Calendar className="w-3.5 h-3.5 text-steel shrink-0" />
          <span className="font-medium text-ink-deep">{formatDate(row.fromDate)}</span>
          <span className="text-stone">&rarr;</span>
          <span className="font-medium text-ink-deep">{formatDate(row.toDate)}</span>
        </div>
      ),
    },
    {
      header: "Lý do",
      accessor: "reason",
      className: "max-w-xs",
      render: (reason) => (
        <span className="text-slate block truncate max-w-xs text-xs" title={reason}>
          {reason || <span className="text-stone italic">Không có lý do</span>}
        </span>
      ),
    },
    {
      header: "Ngày gửi",
      accessor: "createdAt",
      render: (createdAt) => (
        <div className="flex items-center gap-1 text-xs text-steel">
          <Clock className="w-3.5 h-3.5 text-stone" />
          <span>{formatDate(createdAt)}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      align: "center",
      render: (status) => <StatusBadge status={status} />,
    },
    // Cột hành động (chỉ hiện nút thao tác cho Admin)
    ...(isAdmin
      ? [
          {
            header: "Hành động",
            align: "right",
            render: (_, row) => {
              const isPending = (row.status || "").toLowerCase() === "pending";

              if (!isPending) {
                return <span className="text-xs text-stone">Đã xử lý</span>;
              }

              return (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApprove?.(row)}
                    className="p-1.5 text-[#227c37] hover:bg-success/20 bg-success/10 rounded-lg transition-colors cursor-pointer border border-success/30"
                    title="Duyệt đơn"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject?.(row)}
                    className="p-1.5 text-critical hover:bg-critical/20 bg-critical/10 rounded-lg transition-colors cursor-pointer border border-critical/30"
                    title="Từ chối đơn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={requests}
      isLoading={isLoading}
      emptyText={emptyText}
      emptyAction={emptyAction}
      pagination={pagination}
      rowKey="id"
    />
  );
}
