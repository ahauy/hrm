import { useState, useMemo } from "react";
import Table from "../table/Table.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatTime.js";
import { WorkDaysBadge, PayrollStatusBadge } from "./PayrollStatusBadge.jsx";
import {
  Wallet,
  Calendar,
  Clock,
  TrendingUp,
  FileCheck2,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

export default function EmployeePayrollView({
  payrolls = [],
  currentMonth,
  isLoading = false,
  profile,
}) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Danh sách các tháng có bản ghi lương
  const availableMonths = useMemo(() => {
    const set = new Set();
    payrolls.forEach((p) => {
      if (p.month) set.add(p.month);
    });
    if (currentMonth) set.add(currentMonth);
    return Array.from(set).sort().reverse();
  }, [payrolls, currentMonth]);

  // Phiếu lương của tháng đang chọn
  const activePayroll = useMemo(() => {
    return payrolls.find((p) => p.month === selectedMonth) || null;
  }, [payrolls, selectedMonth]);

  // Cấu hình bảng lịch sử các tháng (Tái sử dụng Table.jsx)
  const historyColumns = useMemo(
    () => [
      {
        header: "Kỳ lương",
        accessor: "month",
        render: (val) => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold text-ink-deep text-xs">
              Tháng {val}
            </span>
          </div>
        ),
      },
      {
        header: "Ngày công (Thực tế / Chuẩn)",
        accessor: "actualWorkDays",
        align: "center",
        render: (_, row) => {
          const actual = Number(row.actualWorkDays || 0);
          const standard = Number(row.standardWorkDays || 26);
          return (
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs text-ink font-semibold">
                {actual} / {standard}
              </span>
              <WorkDaysBadge actual={actual} standard={standard} />
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
        render: (val, row) => {
          const adj = Number(val) || 0;
          return (
            <div className="flex items-center justify-end gap-1.5 font-mono text-xs">
              <span
                className={`font-semibold ${
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
              {row.note && (
                <span title={row.note} className="text-stone hover:text-ink cursor-help">
                  <MessageSquare className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Thực nhận",
        accessor: "finalSalary",
        align: "right",
        render: (val) => (
          <span className="font-mono text-xs font-bold text-primary">
            {formatCurrency(val || 0)}
          </span>
        ),
      },
      {
        header: "Ngày chốt",
        accessor: "createdAt",
        align: "center",
        render: (val) => (
          <span className="text-[11px] text-stone">
            {val ? formatDate(val) : "Đã lưu"}
          </span>
        ),
      },
      {
        header: "Hành động",
        align: "center",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => setSelectedMonth(row.month)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-deep font-semibold transition-colors cursor-pointer"
          >
            <span>Xem phiếu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Thanh chọn kỳ lương */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas p-4 rounded-2xl border border-hairline-soft shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-ink-deep flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Phiếu lương cá nhân: {profile?.fullName || profile?.username}</span>
          </h3>
          <p className="text-xs text-steel mt-0.5">
            Dữ liệu thu nhập chính thức được xác nhận bởi bộ phận Nhân sự & Quản trị.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate whitespace-nowrap">
            Chọn kỳ lương:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink outline-none cursor-pointer hover:bg-canvas transition-colors"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thẻ Phiếu Lương Chi Tiết (Payslip Card) */}
      {activePayroll ? (
        <div className="bg-canvas border border-hairline-soft rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header phiếu lương */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-hairline-soft gap-4">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                Kỳ chi trả thu nhập
              </span>
              <h2 className="text-xl font-bold text-ink-deep tracking-tight">
                Phiếu lương Tháng {activePayroll.month}
              </h2>
              <p className="text-xs text-steel mt-0.5">
                Nhân viên: <strong>{profile?.fullName || activePayroll.fullName}</strong> • Phòng ban: {profile?.department || "Chính thức"}
              </p>
            </div>
            <PayrollStatusBadge isFinalized={true} />
          </div>

          {/* Chi tiết tính toán công & lương */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
              <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
                Lương cơ bản
              </span>
              <span className="text-base font-bold text-ink-deep mt-1 block font-mono">
                {formatCurrency(activePayroll.baseSalary)}
              </span>
            </div>

            <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
              <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
                Ngày công đạt được
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-bold text-primary font-mono">
                  {activePayroll.actualWorkDays || 0}
                </span>
                <span className="text-xs text-steel font-mono">
                  / {activePayroll.standardWorkDays || 26} ngày chuẩn
                </span>
              </div>
              <div className="mt-2">
                <WorkDaysBadge
                  actual={activePayroll.actualWorkDays || 0}
                  standard={activePayroll.standardWorkDays || 26}
                />
              </div>
            </div>

            <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
              <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
                Lương theo ngày công
              </span>
              <span className="text-base font-bold text-ink-deep mt-1 block font-mono">
                {formatCurrency(
                  Math.round(
                    (Number(activePayroll.baseSalary || 0) /
                      (Number(activePayroll.standardWorkDays) || 26)) *
                      Number(activePayroll.actualWorkDays || 0)
                  )
                )}
              </span>
            </div>

            <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
              <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
                Thưởng / Phạt
              </span>
              <span
                className={`text-base font-bold mt-1 block font-mono ${
                  Number(activePayroll.adjustment) > 0
                    ? "text-success"
                    : Number(activePayroll.adjustment) < 0
                    ? "text-critical"
                    : "text-steel"
                }`}
              >
                {Number(activePayroll.adjustment) > 0 ? "+" : ""}
                {formatCurrency(activePayroll.adjustment || 0)}
              </span>
            </div>
          </div>

          {/* Ghi chú nếu có */}
          {activePayroll.note && (
            <div className="flex items-start gap-3 p-3.5 bg-surface-soft border border-hairline-soft rounded-2xl text-xs text-charcoal">
              <MessageSquare className="w-4 h-4 text-stone shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink-deep block mb-0.5">Ghi chú từ quản trị viên:</strong>
                <span>{activePayroll.note}</span>
              </div>
            </div>
          )}

          {/* Tổng Thực Nhận (Hero Banner) */}
          <div className="bg-primary/10 border border-primary/25 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">
                  Tổng thu nhập thực lĩnh (Net)
                </p>
                <p className="text-xs text-steel mt-0.5">
                  Đã bao gồm lương tính theo ngày công chấm công và các khoản điều chỉnh
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight block">
                {formatCurrency(activePayroll.finalSalary || 0)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-canvas border border-hairline-soft rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-soft text-stone mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-ink-deep">
            Kỳ lương Tháng {selectedMonth} chưa được chốt
          </h3>
          <p className="text-xs text-steel max-w-sm mx-auto leading-relaxed">
            Dữ liệu lương của bạn trong tháng này đang được quản lý tổng hợp từ hệ thống chấm công. Phiếu lương chính thức sẽ xuất hiện sau khi ban quản trị chốt lương.
          </p>
        </div>
      )}

      {/* Lịch sử các kỳ lương trước (Tái sử dụng Table.jsx) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-ink-deep uppercase tracking-wider flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-steel" />
          <span>Lịch sử các kỳ lương đã chi trả</span>
        </h4>
        <Table
          columns={historyColumns}
          data={payrolls}
          rowKey="id"
          isLoading={isLoading}
          emptyText="Bạn chưa có bản ghi lịch sử lương nào"
        />
      </div>
    </div>
  );
}
