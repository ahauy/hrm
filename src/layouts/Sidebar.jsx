import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Wallet,
  Settings,
  X,
} from "lucide-react";
import SidebarItem from "../components/Sidebar/SidebarItem.jsx";
import { cn } from "../utils/cn.js";
import { useAuthStore } from "../stores/useAuthStore.js";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = Boolean(profile?.role?.trim().toLowerCase().includes("admin"));

  const navGroups = [
    {
      title: "Tổng quan",
      items: [
        { icon: LayoutDashboard, label: "Bảng điều khiển", to: "/dashboard" },
      ],
    },
    {
      title: (isAdmin ? "Quản trị nhân sự" : "Nghỉ phép & Chấm công") ,
      items: [
        ...(isAdmin
          ? [{ icon: Users, label: "Hồ sơ nhân viên", to: "/employees" }]
          : []),
        { icon: Clock, label: "Bảng chấm công", to: "/attendance" },
        { icon: CalendarOff, label: "Đơn nghỉ phép", to: "/leave-requests" },
      ],
    },
    {
      title: "Tài chính",
      items: [
        { icon: Wallet, label: "Bảng lương & Công", to: "/payroll" },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { icon: Settings, label: "Cài đặt hệ thống", to: "/setting" },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-ink-deep/40 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-canvas border-r border-hairline-soft flex flex-col z-[60] transition-all duration-300 ease-in-out shadow-xs",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex justify-between items-center border-b border-hairline-soft shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xs tracking-tight">
              HR
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-ink-deep leading-none">
                HRM Platform
              </h1>
              <p className="text-[10px] font-medium text-steel mt-1">
                {isAdmin ? "Cổng quản trị viên" : "Cổng nhân viên"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-steel hover:text-ink-deep transition-colors cursor-pointer rounded-lg hover:bg-surface-soft"
            aria-label="Đóng sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-3 px-1 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-stone uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  active={
                    location.pathname === item.to ||
                    (item.to === "/dashboard" && location.pathname === "/")
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Discreet Footer: Version & System Status */}
        <div className="p-4 border-t border-hairline-soft shrink-0">
          <div className="flex items-center justify-between text-[11px] text-steel">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium text-slate text-[11px]">Hệ thống ổn định</span>
            </div>
            <span className="font-mono text-[10px] text-stone">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
