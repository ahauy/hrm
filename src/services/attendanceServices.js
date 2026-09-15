import api from "../utils/axios.js";

export const attendanceServices = {
  // Lấy danh sách điểm danh (nếu employee: chỉ của mình, nếu admin: toàn bộ)
  getAttendance: async () => {
    const res = await api.get("/api/attendance");
    return res.data;
  },

  // Chấm công vào (Check-in)
  checkIn: async () => {
    const res = await api.post("/api/attendance/check-in");
    return res.data;
  },

  // Chấm công ra (Check-out)
  checkOut: async () => {
    const res = await api.post("/api/attendance/check-out");
    return res.data;
  },
};
