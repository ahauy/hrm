import Table from "./Table.jsx";
import RoleBadge from "../common/RoleBadge.jsx";
import {
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  Building,
  Calendar,
} from "lucide-react";
import { formatDate } from "../../utils/formatTime.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

/**
 * Component TableEmployees
 * Tái sử dụng Table.jsx để hiển thị danh sách toàn bộ nhân viên
 * @param {Array} employees - Danh sách nhân viên
 * @param {boolean} isLoading - Trạng thái đang tải dữ liệu
 * @param {Object} currentProfile - Thông tin tài khoản người dùng đang đăng nhập
 * @param {Function} onEdit - Callback khi bấm Sửa nhân viên
 * @param {Function} onDelete - Callback khi bấm Xóa nhân viên
 * @param {string} emptyText - Chuỗi thông báo khi không có dữ liệu
 * @param {ReactNode} emptyAction - Nút hành động khi bảng trống
 * @param {Object} pagination - Cấu hình phân trang
 */
export default function TableEmployees({
  employees = [],
  isLoading = false,
  currentProfile = null,
  onEdit,
  onDelete,
  emptyText = "Không tìm thấy nhân viên nào",
  emptyAction,
  pagination,
}) {
  const currentUserId = currentProfile?.id;
  const currentUsername = currentProfile?.username;

  const columns = [
    {
      header: "Nhân viên",
      accessor: "fullName",
      className: "min-w-[200px]",
      render: (_, row) => {
        const isSelf =
          (currentUserId && row.id === currentUserId) ||
          (currentUsername && row.username === currentUsername);

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
              {row.fullName ? row.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-ink-deep truncate block">
                  {row.fullName || "Chưa cập nhật họ tên"}
                </span>
                {isSelf && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary">
                    Bạn
                  </span>
                )}
              </div>
              <p className="text-[11px] text-steel font-mono mt-0.5">
                @{row.username} • ID: {row.id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Thông tin liên hệ",
      className: "min-w-[200px]",
      render: (_, row) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-charcoal truncate">
            <Mail className="w-3.5 h-3.5 text-stone shrink-0" />
            <span className="truncate">{row.email || "-"}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-steel text-[11px]">
              <Phone className="w-3.5 h-3.5 text-stone shrink-0" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Phòng ban & Vị trí",
      className: "min-w-[180px]",
      render: (_, row) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-ink-deep font-medium">
            <Building className="w-3.5 h-3.5 text-stone shrink-0" />
            <span>{row.department || "Chưa phân bổ"}</span>
          </div>
          <p className="text-[11px] text-steel pl-5">
            {row.position || "Chưa thiết lập"}
          </p>
        </div>
      ),
    },
    {
      header: "Vai trò",
      accessor: "role",
      className: "w-36",
      render: (role) => <RoleBadge role={role} />,
    },
    {
      header: "Lương cơ bản",
      accessor: "baseSalary",
      align: "right",
      className: "w-36",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-ink-deep">
          {formatCurrency(val || 0)}
        </span>
      ),
    },
    {
      header: "Ngày vào làm",
      accessor: "joinDate",
      className: "w-36",
      render: (joinDate) => (
        <div className="flex items-center gap-1.5 text-xs text-steel">
          <Calendar className="w-3.5 h-3.5 text-stone shrink-0" />
          <span>{formatDate(joinDate)}</span>
        </div>
      ),
    },
    {
      header: "Thao tác",
      align: "right",
      className: "w-28",
      render: (_, row) => {
        const isSelf =
          (currentUserId && row.id === currentUserId) ||
          (currentUsername && row.username === currentUsername);

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Nút Chỉnh sửa */}
            <button
              type="button"
              onClick={() => onEdit?.(row)}
              className="p-1.5 text-steel hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-primary/20"
              title={`Sửa thông tin nhân viên @${row.username}`}
              aria-label={`Sửa thông tin ${row.fullName}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Nút Xóa nhân viên (Khóa nếu là chính mình) */}
            {isSelf ? (
              <button
                type="button"
                disabled
                className="p-1.5 text-stone/40 bg-surface-soft/60 rounded-lg cursor-not-allowed border border-hairline-soft/50"
                title="Không thể tự xóa chính tài khoản đang đăng nhập"
                aria-label="Không thể tự xóa tài khoản của bạn"
              >
                <Lock className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDelete?.(row)}
                className="p-1.5 text-steel hover:text-critical hover:bg-critical/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-critical/20"
                title={`Xóa nhân viên @${row.username}`}
                aria-label={`Xóa nhân viên ${row.fullName}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={employees}
      isLoading={isLoading}
      emptyText={emptyText}
      emptyAction={emptyAction}
      pagination={pagination}
    />
  );
}
