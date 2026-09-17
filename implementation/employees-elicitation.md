# Elicitation & Grilling Summary: Quản lý Nhân viên (Employees Management)

- **Feature**: Trang Quản trị Nhân viên (`/employees`)
- **Tài liệu API tham chiếu**: [Swagger API Documentation](https://lesson-starter-1.onrender.com/api-docs/swagger.json#/)
- **Ngày thực hiện**: 16/09/2026
- **Trạng thái**: Chờ người dùng xác nhận (Pending Sign-off)

---

## 1. Request Framing (Định vị yêu cầu)
Xây dựng trang Quản lý Nhân viên (`/employees`) dành cho Quản trị viên (Admin) với đầy đủ các thao tác nghiệp vụ: Xem danh sách nhân viên, Thêm mới nhân viên, Sửa thông tin nhân viên (khóa username), Xóa nhân viên (chặn tự xóa tài khoản đang đăng nhập), và bảo vệ tuyến đường (chặn nhân viên thường truy cập).

---

## 2. Decision Tree & Interview Transcript (Biên bản phỏng vấn)

### Nhóm 1: Dữ liệu & Quy tắc nghiệp vụ (Data & Rules)
- **Q1**: Trong Swagger API (`/api/employees`), schema không có trường lương (`salary` / `baseSalary`). Bạn muốn xử lý trường "Lương cơ bản" trên form như thế nào?
  - **Quyết định**: Bỏ trường Lương cơ bản, chỉ sử dụng các trường thông tin chuẩn theo Swagger API (`username`, `password`, `fullName`, `email`, `phone`, `position`, `department`, `role`, `joinDate`).
- **Q2**: Khi quản trị viên chỉnh sửa nhân viên (`PUT /api/employees/{id}`), ngoài việc không cho sửa username, bạn có muốn cho phép đổi / reset mật khẩu không?
  - **Quyết định**: Cho phép nhập mật khẩu mới trong form Sửa (nếu bỏ trống thì giữ nguyên mật khẩu cũ, không gửi đè lên API).
- **Q3**: Khi người dùng có vai trò nhân viên thường (`role: employee`) cố tình truy cập vào đường dẫn `/employees`, hệ thống nên phản hồi như thế nào?
  - **Quyết định**: Hiển thị giao diện thông báo không có quyền truy cập `NotAuthorPage.jsx`.

### Nhóm 2: Trải nghiệm người dùng & Luồng thao tác (UX & Workflows)
- **Q4**: Khi quản trị viên thực hiện thao tác Xóa nhân viên, trải nghiệm xác nhận bạn mong muốn là gì?
  - **Quyết định**: Hiển thị Modal xác nhận cảnh báo nguy hiểm (nêu rõ tên nhân viên, cảnh báo không thể hoàn tác) trước khi gọi API xóa `DELETE /api/employees/{id}`. Vô hiệu hóa nút Xóa đối với tài khoản của chính Admin đang đăng nhập.
- **Q5**: Màn hình danh sách nhân viên có cần trang bị thanh tìm kiếm và bộ lọc nhanh không?
  - **Quyết định**: Trang bị thanh tìm kiếm (theo họ tên, username, email) kết hợp bộ lọc nhanh theo Phòng ban và Vai trò (Admin / Employee), kèm phân trang client-side mượt mà.

---

## 3. Labeled Assumptions (Các giả định kỹ thuật)
- **`ASM-EMP-01`**: API endpoint `PUT /api/employees/{id}` nhận payload gồm các trường chỉnh sửa thông tin nhân viên (`fullName`, `email`, `phone`, `position`, `department`, `role`, `joinDate`, và `password` nếu có nhập mới).
- **`ASM-EMP-02`**: Danh sách nhân viên từ `GET /api/employees` trả về toàn bộ mảng dữ liệu; việc lọc (search, filter) và phân trang sẽ được tính toán trên client tương tự như trang `LeaveRequestsPage.jsx`.
- **`ASM-EMP-03`**: Nhận diện tài khoản hiện tại thông qua `useAuthStore` (`profile.id` hoặc `profile.username`) để ẩn hoặc disable nút xóa chính mình, đồng thời API backend cũng có lớp bảo vệ thứ hai (trả về lỗi 400 nếu cố tình xóa chính mình).

---

## 4. Decision Summary (Tóm tắt quyết định triển khai)

| Hạng mục | Quyết định đã thống nhất |
| :--- | :--- |
| **Phân quyền truy cập** | Chỉ `admin` được xem và thao tác. `employee` truy cập sẽ thấy `NotAuthorPage`. |
| **Trường dữ liệu tạo mới** | `username`, `password`, `fullName`, `email`, `phone`, `position`, `department`, `role`, `joinDate`. |
| **Chỉnh sửa nhân viên** | Khóa `username` (read-only); cho phép cập nhật thông tin cá nhân & nhập mật khẩu mới (tùy chọn). |
| **Xóa nhân viên** | Modal xác nhận nguy hiểm trước khi xóa; chặn xóa tài khoản chính mình cả ở UI lẫn xử lý lỗi từ API. |
| **Trải nghiệm bảng** | Bảng dữ liệu chuẩn Meta-style, có tìm kiếm đa trường, lọc theo phòng ban/vai trò, phân trang và nút Refresh. |
| **Quản lý Form & Modal** | Tái sử dụng `Modal.jsx`, kiểm tra tính hợp lệ dữ liệu chặt chẽ (validation), thông báo Toast qua `sonner`. |
