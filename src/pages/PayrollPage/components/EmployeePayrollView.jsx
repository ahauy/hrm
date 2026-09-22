import { useState, useMemo } from "react";
import Table from "@/components/table/Table";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatTime";
import { WorkDaysBadge } from "./PayrollStatusBadge";
import PayslipCard from "./PayslipCard";
import PayslipModal from "../dialogs/PayslipModal";
import {
  Wallet,
  Calendar,
  Clock,
  FileCheck2,
  MessageSquare,
  Receipt,
} from "lucide-react";

export default function EmployeePayrollView({
  payrolls = [],
  currentMonth,
  isLoading = false,
  profile,
}) {
  const [userSelectedMonth, setUserSelectedMonth] = useState(null);
  const [prevCurrentMonth, setPrevCurrentMonth] = useState(currentMonth);
  const [modalPayroll, setModalPayroll] = useState(null);

  if (prevCurrentMonth !== currentMonth) {
    setPrevCurrentMonth(currentMonth);
    setUserSelectedMonth(null);
  }

  const selectedMonth = userSelectedMonth || currentMonth;
  const setSelectedMonth = setUserSelectedMonth;

  // Kiểm tra chuỗi tháng chuẩn YYYY-MM
  const isValidMonth = (m) => /^\d{4}-(?:0[1-9]|1[0-2])$/.test(m);

  // Danh sách các tháng có bản ghi lương hợp lệ
  const availableMonths = useMemo(() => {
    const set = new Set();
    payrolls.forEach((p) => {
      if (p.month && isValidMonth(p.month)) set.add(p.month);
    });
    if (currentMonth && isValidMonth(currentMonth)) set.add(currentMonth);
    return Array.from(set).sort().reverse();
  }, [payrolls, currentMonth]);

  // Lọc danh sách bản ghi lương hợp lệ cho bảng lịch sử
  const validPayrolls = useMemo(() => {
    return payrolls.filter((p) => p.month && isValidMonth(p.month));
  }, [payrolls]);

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
          const standard = Number(row.standardWorkDays || 22);
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
        accessor: "totalPay",
        align: "right",
        render: (_, row) => {
          const pay = row.totalPay ?? row.finalSalary ?? 0;
          return (
            <span className="font-mono text-xs font-bold text-primary">
              {formatCurrency(pay)}
            </span>
          );
        },
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
        render: (_, row) => {
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth(row.month);
                  setModalPayroll({
                    ...row,
                    fullName: profile?.fullName || profile?.username,
                    department: profile?.department,
                    position: profile?.position,
                  });
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-hairline hover:bg-primary/5 text-primary hover:text-primary-deep font-semibold text-xs transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Xem chi tiết</span>
              </button>
            </div>
          );
        },
      },
    ],
    [profile, setSelectedMonth]
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
        <PayslipCard
          payroll={activePayroll}
          employeeInfo={profile}
          showPrint={true}
          onOpenModal={() =>
            setModalPayroll({
              ...activePayroll,
              fullName: profile?.fullName || profile?.username,
              department: profile?.department,
              position: profile?.position,
            })
          }
        />
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
          data={validPayrolls}
          rowKey={(row) => row.id || row.month}
          isLoading={isLoading}
          emptyText="Bạn chưa có bản ghi lịch sử lương nào"
        />
      </div>

      {/* Modal Chi tiết Phiếu lương chính thức */}
      <PayslipModal
        isOpen={Boolean(modalPayroll)}
        onClose={() => setModalPayroll(null)}
        payrollRecord={modalPayroll}
      />
    </div>
  );
}
