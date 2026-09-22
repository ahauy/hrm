import api from "@/utils/axios";

export const employeeServices = {
  // Lấy danh sách toàn bộ nhân viên (admin only)
  getEmployees: async () => {
    const res = await api.get("/api/employees");
    return res.data;
  },

  // Lấy chi tiết nhân viên theo ID
  getEmployeeById: async (id) => {
    const res = await api.get(`/api/employees/${id}`);
    return res.data;
  },

  // Tạo nhân viên mới (admin only)
  createEmployee: async (data) => {
    const res = await api.post("/api/employees", data);
    return res.data;
  },

  // Cập nhật thông tin nhân viên (admin only)
  updateEmployee: async (id, data) => {
    const res = await api.put(`/api/employees/${id}`, data);
    return res.data;
  },

  // Xóa nhân viên (admin only)
  deleteEmployee: async (id) => {
    const res = await api.delete(`/api/employees/${id}`);
    return res.data;
  },
};
