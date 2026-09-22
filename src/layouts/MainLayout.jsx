import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/utils/cn";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024; // lay chieu rong cua so trinh duyet
    }
    return false;
  });


  // luôn cập nhật sự they đổi của kích thước màn hình
  useEffect(() => {
    let wasDesktop = window.innerWidth >= 1024;
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (wasDesktop !== isDesktop) {
        setIsSidebarOpen(isDesktop);
        wasDesktop = isDesktop;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="flex min-h-screen bg-surface-soft overflow-x-hidden font-sans">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          className={cn(
            "flex-1 min-h-screen flex flex-col transition-all duration-300 min-w-0 w-full",
            isSidebarOpen ? "lg:ml-72 lg:w-[calc(100%-18rem)]" : "lg:ml-0"
          )}
        >
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((prev) => !prev)}
          />

          <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full min-w-0">{children}</div>
        </main>
      </div>
    </>
  );
}
