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
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
      >
        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-white shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-black tracking-[0.15em] text-neutral-900 group-hover:text-neutral-600 transition-colors uppercase leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[8px] font-bold text-neutral-400 tracking-[0.2em] uppercase">
            {userRole}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform duration-200",
            isOpen && "rotate-180 text-neutral-900",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in duration-150">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-[11px] font-black tracking-wider uppercase text-neutral-900 truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
              {profile?.email || "admin@hrm.vn"}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[8px] font-black uppercase tracking-widest rounded">
              {userRole}
            </span>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <User className="w-4 h-4 text-neutral-400" />
              Hồ sơ cá nhân
            </Link>
            <Link
              to="/setting"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              Cài đặt hệ thống
            </Link>
          </div>

          <div className="border-t border-neutral-100 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logOut();
              }}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
