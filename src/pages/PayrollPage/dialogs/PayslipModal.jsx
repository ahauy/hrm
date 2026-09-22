import Modal from "@/components/modal/Modal";
import { formatCurrency, numberToVietnameseWords } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatTime";
import { WorkDaysBadge } from "../components/PayrollStatusBadge";
import {
  Printer,
  Building2,
  User,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Receipt,
  Coins,
  Award,
} from "lucide-react";

/**
 * Modal "Chi tiết phiếu lương" (Official Payslip Detail Modal)
 * Thiết kế theo phong cách chứng từ tài chính / séc chi trả doanh nghiệp cao cấp:
 * - Thông tin chứng từ chuẩn kế toán & mã số phiếu lương
 * - Hồ sơ nhân viên & bảng đo lường ngày công chuẩn/thực tế
 * - Bảng kê chi tiết thu nhập (Lương cơ bản, đơn giá công, thưởng/phạt)
 * - Diễn giải công thức toán học minh bạch
 * - Tổng thực lĩnh lớn (Net Pay) kèm số tiền bằng chữ tiếng Việt
 * - Dấu mộc & chữ ký điện tử xác thực
 * - Hỗ trợ in chứng từ tiêu chuẩn (Print-ready)
 */
export default function PayslipModal({ isOpen, onClose, payrollRecord }) {
  if (!payrollRecord) return null;

  const baseSalary = Number(payrollRecord.baseSalary) || 0;
  const standardWorkDays = Number(payrollRecord.standardWorkDays) || 22;
  const actualWorkDays = Number(payrollRecord.actualWorkDays) || 0;
  const adjustment = Number(payrollRecord.adjustment) || 0;
  const totalPay = Number(payrollRecord.totalPay ?? payrollRecord.finalSalary ?? 0);

  // Đơn giá công chuẩn mỗi ngày
  const dailyRate = standardWorkDays > 0 ? Math.round(baseSalary / standardWorkDays) : 0;

  // Lương theo ngày công thực tế
  const salaryByWorkDays = Math.round(dailyRate * actualWorkDays);

  // Tỷ lệ hoàn thành ngày công (%)
  const completionRate =
    standardWorkDays > 0 ? Math.min(Math.round((actualWorkDays / standardWorkDays) * 100), 100) : 0;

  const isEnoughWorkDays = actualWorkDays >= standardWorkDays;

  const fullName =
    payrollRecord.fullName ||
    payrollRecord.name ||
    payrollRecord.employeeName ||
    `Nhân sự #${payrollRecord.employeeId || ""}`;

  const department = payrollRecord.department || "Văn phòng";
  const position = payrollRecord.position || "Nhân viên chính thức";
  const employeeCode = `NV-${String(payrollRecord.employeeId || payrollRecord.id || "001").padStart(3, "0")}`;
  const payslipCode = `PL-${payrollRecord.month?.replace("-", "") || "202609"}-${String(
    payrollRecord.id || payrollRecord.payrollId || "01"
  ).padStart(3, "0")}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Phiếu lương"
      description={`Kỳ chi trả thu nhập Tháng ${payrollRecord.month} • Mã số: ${payslipCode}`}
      icon={<Receipt className="w-5 h-5 text-primary" />}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full print:hidden">
          <div className="flex items-center gap-2 text-xs text-steel">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Chứng từ đã được bộ phận Tài chính - Nhân sự phê duyệt điện tử</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-surface-soft hover:bg-canvas text-charcoal font-semibold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-stone" />
              <span>In phiếu lương</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-ink-deep print:p-0 print:text-black">
        {/* 1. Header Chứng từ Doanh nghiệp (Company & Document Header) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-soft via-canvas to-surface-soft border border-hairline-soft p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest block">
                  CÔNG TY CỔ PHẦN CÔNG NGHỆ & NHÂN SỰ
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-ink-deep tracking-tight mt-0.5">
                  PHIẾU CHI TRẢ LƯƠNG NHÂN VIÊN
                </h3>
                <p className="text-xs text-steel mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Kỳ lương: <strong className="text-ink-deep font-semibold">Tháng {payrollRecord.month}</strong></span>
                  <span className="text-hairline">•</span>
                  <span>Mã chứng từ: <span className="font-mono text-ink-deep font-semibold">{payslipCode}</span></span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-[#227c37] border border-success/30 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã chốt & Xác nhận</span>
              </div>
              {payrollRecord.createdAt && (
                <span className="text-[11px] text-stone">
                  Ngày lập: {formatDate(payrollRecord.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Thông tin nhân sự & Chỉ số ngày công (Employee Meta & Workday Metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card Thông tin nhân sự */}
          <div className="lg:col-span-2 rounded-2xl border border-hairline-soft bg-canvas p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate uppercase tracking-wider">
              <User className="w-4 h-4 text-primary" />
              <span>Thông tin người thụ hưởng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-soft/60 border border-hairline-soft">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone tracking-wider block">
                    Họ và tên
                  </span>
                  <p className="text-sm font-bold text-ink-deep">
                    {fullName}
                  </p>
                  <span className="text-[11px] font-mono text-steel">
                    Mã NV: {employeeCode}
                  </span>
                </div>
              </div>

              <div className="space-y-2 p-2.5 rounded-xl bg-surface-soft/60 border border-hairline-soft text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-steel">Phòng ban:</span>
                  <span className="font-semibold text-ink-deep">{department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-steel">Vị trí chức danh:</span>
                  <span className="font-semibold text-ink-deep">{position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-steel">Hình thức chi trả:</span>
                  <span className="font-semibold text-ink-deep">Chuyển khoản (Bank)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Chỉ số ngày công */}
          <div className="rounded-2xl border border-hairline-soft bg-canvas p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate uppercase tracking-wider">
                <Clock className="w-4 h-4 text-primary" />
                <span>Chỉ số ngày công</span>
              </div>
              <WorkDaysBadge actual={actualWorkDays} standard={standardWorkDays} />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-primary font-mono tabular-nums">
                  {actualWorkDays}
                </span>
                <span className="text-xs text-steel font-mono">
                  trên <strong className="text-ink-deep font-semibold">{standardWorkDays}</strong> ngày chuẩn
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden border border-hairline-soft">
                  <div
                    className={`h-full transition-all rounded-full ${
                      isEnoughWorkDays ? "bg-success" : "bg-attention"
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone">
                  <span>Hoàn thành: {completionRate}%</span>
                  <span>
                    {isEnoughWorkDays
                      ? "Đạt yêu cầu định mức"
                      : `Còn thiếu ${Math.max(0, standardWorkDays - actualWorkDays)} ngày`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bảng kê chi tiết thu nhập chuẩn kế toán (Income Statement Ledger) */}
        <div className="rounded-2xl border border-hairline-soft bg-canvas overflow-hidden shadow-2xs">
          <div className="bg-surface-soft/80 px-5 py-3 border-b border-hairline-soft flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate uppercase tracking-wider">
              <Coins className="w-4 h-4 text-primary" />
              <span>Bảng kê chi tiết các khoản thu nhập & điều chỉnh</span>
            </div>
            <span className="text-[11px] font-mono text-stone">Đơn vị: VNĐ</span>
          </div>

          <div className="divide-y divide-hairline-soft text-xs">
            {/* Hàng 1: Lương cơ bản */}
            <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
              <div>
                <span className="font-semibold text-ink-deep block">
                  1. Lương cơ bản theo hợp đồng
                </span>
                <span className="text-[11px] text-steel">
                  Mức lương thỏa thuận cố định ký kết trong hợp đồng lao động
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-ink-deep">
                {formatCurrency(baseSalary)}
              </span>
            </div>

            {/* Hàng 2: Đơn giá công chuẩn */}
            <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-soft/40 transition-colors bg-surface-soft/20">
              <div>
                <span className="font-medium text-slate block">
                  2. Đơn giá lương ngày công chuẩn
                </span>
                <span className="text-[11px] text-stone font-mono">
                  = Lương cơ bản ({formatCurrency(baseSalary)}) ÷ {standardWorkDays} ngày công
                </span>
              </div>
              <span className="font-mono text-xs text-steel">
                {formatCurrency(dailyRate)} / ngày
              </span>
            </div>

            {/* Hàng 3: Lương thực tế theo ngày công */}
            <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
              <div>
                <span className="font-semibold text-ink-deep block">
                  3. Lương tính theo ngày công thực tế
                </span>
                <span className="text-[11px] text-steel font-mono">
                  = {formatCurrency(dailyRate)} × {actualWorkDays} ngày thực tế
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-ink-deep">
                {formatCurrency(salaryByWorkDays)}
              </span>
            </div>

            {/* Hàng 4: Thưởng / Phụ cấp */}
            <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
              <div>
                <span className="font-semibold text-ink-deep block">
                  4. Khoản thưởng / Phụ cấp / KPI
                </span>
                <span className="text-[11px] text-steel">
                  Thưởng hiệu suất, phụ cấp trách nhiệm hoặc điều chỉnh cộng
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-success">
                {adjustment > 0 ? `+${formatCurrency(adjustment)}` : "0 ₫"}
              </span>
            </div>

            {/* Hàng 5: Khấu trừ / Phạt */}
            <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-soft/40 transition-colors">
              <div>
                <span className="font-semibold text-ink-deep block">
                  5. Các khoản giảm trừ / Phạt kỷ luật
                </span>
                <span className="text-[11px] text-steel">
                  Khấu trừ đi muộn, vi phạm nội quy hoặc điều chỉnh trừ
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-critical">
                {adjustment < 0 ? `-${formatCurrency(Math.abs(adjustment))}` : "0 ₫"}
              </span>
            </div>

            {/* Ghi chú điều chỉnh của Admin nếu có */}
            {payrollRecord.note && (
              <div className="p-4 sm:px-6 bg-surface-soft/40 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-stone shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-ink-deep">Ghi chú điều chỉnh từ HR: </span>
                  <span className="text-steel italic">"{payrollRecord.note}"</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Diễn giải công thức toán học minh bạch (Mathematical Transparency Card) */}
        <div className="rounded-2xl border border-hairline-soft bg-surface-soft/60 p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate uppercase tracking-wider">
            <Award className="w-4 h-4 text-primary" />
            <span>Công thức tính lương chi tiết</span>
          </div>

          <div className="bg-canvas rounded-xl p-3.5 border border-hairline-soft font-mono text-xs space-y-1">
            <div className="text-steel text-[11px]">
              Công thức áp dụng: (Lương cơ bản ÷ Ngày chuẩn) × Ngày công thực tế + Thưởng/Phạt = Thực nhận
            </div>
            <div className="text-sm font-bold text-ink-deep pt-1">
              = ({formatCurrency(baseSalary)} ÷ {standardWorkDays}) × {actualWorkDays}
              {adjustment >= 0 ? ` + ${formatCurrency(adjustment)}` : ` - ${formatCurrency(Math.abs(adjustment))}`}
              {" = "}
              <span className="text-primary font-black text-base">{formatCurrency(totalPay)}</span>
            </div>
          </div>
        </div>

        {/* 5. Tổng Lương Thực Lĩnh Hero Card (Grand Total Net Pay) */}
        <div className="rounded-3xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>TỔNG THU NHẬP THỰC LĨNH (NET TAKE-HOME PAY)</span>
              </div>
              <p className="text-xs text-steel">
                Số tiền thực nhận sau khi tính đủ công và áp dụng các khoản thưởng phạt
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-tight tabular-nums block">
                {formatCurrency(totalPay)}
              </span>
            </div>
          </div>

          {/* Dòng số tiền bằng chữ tiếng Việt chuẩn hóa */}
          <div className="mt-4 pt-3 border-t border-primary/20 flex items-start gap-2 text-xs">
            <span className="font-bold text-primary shrink-0">Bằng chữ:</span>
            <span className="italic font-medium text-ink-deep">
              {numberToVietnameseWords(totalPay)}
            </span>
          </div>
        </div>

        {/* 6. Phần Chữ ký & Xác nhận chứng từ (Signatures & Disclaimers) */}
        <div className="grid grid-cols-2 gap-6 pt-3 pb-2 text-center text-xs">
          <div className="space-y-12">
            <div>
              <p className="font-bold text-ink-deep uppercase tracking-wider">
                Người lập phiếu
              </p>
              <p className="text-[11px] text-stone italic">
                (Bộ phận Tài chính - Kế toán)
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã ký điện tử
              </span>
              <p className="text-[11px] font-semibold text-slate mt-1">HRM System</p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="font-bold text-ink-deep uppercase tracking-wider">
                Người nhận phiếu
              </p>
              <p className="text-[11px] text-stone italic">
                (Ký & ghi rõ họ tên)
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Xác nhận trực tuyến
              </span>
              <p className="text-[11px] font-semibold text-slate mt-1">{fullName}</p>
            </div>
          </div>
        </div>

        {/* Ghi chú bảo mật */}
        <p className="text-[11px] text-stone text-center italic pt-1 print:text-gray-600">
          * Phiếu lương là tài liệu bảo mật nội bộ giữa nhân viên và công ty. Nếu có bất kỳ sai lệch nào về ngày công hoặc số tiền, vui lòng phản hồi phòng Nhân sự trong vòng 03 ngày làm việc.
        </p>
      </div>
    </Modal>
  );
}
