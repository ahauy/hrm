import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import Modal from "@/components/modal/Modal";

/**
 * Modal xác nhận Xóa nhân viên
 * @param {boolean} isOpen - Trạng thái mở modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {Object|null} employee - Thông tin nhân viên được chọn xóa
 * @param {Function} onConfirm - Hàm xử lý gọi API xóa
 * @param {boolean} isLoading - Trạng thái đang xóa (loading)
 * @param {boolean} isSelf - Có phải là chính tài khoản đang đăng nhập hay không
 */
export default function DeleteEmployeeModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
  isLoading = false,
  isSelf = false,
}) {
  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      icon={<AlertTriangle className="w-5 h-5 text-critical" />}
      title="Xác nhận xóa nhân viên"
      description="Hành động này sẽ xóa vĩnh viễn tài khoản nhân viên khỏi hệ thống."
      size="md"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          {!isSelf && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-critical text-white text-xs font-semibold hover:bg-critical/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa nhân viên</span>
                </>
              )}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Trường hợp tự xóa chính tài khoản */}
        {isSelf ? (
          <div className="p-4 rounded-2xl bg-critical/10 border border-critical/30 flex items-start gap-3 text-xs text-critical">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-critical-strong">
                Không thể xóa tài khoản của chính bạn!
              </p>
              <p className="mt-1 text-critical/90 leading-relaxed">
                Hệ thống không cho phép quản trị viên tự xóa tài khoản đang đăng nhập
                để tránh mất quyền kiểm soát hệ thống.
              </p>
            </div>
          </div>
        ) : null}

        {/* Thông tin nhân viên được chọn xóa */}
        <div className="p-4 rounded-2xl bg-surface-soft/60 border border-hairline-soft space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
              {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink-deep text-sm truncate">
                {employee.fullName || "Chưa cập nhật tên"}
              </p>
              <p className="text-xs text-steel mt-0.5 font-mono">
                @{employee.username} • ID: {employee.id}
              </p>
            </div>
          </div>

          <div className="h-px bg-hairline-soft" />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-steel block text-[11px]">Email:</span>
              <span className="font-medium text-ink-deep truncate block mt-0.5">
                {employee.email || "-"}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Phòng ban:</span>
              <span className="font-medium text-ink-deep truncate block mt-0.5">
                {employee.department || "Chưa phân bổ"}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Chức vụ:</span>
              <span className="font-medium text-ink-deep truncate block mt-0.5">
                {employee.position || "Chưa thiết lập"}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Vai trò:</span>
              <span className="font-semibold text-ink-deep capitalize block mt-0.5">
                {employee.role === "admin" ? "Quản trị viên" : "Nhân viên"}
              </span>
            </div>
          </div>
        </div>

        {/* Cảnh báo không thể hoàn tác */}
        {!isSelf && (
          <div className="flex items-start gap-2 text-xs text-stone p-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-attention mt-0.5" />
            <span>
              Cảnh báo: Dữ liệu bị xóa sẽ không thể phục hồi. Tất cả thông tin liên quan
              đến tài khoản này sẽ bị loại bỏ khỏi danh sách nhân viên.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
