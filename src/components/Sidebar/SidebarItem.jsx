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
    <>
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "group flex items-start justify-start px-10 py-4.5 text-sm hover:bg-gray-500 transition-all duration-100",
          active
            ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200 z-10"
            : "text-neutral-500 hover:text-neutral-900 hover:bg-gray-300"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            {Icon && (
              <Icon
                className={cn(
                  "w-4 h-4",
                  active ? "text-white" : ""
                )}
              />
            )}
          </div>
          <span className="font-bold tracking-[0.15em] uppercase text-[10px]">
            {label}
          </span>
        </div>
      </Link>
    </>
  );
}
