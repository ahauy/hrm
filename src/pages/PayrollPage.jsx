import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import NotAuthorPage from "./NotAuthorPage.jsx";
import { settingsServices } from "../services/settingsServices.js";
import { payrollServices } from "../services/payrollServices.js";
import { employeeServices } from "../services/employeeServices.js";
import { calculatePayroll, formatCurrency } from "../utils/formatCurrency.js";
import AdminPayrollTable from "../components/payroll/AdminPayrollTable.jsx";
import EmployeePayrollView from "../components/payroll/EmployeePayrollView.jsx";
import FinalizePayrollModal from "../components/payroll/FinalizePayrollModal.jsx";
import EditPayrollModal from "../components/payroll/EditPayrollModal.jsx";
import RecalculatePayrollModal from "../components/payroll/RecalculatePayrollModal.jsx";
import BatchFinalizeModal from "../components/payroll/BatchFinalizeModal.jsx";
import {
  Wallet,
  Calendar,
  Users,
  CheckCheck,
  RefreshCw,
  Settings,
  Save,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../utils/cn.js";

export default function PayrollPage() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = role.includes("admin");
  const isEmployee = role.includes("employee");

  // Định dạng tháng mặc định YYYY-MM (Ví dụ: 2026-09)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // State cấu hình ngày công chuẩn
  const [standardWorkDays, setStandardWorkDays] = useState(26);
  const [standardDaysInput, setStandardDaysInput] = useState("26");
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Dữ liệu bảng lương
  const [mergedPayrollData, setMergedPayrollData] = useState([]);
  const [employeePayrolls, setEmployeePayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab chuyển đổi dành cho Admin: 'summary' (Toàn công ty) | 'personal' (Phiếu lương của Admin)
  const [adminActiveTab, setAdminActiveTab] = useState("summary");

  // State quản lý Modals
  const [finalizeModalData, setFinalizeModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [recalculateModalData, setRecalculateModalData] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Tải dữ liệu dành cho Admin
  const loadAdminData = useCallback(async () => {
    try {
      // 1. Tải cài đặt ngày công chuẩn
      const settingsPromise = settingsServices.getSettings().catch(() => ({
        standardWorkDays: 26,
      }));

      // 2. Tải bảng tổng hợp chấm công & lương dự kiến của tháng
      const summaryPromise = payrollServices
        .getPayrollSummary(selectedMonth)
        .catch(() => []);

      // 3. Tải danh sách bản ghi bảng lương đã chốt trong tháng
      const payrollRecordsPromise = payrollServices
        .getPayrolls({ month: selectedMonth })
        .catch(() => []);

      // 4. Tải danh sách nhân viên để đối chiếu thông tin phòng ban/chức vụ nếu cần
      const employeesPromise = employeeServices.getEmployees().catch(() => []);

      const [settingsRes, summaryRes, payrollRes, employeesRes] =
        await Promise.all([
          settingsPromise,
          summaryPromise,
          payrollRecordsPromise,
          employeesPromise,
        ]);

      // Cập nhật ngày công chuẩn
      const stdDays = Number(settingsRes?.standardWorkDays) || 26;
      setStandardWorkDays(stdDays);
      setStandardDaysInput(String(stdDays));

      const summaryList = Array.isArray(summaryRes) ? summaryRes : [];
      const finalizedList = Array.isArray(payrollRes) ? payrollRes : [];
      const employeesList = Array.isArray(employeesRes) ? employeesRes : [];

      // Tạo map nhân viên theo id
      const empMap = new Map();
      employeesList.forEach((e) => {
        empMap.set(e.id, e);
      });

      // Tạo map bản ghi lương đã chốt theo employeeId
      const finalizedMap = new Map();
      finalizedList.forEach((p) => {
        if (p.employeeId) {
          finalizedMap.set(p.employeeId, p);
        }
      });

      // Hợp nhất dữ liệu tổng hợp
      // Nếu summaryList có dữ liệu, dùng summaryList làm gốc
      // Nếu summaryList rỗng nhưng có danh sách nhân viên, dựng danh sách từ employeesList
      const baseSource =
        summaryList.length > 0
          ? summaryList
          : employeesList.map((emp) => ({
              employeeId: emp.id,
              fullName: emp.fullName,
              department: emp.department,
              position: emp.position,
              baseSalary: emp.baseSalary || 10000000,
              actualWorkDays: 0,
            }));

      const merged = baseSource.map((item) => {
        const empId = item.employeeId || item.id;
        const empInfo = empMap.get(empId);
        const finalizedRecord = finalizedMap.get(empId);

        const fullName =
          item.fullName || item.name || empInfo?.fullName || `Nhân viên #${empId}`;
        const department = item.department || empInfo?.department || "Văn phòng";
        const position = item.position || empInfo?.position || "Nhân viên";
        const baseSalary = Number(
          finalizedRecord?.baseSalary || item.baseSalary || empInfo?.baseSalary || 10000000
        );
        const actualWorkDays = Number(
          finalizedRecord?.actualWorkDays ?? item.actualWorkDays ?? 0
        );
        const standard = Number(
          finalizedRecord?.standardWorkDays || stdDays
        );

        if (finalizedRecord) {
          return {
            ...item,
            employeeId: empId,
            fullName,
            department,
            position,
            baseSalary,
            actualWorkDays,
            standardWorkDays: standard,
            isFinalized: true,
            payrollId: finalizedRecord.id,
            adjustment: finalizedRecord.adjustment ?? 0,
            note: finalizedRecord.note || "",
            finalSalary: finalizedRecord.finalSalary,
          };
        }

        const expectedSalary =
          item.expectedSalary !== undefined
            ? Number(item.expectedSalary)
            : calculatePayroll({
                baseSalary,
                standardWorkDays: standard,
                actualWorkDays,
                adjustment: 0,
              });

        return {
          ...item,
          employeeId: empId,
          fullName,
          department,
          position,
          baseSalary,
          actualWorkDays,
          standardWorkDays: standard,
          isFinalized: false,
          adjustment: 0,
          note: "",
          expectedSalary,
        };
      });

      setMergedPayrollData(merged);

      // Đồng thời tải lịch sử lương cá nhân của Admin nếu chuyển tab
      const selfPayrolls = await payrollServices.getPayrolls().catch(() => []);
      setEmployeePayrolls(Array.isArray(selfPayrolls) ? selfPayrolls : []);
    } catch (error) {
      console.error("Lỗi khi tải bảng lương quản trị:", error);
      toast.error("Không thể tải thông tin bảng lương");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedMonth]);

  // Tải dữ liệu dành cho Nhân viên thường
  const loadEmployeeData = useCallback(async () => {
    try {
      const data = await payrollServices.getPayrolls();
      setEmployeePayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử lương nhân viên:", error);
      toast.error("Không thể tải lịch sử phiếu lương của bạn");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Effect kích hoạt tải dữ liệu
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isAdmin && !isEmployee) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isAdmin) {
        await loadAdminData();
      } else {
        await loadEmployeeData();
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isEmployee, loadAdminData, loadEmployeeData]);

  // Xử lý cập nhật Ngày công chuẩn (Admin only)
  const handleUpdateStandardWorkDays = async () => {
    const daysNum = parseInt(standardDaysInput, 10);
    if (isNaN(daysNum) || daysNum <= 0 || daysNum > 31) {
      toast.error("Ngày công chuẩn phải là một số hợp lệ từ 1 đến 31");
      return;
    }

    try {
      setIsUpdatingSettings(true);
      await settingsServices.updateSettings({ standardWorkDays: daysNum });
      setStandardWorkDays(daysNum);
      toast.success(`Đã cập nhật ngày công chuẩn toàn công ty: ${daysNum} ngày/tháng`);

      // Cập nhật tức thì các nhân viên chưa chốt trên bảng hiển thị
      setMergedPayrollData((prev) =>
        prev.map((emp) => {
          if (emp.isFinalized) return emp;
          return {
            ...emp,
            standardWorkDays: daysNum,
            expectedSalary: calculatePayroll({
              baseSalary: emp.baseSalary,
              standardWorkDays: daysNum,
              actualWorkDays: emp.actualWorkDays,
              adjustment: emp.adjustment || 0,
            }),
          };
        })
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật ngày công chuẩn:", error);
      toast.error("Không thể cập nhật ngày công chuẩn. Vui lòng thử lại!");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Xử lý chốt lương nhân viên
  const handleFinalizePayroll = async (payload) => {
    await payrollServices.generatePayroll(payload);
    toast.success("Chốt lương thành công!");
    await loadAdminData();
  };

  // Xử lý sửa lương đã chốt
  const handleUpdateFinalizedPayroll = async (id, payload) => {
    await payrollServices.updatePayroll(id, payload);
    toast.success("Cập nhật điều chỉnh lương thành công!");
    await loadAdminData();
  };

  // Xử lý chốt lại từ đầu
  const handleRecalculatePayroll = async (payload) => {
    await payrollServices.generatePayroll(payload);
    toast.success("Đã tính lại từ đầu và cập nhật bảng lương!");
    await loadAdminData();
  };

  // Xử lý chốt lương hàng loạt
  const handleConfirmBatch = async (unfinalizedList, onProgress) => {
    let completedCount = 0;
    for (const emp of unfinalizedList) {
      try {
        const empId = emp.employeeId || emp.id;
        await payrollServices.generatePayroll({
          employeeId: empId,
          month: selectedMonth,
          adjustment: 0,
          note: "Chốt tự động hàng loạt",
        });
        completedCount++;
        onProgress?.(completedCount, unfinalizedList.length);
      } catch (err) {
        console.error(`Lỗi khi chốt cho nhân viên ${emp.fullName}:`, err);
      }
    }
    toast.success(
      `Đã chốt lương thành công cho ${completedCount}/${unfinalizedList.length} nhân sự!`
    );
    await loadAdminData();
  };

  // Thống kê nhanh dành cho Admin
  const stats = useMemo(() => {
    const totalEmployees = mergedPayrollData.length;
    const finalizedCount = mergedPayrollData.filter((item) => item.isFinalized).length;
    const pendingCount = totalEmployees - finalizedCount;

    const enoughWorkDaysCount = mergedPayrollData.filter(
      (item) => Number(item.actualWorkDays || 0) >= Number(item.standardWorkDays || standardWorkDays)
    ).length;

    const enoughRate =
      totalEmployees > 0 ? Math.round((enoughWorkDaysCount / totalEmployees) * 100) : 0;

    const totalBudget = mergedPayrollData.reduce((sum, item) => {
      if (item.isFinalized) {
        return sum + (Number(item.finalSalary) || 0);
      }
      return sum + (Number(item.expectedSalary) || 0);
    }, 0);

    const totalFinalizedBudget = mergedPayrollData.reduce((sum, item) => {
      if (item.isFinalized) {
        return sum + (Number(item.finalSalary) || 0);
      }
      return sum;
    }, 0);

    const unfinalizedList = mergedPayrollData.filter((item) => !item.isFinalized);

    return {
      totalEmployees,
      finalizedCount,
      pendingCount,
      enoughRate,
      totalBudget,
      totalFinalizedBudget,
      unfinalizedList,
    };
  }, [mergedPayrollData, standardWorkDays]);

  // Kiểm tra quyền truy cập
  if (!isAdmin && !isEmployee) {
    return <NotAuthorPage />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Trang & Bộ chọn Kỳ lương */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Tài chính & Quản trị Lương</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-deep">
            {isAdmin ? "Bảng lương & Chấm công" : "Phiếu lương của tôi"}
          </h1>
          <p className="text-xs text-steel mt-1">
            {isAdmin
              ? "Theo dõi ngày công thực tế, tùy chỉnh ngày công chuẩn và thực hiện chốt bảng lương định kỳ."
              : "Tra cứu lịch sử thu nhập, chi tiết công và các khoản thưởng phạt hàng tháng."}
          </p>
        </div>

        {/* Action Buttons cho Admin */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bộ chọn tháng */}
            <div className="flex items-center gap-2 bg-canvas px-3 py-1.5 border border-hairline rounded-xl shadow-2xs">
              <Calendar className="w-4 h-4 text-stone shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-semibold text-ink-deep bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* Nút Làm mới */}
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadAdminData();
              }}
              disabled={isRefreshing}
              title="Làm mới dữ liệu"
              className="p-2.5 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft text-slate hover:text-ink transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")}
              />
            </button>

            {/* Nút Chốt tất cả */}
            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              disabled={stats.unfinalizedList.length === 0}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Chốt tất cả ({stats.unfinalizedList.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Giao diện phía Quản trị viên (Admin) */}
      {isAdmin ? (
        <div className="space-y-6">
          {/* Card Cấu hình Ngày Công Chuẩn (Quick Edit trực tiếp trên trang) */}
          <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-ink-deep flex items-center gap-2">
                  <span>Ngày công chuẩn toàn công ty</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-soft text-steel border border-hairline-soft">
                    Mặc định tháng {selectedMonth}
                  </span>
                </h3>
                <p className="text-[11px] text-steel mt-0.5">
                  Con số dùng làm mẫu số chia trong công thức tính lương dự kiến:{" "}
                  <code className="bg-surface-soft px-1 py-0.5 rounded text-primary font-mono text-[10px]">
                    (Lương cơ bản ÷ {standardWorkDays}) × Công thực tế
                  </code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-28">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={standardDaysInput}
                  onChange={(e) => setStandardDaysInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-1.5 bg-surface-soft border border-hairline rounded-xl text-ink-deep text-xs font-bold font-mono focus:bg-canvas focus:border-primary outline-none transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone font-medium pointer-events-none">
                  ngày
                </span>
              </div>
              <button
                type="button"
                onClick={handleUpdateStandardWorkDays}
                disabled={isUpdatingSettings || standardDaysInput === String(standardWorkDays)}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdatingSettings ? "Đang lưu..." : "Lưu chuẩn công"}</span>
              </button>
            </div>
          </div>

          {/* Cards Thống kê Chỉ số Lương tháng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng nhân sự & Trạng thái */}
            <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
                  Tiến độ chốt lương
                </span>
                <Users className="w-4 h-4 text-steel" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-ink-deep font-mono">
                  {stats.finalizedCount} / {stats.totalEmployees}
                </span>
                <span className="text-xs text-steel">nhân sự</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        stats.totalEmployees > 0
                          ? (stats.finalizedCount / stats.totalEmployees) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-primary font-mono">
                  {stats.totalEmployees > 0
                    ? Math.round((stats.finalizedCount / stats.totalEmployees) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Card 2: Tỷ lệ đủ ngày công chuẩn */}
            <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
                  Tỷ lệ đủ ngày công
                </span>
                <UserCheck className="w-4 h-4 text-success" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-success font-mono">
                  {stats.enoughRate}%
                </span>
                <span className="text-xs text-steel font-medium">đạt chuẩn công</span>
              </div>
              <p className="text-[11px] text-stone mt-2.5">
                So sánh số ngày có chấm công với chuẩn {standardWorkDays} ngày
              </p>
            </div>

            {/* Card 3: Tổng quỹ lương đã chốt */}
            <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
                  Đã chốt thực tế
                </span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-primary font-mono">
                  {formatCurrency(stats.totalFinalizedBudget)}
                </span>
              </div>
              <p className="text-[11px] text-stone mt-2.5">
                Tổng số tiền đã chính thức chốt ({stats.finalizedCount} người)
              </p>
            </div>

            {/* Card 4: Tổng quỹ lương dự kiến */}
            <div className="bg-canvas border border-hairline-soft rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
                  Tổng quỹ dự kiến
                </span>
                <TrendingUp className="w-4 h-4 text-steel" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-bold text-ink-deep font-mono">
                  {formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <p className="text-[11px] text-stone mt-2.5">
                Bao gồm cả lương dự kiến của {stats.pendingCount} nhân sự chưa chốt
              </p>
            </div>
          </div>

          {/* Tab Chuyển đổi giữa Bảng tổng hợp công ty và Phiếu lương cá nhân Admin */}
          <div className="flex border-b border-hairline-soft gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAdminActiveTab("summary")}
              className={cn(
                "pb-3 relative cursor-pointer transition-colors",
                adminActiveTab === "summary"
                  ? "text-primary border-b-2 border-primary font-bold"
                  : "text-steel hover:text-ink-deep"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Bảng tổng hợp lương toàn công ty ({mergedPayrollData.length})</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAdminActiveTab("personal")}
              className={cn(
                "pb-3 relative cursor-pointer transition-colors",
                adminActiveTab === "personal"
                  ? "text-primary border-b-2 border-primary font-bold"
                  : "text-steel hover:text-ink-deep"
              )}
            >
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Phiếu lương của tôi</span>
              </span>
            </button>
          </div>

          {/* Nội dung Tab */}
          {adminActiveTab === "summary" ? (
            <AdminPayrollTable
              payrollData={mergedPayrollData}
              standardWorkDays={standardWorkDays}
              isLoading={isLoading}
              onOpenFinalize={(row) => setFinalizeModalData(row)}
              onOpenEdit={(row) => setEditModalData(row)}
              onOpenRecalculate={(row) => setRecalculateModalData(row)}
            />
          ) : (
            <EmployeePayrollView
              payrolls={employeePayrolls}
              currentMonth={selectedMonth}
              isLoading={isLoading}
              profile={profile}
            />
          )}
        </div>
      ) : (
        /* 3. Giao diện phía Nhân viên (Employee View) */
        <EmployeePayrollView
          payrolls={employeePayrolls}
          currentMonth={selectedMonth}
          isLoading={isLoading}
          profile={profile}
        />
      )}

      {/* 4. Các Modals Nghiệp vụ */}
      {/* Modal Chốt lương */}
      <FinalizePayrollModal
        isOpen={Boolean(finalizeModalData)}
        onClose={() => setFinalizeModalData(null)}
        employeeData={finalizeModalData}
        month={selectedMonth}
        onFinalize={handleFinalizePayroll}
      />

      {/* Modal Sửa lương đã chốt */}
      <EditPayrollModal
        isOpen={Boolean(editModalData)}
        onClose={() => setEditModalData(null)}
        payrollRecord={editModalData}
        onUpdate={handleUpdateFinalizedPayroll}
      />

      {/* Modal Chốt lại từ đầu */}
      <RecalculatePayrollModal
        isOpen={Boolean(recalculateModalData)}
        onClose={() => setRecalculateModalData(null)}
        employeeData={recalculateModalData}
        month={selectedMonth}
        onRecalculate={handleRecalculatePayroll}
      />

      {/* Modal Chốt hàng loạt */}
      <BatchFinalizeModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        unfinalizedEmployees={stats.unfinalizedList}
        month={selectedMonth}
        standardWorkDays={standardWorkDays}
        onConfirmBatch={handleConfirmBatch}
      />
    </div>
  );
}
