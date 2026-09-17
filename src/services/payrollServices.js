import api from "../utils/axios.js";

export const payrollServices = {
  // Lấy tổng hợp ngày công và lương dự kiến của toàn bộ nhân viên theo tháng (Admin only)
  getPayrollSummary: async (month) => {
    const res = await api.get("/api/payroll/summary", {
      params: { month },
    });
    return res.data;
  },

  // Danh sách bản ghi bảng lương đã chốt
  // Nhân viên thường: API tự trả về của chính mình
  // Admin: có thể truyền thêm month, employeeId để lọc
  getPayrolls: async (params = {}) => {
    const res = await api.get("/api/payroll", {
      params,
    });
    return res.data;
  },

  // Chốt lương hoặc chốt lại cho một nhân viên trong tháng (Admin only)
  // Payload: { employeeId: number, month: string (YYYY-MM), adjustment?: number, note?: string }
  generatePayroll: async (payload) => {
    const res = await api.post("/api/payroll/generate", payload);
    return res.data;
  },

  // Chỉnh sửa khoản thưởng/phạt hoặc ghi chú của bản ghi lương đã chốt (Admin only)
  // Payload: { adjustment?: number, note?: string }
  updatePayroll: async (id, payload) => {
    const res = await api.patch(`/api/payroll/${id}`, payload);
    return res.data;
  },
};
