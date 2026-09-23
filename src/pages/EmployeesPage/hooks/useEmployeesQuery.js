import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeServices } from "../services/employeeServices";
import { QUERY_KEYS } from "@/config/queryClient";
import { toast } from "sonner";

/**
 * Custom hook lấy danh sách nhân viên với TanStack Query
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Điều kiện kích hoạt query
 */
export function useEmployeesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.employees,
    queryFn: async () => {
      const data = await employeeServices.getEmployees();
      return Array.isArray(data) ? data : [];
    },
    enabled,
  });
}

/**
 * Custom hook cung cấp các mutations Thêm, Sửa, Xóa nhân viên và tự động invalidate cache
 */
export function useEmployeeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: employeeServices.createEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees });
      toast.success(`Thêm nhân viên mới "${data?.fullName || ""}" thành công!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Không thể thêm nhân viên mới";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeServices.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees });
      toast.success(
        `Cập nhật thông tin nhân viên "${variables?.data?.fullName || ""}" thành công!`
      );
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Không thể cập nhật thông tin nhân viên";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeServices.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees });
      toast.success("Xóa nhân viên thành công!");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Không thể xóa nhân viên";
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
