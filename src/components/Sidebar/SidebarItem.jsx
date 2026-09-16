import { Link } from "react-router-dom";
import { cn } from "../../utils/cn.js";

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  active,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 mx-3",
        active
          ? "bg-surface-soft text-primary font-semibold shadow-2xs"
          : "text-slate hover:text-ink-deep hover:bg-surface-soft/70"
      )}
    >
      {/* Vạch chỉ báo mép trái khi active */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
          aria-hidden="true"
        />
      )}
      <div className="relative shrink-0">
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4 transition-colors",
              active ? "text-primary" : "text-steel group-hover:text-ink"
            )}
          />
        )}
      </div>
      <span className="text-xs tracking-wide">
        {label}
      </span>
    </Link>
  );
}
