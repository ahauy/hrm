import { Menu, Search, Mail, Bell } from "lucide-react";
import UserProfile from "../components/user/UserProfile.jsx";

export default function Header({ onToggle, onClose }) {
  const handleToggle = onToggle || onClose;

  return (
    <>
      <header className="h-20 bg-white border-b border-neutral-100 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={handleToggle}
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative group w-full max-w-md hidden md:block">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
            <input
              type="text"
              placeholder="TÌM KIẾM HỆ THỐNG..."
              className="w-full bg-transparent pl-8 pr-4 py-2 text-[10px] font-bold tracking-[0.2em] outline-none border-b border-transparent focus:border-neutral-900 transition-all placeholder:text-neutral-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative group hidden xs:block">
              <Mail className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-900 rounded-full border-2 border-white shadow-sm" />
            </button>
            <button className="relative group">
              <Bell className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-900 rounded-full border-2 border-white shadow-sm" />
            </button>
          </div>

          <div className="h-6 w-[1.5px] bg-neutral-100 mx-1 sm:mx-2 hidden sm:block" />

          {/* User Profile Component */}
          <UserProfile />
        </div>
      </header>
    </>
  );
}
