import api from "../utils/axios.js";

export const settingsServices = {
  // Lấy cấu hình công ty (standardWorkDays, ...)
  getSettings: async () => {
    const res = await api.get("/api/settings");
    return res.data;
  },

  // Cập nhật cấu hình công ty (admin only)
  updateSettings: async (settingsData) => {
    const res = await api.put("/api/settings", settingsData);
    return res.data;
  },
};
