import { useState, useMemo } from "react";
import Table from "../table/Table.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { WorkDaysBadge, PayrollStatusBadge } from "./PayrollStatusBadge.jsx";
import { usePagination } from "../../hooks/usePagination.js";
import SearchInput from "../common/SearchInput.jsx";
import { cn } from "../../utils/cn.js";
import {
  CheckCircle,
  Edit3,
  RefreshCw,
  Filter,
  User,
  MessageSquare,
  Eye,
} from "lucide-react";

export default function AdminPayrollTable({
  payrollData = [],
  standardWorkDays = 22,
  isLoading = false,
  onOpenFinalize,
  onOpenEdit,
  onOpenRecalculate,
  onOpenViewPayslip,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'finalized' | 'pending' | 'enough' | 'lack'
  const pageSize = 10;

  // Lọc dữ liệu theo từ khóa tìm kiếm và bộ lọc trạng thái
  const filteredData = useMemo(() => {
    return payrollData.filter((item) => {
      const name = (item.fullName || item.name || "").toLowerCase();
      const code = String(item.employeeId || item.id || "");
      const dept = (item.department || "").toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchSearch =
        !term || name.includes(term) || code.includes(term) || dept.includes(term);

      if (!matchSearch) return false;

      const isFinalized = Boolean(item.isFinalized || item.payrollId || item.totalPay !== undefined || item.finalSalary !== undefined);
      const isEnoughWorkDays = Number(item.actualWorkDays || 0) >= Number(item.standardWorkDays || standardWorkDays);

      if (statusFilter === "finalized") return isFinalized;
      if (statusFilter === "pending") return !isFinalized;
      if (statusFilter === "attendance_changed") return Boolean(item.isFinalized && item.hasAttendanceChanged);
      if (statusFilter === "enough") return isEnoughWorkDays;
      if (statusFilter === "lack") return !isEnoughWorkDays;

      return true;
    });
  }, [payrollData, searchTerm, statusFilter, standardWorkDays]);

  // Phân trang qua custom hook
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
  } = usePagination(filteredData, pageSize);

  // Số lượng nhân viên có cập nhật công mới
  const attendanceChangedCount = useMemo(() => {
    return payrollData.filter((i) => i.isFinalized && i.hasAttendanceChanged).length;
  }, [payrollData]);

  // Định nghĩa các cột cho Table.jsx
  const columns = useMemo(
    () => [
      {
        header: "Nhân viên",
        accessor: "fullName",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-soft border border-hairline-soft flex items-center justify-center font-bold text-steel text-xs shrink-0">
              <User className="w-4 h-4 text-stone" />
            </div>
            <div>
              <div className="font-semibold text-ink-deep text-xs">
                {row.fullName || row.name}
              </div>
              <div className="text-[11px] text-steel">
                {row.position || "Nhân sự"} • {row.department || "Văn phòng"}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Ngày công (Thực tế / Chuẩn)",
        accessor: "actualWorkDays",
        align: "center",
        render: (_, row) => {
          const actual = Number(row.actualWorkDays || 0);
          const standard = Number(row.standardWorkDays || standardWorkDays);
          return (
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xs font-semibold text-ink">
                <strong className={actual >= standard ? "text-success" : "text-attention"}>
                  {actual}
                </strong>{" "}
                / {standard} ngày
              </span>
              <WorkDaysBadge actual={actual} standard={standard} />
              {row.isFinalized && row.hasAttendanceChanged && (
                <span
                  title={`Dữ liệu chấm công hiện tại là ${row.liveActualWorkDays} ngày (${row.deltaDays > 0 ? `+${row.deltaDays}` : row.deltaDays} ngày so với bản chốt). Cần chốt lại!`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-attention/20 text-[#a06800] border border-attention/35 cursor-help"
                >
                  <span>⚡ Mới: {row.liveActualWorkDays} công</span>
                  <span>({row.deltaDays > 0 ? `+${row.deltaDays}` : row.deltaDays})</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Lương cơ bản",
        accessor: "baseSalary",
        align: "right",
        render: (val) => (
          <span className="font-mono text-xs text-slate">
            {formatCurrency(val || 0)}
          </span>
        ),
      },
      {
        header: "Thưởng / Phạt",
        accessor: "adjustment",
        align: "right",
        render: (_, row) => {
          const adj = Number(row.adjustment) || 0;
          const hasNote = Boolean(row.note);

          if (!row.isFinalized && row.adjustment === undefined) {
            return <span className="text-stone text-xs">-</span>;
          }

          return (
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`font-mono text-xs font-semibold ${
                  adj > 0
                    ? "text-success"
                    : adj < 0
                    ? "text-critical"
                    : "text-steel"
                }`}
              >
                {adj > 0 ? "+" : ""}
                {formatCurrency(adj)}
              </span>
              {hasNote && (
                <span title={row.note} className="cursor-help text-stone hover:text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Thực lĩnh",
        accessor: "finalSalary",
        align: "right",
        render: (_, row) => {
          const isFinalized = Boolean(row.isFinalized || row.payrollId || row.totalPay !== undefined || row.finalSalary !== undefined);
          const salary = isFinalized
            ? (row.totalPay ?? row.finalSalary ?? 0)
            : (row.expectedSalary ?? row.calculatedSalary ?? 0);

          return (
            <div className="flex flex-col items-end">
              <span
                className={`font-mono text-xs font-bold ${
                  isFinalized ? "text-primary" : "text-ink-deep"
                }`}
              >
                {formatCurrency(salary || 0)}
              </span>
              <span className="text-[10px] text-stone">
                {isFinalized ? "Đã chốt" : "Dự kiến"}
              </span>
            </div>
          );
        },
      },
      {
        header: "Trạng thái",
        accessor: "isFinalized",
        align: "center",
        render: (_, row) => (
          <PayrollStatusBadge
            isFinalized={Boolean(row.isFinalized || row.payrollId || row.totalPay !== undefined || row.finalSalary !== undefined)}
          />
        ),
      },
      {
        header: "Thao tác",
        align: "center",
        render: (_, row) => {
          const isFinalized = Boolean(row.isFinalized || row.payrollId || row.totalPay !== undefined || row.finalSalary !== undefined);

          if (!isFinalized) {
            return (
              <button
                type="button"
                onClick={() => onOpenFinalize(row)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-deep text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Chốt lương</span>
              </button>
            );
          }

          return (
            <div className="flex items-center justify-center gap-1.5">
              {onOpenViewPayslip && (
                <button
                  type="button"
                  onClick={() => onOpenViewPayslip(row)}
                  title="Xem chi tiết phiếu lương của nhân viên này"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hairline hover:bg-primary/5 text-primary hover:text-primary-deep text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem phiếu</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenEdit(row)}
                title="Sửa khoản thưởng/phạt hoặc ghi chú mà không đổi số ngày công đã ghi nhận"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hairline hover:bg-surface-soft text-slate hover:text-ink text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone" />
                <span>Sửa</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenRecalculate(row)}
                title={
                  row.hasAttendanceChanged
                    ? `Dữ liệu chấm công đã thay đổi: từ ${row.finalizedActualWorkDays} công thành ${row.liveActualWorkDays} công. Bấm để tính lại toàn bộ!`
                    : "Tính lại từ đầu theo dữ liệu chấm công mới nhất"
                }
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                  row.hasAttendanceChanged
                    ? "bg-attention/20 border-attention/50 text-[#a06800] hover:bg-attention/30 font-semibold shadow-2xs"
                    : "border-hairline hover:bg-attention/10 text-slate hover:text-[#a06800]"
                )}
              >
                <RefreshCw
                  className={cn(
                    "w-3.5 h-3.5 text-attention",
                    row.hasAttendanceChanged && "animate-spin text-attention"
                  )}
                  style={row.hasAttendanceChanged ? { animationDuration: "3s" } : undefined}
                />
                <span>Chốt lại</span>
              </button>
            </div>
          );
        },
      },
    ],
    [standardWorkDays, onOpenFinalize, onOpenEdit, onOpenRecalculate, onOpenViewPayslip]
  );

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên, mã NV hoặc phòng ban..."
          containerClassName="w-full sm:w-80 max-w-none"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-canvas border border-hairline rounded-xl px-2 py-1 shadow-2xs w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate font-medium py-1 pr-2 outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              {attendanceChangedCount > 0 && (
                <option value="attendance_changed">
                  ⚡ Có cập nhật công mới ({attendanceChangedCount})
                </option>
              )}
              <option value="pending">Chưa chốt lương</option>
              <option value="finalized">Đã chốt lương</option>
              <option value="enough">Đủ ngày công</option>
              <option value="lack">Thiếu ngày công</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tái sử dụng Table.jsx */}
      <Table
        columns={columns}
        data={paginatedData}
        rowKey={(row) => row.payrollId || row.employeeId || row.id}
        isLoading={isLoading}
        emptyText="Không tìm thấy nhân viên nào phù hợp với bộ lọc"
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredData.length,
          onPageChange: (newPage) => setCurrentPage(newPage),
        }}
      />
    </div>
  );
}
