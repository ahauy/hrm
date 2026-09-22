import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotAuthorPage from "@/pages/NotAuthorPage";
import { settingsServices } from "@/pages/SettingPage/services/settingsServices";
import { payrollServices } from "./services/payrollServices";
import { employeeServices } from "@/pages/EmployeesPage/services/employeeServices";
import { calculatePayroll } from "@/utils/formatCurrency";
import AdminPayrollTable from "./components/AdminPayrollTable";
import EmployeePayrollView from "./components/EmployeePayrollView";
import FinalizePayrollModal from "./dialogs/FinalizePayrollModal";
import EditPayrollModal from "./dialogs/EditPayrollModal";
import RecalculatePayrollModal from "./dialogs/RecalculatePayrollModal";
import BatchFinalizeModal from "./dialogs/BatchFinalizeModal";
import PayslipModal from "./dialogs/PayslipModal";
import StandardWorkDaysConfig from "./components/StandardWorkDaysConfig";
import PayrollStatsCards from "./components/PayrollStatsCards";
import {
  Wallet,
  Calendar,
  Users,
  CheckCheck,
  RefreshCw,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

export default function PayrollPage() {
  const { profile, isAdmin, isEmployee } = useAuth();

  // Định dạng tháng mặc định YYYY-MM (Ví dụ: 2026-09)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // State cấu hình ngày công chuẩn
  const [standardWorkDays, setStandardWorkDays] = useState(22);
  const [standardDaysInput, setStandardDaysInput] = useState("22");
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
  const [viewPayslipData, setViewPayslipData] = useState(null);

  // Tải dữ liệu dành cho Admin
  const loadAdminData = useCallback(async () => {
    try {
      // 1. Tải cài đặt ngày công chuẩn
      const settingsPromise = settingsServices.getSettings().catch(() => ({
        standardWorkDays: 22,
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
      const stdDays = Number(settingsRes?.standardWorkDays) || 22;
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
              baseSalary: emp.baseSalary ?? 0,
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
          finalizedRecord?.baseSalary ?? item.baseSalary ?? empInfo?.baseSalary ?? 0
        );

        // Số công chấm công thực tế mới nhất hiện tại từ hệ thống chấm công
        const liveActualWorkDays = Number(item.actualWorkDays ?? 0);
        // Số công đã chốt trong bản ghi lương trước đây
        const finalizedActualWorkDays = finalizedRecord
          ? Number(finalizedRecord.actualWorkDays ?? item.existingActualWorkDays ?? 0)
          : null;

        // Kiểm tra xem dữ liệu chấm công có thay đổi sau khi chốt lương hay không
        const hasAttendanceChanged = Boolean(
          finalizedRecord &&
            finalizedActualWorkDays !== null &&
            liveActualWorkDays !== finalizedActualWorkDays
        );
        const deltaDays = hasAttendanceChanged
          ? liveActualWorkDays - finalizedActualWorkDays
          : 0;

        // Hiển thị số ngày công: đã chốt thì ưu tiên hiển thị số công đã chốt, chưa chốt thì hiển thị công thực tế
        const actualWorkDays = finalizedRecord
          ? finalizedActualWorkDays
          : liveActualWorkDays;

        const standard = Number(
          finalizedRecord?.standardWorkDays || stdDays
        );

        if (finalizedRecord) {
          const totalPayVal = Number(
            finalizedRecord.totalPay ?? finalizedRecord.finalSalary ?? 0
          );
          return {
            ...item,
            id: finalizedRecord.id,
            payrollId: finalizedRecord.id,
            employeeId: empId,
            fullName,
            department,
            position,
            baseSalary,
            actualWorkDays,
            finalizedActualWorkDays,
            liveActualWorkDays,
            hasAttendanceChanged,
            deltaDays,
            standardWorkDays: standard,
            isFinalized: true,
            adjustment: finalizedRecord.adjustment ?? 0,
            note: finalizedRecord.note || "",
            totalPay: totalPayVal,
            finalSalary: totalPayVal,
            createdAt: finalizedRecord.createdAt,
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
          liveActualWorkDays,
          finalizedActualWorkDays: null,
          hasAttendanceChanged: false,
          deltaDays: 0,
          standardWorkDays: standard,
          isFinalized: false,
          adjustment: 0,
          note: "",
          expectedSalary,
        };
      });

      setMergedPayrollData(merged);

      // Tải lịch sử lương cá nhân của Admin nếu chuyển tab (chỉ lấy đúng của Admin)
      const adminEmpId = profile?.id;
      const selfPayrolls = adminEmpId
        ? await payrollServices
            .getPayrolls({ employeeId: adminEmpId })
            .catch(() => [])
        : [];
      const adminOnlyPayrolls = Array.isArray(selfPayrolls)
        ? selfPayrolls.filter(
            (p) => Number(p.employeeId) === Number(adminEmpId)
          )
        : [];
      setEmployeePayrolls(adminOnlyPayrolls);
    } catch (error) {
      console.error("Lỗi khi tải bảng lương quản trị:", error);
      toast.error("Không thể tải thông tin bảng lương");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedMonth, profile]);

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
        return sum + (Number(item.totalPay ?? item.finalSalary) || 0);
      }
      return sum + (Number(item.expectedSalary) || 0);
    }, 0);

    const totalFinalizedBudget = mergedPayrollData.reduce((sum, item) => {
      if (item.isFinalized) {
        return sum + (Number(item.totalPay ?? item.finalSalary) || 0);
      }
      return sum;
    }, 0);

    const unfinalizedList = mergedPayrollData.filter((item) => !item.isFinalized);
    const attendanceChangedList = mergedPayrollData.filter(
      (item) => item.isFinalized && item.hasAttendanceChanged
    );

    return {
      totalEmployees,
      finalizedCount,
      pendingCount,
      enoughRate,
      totalBudget,
      totalFinalizedBudget,
      unfinalizedList,
      attendanceChangedList,
    };
  }, [mergedPayrollData, standardWorkDays]);

  // Xử lý chốt lại toàn bộ cho tất cả nhân sự có cập nhật chấm công mới
  const [isBatchRecalculating, setIsBatchRecalculating] = useState(false);
  const handleBatchRecalculateAttendanceChanges = async () => {
    const list = stats.attendanceChangedList;
    if (!list || list.length === 0) return;

    const confirm = window.confirm(
      `Tìm thấy ${list.length} nhân sự có dữ liệu chấm công mới sau khi đã chốt. Bạn có muốn tính lại từ đầu và chốt lại toàn bộ cho ${list.length} nhân sự này?`
    );
    if (!confirm) return;

    try {
      setIsBatchRecalculating(true);
      let successCount = 0;
      for (const emp of list) {
        try {
          const empId = emp.employeeId || emp.id;
          await payrollServices.generatePayroll({
            employeeId: empId,
            month: selectedMonth,
            adjustment: emp.adjustment || 0,
            note: emp.note || "Chốt lại tự động theo dữ liệu chấm công mới",
          });
          successCount++;
        } catch (err) {
          console.error(`Lỗi khi chốt lại cho ${emp.fullName}:`, err);
        }
      }
      toast.success(
        `Đã chốt lại thành công cho ${successCount}/${list.length} nhân sự có dữ liệu chấm công mới!`
      );
      await loadAdminData();
    } catch (err) {
      console.error("Lỗi khi chốt lại hàng loạt:", err);
      toast.error("Không thể hoàn tất chốt lại hàng loạt");
    } finally {
      setIsBatchRecalculating(false);
    }
  };

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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <>
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

              {/* Nút Làm mới cho Admin */}
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
            </>
          ) : (
            /* Nút Làm mới cho Nhân viên */
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadEmployeeData();
              }}
              disabled={isRefreshing}
              title="Làm mới dữ liệu phiếu lương"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-hairline bg-canvas hover:bg-surface-soft text-slate hover:text-ink text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")}
              />
              <span>Làm mới phiếu lương</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Giao diện phía Quản trị viên (Admin) */}
      {isAdmin ? (
        <div className="space-y-6">
          {/* Card Cấu hình Ngày Công Chuẩn */}
          <StandardWorkDaysConfig
            standardDaysInput={standardDaysInput}
            onStandardDaysInputChange={setStandardDaysInput}
            onSaveStandardDays={handleUpdateStandardWorkDays}
            isUpdatingSettings={isUpdatingSettings}
            unfinalizedCount={stats.unfinalizedList.length}
            onOpenBatchModal={() => setShowBatchModal(true)}
          />

          {/* Cards Thống kê Chỉ số Lương tháng & Banner cảnh báo công mới */}
          <PayrollStatsCards
            stats={stats}
            standardWorkDays={standardWorkDays}
            onBatchRecalculate={handleBatchRecalculateAttendanceChanges}
            isBatchRecalculating={isBatchRecalculating}
          />

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
              onOpenViewPayslip={(row) => setViewPayslipData(row)}
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
      {/* Modal Xem chi tiết Phiếu lương */}
      <PayslipModal
        isOpen={Boolean(viewPayslipData)}
        onClose={() => setViewPayslipData(null)}
        payrollRecord={viewPayslipData}
      />

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
