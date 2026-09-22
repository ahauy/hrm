import { Shield, User } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Component RoleBadge dùng chung
 * Hiển thị huy hiệu vai trò của tài khoản (Quản trị viên / Nhân viên)
 *
 * @param {string} role - Tên vai trò (admin | employee)
 * @param {string} [className] - Class tùy biến
 * @param {"sm"|"md"} [size="sm"] - Kích thước hiển thị
 */
export default function RoleBadge({ role = "", className, size = "sm" }) {
  const isAdmin = (role || "").toLowerCase().includes("admin");

  if (isAdmin) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-semibold bg-primary/10 text-primary border border-primary/25 shadow-2xs select-none",
          size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
          className
        )}
      >
        <Shield className={cn("text-primary", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
        <span>Quản trị viên</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold bg-surface-soft text-slate border border-hairline-soft shadow-2xs select-none",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <User className={cn("text-steel", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>Nhân viên</span>
    </span>
  );
}
