import { useMemo } from "react";
import { FormikProvider, useFormik } from "formik";
import { CalendarPlus, Clock, Send } from "lucide-react";
import Modal from "@/components/modal/Modal";
import { InputField, TextareaField } from "@/components/form";
import { leaveRequestSchema } from "@/validators/leaveRequest.validator";
import { leaveRequestsServices } from "../services/leaveRequestsServices";
import { queryClient, QUERY_KEYS } from "@/config/queryClient";
import { toast } from "sonner";

export default function CreateLeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const formik = useFormik({
    initialValues: {
      fromDate: "",
      toDate: "",
      reason: "",
    },
    validationSchema: leaveRequestSchema,
    onSubmit: async (values) => {
      try {
        await leaveRequestsServices.createLeaveRequest({
          fromDate: values.fromDate,
          toDate: values.toDate,
          reason: values.reason.trim(),
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaveRequests });
        toast.success("Tạo đơn xin nghỉ phép thành công!");
        handleClose();
        onSuccess?.();
      } catch (error) {
        console.error("Lỗi khi tạo đơn xin nghỉ:", error);
        const serverMsg = error.response?.data?.message || "Không thể gửi đơn xin nghỉ phép";
        toast.error(serverMsg);
      }
    },
  });

  const { fromDate, toDate } = formik.values;

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
    formik.resetForm();
    onClose?.();
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
            disabled={formik.isSubmitting}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? (
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
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Khoảng ngày nghỉ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <InputField
              name="fromDate"
              type="date"
              label="Từ ngày"
              required
            />
            <InputField
              name="toDate"
              type="date"
              label="Đến ngày"
              required
              min={fromDate || undefined}
            />
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
          <TextareaField
            name="reason"
            label="Lý do xin nghỉ"
            required
            rows={3}
            maxLength={500}
            placeholder="Mô tả cụ thể lý do xin nghỉ phép (ví dụ: bận việc gia đình, ốm đau, giải quyết việc cá nhân...)"
          />
        </form>
      </FormikProvider>
    </Modal>
  );
}
