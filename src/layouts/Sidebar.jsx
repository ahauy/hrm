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

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: Users, label: "Quản lý nhân viên", to: "/employees" },
    { icon: Clock, label: "Chấm công", to: "/payroll" },
    { icon: CalendarOff, label: "Nghỉ phép", to: "/leave-requests" },
    { icon: Wallet, label: "Ngày công & lương", to: "/attendance" },
    { icon: Settings, label: "Cài đặt", to: "/setting" },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-neutral-950/40 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-white border-r border-neutral-100 flex flex-col z-[60] transition-all duration-300 ease-in-out shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-10 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif tracking-tighter text-neutral-900">
              HRM
            </h1>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.4em]">
              Control Panel
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Đóng sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 mt-8 space-y-1">
          {menuItems.map((item) => (
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
        </nav>
      </aside>
    </>
  );
}
