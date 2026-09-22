import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-[96vw]",
};

/**
 * Modal dùng chung cho toàn bộ dự án
 * - Sử dụng ReactDOM.createPortal() để render trực tiếp vào document.body
 * - Tự động khóa cuộn trang (body scroll lock)
 * - Hỗ trợ phím ESC và click ra ngoài backdrop để đóng
 * - Dễ dàng tùy biến tiêu đề, icon, nội dung (children) và nút hành động (footer)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  bodyClassName,
  overlayClassName,
}) {
  // 1. Lắng nghe phím ESC để đóng Modal
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // 2. Khóa cuộn trang khi Modal đang mở
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [isOpen]);

  // Nếu modal không mở, không render gì cả
  if (!isOpen) return null;

  const maxWidthClass = SIZE_MAP[size] || size || SIZE_MAP.md;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 bg-ink-deep/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 z-[999]",
        overlayClassName
      )}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-custom-title" : undefined}
    >
      <div
        className={cn(
          "bg-canvas border border-hairline-soft rounded-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200",
          maxWidthClass,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        {(title || showCloseButton) && (
          <div className="p-5 sm:p-6 border-b border-hairline-soft flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3
                    id="modal-custom-title"
                    className="text-base sm:text-lg font-bold text-ink-deep"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-steel mt-0.5">{description}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng modal"
                className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body Modal */}
        <div
          className={cn(
            "p-5 sm:p-6 overflow-y-auto text-xs text-charcoal leading-relaxed",
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="p-4 sm:px-6 border-t border-hairline-soft flex items-center justify-end gap-2 shrink-0 bg-surface-soft/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  const modalRoot = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, modalRoot);
}
