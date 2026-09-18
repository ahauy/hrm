import { useState } from "react";
import Modal from "../modal/Modal.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { CheckCheck, Users, AlertCircle, Loader2 } from "lucide-react";
import { WorkDaysBadge } from "./PayrollStatusBadge.jsx";

export default function BatchFinalizeModal({
  isOpen,
  onClose,
  unfinalizedEmployees = [],
  month,
  standardWorkDays = 22,
  onConfirmBatch,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalEstimated = unfinalizedEmployees.reduce(
    (sum, emp) => sum + (Number(emp.expectedSalary || emp.calculatedSalary) || 0),
    0
  );

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmBatch(unfinalizedEmployees, (completedCount, total) => {
        setProgress(Math.round((completedCount / total) * 100));
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi chốt lương hàng loạt:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chốt lương hàng loạt"
      description={`Chốt lương cho tất cả ${unfinalizedEmployees.length} nhân viên chưa chốt trong tháng ${month}`}
      icon={<CheckCheck className="w-5 h-5 text-primary" />}
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
            onClick={handleConfirm}
            disabled={isSubmitting || unfinalizedEmployees.length === 0}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý ({progress}%)...</span>
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>Xác nhận Chốt tất cả ({unfinalizedEmployees.length} nhân sự)</span>
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Banner tóm tắt */}
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-deep">
                {unfinalizedEmployees.length} nhân viên chưa chốt lương
              </p>
              <p className="text-[11px] text-steel">
                Thưởng/phạt mặc định: 0 ₫ • Tính tự động theo công thực tế
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone uppercase tracking-wider font-semibold block">
              Tổng quỹ dự kiến
            </span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(totalEstimated)}
            </span>
          </div>
        </div>

        {/* Danh sách nhân viên sẽ chốt */}
        <div className="border border-hairline-soft rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-soft border-b border-hairline-soft text-[11px] font-bold text-slate">
                <th className="px-4 py-2.5">Nhân viên</th>
                <th className="px-4 py-2.5 text-center">Công thực tế / Chuẩn</th>
                <th className="px-4 py-2.5 text-right">Lương cơ bản</th>
                <th className="px-4 py-2.5 text-right">Lương dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {unfinalizedEmployees.map((emp) => (
                <tr key={emp.employeeId || emp.id} className="hover:bg-surface-soft/40">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-ink-deep">{emp.fullName || emp.name}</p>
                    <p className="text-[10px] text-steel">{emp.position || "Nhân viên"}</p>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-mono font-medium">
                        {emp.actualWorkDays || 0} / {emp.standardWorkDays || standardWorkDays}
                      </span>
                      <WorkDaysBadge
                        actual={emp.actualWorkDays || 0}
                        standard={emp.standardWorkDays || standardWorkDays}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-steel">
                    {formatCurrency(emp.baseSalary || 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-primary">
                    {formatCurrency(emp.expectedSalary || emp.calculatedSalary || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-steel">
          <AlertCircle className="w-4 h-4 text-stone shrink-0" />
          <span>
            Bạn vẫn có thể bấm "Sửa điều chỉnh" hoặc "Chốt lại" cho từng người sau khi đã hoàn thành chốt hàng loạt.
          </span>
        </div>
      </div>
    </Modal>
  );
}
