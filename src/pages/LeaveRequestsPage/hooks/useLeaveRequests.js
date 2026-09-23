import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveRequestsServices } from "../services/leaveRequestsServices";
import { employeeServices } from "@/pages/EmployeesPage/services/employeeServices";
import { QUERY_KEYS } from "@/config/queryClient";
import { toast } from "sonner";

/**
 * Custom Hook useLeaveRequests sử dụng TanStack Query
 * Quản lý caching danh sách đơn nghỉ phép, thông tin nhân viên và phê duyệt đơn
 *
 * @param {Object} options
 * @param {boolean} [options.isAdmin=false] - Người dùng có quyền Admin hay không
 * @param {boolean} [options.autoFetch=true] - Tự động tải dữ liệu khi mount
 */
export function useLeaveRequests({ isAdmin = false, autoFetch = true } = {}) {
  const queryClient = useQueryClient();

  // Truy vấn danh sách đơn xin nghỉ phép có cache
  const {
    data: requests = [],
    isLoading: isLeaveLoading,
    isFetching: isLeaveFetching,
    refetch: refetchLeave,
  } = useQuery({
    queryKey: QUERY_KEYS.leaveRequests,
    queryFn: async () => {
      const data = await leaveRequestsServices.getLeaveRequests();
      return Array.isArray(data) ? data : [];
    },
    enabled: autoFetch,
  });

  // Truy vấn danh sách nhân viên để map tên (chỉ khi là Admin)
  const {
    data: employees = [],
    isLoading: isEmpLoading,
    refetch: refetchEmp,
  } = useQuery({
    queryKey: QUERY_KEYS.employees,
    queryFn: async () => {
      const data = await employeeServices.getEmployees();
      return Array.isArray(data) ? data : [];
    },
    enabled: autoFetch && isAdmin,
  });

  // Tạo map id -> employee để tra cứu nhanh thông tin
  const employeesMap = useMemo(() => {
    if (!isAdmin || !Array.isArray(employees)) return {};
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp;
    });
    return map;
  }, [isAdmin, employees]);

  const isLoading = isLeaveLoading || (isAdmin && isEmpLoading);
  const isRefreshing = isLeaveFetching && !isLoading;

  const handleRefresh = async () => {
    await Promise.all([
      refetchLeave(),
      isAdmin ? refetchEmp() : Promise.resolve(),
    ]);
    toast.success("Đã làm mới danh sách đơn nghỉ phép");
  };

  const handleApprove = async (requestOrId) => {
    const id = typeof requestOrId === "object" ? requestOrId.id : requestOrId;
    try {
      await leaveRequestsServices.updateStatus(id, "approved");
      toast.success(`Đã duyệt đơn nghỉ phép #${id}`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaveRequests });
      return true;
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      toast.error("Duyệt đơn nghỉ phép thất bại");
      return false;
    }
  };

  const handleReject = async (requestOrId) => {
    const id = typeof requestOrId === "object" ? requestOrId.id : requestOrId;
    try {
      await leaveRequestsServices.updateStatus(id, "rejected");
      toast.success(`Đã từ chối đơn nghỉ phép #${id}`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaveRequests });
      return true;
    } catch (error) {
      console.error("Lỗi khi từ chối đơn:", error);
      toast.error("Từ chối đơn nghỉ phép thất bại");
      return false;
    }
  };

  const stats = useMemo(() => {
    const total = requests.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    requests.forEach((r) => {
      const st = (r.status || "").toLowerCase();
      if (st === "approved") approved++;
      else if (st === "rejected") rejected++;
      else pending++;
    });

    return { total, pending, approved, rejected };
  }, [requests]);

  return {
    requests,
    employeesMap,
    isLoading,
    isRefreshing,
    stats,
    fetchData: refetchLeave,
    refetch: refetchLeave,
    handleRefresh,
    handleApprove,
    handleReject,
  };
}
