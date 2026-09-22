import { useField } from "formik";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Custom Formik Checkbox Field
 * @param {Object} props
 * @param {string} props.name - Tên trường Formik
 * @param {React.ReactNode} [props.label] - Nhãn checkbox
 * @param {React.ReactNode} [props.description] - Mô tả phụ dưới nhãn
 * @param {string} [props.className] - CSS class tùy biến
 */
export default function CheckboxField({
  name,
  label,
  description,
  className,
  ...props
}) {
  const [field, meta] = useField({ name, type: "checkbox" });
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start space-x-2 ml-0.5">
        <input
          {...field}
          {...props}
          id={props.id || name}
          type="checkbox"
          checked={Boolean(field.value)}
          className="w-4 h-4 mt-0.5 rounded border-hairline text-primary focus:ring-primary accent-[#0064e0] cursor-pointer"
        />
        {(label || description) && (
          <label
            htmlFor={props.id || name}
            className="cursor-pointer select-none"
          >
            {label && (
              <span className="text-xs text-steel hover:text-ink transition-colors block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-stone block mt-0.5">
                {description}
              </span>
            )}
          </label>
        )}
      </div>

      {hasError && (
        <p className="flex items-center gap-1 text-[11px] text-critical ml-0.5 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{meta.error}</span>
        </p>
      )}
    </div>
  );
}
