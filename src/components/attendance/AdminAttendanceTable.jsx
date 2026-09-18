import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  List,
} from "lucide-react";
import { calculateMonthlyStats } from "../../utils/attendanceCalculator.js";
import { useMonthNavigator } from "../../hooks/useMonthNavigator.js";
import { cn } from "../../utils/cn.js";
import SearchInput from "../common/SearchInput.jsx";
import MonthNavigator from "../common/MonthNavigator.jsx";
import DayAttendanceDetailModal from "./DayAttendanceDetailModal.jsx";
import AttendanceKpiStrip from "./AttendanceKpiStrip.jsx";
import AttendanceLegend from "./AttendanceLegend.jsx";
import AttendanceMatrixView from "./AttendanceMatrixView.jsx";
import AttendanceSummaryView from "./AttendanceSummaryView.jsx";

export default function AdminAttendanceTable({
  employees = [],
  attendances = [],
  standardWorkDays = 22,
  onSelectEmployee,
  onRefresh,
  isRefreshing = false,
}) {
  const {
    year: selectedYear,
    month: selectedMonth,
    formattedMonth,
    daysInMonth: daysInSelectedMonth,
    isCurrentMonth,
    handlePrevMonth,
    handleNextMonth,
    handleCurrentMonth,
  } = useMonthNavigator();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toLocaleDateString("en-CA"), [today]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'late' | 'missing' | 'full'
  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' | 'summary'
  const [selectedDayModal, setSelectedDayModal] = useState(null); // { dayData, employee }

  // Trạng thái sắp xếp cột
  const [sortField, setSortField] = useState("totalUnits");
  const [sortDirection, setSortDirection] = useState("desc");

  // Danh sách các ngày trong tháng để render cột lưới
  const monthDayList = useMemo(() => {
    const list = [];
    const monthPadded = String(selectedMonth).padStart(2, "0");
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      const dayPadded = String(d).padStart(2, "0");
      const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay(); // 0 = CN, 6 = T7
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
      if (activeTab === "under_hours") {
        return (item.stats.underHoursDays || 0) > 0;
      }
      if (activeTab === "absent") {
        return (item.stats.absentDays || 0) > 0;
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
        case "underHours":
          valA = a.stats.underHoursDays || 0;
          valB = b.stats.underHoursDays || 0;
          break;
        case "absent":
          valA = a.stats.absentDays || 0;
          valB = b.stats.absentDays || 0;
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
    let totalUnderHours = 0;
    let totalAbsentDays = 0;
    let totalWorkedUnitsCompany = 0;

    employeesWithStats.forEach((emp) => {
      totalLateIncidents += emp.stats.lateDays;
      totalMissingCheckOut += emp.stats.missingCheckOutDays;
      totalUnderHours += emp.stats.underHoursDays || 0;
      totalAbsentDays += emp.stats.absentDays || 0;
      totalWorkedUnitsCompany += emp.stats.totalWorkUnits;
    });

    const totalStaff = employees.length || 1;
    const avgUnitsPerStaff = (totalWorkedUnitsCompany / totalStaff).toFixed(1);

    return {
      totalStaff: employees.length,
      totalLateIncidents,
      totalMissingCheckOut,
      totalUnderHours,
      totalAbsentDays,
      avgUnitsPerStaff,
    };
  }, [employeesWithStats, employees.length]);

  const fullComplianceCount = useMemo(() => {
    return employeesWithStats.filter(
      (e) => e.stats.totalWorkUnits >= e.stats.standardWorkDays
    ).length;
  }, [employeesWithStats]);

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
    <div className="space-y-5 w-full min-w-0">
      {/* 1. Cụm thẻ hiệu suất & dải ngoại lệ tương tác */}
      <AttendanceKpiStrip
        companySummary={companySummary}
        standardWorkDays={standardWorkDays}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fullComplianceCount={fullComplianceCount}
      />

      {/* 2. Thanh Điều khiển & Tìm kiếm & Bộ chuyển tháng */}
      <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nhân viên theo tên, mã NV, phòng ban..."
          />

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <MonthNavigator
              formattedMonth={formattedMonth}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onCurrent={handleCurrentMonth}
              isCurrent={isCurrentMonth}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
            >
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
            </MonthNavigator>
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
                  ? "bg-amber-500 text-white font-bold shadow-2xs"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Có đi muộn ({employeesWithStats.filter((e) => e.stats.lateDays > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("missing")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "missing"
                  ? "bg-rose-600 text-white shadow-2xs font-bold"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Thiếu check-out ({employeesWithStats.filter((e) => e.stats.missingCheckOutDays > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("under_hours")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "under_hours"
                  ? "bg-fuchsia-600 text-white shadow-2xs font-bold"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-600" />
              Thiếu giờ ({employeesWithStats.filter((e) => (e.stats.underHoursDays || 0) > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("absent")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "absent"
                  ? "bg-slate-600 text-white shadow-2xs font-bold"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Có vắng ({employeesWithStats.filter((e) => (e.stats.absentDays || 0) > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("full")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "full"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "bg-surface-soft text-steel hover:text-ink hover:bg-surface-soft/80"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Đạt chuẩn công ({fullComplianceCount})
            </button>
          </div>

          <span className="text-stone font-medium">
            Hiển thị <strong className="text-ink-deep font-semibold">{sortedAndFilteredEmployees.length}</strong> / {employeesWithStats.length} nhân sự
          </span>
        </div>

        {/* Dải chú thích quy chuẩn màu sắc */}
        <AttendanceLegend />
      </div>

      {/* 3. Bảng Dữ Liệu: Hỗ trợ Chế độ Lưới theo ngày hoặc Danh sách tổng hợp */}
      <div className="bg-canvas border border-hairline-soft rounded-2xl shadow-xs overflow-hidden w-full min-w-0">
        {viewMode === "matrix" ? (
          <AttendanceMatrixView
            employees={sortedAndFilteredEmployees}
            monthDayList={monthDayList}
            selectedMonth={selectedMonth}
            onSort={handleSort}
            renderSortIcon={renderSortIcon}
            onSelectEmployee={onSelectEmployee}
            onSelectDayModal={setSelectedDayModal}
          />
        ) : (
          <AttendanceSummaryView
            employees={sortedAndFilteredEmployees}
            monthDayList={monthDayList}
            daysInSelectedMonth={daysInSelectedMonth}
            selectedMonth={selectedMonth}
            onSort={handleSort}
            renderSortIcon={renderSortIcon}
            onSelectEmployee={onSelectEmployee}
            onSelectDayModal={setSelectedDayModal}
          />
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
