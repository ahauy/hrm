import { useState } from "react";
import Modal from "@/components/modal/Modal";
import { formatCurrency, calculatePayroll } from "@/utils/formatCurrency";
import { Calculator, CheckCircle, AlertCircle } from "lucide-react";
import { WorkDaysBadge } from "../components/PayrollStatusBadge";

function FinalizePayrollContent({
  isOpen,
  onClose,
  employeeData,
  month,
  onFinalize,
}) {
  const [adjustment, setAdjustment] = useState(Number(employeeData?.adjustment) || 0);
  const [note, setNote] = useState(employeeData?.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseSalary = Number(employeeData.baseSalary) || 0;
  const standardWorkDays = Number(employeeData.standardWorkDays) || 22;
  const actualWorkDays = Number(employeeData.actualWorkDays) || 0;

  const currentSalary = calculatePayroll({
    baseSalary,
    standardWorkDays,
    actualWorkDays,
    adjustment,
  });

  const salaryByWorkDays = Math.round(
    standardWorkDays > 0 ? (baseSalary / standardWorkDays) * actualWorkDays : 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onFinalize({
        employeeId: employeeData.employeeId || employeeData.id,
        month,
        adjustment: Number(adjustment) || 0,
        note: note.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi chốt lương:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chốt lương nhân viên"
      description={`Kỳ lương tháng ${month} • ${employeeData.fullName || employeeData.name}`}
      icon={<Calculator className="w-5 h-5" />}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-hairline text-slate hover:bg-surface-soft font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang chốt...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận Chốt lương</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thông tin nhân sự & Công */}
        <div className="bg-surface-soft/60 rounded-2xl p-4 border border-hairline-soft space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-deep">
                {employeeData.fullName || employeeData.name}
              </p>
              <p className="text-[11px] text-steel">
                {employeeData.position || "Nhân viên"} • {employeeData.department || "Văn phòng"}
              </p>
            </div>
            <WorkDaysBadge actual={actualWorkDays} standard={standardWorkDays} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-hairline-soft text-center">
            <div className="bg-canvas p-2.5 rounded-xl border border-hairline-soft">
              <span className="block text-[10px] text-stone uppercase tracking-wider font-semibold">
                Lương cơ bản
              </span>
              <span className="text-xs font-bold text-ink-deep mt-0.5 block">
                {formatCurrency(baseSalary)}
              </span>
            </div>
            <div className="bg-canvas p-2.5 rounded-xl border border-hairline-soft">
              <span className="block text-[10px] text-stone uppercase tracking-wider font-semibold">
                Công chuẩn
              </span>
              <span className="text-xs font-bold text-ink-deep mt-0.5 block">
                {standardWorkDays} ngày
              </span>
            </div>
            <div className="bg-canvas p-2.5 rounded-xl border border-hairline-soft">
              <span className="block text-[10px] text-stone uppercase tracking-wider font-semibold">
                Công thực tế
              </span>
              <span className="text-xs font-bold text-primary mt-0.5 block">
                {actualWorkDays} ngày
              </span>
            </div>
          </div>
        </div>

        {/* Công thức tính toán lương */}
        <div className="bg-canvas rounded-2xl p-4 border border-hairline-soft space-y-2">
          <div className="flex justify-between text-xs text-steel">
            <span>Lương theo công ({actualWorkDays}/{standardWorkDays}):</span>
            <span className="font-semibold text-ink-deep">
              {formatCurrency(salaryByWorkDays)}
            </span>
          </div>

          <div className="flex justify-between text-xs text-steel">
            <span>Khoản điều chỉnh (Thưởng / Phạt):</span>
            <span
              className={`font-semibold ${
                Number(adjustment) > 0
                  ? "text-success"
                  : Number(adjustment) < 0
                  ? "text-critical"
                  : "text-slate"
              }`}
            >
              {Number(adjustment) > 0 ? "+" : ""}
              {formatCurrency(adjustment)}
            </span>
          </div>

          <div className="pt-2 border-t border-hairline-soft flex items-center justify-between">
            <span className="text-xs font-bold text-ink-deep uppercase tracking-wide">
              Lương thực lĩnh:
            </span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(currentSalary)}
            </span>
          </div>
        </div>

        {/* Trường nhập Thưởng / Phạt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate block">
              Khoản thưởng / phạt (VND)
            </label>
            <span className="text-[11px] text-stone">
              (Dương là thưởng, âm là phạt)
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="10000"
              value={adjustment}
              onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
              className="block w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all font-mono"
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-steel">
            <AlertCircle className="w-3.5 h-3.5 text-stone shrink-0" />
            <span>Ví dụ: Nhập 500000 để thưởng, hoặc -200000 để trừ phạt kỷ luật.</span>
          </div>
        </div>

        {/* Trường nhập Ghi chú */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Ghi chú đính kèm
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all resize-none placeholder:text-stone"
            placeholder="Lý do thưởng/phạt hoặc lưu ý chốt lương..."
          />
        </div>
      </form>
    </Modal>
  );
}

export default function FinalizePayrollModal({
  isOpen,
  onClose,
  employeeData,
  month,
  onFinalize,
}) {
  if (!isOpen || !employeeData) return null;

  return (
    <FinalizePayrollContent
      key={`${employeeData.employeeId || employeeData.id}_${month}`}
      isOpen={isOpen}
      onClose={onClose}
      employeeData={employeeData}
      month={month}
      onFinalize={onFinalize}
    />
  );
}
