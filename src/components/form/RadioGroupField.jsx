import { useField } from "formik";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Custom Formik Radio Group (Card style) Field
 * @param {Object} props
 * @param {string} props.name - Tên trường Formik
 * @param {string} [props.label] - Tiêu đề nhóm radio
 * @param {boolean} [props.required] - Bắt buộc chọn (*)
 * @param {Array<{value: string, label: string, description?: string, icon?: import("lucide-react").LucideIcon, iconClassName?: string}>} props.options
 * @param {string} [props.gridCols="grid-cols-1 sm:grid-cols-2"] - Lưới hiển thị các thẻ radio
 * @param {string} [props.className] - CSS class tùy biến
 */
export default function RadioGroupField({
  name,
  label,
  required,
  options = [],
  gridCols = "grid-cols-1 sm:grid-cols-2",
  className,
}) {
  const [field, meta, helpers] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-ink-deep mb-2">
          {label} {required && <span className="text-critical">*</span>}
        </label>
      )}

      <div className={cn("grid gap-3", gridCols)}>
        {options.map((option) => {
          const isSelected = field.value === option.value;
          const OptionIcon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none",
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-hairline bg-canvas hover:border-primary/50 hover:bg-surface-soft/50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => helpers.setValue(option.value)}
                onBlur={() => helpers.setTouched(true)}
                className="mt-0.5 text-primary focus:ring-primary/20 accent-[#0064e0]"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink-deep flex items-center gap-1.5">
                  {OptionIcon && (
                    <OptionIcon
                      className={cn(
                        "w-3.5 h-3.5",
                        option.iconClassName || (isSelected ? "text-primary" : "text-steel")
                      )}
                    />
                  )}
                  <span>{option.label}</span>
                </p>
                {option.description && (
                  <p className="text-[11px] text-stone mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {hasError && (
        <p className="flex items-center gap-1 text-[11px] text-critical mt-1.5 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{meta.error}</span>
        </p>
      )}
    </div>
  );
}
