import { CheckCircle2, FileText } from "lucide-react";
import Modal from "@/components/modal/Modal";

export default function RegulationsModal({ isOpen = true, onClose, showModal }) {
  const handleClose = onClose || showModal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<FileText className="w-5 h-5" />}
      title="Quy chế Ca làm việc & Tính công"
      description="Áp dụng toàn thể cán bộ nhân viên công ty"
      size="md"
      footer={
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-charcoal active:scale-[0.98] transition-all cursor-pointer"
        >
          Đã hiểu
        </button>
      }
    >
      <div className="space-y-3.5 text-xs text-charcoal leading-relaxed">
        <div className="p-3.5 rounded-xl bg-surface-soft/60 border border-hairline-soft space-y-1.5">
          <div className="font-bold text-ink-deep flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Ca chuẩn & Giờ làm việc:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-steel pl-1">
            <li>
              Giờ vào ca chuẩn: <strong>08:30</strong>
            </li>
            <li>
              Giờ tan ca chuẩn: <strong>18:00</strong>
            </li>
            <li>
              Nghỉ trưa theo quy định: <strong>12:00 - 13:30</strong> (90 phút)
            </li>
            <li>
              Thời gian làm việc thực tế: <strong>8.0 giờ / ngày</strong>
            </li>
            <li>Ngày làm việc: Thứ Hai đến Thứ Sáu (Thứ Bảy & CN nghỉ)</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
