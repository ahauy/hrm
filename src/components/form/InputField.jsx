import { useState } from "react";
import { useField } from "formik";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Custom Formik Input Field
 * @param {Object} props
 * @param {string} props.name - Tên trường trong Formik
 * @param {string} [props.label] - Nhãn hiển thị phía trên input
 * @param {boolean} [props.required] - Đánh dấu trường bắt buộc (hiển thị dấu *)
 * @param {import("lucide-react").LucideIcon} [props.icon] - Icon hiển thị bên trái input
 * @param {string} [props.type="text"] - Loại input ("text", "password", "email", "number", "date", v.v.)
 * @param {boolean} [props.showPasswordToggle=false] - Tự động hiển thị nút bật/tắt mật khẩu khi type="password"
 * @param {React.ReactNode} [props.rightElement] - Element tùy chỉnh ở góc trên bên phải (cùng hàng với label, ví dụ: Quên mật khẩu?)
 * @param {React.ReactNode} [props.helperText] - Dòng ghi chú nhỏ phía dưới input khi không có lỗi
 * @param {string} [props.className] - CSS class tùy biến cho container bao ngoài
 * @param {string} [props.inputClassName] - CSS class tùy biến thêm cho thẻ input
 */
export default function InputField({
  name,
  label,
  required,
  icon: Icon,
  type = "text",
  showPasswordToggle = false,
  rightElement,
  helperText,
  className,
  inputClassName,
  disabled,
  ...props
}) {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(meta.touched && meta.error);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || rightElement) && (
        <div className="flex items-center justify-between">
          {label ? (
            <label
              htmlFor={props.id || name}
              className="text-xs font-semibold text-ink-deep ml-0.5 block"
            >
              {label} {required && <span className="text-critical">*</span>}
            </label>
          ) : <div />}
          {rightElement}
        </div>
      )}

      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                hasError
                  ? "text-critical"
                  : "text-stone group-focus-within:text-primary"
              )}
            />
          </div>
        )}

        <input
          {...field}
          {...props}
          id={props.id || name}
          type={inputType}
          disabled={disabled}
          className={cn(
            "block w-full py-2.5 bg-surface-soft border rounded-xl text-ink text-xs focus:bg-canvas outline-none transition-all placeholder:text-stone",
            Icon ? "pl-10" : "pl-3.5",
            isPassword && showPasswordToggle ? "pr-11" : "pr-3.5",
            hasError
              ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
              : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20",
            disabled && "bg-surface-soft text-steel cursor-not-allowed border-hairline-soft",
            inputClassName
          )}
        />

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone hover:text-ink cursor-pointer transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {hasError ? (
        <p className="flex items-center gap-1 text-[11px] text-critical ml-0.5 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{meta.error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-stone ml-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
