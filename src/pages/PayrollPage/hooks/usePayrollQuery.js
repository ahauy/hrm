import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollServices } from "../services/payrollServices";
import { settingsServices } from "@/pages/SettingPage/services/settingsServices";
import { useEmployeesQuery } from "@/pages/EmployeesPage/hooks/useEmployeesQuery";
import { QUERY_KEYS } from "@/config/queryClient";
import { calculatePayroll } from "@/utils/formatCurrency";
import { toast } from "sonner";

/**
 * Custom hook quản lý dữ liệu bảng lương dành cho Admin với TanStack Query
 * Tự động đồng bộ và cache tổng hợp chấm công, các bản ghi đã chốt, danh sách nhân viên và cài đặt công chuẩn
 */
export function usePayrollAdminQuery({ selectedMonth, enabled = true } = {}) {
  const queryClient = useQueryClient();

  // 1. Tải cài đặt ngày công chuẩn
  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: async () => {
      try {
        return await settingsServices.getSettings();
      } catch {
        return { standardWorkDays: 22 };
      }
    },
    enabled,
  });

  // 2. Tải bảng tổng hợp chấm công & lương dự kiến của tháng
  const summaryQuery = useQuery({
    queryKey: QUERY_KEYS.payrollSummary(selectedMonth),
    queryFn: async () => {
      try {
        const data = await payrollServices.getPayrollSummary(selectedMonth);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(enabled && selectedMonth),
  });

  // 3. Tải danh sách bản ghi bảng lương đã chốt trong tháng
  const recordsQuery = useQuery({
    queryKey: QUERY_KEYS.payrollRecords({ month: selectedMonth }),
    queryFn: async () => {
      try {
        const data = await payrollServices.getPayrolls({ month: selectedMonth });
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(enabled && selectedMonth),
  });

  // 4. Tải danh sách nhân viên (tái sử dụng cache toàn cục)
  const employeesQuery = useEmployeesQuery({ enabled });

  const standardWorkDays = Number(settingsQuery.data?.standardWorkDays) || 22;

  // Hợp nhất dữ liệu bảng lương
  const mergedPayrollData = useMemo(() => {
    const summaryList = Array.isArray(summaryQuery.data) ? summaryQuery.data : [];
    const finalizedList = Array.isArray(recordsQuery.data) ? recordsQuery.data : [];
    const employeesList = Array.isArray(employeesQuery.data) ? employeesQuery.data : [];

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

    // Nếu summaryList có dữ liệu, dùng summaryList làm gốc; nếu không, dựng từ employeesList
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

    return baseSource.map((item) => {
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

      const liveActualWorkDays = Number(item.actualWorkDays ?? 0);
      const finalizedActualWorkDays = finalizedRecord
        ? Number(finalizedRecord.actualWorkDays ?? item.existingActualWorkDays ?? 0)
        : null;

      const hasAttendanceChanged = Boolean(
        finalizedRecord &&
          finalizedActualWorkDays !== null &&
          liveActualWorkDays !== finalizedActualWorkDays
      );
      const deltaDays = hasAttendanceChanged
        ? liveActualWorkDays - finalizedActualWorkDays
        : 0;

      const actualWorkDays = finalizedRecord
        ? finalizedActualWorkDays
        : liveActualWorkDays;

      const standard = Number(finalizedRecord?.standardWorkDays || standardWorkDays);

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
  }, [summaryQuery.data, recordsQuery.data, employeesQuery.data, standardWorkDays]);

  const isLoading =
    settingsQuery.isLoading ||
    summaryQuery.isLoading ||
    recordsQuery.isLoading ||
    employeesQuery.isLoading;

  const isFetching =
    settingsQuery.isFetching ||
    summaryQuery.isFetching ||
    recordsQuery.isFetching ||
    employeesQuery.isFetching;

  const refetchAll = async () => {
    await Promise.all([
      settingsQuery.refetch(),
      summaryQuery.refetch(),
      recordsQuery.refetch(),
      employeesQuery.refetch(),
    ]);
  };

  return {
    mergedPayrollData,
    standardWorkDays,
    isLoading,
    isFetching,
    refetchAll,
    queryClient,
  };
}

/**
 * Custom hook quản lý lịch sử phiếu lương cá nhân (cho Employee hoặc Admin xem của chính mình)
 */
export function usePayrollPersonalQuery({ employeeId, enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.payrollSelf(employeeId),
    queryFn: async () => {
      const params = employeeId ? { employeeId } : {};
      const data = await payrollServices.getPayrolls(params);
      if (!Array.isArray(data)) return [];
      if (employeeId) {
        return data.filter((p) => Number(p.employeeId) === Number(employeeId));
      }
      return data;
    },
    enabled,
  });
}

/**
 * Custom hook cung cấp các mutations Chốt lương, Cập nhật lương, Chốt lại
 */
export function usePayrollMutations() {
  const queryClient = useQueryClient();

  // Chốt lương hoặc Chốt lại
  const generateMutation = useMutation({
    mutationFn: payrollServices.generatePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success("Chốt lương thành công!");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Không thể chốt lương";
      toast.error(msg);
    },
  });

  // Chỉnh sửa điều chỉnh thưởng/phạt hoặc ghi chú
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => payrollServices.updatePayroll(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success("Cập nhật điều chỉnh lương thành công!");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message || "Không thể cập nhật bản ghi lương";
      toast.error(msg);
    },
  });

  // Cập nhật ngày công chuẩn
  const updateSettingsMutation = useMutation({
    mutationFn: settingsServices.updateSettings,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success(
        `Đã cập nhật ngày công chuẩn toàn công ty: ${variables?.standardWorkDays} ngày/tháng`
      );
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message || "Không thể cập nhật ngày công chuẩn";
      toast.error(msg);
    },
  });

  return {
    generateMutation,
    updateMutation,
    updateSettingsMutation,
  };
}
