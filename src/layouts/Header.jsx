import { Menu, Search, Mail, Bell } from "lucide-react";
import UserProfile from "../components/user/UserProfile.jsx";

export default function Header({ onToggle }) {
  return (
    <header className="h-18 bg-canvas border-b border-hairline-soft flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 w-full backdrop-blur-md bg-canvas/95">
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-steel hover:text-ink-deep hover:bg-surface-soft rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Input tìm kiếm */}
        <div className="relative group w-full max-w-sm hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-full bg-surface-soft pl-10 pr-12 py-2 text-xs font-medium text-ink rounded-lg border border-transparent focus:border-primary focus:bg-canvas outline-none transition-all placeholder:text-stone"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-stone bg-canvas border border-hairline-soft rounded font-mono shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="relative p-2 text-steel hover:text-ink-deep hover:bg-surface-soft rounded-lg transition-colors cursor-pointer hidden xs:block"
            aria-label="Hộp thư"
          >
            <Mail className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-canvas" />
          </button>
          <button
            type="button"
            className="relative p-2 text-steel hover:text-ink-deep hover:bg-surface-soft rounded-lg transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-canvas" />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-hairline-soft mx-1 hidden sm:block" />

        {/* User Profile Component */}
        <UserProfile />
      </div>
    </header>
  );
}
