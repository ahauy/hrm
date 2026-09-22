import { useState } from "react";
import Modal from "@/components/modal/Modal";
import { formatCurrency, calculatePayroll } from "@/utils/formatCurrency";
import { Edit3, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function EditPayrollContent({
  isOpen,
  onClose,
  payrollRecord,
  onUpdate,
}) {
  const [adjustment, setAdjustment] = useState(Number(payrollRecord?.adjustment) || 0);
  const [note, setNote] = useState(payrollRecord?.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseSalary = Number(payrollRecord.baseSalary) || 0;
  const standardWorkDays = Number(payrollRecord.standardWorkDays) || 22;
  const actualWorkDays = Number(payrollRecord.actualWorkDays) || 0;

  // Tính lương thực lĩnh sau điều chỉnh mới (giữ nguyên số ngày công đã chốt)
  const recalculatedSalary = calculatePayroll({
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
      const targetId = payrollRecord.payrollId || payrollRecord.id;
      if (!targetId) {
        throw new Error("Không tìm thấy ID bản ghi lương để cập nhật");
      }
      await onUpdate(targetId, {
        adjustment: Number(adjustment) || 0,
        note: note.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật lương đã chốt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa lương đã chốt"
      description={`Điều chỉnh thưởng/phạt hoặc ghi chú cho ${payrollRecord.fullName || payrollRecord.employeeName || "nhân viên"}`}
      icon={<Edit3 className="w-5 h-5" />}
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
              <span>Đang lưu...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner thông báo khóa ngày công */}
        <div className="flex items-center gap-2 p-3 bg-surface-soft/80 border border-hairline-soft rounded-2xl text-xs text-steel">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            Số ngày công đã chốt: <strong className="text-ink-deep font-semibold">{actualWorkDays} ngày</strong> (cố định, không làm thay đổi ngày công đã ghi nhận).
          </span>
        </div>

        {/* Thông tin lương cố định */}
        <div className="bg-canvas rounded-2xl p-4 border border-hairline-soft space-y-2">
          <div className="flex justify-between text-xs text-steel">
            <span>Lương cơ bản:</span>
            <span className="font-semibold text-ink-deep">
              {formatCurrency(baseSalary)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-steel">
            <span>Lương theo công đã chốt ({actualWorkDays}/{standardWorkDays} ngày):</span>
            <span className="font-semibold text-ink-deep">
              {formatCurrency(salaryByWorkDays)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-steel">
            <span>Thưởng/Phạt sau điều chỉnh:</span>
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
              Lương thực lĩnh mới:
            </span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(recalculatedSalary)}
            </span>
          </div>
        </div>

        {/* Ô sửa Thưởng / Phạt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Khoản thưởng / phạt mới (VND)
          </label>
          <input
            type="number"
            step="10000"
            value={adjustment}
            onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
            className="block w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all font-mono"
            placeholder="0"
          />
          <div className="flex items-center gap-1 text-[11px] text-steel">
            <AlertCircle className="w-3.5 h-3.5 text-stone shrink-0" />
            <span>Nhập số tiền dương cho thưởng (+), số âm cho phạt (-).</span>
          </div>
        </div>

        {/* Ô sửa Ghi chú */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Ghi chú điều chỉnh
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all resize-none placeholder:text-stone"
            placeholder="Lý do điều chỉnh lại bảng lương..."
          />
        </div>
      </form>
    </Modal>
  );
}

export default function EditPayrollModal({
  isOpen,
  onClose,
  payrollRecord,
  onUpdate,
}) {
  if (!isOpen || !payrollRecord) return null;

  return (
    <EditPayrollContent
      key={payrollRecord.id}
      isOpen={isOpen}
      onClose={onClose}
      payrollRecord={payrollRecord}
      onUpdate={onUpdate}
    />
  );
}
