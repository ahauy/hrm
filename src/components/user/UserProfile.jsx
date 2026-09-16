import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { cn } from "../../utils/cn.js";

export default function UserProfile() {
  const { profile, logOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.fullName || profile?.username || "Admin User";
  const userRole =
    profile?.role === "admin" ? "Quản trị viên" : profile?.role || "Nhân viên";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none py-1 px-1.5 rounded-xl hover:bg-surface-soft transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ring-2 ring-canvas shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-ink-deep group-hover:text-primary transition-colors leading-tight truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] font-medium text-steel mt-0.5">
            {userRole}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-steel group-hover:text-ink-deep transition-transform duration-200",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-60 bg-canvas rounded-xl shadow-lg border border-hairline-soft py-1.5 z-50 animate-in fade-in duration-150">
          <div className="px-4 py-3 border-b border-hairline-soft">
            <p className="text-xs font-bold text-ink-deep truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-steel truncate mt-0.5">
              {profile?.email || "admin@hrm.vn"}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-surface-soft text-slate text-[10px] font-medium border border-hairline-soft rounded-md">
              {userRole}
            </span>
          </div>

          <div className="py-1 px-1.5 space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate hover:text-primary hover:bg-surface-soft rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-steel" />
              Hồ sơ cá nhân
            </Link>
            <Link
              to="/setting"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate hover:text-primary hover:bg-surface-soft rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-steel" />
              Cài đặt hệ thống
            </Link>
          </div>

          <div className="border-t border-hairline-soft pt-1 mt-1 px-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                logOut();
              }}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-critical hover:bg-critical/10 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-critical" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
