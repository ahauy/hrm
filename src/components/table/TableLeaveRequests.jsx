import Table from "./Table";
import { Check, X, Calendar, Clock, User } from "lucide-react";
import { formatDate } from "../../utils/formatTime.js"

/**
 * Component TableLeaveRequests
 * Dùng chung Table.jsx để hiển thị danh sách đơn xin nghỉ phép
 *
 * @param {Array} requests - Danh sách đơn xin nghỉ phép từ API
 * @param {boolean} isLoading - Trạng thái loading
 * @param {boolean} isAdmin - Quyền người dùng (nếu admin có thêm cột người gửi & nút duyệt)
 * @param {Object} employeesMap - Map lookup { [employeeId]: employeeObject } để hiển thị tên NV
 * @param {Function} onApprove - Callback khi admin duyệt đơn
 * @param {Function} onReject - Callback khi admin từ chối đơn
 * @param {string} emptyText - Thông báo khi không có đơn
 */
export default function TableLeaveRequests({
  requests = [],
  isLoading = false,
  isAdmin = false,
  employeesMap = {},
  onApprove,
  onReject,
  emptyText = "Không có đơn nghỉ phép nào",
}) {
  // Trạng thái badge
  const renderStatus = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Từ chối
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Chờ duyệt
          </span>
        );
    }
  };

  // Cấu hình các cột hiển thị
  const columns = [
    {
      header: "Mã đơn",
      accessor: "id",
      className: "w-20 font-semibold text-neutral-900",
      render: (id) => <span className="text-neutral-500 font-mono text-xs">#{String(id).padStart(3, "0")}</span>,
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
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 border border-neutral-200 font-medium text-xs">
                    {emp?.fullName ? (
                      emp.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 leading-tight">
                      {emp?.fullName || `Nhân viên #${employeeId}`}
                    </p>
                    <p className="text-xs text-neutral-400 leading-tight">
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
        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
          <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="font-medium text-neutral-800">{formatDate(row.fromDate)}</span>
          <span className="text-neutral-400">&rarr;</span>
          <span className="font-medium text-neutral-800">{formatDate(row.toDate)}</span>
        </div>
      ),
    },
    {
      header: "Lý do",
      accessor: "reason",
      className: "max-w-xs",
      render: (reason) => (
        <span className="text-neutral-600 block truncate max-w-xs" title={reason}>
          {reason || <span className="text-neutral-300 italic">Không có lý do</span>}
        </span>
      ),
    },
    {
      header: "Ngày gửi",
      accessor: "createdAt",
      render: (createdAt) => (
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-neutral-300" />
          <span>{formatDate(createdAt)}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      align: "center",
      render: (status) => renderStatus(status),
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
                return <span className="text-xs text-neutral-300">Đã xử lý</span>;
              }

              return (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApprove?.(row)}
                    className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                    title="Duyệt đơn"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject?.(row)}
                    className="p-1.5 text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
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
      rowKey="id"
    />
  );
}
