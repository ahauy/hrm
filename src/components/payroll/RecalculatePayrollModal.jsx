import { useState } from "react";
import Modal from "../modal/Modal.jsx";
import { formatCurrency, calculatePayroll } from "../../utils/formatCurrency.js";
import { RefreshCw, AlertTriangle, Clock, User } from "lucide-react";

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
  const standardWorkDays = Number(employeeData.standardWorkDays) || 22;

  // Số ngày công đã chốt cũ vs số ngày công thực tế mới nhất hiện tại từ chấm công
  const oldActualWorkDays = Number(
    employeeData.finalizedActualWorkDays ?? employeeData.actualWorkDays ?? 0
  );
  const newActualWorkDays = Number(
    employeeData.liveActualWorkDays ?? employeeData.actualWorkDays ?? 0
  );

  const hasAttendanceChanged = Boolean(
    employeeData.hasAttendanceChanged ||
      (newActualWorkDays !== oldActualWorkDays && oldActualWorkDays !== 0)
  );
  const deltaDays = newActualWorkDays - oldActualWorkDays;

  // Lương theo ngày công cũ
  const oldSalaryByWorkDays = Math.round(
    standardWorkDays > 0 ? (baseSalary / standardWorkDays) * oldActualWorkDays : 0
  );
  const oldTotalPay = Number(employeeData.totalPay ?? employeeData.finalSalary ?? 0);

  // Lương theo ngày công mới
  const newSalaryByWorkDays = Math.round(
    standardWorkDays > 0 ? (baseSalary / standardWorkDays) * newActualWorkDays : 0
  );

  // Lương thực nhận mới dự kiến
  const newEstimatedSalary = calculatePayroll({
    baseSalary,
    standardWorkDays,
    actualWorkDays: newActualWorkDays,
    adjustment,
  });

  const deltaSalary = newEstimatedSalary - oldTotalPay;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const empId = employeeData.employeeId || employeeData.id;
      await onRecalculate({
        employeeId: empId,
        month,
        adjustment: Number(adjustment) || 0,
        note: note.trim() || (hasAttendanceChanged ? `Chốt lại theo chấm công mới (${newActualWorkDays} ngày công)` : "Tính toán lại từ đầu"),
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
      description={`Tính toán lại từ đầu theo dữ liệu chấm công mới nhất • Kỳ lương Tháng ${month}`}
      icon={<RefreshCw className="w-5 h-5 text-attention" />}
      size="lg"
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
            className="px-5 py-2.5 rounded-xl bg-attention hover:bg-[#d9940c] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span>Đang tính lại & chốt...</span>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Xác nhận Chốt lại & Cập nhật</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Cảnh báo / Thông tin cập nhật */}
        {hasAttendanceChanged ? (
          <div className="flex items-start gap-3 p-4 bg-attention/15 border border-attention/35 rounded-2xl text-xs text-[#a06800]">
            <AlertTriangle className="w-5 h-5 shrink-0 text-attention mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">
                Phát hiện dữ liệu chấm công đã thay đổi sau khi chốt!
              </p>
              <p className="leading-relaxed text-[11px]">
                Bản ghi lương hiện tại được chốt với <strong>{oldActualWorkDays} ngày công</strong>.
                Tuy nhiên, hệ thống chấm công hiện ghi nhận{" "}
                <strong className="underline">{newActualWorkDays} ngày công</strong> (
                {deltaDays > 0 ? `tăng +${deltaDays} ngày` : `giảm ${deltaDays} ngày`}).
                Khi bạn bấm Chốt lại, hệ thống sẽ tính lại toàn bộ theo <strong>{newActualWorkDays} ngày công mới</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3.5 bg-surface-soft border border-hairline-soft rounded-2xl text-xs text-steel">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-ink-deep">Đồng bộ lại từ đầu</p>
              <p className="text-[11px]">
                Hệ thống sẽ lấy toàn bộ số công chấm công mới nhất hiện tại ({newActualWorkDays} ngày) và tính lại toàn bộ lương từ đầu, ghi đè lên bản ghi trước đây.
              </p>
            </div>
          </div>
        )}

        {/* Thông tin nhân viên */}
        <div className="flex items-center justify-between p-3.5 bg-surface-soft/60 rounded-2xl border border-hairline-soft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-deep">
                {employeeData.fullName || employeeData.name}
              </p>
              <p className="text-[11px] text-steel">
                {employeeData.position || "Nhân viên"} • {employeeData.department || "Văn phòng"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone tracking-wider block">
              Lương cơ bản
            </span>
            <span className="text-xs font-bold font-mono text-ink-deep">
              {formatCurrency(baseSalary)}
            </span>
          </div>
        </div>

        {/* Bảng đối chiếu Trước vs Sau khi chốt lại (Comparison Grid) */}
        <div className="rounded-2xl border border-hairline-soft bg-canvas overflow-hidden shadow-2xs">
          <div className="bg-surface-soft/80 px-4 py-2.5 border-b border-hairline-soft text-xs font-bold text-slate uppercase tracking-wider">
            Bảng đối chiếu trước & sau khi chốt lại
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-hairline-soft text-xs">
            {/* Cột 1: Dữ liệu đã chốt cũ */}
            <div className="p-4 space-y-2.5 bg-surface-soft/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate uppercase text-[10px] tracking-wider">
                  Bản ghi đã chốt cũ
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-soft text-stone border border-hairline-soft">
                  Hiện tại
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-steel">Số ngày công:</span>
                  <span className="font-mono font-semibold text-ink">
                    {oldActualWorkDays} / {standardWorkDays} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel">Lương theo công:</span>
                  <span className="font-mono text-slate">
                    {formatCurrency(oldSalaryByWorkDays)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel">Thưởng / Phạt cũ:</span>
                  <span className="font-mono text-slate">
                    {formatCurrency(employeeData.adjustment || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-hairline-soft font-bold">
                  <span className="text-steel">Thực nhận cũ:</span>
                  <span className="font-mono text-ink-deep">
                    {formatCurrency(oldTotalPay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột 2: Dữ liệu tính lại mới */}
            <div className="p-4 space-y-2.5 bg-attention/5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-attention uppercase text-[10px] tracking-wider">
                  Tính toán mới từ chấm công
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-attention/20 text-[#a06800] border border-attention/30">
                  Dự kiến mới
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-steel">Số ngày công mới:</span>
                  <span className="font-mono font-bold text-primary">
                    {newActualWorkDays} / {standardWorkDays} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel">Lương theo công mới:</span>
                  <span className="font-mono font-semibold text-ink-deep">
                    {formatCurrency(newSalaryByWorkDays)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel">Thưởng / Phạt mới:</span>
                  <span
                    className={`font-mono font-semibold ${
                      adjustment > 0
                        ? "text-success"
                        : adjustment < 0
                        ? "text-critical"
                        : "text-slate"
                    }`}
                  >
                    {adjustment > 0 ? `+${formatCurrency(adjustment)}` : formatCurrency(adjustment)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-hairline-soft font-bold">
                  <span className="text-ink-deep">Thực nhận mới:</span>
                  <span className="font-mono text-primary text-sm font-black">
                    {formatCurrency(newEstimatedSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh chênh lệch (Delta Bar) */}
          <div className="p-3 bg-surface-soft/80 border-t border-hairline-soft flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-steel font-medium">Chênh lệch sau khi chốt lại:</span>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className={deltaDays > 0 ? "text-success" : deltaDays < 0 ? "text-critical" : "text-steel"}>
                Công: {deltaDays > 0 ? `+${deltaDays}` : deltaDays} ngày
              </span>
              <span>•</span>
              <span className={deltaSalary > 0 ? "text-success" : deltaSalary < 0 ? "text-critical" : "text-steel"}>
                Lương: {deltaSalary >= 0 ? `+${formatCurrency(deltaSalary)}` : formatCurrency(deltaSalary)}
              </span>
            </div>
          </div>
        </div>

        {/* Input Thưởng / Phạt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Khoản thưởng / phạt áp dụng (VND)
          </label>
          <input
            type="number"
            step="10000"
            value={adjustment}
            onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
            className="block w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all font-mono shadow-2xs"
            placeholder="0"
          />
        </div>

        {/* Input Ghi chú lý do chốt lại */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate block">
            Ghi chú lý do chốt lại
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all resize-none placeholder:text-stone shadow-2xs"
            placeholder={
              hasAttendanceChanged
                ? `Chốt lại do cập nhật ${deltaDays > 0 ? `thêm ${deltaDays}` : `${Math.abs(deltaDays)}`} ngày công...`
                : "Lý do tính lại bảng lương..."
            }
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
