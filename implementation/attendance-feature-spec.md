# Đặc tả Kỹ thuật & Nghiệp vụ: Tính năng Chấm công (HRM Attendance)

> **Phương pháp**: Phỏng vấn đặc tả qua quy trình `/grilling` và chuẩn hóa UI/UX Anti-AI-Slop (`ui-taste-pro`, `design-taste-product`).

---

## 1. Quy chuẩn Ca làm việc (Working Shift)
- **Giờ vào ca chuẩn**: `08:30` (510 phút)
- **Giờ tan ca chuẩn**: `18:00` (1080 phút)
- **Thời gian nghỉ trưa**: `90 phút` (1.5 giờ, từ `12:00` đến `13:30`, 720 - 810 phút)
- **Tổng thời gian làm việc chuẩn**: `8 giờ` (480 phút làm việc thực tế)
- **Ngày làm việc trong tuần**: Thứ Hai đến Thứ Sáu (Thứ Bảy & Chủ Nhật là ngày nghỉ cuối tuần).

---

## 2. Quy tắc Tính Số Công & Xử lý Đi muộn

| Trạng thái | Điều kiện Check-in / Làm việc | Nhãn hiển thị | Số công ghi nhận | Thống kê |
| :--- | :--- | :--- | :---: | :--- |
| **Đúng giờ** | Check-in $\le$ `08:30` và làm đủ $\ge 8\text{h}$ | `Đúng giờ` | **1.0 công** | Tính vào ngày đúng giờ |
| **Ân hạn đi muộn ($\le 15$p)** | Check-in từ `08:30:01` đến `08:45:00` | `Đi muộn ≤ 15p` | **1.0 công** | Tính 1 lần vào số lần đi muộn |
| **Phạt đi muộn (15p - 60p)** | Check-in từ `08:45:01` đến `09:30:00` | `Đi muộn > 15p` | **0.75 công** | Trừ 0.25 công, tính 1 lần đi muộn |
| **Nửa công / Muộn > 60p** | Check-in sau `09:30` hoặc làm việc $4\text{h} \le \text{thời gian} < 8\text{h}$ | `Nửa công` | **0.5 công** | Tính 0.5 công |
| **Không đủ công** | Làm việc dưới $4\text{h}$ thực tế | `Không đủ công` | **0 công** | Không đạt mức tối thiểu |
| **Thiếu Check-out** | Có check-in nhưng không có check-out khi hết ngày | `Thiếu check-out` | **0 công** | Ghi nhận thiếu check-out |
| **Đang làm việc** | Ngày hôm nay (`today`), đã check-in nhưng chưa check-out | `Đang làm việc` | **Đang tính** | Hiển thị trạng thái ca làm đang diễn ra |
| **Nghỉ cuối tuần** | Thứ Bảy / Chủ Nhật | `Nghỉ cuối tuần` | `--` | Không tính ngày công |
| **Vắng mặt** | Ngày làm việc trong quá khứ không có dữ liệu check-in | `Vắng mặt` | **0 công** | Ngày vắng không phép / không chấm công |

---

## 3. Cấu trúc Component & Luồng dữ liệu

```
src/
├── pages/
│   └── AttendancePage.jsx          # Trang chấm công chính (phân quyền Nhân viên / Quản trị viên)
├── components/attendance/
│   ├── Attendance.jsx              # Khối Chấm công trực quan (Đồng hồ, Check-in / Check-out button)
│   ├── AttendanceCalendar.jsx      # Lưới Lịch Calendar tháng, bộ chuyển tháng, KPI card, Modal chi tiết ngày
│   ├── AdminAttendanceTable.jsx    # Bảng Quản lý toàn bộ nhân viên, bộ lọc tháng, tìm kiếm, KPI công ty
│   └── EmployeeAttendanceModal.jsx # Modal hiển thị lịch chấm công của nhân viên được Admin chọn (Read-only)
├── services/
│   ├── attendanceServices.js       # Gọi API /api/attendance, /check-in, /check-out (hỗ trợ params filter)
│   ├── employeeServices.js         # Gọi API /api/employees
│   └── settingsServices.js         # Gọi API /api/settings (standardWorkDays)
└── utils/
    ├── attendanceCalculator.js     # Thuật toán tính toán ca, ân hạn 15p, trừ giờ nghỉ trưa 90p, thống kê tháng
    └── formatTime.js               # Định dạng giờ phút, ngày tháng
```

---

## 4. Kết quả Kiểm thử & Đảm bảo Chất lượng (QA)
- **Node Execution Tests**: Đã kiểm tra thuật toán `attendanceCalculator.js` trên các ca kiểm thử: đúng giờ, ân hạn 10 phút, phạt đi muộn 30 phút, đi muộn > 60 phút, và quên check-out. Toàn bộ cho kết quả chính xác theo quy chuẩn đã duyệt.
- **Linter**: `npm run lint` đạt 0 lỗi, 0 cảnh báo.
- **Production Build**: `npm run build` chạy thành công (Vite v8.3.0).
