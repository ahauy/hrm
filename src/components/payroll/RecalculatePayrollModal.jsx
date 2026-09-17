import { useState } from "react";
import Modal from "../modal/Modal.jsx";
import { formatCurrency, calculatePayroll } from "../../utils/formatCurrency.js";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { WorkDaysBadge } from "./PayrollStatusBadge.jsx";

function RecalculatePayrollContent({
  isOpen,
  onClose,
  employeeData,
  month,
  onRecalculate,
}) {
  const [adjustment, setAdjustment] = useState(Number(employeeData?.adjustment) || 0);
  const [note, setNote] = useState(employeeData?.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseSalary = Number(employeeData.baseSalary) || 0;
  const standardWorkDays = Number(employeeData.standardWorkDays) || 26;
  const actualWorkDays = Number(employeeData.actualWorkDays) || 0;

  const newEstimatedSalary = calculatePayroll({
    baseSalary,
    standardWorkDays,
    actualWorkDays,
    adjustment,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onRecalculate({
        employeeId: employeeData.employeeId || employeeData.id,
        month,
        adjustment: Number(adjustment) || 0,
        note: note.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi chốt lại bảng lương:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chốt lại bảng lương"
      description={`Tính toán lại từ đầu theo dữ liệu chấm công mới nhất • Tháng ${month}`}
      icon={<RefreshCw className="w-5 h-5 text-attention" />}
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
            className="px-5 py-2.5 rounded-xl bg-attention hover:bg-[#d9940c] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang tính lại...</span>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Xác nhận Chốt lại</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cảnh báo ghi đè */}
        <div className="flex items-start gap-3 p-3.5 bg-attention/10 border border-attention/30 rounded-2xl text-xs text-[#a06800]">
          <AlertTriangle className="w-5 h-5 shrink-0 text-attention mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Lưu ý quan trọng khi Chốt lại:</p>
            <p className="leading-relaxed text-[11px]">
              Hệ thống sẽ lấy số ngày chấm công thực tế mới nhất hiện tại ({actualWorkDays} ngày) và tính lại toàn bộ lương từ đầu, ghi đè hoàn toàn lên bản ghi đã chốt trước đây.
            </p>
          </div>
        </div>

        {/* Thông tin nhân viên và công mới */}
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
                Công chấm công mới
              </span>
              <span className="text-xs font-bold text-primary mt-0.5 block">
                {actualWorkDays} ngày
              </span>
            </div>
          </div>
        </div>

        {/* Dự kiến lương sau khi chốt lại */}
        <div className="bg-canvas rounded-2xl p-4 border border-hairline-soft space-y-2">
          <div className="flex justify-between text-xs text-steel">
            <span>Lương tính theo công mới ({actualWorkDays}/{standardWorkDays}):</span>
            <span className="font-semibold text-ink-deep">
              {formatCurrency(
                Math.round(
                  standardWorkDays > 0
                    ? (baseSalary / standardWorkDays) * actualWorkDays
                    : 0
                )
              )}
            </span>
          </div>
          <div className="flex justify-between text-xs text-steel">
            <span>Thưởng / Phạt:</span>
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
              Tổng thực lĩnh sau chốt lại:
            </span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(newEstimatedSalary)}
            </span>
          </div>
        </div>

        {/* Thưởng / phạt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Khoản thưởng / phạt (VND)
          </label>
          <input
            type="number"
            step="10000"
            value={adjustment}
            onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
            className="block w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all font-mono"
            placeholder="0"
          />
        </div>

        {/* Ghi chú */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Ghi chú
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all resize-none placeholder:text-stone"
            placeholder="Lý do chốt lại..."
          />
        </div>
      </form>
    </Modal>
  );
}

export default function RecalculatePayrollModal({
  isOpen,
  onClose,
  employeeData,
  month,
  onRecalculate,
}) {
  if (!isOpen || !employeeData) return null;

  return (
    <RecalculatePayrollContent
      key={`${employeeData.employeeId || employeeData.id}_recalc_${month}`}
      isOpen={isOpen}
      onClose={onClose}
      employeeData={employeeData}
      month={month}
      onRecalculate={onRecalculate}
    />
  );
}
