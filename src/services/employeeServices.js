import api from "../utils/axios.js";

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
};
