import { useState, useEffect, useCallback, useMemo } from "react";
import { leaveRequestsServices } from "@/services/leaveRequestsServices";
import { employeeServices } from "@/services/employeeServices";
import { toast } from "sonner";

/**
 * Custom Hook useLeaveRequests
 * Gom toàn bộ logic tải dữ liệu, quản lý trạng thái, duyệt/từ chối đơn nghỉ phép
 *
 * @param {Object} options
 * @param {boolean} options.isAdmin - Người dùng có quyền Admin hay không
 * @param {boolean} [options.autoFetch=true] - Tự động tải dữ liệu khi mount
 */
export function useLeaveRequests({ isAdmin = false, autoFetch = true } = {}) {
  const [requests, setRequests] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const reqPromise = leaveRequestsServices.getLeaveRequests();
      const empPromise = isAdmin
        ? employeeServices.getEmployees().catch(() => [])
        : Promise.resolve([]);

      const [reqData, empData] = await Promise.all([reqPromise, empPromise]);

      setRequests(Array.isArray(reqData) ? reqData : []);

      if (isAdmin && Array.isArray(empData)) {
        const map = {};
        empData.forEach((emp) => {
          map[emp.id] = emp;
        });
        setEmployeesMap(map);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn nghỉ phép:", error);
      toast.error("Không thể tải danh sách đơn nghỉ phép");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;
    if (autoFetch) {
      (async () => {
        try {
          const reqPromise = leaveRequestsServices.getLeaveRequests();
          const empPromise = isAdmin
            ? employeeServices.getEmployees().catch(() => [])
            : Promise.resolve([]);

          const [reqData, empData] = await Promise.all([reqPromise, empPromise]);
          if (!isMounted) return;

          setRequests(Array.isArray(reqData) ? reqData : []);

          if (isAdmin && Array.isArray(empData)) {
            const map = {};
            empData.forEach((emp) => {
              map[emp.id] = emp;
            });
            setEmployeesMap(map);
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách đơn nghỉ phép:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
            setIsRefreshing(false);
          }
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [autoFetch, isAdmin]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success("Đã làm mới danh sách đơn nghỉ phép");
  };

  const handleApprove = async (requestOrId) => {
    const id = typeof requestOrId === "object" ? requestOrId.id : requestOrId;
    try {
      await leaveRequestsServices.updateStatus(id, "approved");
      toast.success(`Đã duyệt đơn nghỉ phép #${id}`);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
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
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
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
    setRequests,
    employeesMap,
    isLoading,
    isRefreshing,
    stats,
    fetchData,
    handleRefresh,
    handleApprove,
    handleReject,
  };
}
