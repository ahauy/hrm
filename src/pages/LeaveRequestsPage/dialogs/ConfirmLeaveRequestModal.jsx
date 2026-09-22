import { CheckCircle2, XCircle, AlertTriangle, Calendar, User } from "lucide-react";
import Modal from "@/components/modal/Modal";
import { formatDate } from "@/utils/formatTime";

export default function ConfirmLeaveRequestModal({
  isOpen,
  onClose,
  request,
  employee,
  actionType = "approve", // 'approve' | 'reject'
  onConfirm,
  isLoading = false,
}) {
  if (!request) return null;

  const isApprove = actionType === "approve";

  // Tính số ngày nghỉ
  let durationText = "";
  if (request.fromDate && request.toDate) {
    const start = new Date(request.fromDate);
    const end = new Date(request.toDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
      const oneDay = 24 * 60 * 60 * 1000;
      const days = Math.round(Math.abs((end - start) / oneDay)) + 1;
      durationText = `${days} ngày`;
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      icon={
        isApprove ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <XCircle className="w-5 h-5 text-critical" />
        )
      }
      title={isApprove ? "Xác nhận duyệt đơn nghỉ phép" : "Xác nhận từ chối đơn nghỉ phép"}
      description={
        isApprove
          ? "Đơn nghỉ phép này sẽ được chuyển sang trạng thái Đã duyệt."
          : "Đơn nghỉ phép này sẽ bị từ chối và thông báo đến nhân viên."
      }
      size="md"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? "bg-[#227c37] hover:bg-[#1c662e]"
                : "bg-critical hover:bg-critical/90"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{isApprove ? "Duyệt đơn" : "Từ chối"}</span>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Card tóm tắt thông tin đơn */}
        <div className="p-4 rounded-2xl bg-surface-soft/60 border border-hairline-soft space-y-3">
          {/* Nhân viên */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-soft text-slate flex items-center justify-center border border-hairline-soft font-bold text-sm shrink-0">
              {employee?.fullName ? (
                employee.fullName.charAt(0).toUpperCase()
              ) : (
                <User className="w-5 h-5 text-stone" />
              )}
            </div>
            <div>
              <p className="font-bold text-ink-deep text-sm leading-tight">
                {employee?.fullName || `Nhân viên #${request.employeeId}`}
              </p>
              <p className="text-xs text-steel mt-0.5">
                {employee?.department ? `${employee.department} • ` : ""}
                {employee?.position || `Mã NV: ${request.employeeId}`}
              </p>
            </div>
          </div>

          <div className="h-px bg-hairline-soft" />

          {/* Chi tiết thời gian */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-steel block text-[11px]">Thời gian nghỉ:</span>
              <div className="font-semibold text-ink-deep flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-steel shrink-0" />
                <span>
                  {formatDate(request.fromDate)} &rarr; {formatDate(request.toDate)}
                </span>
              </div>
            </div>
            {durationText && (
              <div>
                <span className="text-steel block text-[11px]">Tổng số ngày:</span>
                <span className="font-semibold text-ink-deep font-mono mt-0.5 block">
                  {durationText}
                </span>
              </div>
            )}
          </div>

          {/* Lý do xin nghỉ */}
          <div className="text-xs">
            <span className="text-steel block text-[11px] mb-1">Lý do xin nghỉ:</span>
            <div className="p-3 rounded-xl bg-canvas border border-hairline-soft text-charcoal leading-relaxed whitespace-pre-wrap">
              {request.reason || <span className="text-stone italic">Không có lý do</span>}
            </div>
          </div>
        </div>

        {/* Cảnh báo hành động */}
        <div className="flex items-start gap-2 text-xs text-stone p-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-attention mt-0.5" />
          <span>
            Hành động này sẽ cập nhật trực tiếp vào hệ thống và không thể hoàn tác sau khi đã xác nhận.
          </span>
        </div>
      </div>
    </Modal>
  );
}
