import { useField } from "formik";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Custom Formik Textarea Field
 * @param {Object} props
 * @param {string} props.name - Tên trường Formik
 * @param {string} [props.label] - Nhãn hiển thị
 * @param {boolean} [props.required] - Bắt buộc nhập (hiển thị *)
 * @param {number} [props.rows=3] - Số hàng mặc định
 * @param {number} [props.maxLength] - Giới hạn ký tự tối đa
 * @param {boolean} [props.showCount] - Có hiển thị bộ đếm ký tự không
 * @param {React.ReactNode} [props.helperText] - Dòng ghi chú phía dưới
 * @param {string} [props.className] - CSS class tùy biến bao ngoài
 * @param {string} [props.inputClassName] - CSS class tùy biến cho textarea
 */
export default function TextareaField({
  name,
  label,
  required,
  rows = 3,
  maxLength,
  showCount,
  helperText,
  className,
  inputClassName,
  ...props
}) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);
  const currentLength = (field.value || "").length;
  const shouldShowCount = showCount ?? Boolean(maxLength);

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || (shouldShowCount && maxLength)) && (
        <div className="flex items-center justify-between">
          {label ? (
            <label
              htmlFor={props.id || name}
              className="text-xs font-semibold text-ink-deep ml-0.5 block"
            >
              {label} {required && <span className="text-critical">*</span>}
            </label>
          ) : <div />}

          {shouldShowCount && maxLength && (
            <span className="text-[11px] text-steel font-mono">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        {...field}
        {...props}
        id={props.id || name}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "block w-full px-3 py-2.5 bg-surface-soft border rounded-xl text-ink text-xs focus:bg-canvas outline-none transition-all placeholder:text-stone resize-none",
          hasError
            ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
            : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20",
          inputClassName
        )}
      />

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
