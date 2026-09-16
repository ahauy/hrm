import { useEffect } from "react";
import { X, Briefcase, Mail, Phone } from "lucide-react";
import AttendanceCalendar from "./AttendanceCalendar.jsx";

export default function EmployeeAttendanceModal({
  isOpen,
  onClose,
  employee,
  attendances = [],
  standardWorkDays = 22,
}) {
  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang nền khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  // Lọc chỉ lấy các bản ghi của nhân viên này
  const empId = Number(employee.id);
  const employeeAttendances = attendances.filter(
    (att) => Number(att.employeeId || att.employee_id) === empId
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-deep/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-modal-title"
    >
      <div
        className="bg-canvas border border-hairline-soft rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal: Thông tin nhân viên */}
        <div className="p-5 sm:p-6 border-b border-hairline-soft bg-surface-soft/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl uppercase tracking-wider shrink-0 shadow-2xs">
              {employee.fullName
                ? employee.fullName
                    .split(" ")
                    .filter(Boolean)
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")
                : employee.username?.slice(0, 2) || "NV"}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="employee-modal-title"
                  className="text-lg sm:text-xl font-bold text-ink-deep"
                >
                  {employee.fullName || employee.username}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  ID: #{employee.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-soft text-charcoal border border-hairline">
                  {employee.role || "Nhân viên"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel">
                {employee.department && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-stone" />
                    <span>
                      {employee.department}
                      {employee.position ? ` • ${employee.position}` : ""}
                    </span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone" />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-2 rounded-xl text-stone hover:text-ink hover:bg-surface-soft border border-hairline-soft transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung: Lịch chấm công chi tiết */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-surface-soft/20">
          <AttendanceCalendar
            attendances={employeeAttendances}
            employee={employee}
            standardWorkDays={standardWorkDays}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-hairline-soft bg-surface-soft/40 flex items-center justify-between">
          <span className="text-xs text-stone">
            Chế độ Quản trị viên: Xem lịch sử chấm công & đánh giá công (Read-only).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-ink hover:bg-charcoal active:scale-[0.98] text-white font-medium text-xs transition-all shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
