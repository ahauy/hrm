import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotAuthorPage from "@/pages/NotAuthorPage";
import { payrollServices } from "./services/payrollServices";
import {
  usePayrollAdminQuery,
  usePayrollPersonalQuery,
  usePayrollMutations,
} from "./hooks/usePayrollQuery";
import { queryClient, QUERY_KEYS } from "@/config/queryClient";
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

  // Tab chuyển đổi dành cho Admin: 'summary' (Toàn công ty) | 'personal' (Phiếu lương của Admin)
  const [adminActiveTab, setAdminActiveTab] = useState("summary");

  // 1. Dữ liệu bảng lương Admin qua TanStack Query
  const {
    mergedPayrollData,
    standardWorkDays,
    isLoading: isAdminLoading,
    isFetching: isAdminFetching,
    refetchAll: refetchAdmin,
  } = usePayrollAdminQuery({
    selectedMonth,
    enabled: Boolean(isAdmin),
  });

  // 2. Dữ liệu phiếu lương cá nhân (cho Nhân viên hoặc Admin xem của mình)
  const {
    data: employeePayrolls = [],
    isLoading: isEmpLoading,
    isFetching: isEmpFetching,
    refetch: refetchEmployeePayrolls,
  } = usePayrollPersonalQuery({
    employeeId: isAdmin ? profile?.id : undefined,
    enabled: Boolean(isEmployee || (isAdmin && adminActiveTab === "personal")),
  });

  // 3. Các mutations thao tác lương
  const {
    generateMutation,
    updateMutation,
    updateSettingsMutation,
  } = usePayrollMutations();

  const [customDaysInput, setCustomDaysInput] = useState(null);
  const standardDaysInput = customDaysInput ?? String(standardWorkDays || 22);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const isLoading = isAdmin ? isAdminLoading : isEmpLoading;
  const isRefreshing =
    (isAdmin ? isAdminFetching : isEmpFetching) && !isLoading;

  // State quản lý Modals
  const [finalizeModalData, setFinalizeModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [recalculateModalData, setRecalculateModalData] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [viewPayslipData, setViewPayslipData] = useState(null);

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    if (isAdmin) {
      await Promise.all([
        refetchAdmin(),
        adminActiveTab === "personal"
          ? refetchEmployeePayrolls()
          : Promise.resolve(),
      ]);
    } else {
      await refetchEmployeePayrolls();
    }
    toast.success("Đã làm mới dữ liệu bảng lương");
  };

  // Xử lý cập nhật Ngày công chuẩn (Admin only)
  const handleUpdateStandardWorkDays = async () => {
    const daysNum = parseInt(standardDaysInput, 10);
    if (isNaN(daysNum) || daysNum <= 0 || daysNum > 31) {
      toast.error("Ngày công chuẩn phải là một số hợp lệ từ 1 đến 31");
      return;
    }

    try {
      setIsUpdatingSettings(true);
      await updateSettingsMutation.mutateAsync({ standardWorkDays: daysNum });
      setCustomDaysInput(null);
    } catch {
      // Đã bắt lỗi trong mutation
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Xử lý chốt lương nhân viên
  const handleFinalizePayroll = async (payload) => {
    await generateMutation.mutateAsync(payload);
  };

  // Xử lý sửa lương đã chốt
  const handleUpdateFinalizedPayroll = async (id, payload) => {
    await updateMutation.mutateAsync({ id, payload });
  };

  // Xử lý chốt lại từ đầu
  const handleRecalculatePayroll = async (payload) => {
    await generateMutation.mutateAsync(payload);
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
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
    toast.success(
      `Đã chốt lương thành công cho ${completedCount}/${unfinalizedList.length} nhân sự!`
    );
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
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
                onClick={handleRefresh}
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
              onClick={handleRefresh}
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
            onStandardDaysInputChange={setCustomDaysInput}
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
