import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceServices } from "../services/attendanceServices";
import { QUERY_KEYS } from "@/config/queryClient";
import { toast } from "sonner";

/**
 * Custom hook truy vấn danh sách chấm công với TanStack Query
 * @param {Object} [options]
 * @param {Object} [options.params] - Query params (ví dụ: employeeId, date...)
 * @param {boolean} [options.enabled=true] - Điều kiện kích hoạt query
 */
export function useAttendanceQuery({ params, enabled = true } = {}) {
  return useQuery({
    queryKey: params ? [...QUERY_KEYS.attendance, params] : QUERY_KEYS.attendance,
    queryFn: async () => {
      const data = await attendanceServices.getAttendance(params);
      return Array.isArray(data) ? data : [];
    },
    enabled,
  });
}

/**
 * Custom hook cung cấp các mutations Check-in / Check-out tự động cập nhật cache
 */
export function useAttendanceMutations() {
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: attendanceServices.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attendance });
      toast.success("Chấm công vào thành công!");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chấm công vào";
      toast.error(msg);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceServices.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attendance });
      toast.success("Chấm công ra thành công!");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chấm công ra";
      toast.error(msg);
    },
  });

  return {
    checkInMutation,
    checkOutMutation,
  };
}
