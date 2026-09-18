import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn.js";

/**
 * Component SearchInput dùng chung
 * Ô tìm kiếm chuẩn hóa với icon Search và nút Xóa nhanh
 *
 * @param {string} value - Giá trị ô nhập
 * @param {Function} onChange - Callback nhận event hoặc giá trị chuỗi
 * @param {Function} [onClear] - Callback khi bấm nút xóa (mặc định set value rỗng qua onChange)
 * @param {string} [placeholder="Tìm kiếm..."] - Văn bản gợi ý
 * @param {string} [className] - Class cho thẻ input
 * @param {string} [containerClassName] - Class cho wrapper container
 */
export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  className,
  containerClassName,
}) {
  const handleChange = (e) => {
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  const handleClear = () => {
    if (typeof onClear === "function") {
      onClear();
    } else if (typeof onChange === "function") {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={cn("relative flex-1 max-w-md", containerClassName)}>
      <Search className="w-4 h-4 text-stone absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full pl-9.5 pr-8 py-2 text-xs rounded-xl border border-hairline-soft bg-surface-soft/40 focus:bg-canvas focus:border-primary focus:outline-none transition-all placeholder:text-stone text-ink-deep shadow-2xs",
          className
        )}
      />
      {Boolean(value) && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa từ khóa tìm kiếm"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-surface-soft flex items-center justify-center text-stone hover:text-ink cursor-pointer transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
