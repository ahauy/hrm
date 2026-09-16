import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Clock, Send, AlertCircle } from "lucide-react";
import Modal from "./Modal.jsx";
import { leaveRequestSchema } from "../../validators/leaveRequest.validator.js";
import { leaveRequestsServices } from "../../services/leaveRequestsServices.js";
import { toast } from "sonner";

export default function CreateLeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      fromDate: "",
      toDate: "",
      reason: "",
    },
  });

  const fromDate = useWatch({ control, name: "fromDate" });
  const toDate = useWatch({ control, name: "toDate" });
  const reason = useWatch({ control, name: "reason" }) || "";

  // Tính toán số ngày nghỉ dự kiến
  const daysDiff = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    if (end < start) return null;

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((end - start) / oneDay)) + 1;
    return diffDays;
  }, [fromDate, toDate]);

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const onSubmit = async (data) => {
    try {
      await leaveRequestsServices.createLeaveRequest({
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason.trim(),
      });
      toast.success("Tạo đơn xin nghỉ phép thành công!");
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi tạo đơn xin nghỉ:", error);
      const serverMsg = error.response?.data?.message || "Không thể gửi đơn xin nghỉ phép";
      toast.error(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<CalendarPlus className="w-5 h-5" />}
      title="Tạo đơn xin nghỉ phép"
      description="Điền thông tin khoảng thời gian và lý do xin nghỉ"
      size="md"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Gửi đơn</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Khoảng ngày nghỉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Từ ngày */}
          <div>
            <label className="block text-xs font-semibold text-ink-deep mb-1.5">
              Từ ngày <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("fromDate")}
                className={`w-full px-3 py-2 rounded-xl border text-xs text-ink bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.fromDate ? "border-critical focus:border-critical" : "border-hairline focus:border-primary"
                }`}
              />
            </div>
            {errors.fromDate && (
              <p className="text-[11px] text-critical flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.fromDate.message}
              </p>
            )}
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-xs font-semibold text-ink-deep mb-1.5">
              Đến ngày <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("toDate")}
                min={fromDate || undefined}
                className={`w-full px-3 py-2 rounded-xl border text-xs text-ink bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.toDate ? "border-critical focus:border-critical" : "border-hairline focus:border-primary"
                }`}
              />
            </div>
            {errors.toDate && (
              <p className="text-[11px] text-critical flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.toDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Thẻ hiển thị số ngày nghỉ tính toán được */}
        {daysDiff !== null && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Clock className="w-4 h-4" />
              <span>Tổng thời gian nghỉ:</span>
            </div>
            <span className="font-mono font-bold text-xs text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
              {daysDiff} ngày
            </span>
          </div>
        )}

        {/* Lý do nghỉ */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink-deep">
              Lý do xin nghỉ <span className="text-critical">*</span>
            </label>
            <span className="text-[11px] text-steel font-mono">
              {reason.length}/500
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="Mô tả cụ thể lý do xin nghỉ phép (ví dụ: bận việc gia đình, ốm đau, giải quyết việc cá nhân...)"
            {...register("reason")}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs text-ink bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
              errors.reason ? "border-critical focus:border-critical" : "border-hairline focus:border-primary"
            }`}
          />
          {errors.reason && (
            <p className="text-[11px] text-critical flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.reason.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
