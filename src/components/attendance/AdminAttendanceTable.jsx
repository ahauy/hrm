import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Eye,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  List,
} from "lucide-react";
import { calculateMonthlyStats } from "../../utils/attendanceCalculator.js";
import { formatTime } from "../../utils/formatTime.js";
import { cn } from "../../utils/cn.js";
import DayAttendanceDetailModal from "./DayAttendanceDetailModal.jsx";

export default function AdminAttendanceTable({
  employees = [],
  attendances = [],
  standardWorkDays = 22,
  onSelectEmployee,
  onRefresh,
  isRefreshing = false,
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toLocaleDateString("en-CA"), [today]);
  const [selectedYear, setSelectedYear] = useState(() => today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => today.getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'late' | 'missing' | 'full'
  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' (theo ngày) | 'summary' (tổng hợp)
  const [selectedDayModal, setSelectedDayModal] = useState(null); // { dayData, employee }

  // Trạng thái sắp xếp cột
  const [sortField, setSortField] = useState("totalUnits"); // 'name' | 'department' | 'onTime' | 'late' | 'missing' | 'totalUnits'
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' | 'desc'

  // Tính số ngày trong tháng được chọn
  const daysInSelectedMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Danh sách các ngày trong tháng để render cột lưới
  const monthDayList = useMemo(() => {
    const list = [];
    const monthPadded = String(selectedMonth).padStart(2, "0");
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const dayPadded = String(d).padStart(2, "0");
      const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay(); // 0 = Chủ Nhật, 6 = Thứ Bảy
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayName =
        dayOfWeek === 0
          ? "CN"
          : dayOfWeek === 1
          ? "T2"
          : dayOfWeek === 2
          ? "T3"
          : dayOfWeek === 3
          ? "T4"
          : dayOfWeek === 4
          ? "T5"
          : dayOfWeek === 5
          ? "T6"
          : "T7";

      list.push({
        dayNumber: d,
        dateStr,
        dayOfWeek,
        dayName,
        isWeekend,
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }, [selectedYear, selectedMonth, daysInSelectedMonth, todayStr]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Điều hướng tháng
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  // Gom dữ liệu điểm danh theo từng employeeId
  const attendancesByEmployee = useMemo(() => {
    const map = {};
    attendances.forEach((att) => {
      const empId = Number(att.employeeId || att.employee_id);
      if (!empId) return;
      if (!map[empId]) map[empId] = [];
      map[empId].push(att);
    });
    return map;
  }, [attendances]);

  // Tính toán thống kê công của từng nhân viên cho tháng đang chọn
  const employeesWithStats = useMemo(() => {
    return employees.map((emp) => {
      const empId = Number(emp.id);
      const empRecords = attendancesByEmployee[empId] || [];
      const stats = calculateMonthlyStats(
        empRecords,
        selectedYear,
        selectedMonth,
        standardWorkDays
      );
      return {
        ...emp,
        stats,
      };
    });
  }, [
    employees,
    attendancesByEmployee,
    selectedYear,
    selectedMonth,
    standardWorkDays,
  ]);

  // Lọc dữ liệu theo từ khóa tìm kiếm và tab
  const filteredEmployees = useMemo(() => {
    return employeesWithStats.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (item.fullName || "").toLowerCase().includes(term) ||
        (item.username || "").toLowerCase().includes(term) ||
        (item.email || "").toLowerCase().includes(term) ||
        (item.department || "").toLowerCase().includes(term) ||
        (item.position || "").toLowerCase().includes(term) ||
        String(item.id).includes(term);

      if (!matchSearch) return false;

      if (activeTab === "late") {
        return item.stats.lateDays > 0;
      }
      if (activeTab === "missing") {
        return item.stats.missingCheckOutDays > 0;
      }
      if (activeTab === "full") {
        return item.stats.totalWorkUnits >= item.stats.standardWorkDays;
      }

      return true;
    });
  }, [employeesWithStats, searchTerm, activeTab]);

  // Sắp xếp dữ liệu sau khi lọc
  const sortedAndFilteredEmployees = useMemo(() => {
    const list = [...filteredEmployees];
    list.sort((a, b) => {
      let valA;
      let valB;
      switch (sortField) {
        case "name":
          valA = (a.fullName || a.username || "").toLowerCase();
          valB = (b.fullName || b.username || "").toLowerCase();
          break;
        case "department":
          valA = (a.department || "").toLowerCase();
          valB = (b.department || "").toLowerCase();
          break;
        case "onTime":
          valA = a.stats.onTimeDays;
          valB = b.stats.onTimeDays;
          break;
        case "late":
          valA = a.stats.lateDays;
          valB = b.stats.lateDays;
          break;
        case "missing":
          valA = a.stats.missingCheckOutDays;
          valB = b.stats.missingCheckOutDays;
          break;
        case "totalUnits":
        default:
          valA = a.stats.totalWorkUnits;
          valB = b.stats.totalWorkUnits;
          break;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredEmployees, sortField, sortDirection]);

  // Thống kê tổng hợp toàn công ty trong tháng
  const companySummary = useMemo(() => {
    let totalLateIncidents = 0;
    let totalMissingCheckOut = 0;
    let totalWorkedUnitsCompany = 0;

    employeesWithStats.forEach((emp) => {
      totalLateIncidents += emp.stats.lateDays;
      totalMissingCheckOut += emp.stats.missingCheckOutDays;
      totalWorkedUnitsCompany += emp.stats.totalWorkUnits;
    });

    const totalStaff = employees.length || 1;
    const avgUnitsPerStaff = (totalWorkedUnitsCompany / totalStaff).toFixed(1);

    return {
      totalStaff: employees.length,
      totalLateIncidents,
      totalMissingCheckOut,
      avgUnitsPerStaff,
    };
  }, [employeesWithStats, employees.length]);

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-stone/50 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary ml-1 font-bold" />
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Bố cục Bất đối xứng (Asymmetric Hub & Interactive Exception Strip) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cột trái (5/12): Thẻ trọng tâm hiệu suất công ty */}
        <div className="lg:col-span-5 bg-canvas border border-hairline-soft rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-stone uppercase tracking-wider block">
                Hiệu suất chuyên cần toàn công ty
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-black text-ink-deep font-mono tabular-nums">
                  {companySummary.avgUnitsPerStaff}
                </span>
                <span className="text-xs font-semibold text-steel">
                  / {standardWorkDays} công chuẩn TB
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-hairline-soft flex items-center justify-between text-xs">
            <span className="text-steel">
              Quy mô: <strong className="text-ink-deep">{companySummary.totalStaff} nhân viên</strong>
            </span>
            <span className="font-mono font-bold text-primary">
              {Math.round(
                (companySummary.avgUnitsPerStaff / (standardWorkDays || 22)) * 100
              )}
              % đạt chuẩn
            </span>
          </div>
        </div>

        {/* Cột phải (7/12): Dải thẻ tương tác trực tiếp (Interactive Exception Strip) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Thẻ 1: Lượt đi muộn */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(activeTab === "late" ? "all" : "late")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab(activeTab === "late" ? "all" : "late");
              }
            }}
            className={cn(
              "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
              activeTab === "late"
                ? "bg-attention/15 border-attention shadow-xs ring-1 ring-attention"
                : "bg-canvas border-hairline-soft hover:border-attention/60"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
                Lượt đi muộn
              </span>
              <span className="w-2 h-2 rounded-full bg-attention" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-attention font-mono tabular-nums">
                {companySummary.totalLateIncidents}
              </span>
              <span className="text-[11px] text-steel block mt-0.5">
                {activeTab === "late" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
              </span>
            </div>
          </div>

          {/* Thẻ 2: Quên Check-out */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(activeTab === "missing" ? "all" : "missing")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab(activeTab === "missing" ? "all" : "missing");
              }
            }}
            className={cn(
              "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
              activeTab === "missing"
                ? "bg-critical/15 border-critical shadow-xs ring-1 ring-critical"
                : "bg-canvas border-hairline-soft hover:border-critical/60"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
                Quên Check-out
              </span>
              <span className="w-2 h-2 rounded-full bg-critical" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-critical font-mono tabular-nums">
                {companySummary.totalMissingCheckOut}
              </span>
              <span className="text-[11px] text-steel block mt-0.5">
                {activeTab === "missing" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
              </span>
            </div>
          </div>

          {/* Thẻ 3: Đạt chuẩn công */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(activeTab === "full" ? "all" : "full")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab(activeTab === "full" ? "all" : "full");
              }
            }}
            className={cn(
              "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none active:scale-[0.98]",
              activeTab === "full"
                ? "bg-success/15 border-success shadow-xs ring-1 ring-success"
                : "bg-canvas border-hairline-soft hover:border-success/60"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone uppercase tracking-wider">
                Đạt chuẩn công
              </span>
              <span className="w-2 h-2 rounded-full bg-success" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-success font-mono tabular-nums">
                {
                  employeesWithStats.filter(
                    (e) => e.stats.totalWorkUnits >= e.stats.standardWorkDays
                  ).length
                }
              </span>
              <span className="text-[11px] text-steel block mt-0.5">
                {activeTab === "full" ? "Đang lọc • Bấm để hủy" : "Bấm để lọc danh sách"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thanh Điều khiển & Tìm kiếm */}
      <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nhân viên theo tên, mã NV, phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-hairline-soft bg-surface-soft/40 focus:bg-canvas focus:border-primary focus:outline-none transition-all placeholder:text-stone text-ink-deep"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cụm chuyển tháng */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Tháng trước"
                className="p-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-4 py-1.5 rounded-xl border border-hairline bg-surface-soft/60 font-bold text-xs text-ink-deep min-w-[140px] text-center font-mono">
                Tháng {String(selectedMonth).padStart(2, "0")} / {selectedYear}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Tháng sau"
                className="p-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {(selectedYear !== today.getFullYear() ||
              selectedMonth !== today.getMonth() + 1) && (
              <button
                type="button"
                onClick={handleCurrentMonth}
                className="text-xs font-semibold text-primary hover:text-primary-deep px-3 py-1.5 rounded-xl border border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
              >
                Hôm nay
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Làm mới dữ liệu"
                className="p-2 rounded-xl border border-hairline hover:bg-surface-soft active:scale-[0.97] transition-all text-charcoal cursor-pointer disabled:opacity-50 ml-1"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                />
              </button>
            )}

            {/* Chuyển chế độ xem: Lưới theo ngày vs Danh sách tổng hợp */}
            <div className="flex items-center p-1 rounded-xl bg-surface-soft border border-hairline ml-2">
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                title="Bảng chấm công chi tiết theo ngày trong tháng"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  viewMode === "matrix"
                    ? "bg-canvas text-primary font-bold shadow-xs"
                    : "text-steel hover:text-ink"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theo ngày</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("summary")}
                title="Danh sách tổng hợp nhân sự"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  viewMode === "summary"
                    ? "bg-canvas text-primary font-bold shadow-xs"
                    : "text-steel hover:text-ink"
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tổng hợp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thanh đếm số lượng & Tab lọc */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-hairline-soft text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer",
                activeTab === "all"
                  ? "bg-ink text-white shadow-2xs"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              Tất cả ({employeesWithStats.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("late")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "late"
                  ? "bg-attention text-ink-deep font-bold shadow-2xs"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-attention" />
              Có đi muộn (
              {employeesWithStats.filter((e) => e.stats.lateDays > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("missing")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "missing"
                  ? "bg-critical text-white shadow-2xs"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-critical" />
              Thiếu check-out (
              {
                employeesWithStats.filter((e) => e.stats.missingCheckOutDays > 0)
                  .length
              }
              )
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("full")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "full"
                  ? "bg-success text-white shadow-2xs"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Đạt chuẩn công (
              {
                employeesWithStats.filter(
                  (e) => e.stats.totalWorkUnits >= e.stats.standardWorkDays
                ).length
              }
              )
            </button>
          </div>

          <span className="text-stone font-medium">
            Hiển thị <strong className="text-ink-deep font-semibold">{sortedAndFilteredEmployees.length}</strong> / {employeesWithStats.length} nhân sự
          </span>
        </div>

        {/* Dải chú thích quy chuẩn màu sắc theo tình huống */}
        <div className="pt-3 border-t border-hairline-soft flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="text-[11px] font-bold text-stone uppercase tracking-wider">
            Quy chuẩn màu sắc:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success ring-2 ring-success/20" />
            <span className="text-ink font-medium">Đúng giờ (1.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-attention ring-2 ring-attention/20" />
            <span className="text-ink font-medium">Muộn ≤ 15p (1.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-warning/20" />
            <span className="text-ink font-medium">Muộn 15-60p (0.75)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
            <span className="text-ink font-medium">Nửa công (0.5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 animate-pulse" />
            <span className="text-ink font-medium">Đang trong ca</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-critical ring-2 ring-critical/20" />
            <span className="text-ink font-medium">Thiếu check-out (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone ring-2 ring-stone/20" />
            <span className="text-ink font-medium">Vắng mặt</span>
          </div>
        </div>
      </div>

      {/* 3. Bảng Dữ Liệu: Hỗ trợ Chế độ Lưới theo ngày hoặc Danh sách tổng hợp */}
      <div className="bg-canvas border border-hairline-soft rounded-2xl shadow-xs overflow-hidden">
        {viewMode === "matrix" ? (
          /* CHẾ ĐỘ 1: BẢNG CHẤM CÔNG CHI TIẾT THEO TỪNG NGÀY (TIMESHEET MATRIX) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1250px]">
              <thead>
                <tr className="border-b border-hairline-soft bg-surface-soft/70 text-[11px] font-bold text-stone uppercase select-none">
                  {/* Cột nhân viên (Sticky Left) */}
                  <th
                    scope="col"
                    onClick={() => handleSort("name")}
                    className="py-3 px-4 sticky left-0 z-20 bg-surface-soft/95 backdrop-blur-xs cursor-pointer hover:text-ink border-r border-hairline-soft min-w-[220px]"
                  >
                    <div className="flex items-center">
                      <span>Nhân viên</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>

                  {/* Các cột ngày trong tháng (1..daysInSelectedMonth) */}
                  {monthDayList.map((day) => (
                    <th
                      key={day.dateStr}
                      scope="col"
                      className={cn(
                        "py-2 px-1 text-center font-mono min-w-[38px] border-r border-hairline-soft/40 transition-colors",
                        day.isWeekend && "bg-surface-soft/90 text-stone/80",
                        day.isToday && "bg-primary/10 text-primary font-bold"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-stone/80 tracking-tight">
                          {day.dayName}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold mt-0.5",
                            day.isToday
                              ? "text-primary"
                              : day.isWeekend
                              ? "text-stone/80"
                              : "text-ink-deep"
                          )}
                        >
                          {String(day.dayNumber).padStart(2, "0")}
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Các cột tổng hợp bên phải */}
                  <th
                    scope="col"
                    onClick={() => handleSort("totalUnits")}
                    className="py-3 px-3 text-center cursor-pointer hover:text-ink min-w-[110px]"
                  >
                    <div className="flex items-center justify-center">
                      <span>Tổng công</span>
                      {renderSortIcon("totalUnits")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("onTime")}
                    className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
                  >
                    <div className="flex items-center justify-center">
                      <span>Đúng giờ</span>
                      {renderSortIcon("onTime")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("late")}
                    className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
                  >
                    <div className="flex items-center justify-center">
                      <span>Muộn</span>
                      {renderSortIcon("late")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("missing")}
                    className="py-3 px-2 text-center cursor-pointer hover:text-ink min-w-[70px]"
                  >
                    <div className="flex items-center justify-center">
                      <span>Thiếu Out</span>
                      {renderSortIcon("missing")}
                    </div>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right min-w-[90px]">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-hairline-soft text-xs">
                {sortedAndFilteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={monthDayList.length + 6}
                      className="py-12 text-center text-stone"
                    >
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone/60" />
                      <p className="font-semibold text-ink-deep">
                        Không tìm thấy nhân viên phù hợp
                      </p>
                      <p className="text-xs text-steel mt-0.5">
                        Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredEmployees.map((emp) => {
                    const stats = emp.stats;
                    const daysMap = stats.daysMap || {};

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-surface-soft/30 transition-colors group"
                      >
                        {/* Cột thông tin nhân viên (Sticky Left) */}
                        <td className="py-2.5 px-3 sticky left-0 z-10 bg-canvas group-hover:bg-surface-soft/70 transition-colors border-r border-hairline-soft">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                              {emp.fullName
                                ? emp.fullName
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(-2)
                                    .map((n) => n[0])
                                    .join("")
                                : emp.username?.slice(0, 2) || "NV"}
                            </div>
                            <div className="min-w-0 max-w-[140px]">
                              <div className="font-bold text-ink-deep truncate">
                                {emp.fullName || emp.username}
                              </div>
                              <div className="text-[10px] text-stone truncate">
                                #{emp.id} • {emp.department || "Chưa phân bổ"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Các ô ngày trong tháng với màu sắc theo tình huống */}
                        {monthDayList.map((day) => {
                          const dayData = daysMap[day.dateStr];
                          const status = dayData?.status;
                          const key = status?.key;

                          return (
                            <td
                              key={day.dateStr}
                              className={cn(
                                "py-1 px-1 text-center border-r border-hairline-soft/30",
                                day.isWeekend && "bg-surface-soft/20",
                                day.isToday && "bg-primary/[0.04]"
                              )}
                            >
                              <button
                                type="button"
                                disabled={day.isWeekend && !dayData?.checkInTime}
                                onClick={() =>
                                  dayData &&
                                  setSelectedDayModal({
                                    dayData,
                                    employee: emp,
                                  })
                                }
                                title={
                                  dayData
                                    ? `Ngày ${day.dayNumber}/${selectedMonth}: ${
                                        status?.label || ""
                                      } (${dayData.credit} công)\n• Check-in: ${
                                        formatTime(dayData.checkInTime) ||
                                        "Chưa có"
                                      }\n• Check-out: ${
                                        formatTime(dayData.checkOutTime) ||
                                        (dayData.isMissingCheckout
                                          ? "Thiếu check-out"
                                          : "Chưa có")
                                      }\n(Bấm để xem chi tiết)`
                                    : ""
                                }
                                className={cn(
                                  "w-7.5 h-7.5 mx-auto rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all select-none",
                                  // Đúng giờ: Nền xanh lá dịu
                                  key === "ON_TIME"
                                    ? "bg-success/15 hover:bg-success/25 text-[#15692f] border border-success/30 cursor-pointer shadow-2xs"
                                    // Muộn ân hạn: Nền vàng cam
                                    : key === "LATE_GRACE"
                                    ? "bg-attention/20 hover:bg-attention/30 text-[#8a5700] border border-attention/40 cursor-pointer shadow-2xs"
                                    // Muộn trừ công: Nền cam đậm
                                    : key === "LATE_PENALTY"
                                    ? "bg-warning/25 hover:bg-warning/35 text-[#914600] border border-warning/50 cursor-pointer shadow-2xs"
                                    // Nửa công: Nền tím
                                    : key === "HALF_DAY"
                                    ? "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 cursor-pointer shadow-2xs"
                                    // Đang trong ca: Xanh lam
                                    : key === "IN_PROGRESS"
                                    ? "bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 cursor-pointer animate-pulse"
                                    // Thiếu check-out: Đỏ
                                    : key === "MISSING_CHECKOUT"
                                    ? "bg-critical/15 hover:bg-critical/25 text-critical border border-critical/40 cursor-pointer shadow-2xs"
                                    // Không đủ công (<4h)
                                    : key === "UNDER_HOURS"
                                    ? "bg-critical/10 hover:bg-critical/20 text-critical border border-critical/30 cursor-pointer"
                                    // Vắng mặt
                                    : key === "ABSENT"
                                    ? "bg-surface-soft text-stone/70 border border-hairline-soft/40 cursor-pointer hover:bg-stone/15"
                                    // Chưa chấm công hôm nay
                                    : key === "NOT_CHECKED_IN"
                                    ? "bg-attention/10 text-attention border border-attention/30 cursor-pointer hover:bg-attention/20"
                                    // Cuối tuần
                                    : day.isWeekend
                                    ? "bg-surface-soft/40 text-stone/40 border border-transparent cursor-default"
                                    // Tương lai
                                    : "bg-transparent text-stone/25 cursor-default"
                                )}
                              >
                                {key === "ON_TIME"
                                  ? "1.0"
                                  : key === "LATE_GRACE"
                                  ? "1.0"
                                  : key === "LATE_PENALTY"
                                  ? "0.75"
                                  : key === "HALF_DAY"
                                  ? "0.5"
                                  : key === "IN_PROGRESS"
                                  ? "ĐL"
                                  : key === "MISSING_CHECKOUT"
                                  ? "!Out"
                                  : key === "UNDER_HOURS"
                                  ? "<4h"
                                  : key === "ABSENT"
                                  ? "-"
                                  : key === "NOT_CHECKED_IN"
                                  ? "Chưa"
                                  : day.isWeekend
                                  ? "CT"
                                  : "•"}
                              </button>
                            </td>
                          );
                        })}

                        {/* Cột tổng hợp bên phải */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-ink-deep">
                          <span className="text-xs">
                            {stats.totalWorkUnits}
                          </span>
                          <span className="text-[10px] text-steel font-normal">
                            {" "}
                            / {stats.standardWorkDays}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-success/10 text-success font-bold font-mono text-[11px] border border-success/20">
                            {stats.onTimeDays}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          {stats.lateDays > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-attention/15 text-attention font-bold font-mono text-[11px] border border-attention/30">
                              {stats.lateDays}
                            </span>
                          ) : (
                            <span className="text-stone font-mono text-[11px]">
                              0
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          {stats.missingCheckOutDays > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-critical/15 text-critical font-bold font-mono text-[11px] border border-critical/30">
                              {stats.missingCheckOutDays}
                            </span>
                          ) : (
                            <span className="text-stone font-mono text-[11px]">
                              0
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectEmployee(emp)}
                            title="Xem toàn bộ lịch chấm công của nhân viên này"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hairline hover:border-primary text-steel hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all font-medium text-xs cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lịch</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* CHẾ ĐỘ 2: BẢNG DANH SÁCH TỔNG HỢP (KÈM DẢI NHẬT KÝ THÁNG TRỰC QUAN) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline-soft bg-surface-soft/60 text-[11px] font-bold text-stone uppercase tracking-wider select-none">
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Nhân viên</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("department")}
                    className="py-3.5 px-4 cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Phòng ban & Vị trí</span>
                      {renderSortIcon("department")}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 min-w-[240px]">
                    <span>Nhật ký tháng ({daysInSelectedMonth} ngày)</span>
                  </th>
                  <th
                    onClick={() => handleSort("onTime")}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <span>Đúng giờ (1.0)</span>
                      {renderSortIcon("onTime")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("late")}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <span>Đi muộn</span>
                      {renderSortIcon("late")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("missing")}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <span>Thiếu Out</span>
                      {renderSortIcon("missing")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("totalUnits")}
                    className="py-3.5 px-4 cursor-pointer hover:text-ink transition-colors"
                  >
                    <div className="flex items-center">
                      <span>Tổng công tháng</span>
                      {renderSortIcon("totalUnits")}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-hairline-soft text-xs">
                {sortedAndFilteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone/60" />
                      <p className="font-semibold text-ink-deep">
                        Không tìm thấy nhân viên phù hợp
                      </p>
                      <p className="text-xs text-steel mt-0.5">
                        Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredEmployees.map((emp) => {
                    const stats = emp.stats;
                    const ratio = Math.min(
                      100,
                      (stats.totalWorkUnits / (stats.standardWorkDays || 22)) * 100
                    );

                    return (
                      <tr
                        key={emp.id}
                        onClick={() => onSelectEmployee(emp)}
                        className="hover:bg-surface-soft/50 transition-colors cursor-pointer group"
                      >
                        {/* Cột 1: Thông tin nhân viên */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                              {emp.fullName
                                ? emp.fullName
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(-2)
                                    .map((n) => n[0])
                                    .join("")
                                : emp.username?.slice(0, 2) || "NV"}
                            </div>
                            <div>
                              <div className="font-bold text-ink-deep group-hover:text-primary transition-colors flex items-center gap-1.5">
                                <span>{emp.fullName || emp.username}</span>
                                <span className="text-[10px] text-stone font-mono font-normal">
                                  #{emp.id}
                                </span>
                              </div>
                              <div className="text-[11px] text-steel">
                                {emp.email || emp.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Phòng ban & Chức vụ */}
                        <td className="py-3.5 px-4 text-steel">
                          <div className="font-semibold text-ink">
                            {emp.department || "Chưa phân bổ"}
                          </div>
                          <div className="text-[11px] text-stone">
                            {emp.position || emp.role || "Nhân viên"}
                          </div>
                        </td>

                        {/* Cột 3: Dải chấm công tháng trực quan với màu sắc theo tình huống */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-0.5 overflow-x-auto max-w-[260px] py-1">
                            {monthDayList.map((day) => {
                              const dayData = stats.daysMap?.[day.dateStr];
                              const status = dayData?.status;
                              const key = status?.key;

                              return (
                                <button
                                  key={day.dateStr}
                                  type="button"
                                  disabled={day.isWeekend && !dayData?.checkInTime}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (dayData) {
                                      setSelectedDayModal({
                                        dayData,
                                        employee: emp,
                                      });
                                    }
                                  }}
                                  title={
                                    dayData
                                      ? `Ngày ${day.dayNumber}/${selectedMonth}: ${
                                          status?.label || ""
                                        } (${dayData.credit} công)\n• Vào: ${
                                          formatTime(dayData.checkInTime) || "--"
                                        }\n• Ra: ${
                                          formatTime(dayData.checkOutTime) ||
                                          (dayData.isMissingCheckout
                                            ? "Thiếu out"
                                            : "--")
                                        }`
                                      : `Ngày ${day.dayNumber}/${selectedMonth}`
                                  }
                                  className={cn(
                                    "w-2 h-5.5 rounded-[2px] transition-all select-none shrink-0",
                                    key === "ON_TIME"
                                      ? "bg-success hover:scale-125 cursor-pointer shadow-2xs"
                                      : key === "LATE_GRACE"
                                      ? "bg-attention hover:scale-125 cursor-pointer shadow-2xs"
                                      : key === "LATE_PENALTY"
                                      ? "bg-warning hover:scale-125 cursor-pointer shadow-2xs"
                                      : key === "HALF_DAY"
                                      ? "bg-purple-500 hover:scale-125 cursor-pointer shadow-2xs"
                                      : key === "IN_PROGRESS"
                                      ? "bg-primary hover:scale-125 cursor-pointer animate-pulse"
                                      : key === "MISSING_CHECKOUT"
                                      ? "bg-critical hover:scale-125 cursor-pointer shadow-2xs"
                                      : key === "UNDER_HOURS"
                                      ? "bg-critical/60 hover:scale-125 cursor-pointer"
                                      : key === "ABSENT"
                                      ? "bg-stone/30 hover:scale-125 cursor-pointer"
                                      : key === "NOT_CHECKED_IN"
                                      ? "bg-attention/30 hover:scale-125 cursor-pointer"
                                      : day.isWeekend
                                      ? "bg-surface-soft/60 cursor-default"
                                      : "bg-surface-soft/30 cursor-default",
                                    day.isToday && "ring-1 ring-primary ring-offset-1"
                                  )}
                                />
                              );
                            })}
                          </div>
                        </td>

                        {/* Cột 4: Đúng giờ */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success font-bold font-mono text-xs border border-success/20">
                            {stats.onTimeDays}
                          </span>
                        </td>

                        {/* Cột 5: Đi muộn */}
                        <td className="py-3.5 px-4 text-center">
                          {stats.lateDays > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-attention/15 text-attention font-bold font-mono text-xs border border-attention/30">
                              {stats.lateDays}
                            </span>
                          ) : (
                            <span className="text-stone font-mono">0</span>
                          )}
                        </td>

                        {/* Cột 6: Thiếu check-out */}
                        <td className="py-3.5 px-4 text-center">
                          {stats.missingCheckOutDays > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-critical/15 text-critical font-bold font-mono text-xs border border-critical/30">
                              {stats.missingCheckOutDays}
                            </span>
                          ) : (
                            <span className="text-stone font-mono">0</span>
                          )}
                        </td>

                        {/* Cột 7: Tổng công trong tháng */}
                        <td className="py-3.5 px-4 min-w-[170px]">
                          <div className="flex items-baseline justify-between font-mono">
                            <span className="font-black text-sm text-ink-deep">
                              {stats.totalWorkUnits}
                            </span>
                            <span className="text-[11px] text-steel">
                              / {stats.standardWorkDays} công
                            </span>
                          </div>
                          <div className="mt-1.5 w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                ratio >= 100
                                  ? "bg-success"
                                  : ratio >= 80
                                  ? "bg-primary"
                                  : "bg-warning"
                              )}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </td>

                        {/* Cột 8: Thao tác */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEmployee(emp);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline hover:border-primary text-steel hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all font-medium text-xs cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem lịch</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi tiết ngày khi click vào ô ngày */}
      <DayAttendanceDetailModal
        isOpen={Boolean(selectedDayModal)}
        onClose={() => setSelectedDayModal(null)}
        dayData={selectedDayModal?.dayData}
        employee={selectedDayModal?.employee}
      />
    </div>
  );
}
