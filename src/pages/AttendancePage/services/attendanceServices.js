import api from "@/utils/axios";

export const attendanceServices = {
  // Lấy danh sách điểm danh (nếu employee: chỉ của mình, nếu admin: toàn bộ hoặc lọc theo employeeId)
  getAttendance: async (params) => {
    const res = await api.get("/api/attendance", { params });
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
