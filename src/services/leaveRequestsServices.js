import api from "../utils/axios.js";

export const leaveRequestsServices = {
  // Lấy danh sách đơn nghỉ phép (nếu là employee: chỉ lấy của mình; nếu là admin: lấy tất cả)
  getLeaveRequests: async () => {
    const res = await api.get("/api/leave-requests");
    return res.data;
  },

  // Cập nhật trạng thái đơn (duyệt / từ chối - dành cho admin)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/api/leave-requests/${id}`, { status });
    return res.data;
  },
};