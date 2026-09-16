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
} from "lucide-react";
import { calculateMonthlyStats } from "../../utils/attendanceCalculator.js";
import { cn } from "../../utils/cn.js";

export default function AdminAttendanceTable({
  employees = [],
  attendances = [],
  standardWorkDays = 22,
  onSelectEmployee,
  onRefresh,
  isRefreshing = false,
}) {
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(() => today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => today.getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'late' | 'missing' | 'full'

  // Trạng thái sắp xếp cột
  const [sortField, setSortField] = useState("totalUnits"); // 'name' | 'department' | 'onTime' | 'late' | 'missing' | 'totalUnits'
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' | 'desc'

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
      </div>

      {/* 3. Bảng Dữ Liệu Nhân Viên (Hỗ trợ Sort từng cột) */}
      <div className="bg-canvas border border-hairline-soft rounded-2xl shadow-xs overflow-hidden">
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
                  <td colSpan={7} className="py-12 text-center text-stone">
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

                      {/* Cột 3: Đúng giờ */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success font-bold font-mono text-xs border border-success/20">
                          {stats.onTimeDays}
                        </span>
                      </td>

                      {/* Cột 4: Đi muộn */}
                      <td className="py-3.5 px-4 text-center">
                        {stats.lateDays > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-attention/15 text-attention font-bold font-mono text-xs border border-attention/30">
                            {stats.lateDays}
                          </span>
                        ) : (
                          <span className="text-stone font-mono">0</span>
                        )}
                      </td>

                      {/* Cột 5: Thiếu check-out */}
                      <td className="py-3.5 px-4 text-center">
                        {stats.missingCheckOutDays > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-critical/15 text-critical font-bold font-mono text-xs border border-critical/30">
                            {stats.missingCheckOutDays}
                          </span>
                        ) : (
                          <span className="text-stone font-mono">0</span>
                        )}
                      </td>

                      {/* Cột 6: Tổng công trong tháng */}
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

                      {/* Cột 7: Thao tác */}
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
      </div>
    </div>
  );
}
