import { QueryClient } from "@tanstack/react-query";

/**
 * Cấu hình tập trung cho QueryClient của TanStack React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút: Dữ liệu được coi là fresh trong 5 phút, không gọi lại API thừa
      gcTime: 10 * 60 * 1000, // 10 phút: Thời gian lưu trữ cache không hoạt động
      refetchOnWindowFocus: false, // Không tự động refetch khi focus lại tab trình duyệt
      retry: 1, // Tự động thử lại 1 lần nếu request thất bại do mạng
    },
  },
});

/**
 * Quản lý Query Keys tập trung để dễ dàng invalidate và cập nhật cache
 */
export const QUERY_KEYS = {
  employees: ["employees"],
  employeeDetail: (id) => ["employees", id],
  leaveRequests: ["leave-requests"],
  attendance: ["attendance"],
  payroll: ["payroll"],
  payrollSummary: (month) => ["payroll", "summary", month],
  payrollRecords: (params) => ["payroll", "records", params],
  payrollSelf: (empId) => ["payroll", "self", empId],
  settings: ["settings"],
};
