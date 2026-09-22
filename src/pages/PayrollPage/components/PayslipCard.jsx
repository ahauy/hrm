import { formatCurrency, numberToVietnameseWords } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatTime";
import { WorkDaysBadge, PayrollStatusBadge } from "./PayrollStatusBadge";
import {
  TrendingUp,
  MessageSquare,
  Printer,
  FileCheck,
  Receipt,
} from "lucide-react";

/**
 * Thẻ hiển thị Phiếu Lương Chi Tiết (Payslip Card)
 * Dùng chung cho cả trang Nhân viên (EmployeePayrollView) và Modal xem trước của Admin (PayslipModal)
 */
export default function PayslipCard({
  payroll,
  employeeInfo = {},
  showPrint = true,
  onOpenModal,
}) {
  if (!payroll) return null;

  const baseSalary = Number(payroll.baseSalary) || 0;
  const standardWorkDays = Number(payroll.standardWorkDays) || 22;
  const actualWorkDays = Number(payroll.actualWorkDays) || 0;
  const adjustment = Number(payroll.adjustment) || 0;
  const totalPay = Number(payroll.totalPay ?? payroll.finalSalary ?? 0);

  const salaryByWorkDays = Math.round(
    standardWorkDays > 0 ? (baseSalary / standardWorkDays) * actualWorkDays : 0
  );

  const fullName =
    employeeInfo.fullName ||
    payroll.fullName ||
    payroll.employeeName ||
    employeeInfo.username ||
    `Nhân viên #${payroll.employeeId || ""}`;

  const department =
    employeeInfo.department || payroll.department || "Chính thức";
  const position = employeeInfo.position || payroll.position || "Nhân viên";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-canvas border border-hairline-soft rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
      {/* Header phiếu lương */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-hairline-soft gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Kỳ chi trả thu nhập
            </span>
            {payroll.createdAt && (
              <span className="text-[11px] text-stone">
                • Chốt ngày: {formatDate(payroll.createdAt)}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-deep tracking-tight">
            Phiếu lương Tháng {payroll.month}
          </h2>
          <p className="text-xs text-steel mt-1">
            Nhân viên: <strong className="text-ink-deep font-semibold">{fullName}</strong> • Phòng ban:{" "}
            <span className="text-ink-deep font-medium">{department}</span> • Vị trí:{" "}
            <span className="text-ink-deep font-medium">{position}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PayrollStatusBadge isFinalized={true} />
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              title="Mở toàn màn hình chứng từ chi tiết"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hairline bg-surface-soft hover:bg-canvas text-primary font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Xem chi tiết</span>
            </button>
          )}
          {showPrint && (
            <button
              type="button"
              onClick={handlePrint}
              title="In phiếu lương"
              className="p-2 rounded-xl border border-hairline bg-surface-soft hover:bg-canvas text-slate hover:text-ink transition-colors cursor-pointer print:hidden shadow-2xs"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chi tiết tính toán 4 chỉ số chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
          <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
            Lương cơ bản
          </span>
          <span className="text-base font-bold text-ink-deep mt-1 block font-mono">
            {formatCurrency(baseSalary)}
          </span>
        </div>

        <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
          <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
            Ngày công đạt được
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-primary font-mono">
              {actualWorkDays}
            </span>
            <span className="text-xs text-steel font-mono">
              / {standardWorkDays} ngày chuẩn
            </span>
          </div>
          <div className="mt-2">
            <WorkDaysBadge actual={actualWorkDays} standard={standardWorkDays} />
          </div>
        </div>

        <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
          <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
            Lương theo ngày công
          </span>
          <span className="text-base font-bold text-ink-deep mt-1 block font-mono">
            {formatCurrency(salaryByWorkDays)}
          </span>
        </div>

        <div className="bg-surface-soft/60 p-4 rounded-2xl border border-hairline-soft">
          <span className="text-[11px] text-stone font-semibold uppercase tracking-wider block">
            Thưởng / Phạt
          </span>
          <span
            className={`text-base font-bold mt-1 block font-mono ${
              adjustment > 0
                ? "text-success"
                : adjustment < 0
                ? "text-critical"
                : "text-steel"
            }`}
          >
            {adjustment > 0 ? "+" : ""}
            {formatCurrency(adjustment)}
          </span>
        </div>
      </div>

      {/* Diễn giải công thức tính minh bạch */}
      <div className="bg-surface-soft/70 border border-hairline-soft rounded-2xl p-3.5 text-xs text-steel space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate text-[11px] uppercase tracking-wider">
          <FileCheck className="w-3.5 h-3.5 text-primary" />
          <span>Công thức tính lương thực nhận:</span>
        </div>
        <p className="font-mono text-[11px] text-charcoal">
          (Lương cơ bản ÷ Ngày công chuẩn) × Ngày công thực tế + Thưởng/Phạt
        </p>
        <p className="font-mono text-xs font-semibold text-ink-deep pt-0.5">
          = ({formatCurrency(baseSalary)} ÷ {standardWorkDays}) × {actualWorkDays}
          {adjustment >= 0 ? ` + ${formatCurrency(adjustment)}` : ` - ${formatCurrency(Math.abs(adjustment))}`}
          {" = "}
          <span className="text-primary font-bold">{formatCurrency(totalPay)}</span>
        </p>
      </div>

      {/* Ghi chú từ quản trị viên nếu có */}
      {payroll.note && (
        <div className="flex items-start gap-3 p-3.5 bg-surface-soft border border-hairline-soft rounded-2xl text-xs text-charcoal">
          <MessageSquare className="w-4 h-4 text-stone shrink-0 mt-0.5" />
          <div>
            <strong className="text-ink-deep block mb-0.5">Ghi chú từ quản trị viên:</strong>
            <span>{payroll.note}</span>
          </div>
        </div>
      )}

      {/* Tổng Thực Nhận (Hero Banner) */}
      <div className="bg-primary/10 border border-primary/25 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
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
            {formatCurrency(totalPay)}
          </span>
        </div>
      </div>

      {/* Dòng số tiền bằng chữ tiếng Việt */}
      <div className="px-5 py-2.5 bg-surface-soft/60 border border-hairline-soft rounded-xl flex items-start gap-2 text-xs">
        <span className="font-bold text-primary shrink-0">Bằng chữ:</span>
        <span className="italic font-medium text-ink-deep">
          {numberToVietnameseWords(totalPay)}
        </span>
      </div>
    </div>
  );
}
