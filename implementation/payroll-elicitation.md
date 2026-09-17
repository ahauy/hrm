# Elicitation & Grilling Summary: Bảng lương & Quản trị Lương (Payroll Management)

- **Feature**: Trang Bảng lương & Công (`/payroll`)
- **Tài liệu API tham chiếu**: [Swagger API Documentation](https://lesson-starter-1.onrender.com/api-docs/swagger.json#/)
- **Ngày thực hiện**: 16/09/2026
- **Trạng thái**: Đã hoàn thành phỏng vấn — Chờ người dùng xác nhận chốt (Ready for Sign-off)

---

## 1. Request Framing (Định vị yêu cầu)
Xây dựng trang Quản lý & Tra cứu Bảng lương (`/payroll`) tích hợp toàn diện theo đặc tả Swagger API (`/api/settings`, `/api/payroll/summary`, `/api/payroll`, `/api/payroll/generate`, `/api/payroll/{id}`), cho phép Quản trị viên (Admin) tùy chỉnh ngày công chuẩn của công ty, tự động đối soát ngày công thực tế từ hệ thống chấm công, chốt lương từng nhân viên hoặc chốt hàng loạt theo công thức chuẩn (`lương cơ bản ÷ ngày công chuẩn × ngày công thực tế + thưởng/phạt`), sửa nhanh khoản điều chỉnh của bảng lương đã chốt (`PATCH /api/payroll/{id}`) mà không đổi công, chốt lại từ đầu khi dữ liệu chấm công thay đổi (`POST /api/payroll/generate`), đồng thời bảo vệ phân quyền để Nhân viên thường (`employee`) chỉ tra cứu được phiếu lương cá nhân của chính mình.

---

## 2. Decision Tree & Interview Transcript (Biên bản phỏng vấn)

### Trụ cột 1: Thao tác chốt lương & Quản lý hàng loạt (Workflows & RBAC)
- **Q1**: Khi Quản trị viên chốt lương cho một tháng, bạn muốn quy trình thao tác diễn ra như thế nào?
  - **Quyết định**: Hỗ trợ cả hai: Chốt từng nhân viên (mở modal nhập thưởng/phạt, ghi chú) VÀ nút **"Chốt tất cả"** (tự động chốt hàng loạt các nhân viên chưa chốt với thưởng/phạt = 0).
- **Q2**: Về Lương cơ bản trong công thức tính lương, bạn muốn quản lý trên giao diện như thế nào?
  - **Quyết định**: Lương cơ bản lấy tự động từ hệ thống (API summary / hồ sơ nhân viên), hiển thị chỉ đọc (read-only), Quản lý chỉ điều chỉnh Thưởng/Phạt và Ghi chú.
- **Q3**: Đối với tài khoản Nhân viên (`role: employee`), giao diện trang Lương nên được trình bày theo dạng nào?
  - **Quyết định**: Hiển thị **Phiếu lương chi tiết (Payslip Card)** trực quan cho tháng chọn (gồm lương cơ bản, công chuẩn, công thực tế, thưởng phạt, thực lĩnh, ghi chú), kèm bảng lịch sử thu nhập các tháng trước để đối soát.

### Trụ cột 2: Quy tắc chuyển đổi trạng thái & Tính toán lại (States & Edge Cases)
- **Q4**: Khi Quản trị viên bấm **"Chốt lại"** (tính lại toàn bộ từ đầu do chấm công thay đổi), bạn muốn luồng xử lý như thế nào?
  - **Quyết định**: Hiển thị Modal xác nhận cảnh báo nguy cơ ghi đè công chấm công, cho phép xem lại hoặc giữ nguyên/sửa lại khoản Thưởng/Phạt trước khi chốt lại (gọi `POST /api/payroll/generate`).
- **Q5**: Khi Quản trị viên chỉnh sửa **"Ngày công chuẩn"** trực tiếp trên trang Lương, bảng tính nên phản hồi ra sao?
  - **Quyết định**: Gọi `PUT /api/settings` cập nhật lên server, đồng thời tính toán cập nhật ngay lập tức cột **"Lương dự kiến"** trên toàn bảng lương tháng đang xem mà không cần reload trang.
- **Q6**: Khi Quản trị viên bấm **"Sửa lương đã chốt"**, bạn muốn thao tác diễn ra qua hình thức nào?
  - **Quyết định**: Mở modal sửa nhanh chỉ chứa ô Thưởng/Phạt và Ghi chú, khóa cố định số ngày công đã chốt lúc trước (gọi `PATCH /api/payroll/{id}`), tự động tính lại số tiền thực lĩnh ngay trên modal và bảng.

---

## 3. Labeled Assumptions (Các giả định kỹ thuật)
- **`ASM-PAY-01`**: Endpoint `GET /api/payroll/summary?month=YYYY-MM` trả về danh sách tổng hợp tất cả nhân viên trong tháng gồm: mã nhân viên (`employeeId`), họ tên, số ngày công thực tế (`actualWorkDays`), lương cơ bản (`baseSalary`), lương dự kiến (`expectedSalary`) hoặc trạng thái đã chốt kèm thông tin bảng lương đã chốt.
- **`ASM-PAY-02`**: Khi gọi `POST /api/payroll/generate` với payload `{ employeeId, month, adjustment, note }`, backend tự động lấy số công thực tế tại thời điểm gọi, tính ra `finalSalary` và lưu vào bảng `payroll`.
- **`ASM-PAY-03`**: Khi gọi `PATCH /api/payroll/{id}` với payload `{ adjustment, note }`, backend chỉ cập nhật khoản thưởng/phạt và ghi chú, giữ nguyên `actualWorkDays` và `standardWorkDays` đã lưu tại thời điểm chốt.
- **`ASM-PAY-04`**: Endpoint `GET /api/payroll` khi gọi bởi nhân viên thường chỉ trả về các bản ghi lương của chính nhân viên đó (bảo vệ quyền riêng tư qua Bearer token).
- **`ASM-PAY-05`**: Định dạng tiền tệ hiển thị theo chuẩn Việt Nam Đồng (VND, định dạng `vi-VN` với hậu tố `₫`).

---

## 4. Decision Summary (Bảng tóm tắt quyết định triển khai)

| Hạng mục | Quyết định đã thống nhất | Endpoint API tương ứng |
| :--- | :--- | :--- |
| **Phân quyền truy cập** | Admin: Quản trị bảng lương toàn công ty, chốt/sửa/chốt lại.<br>Employee: Chỉ xem phiếu lương và lịch sử lương của chính mình. | Phân nhánh theo `role` từ `useAuthStore` |
| **Cấu hình Ngày công chuẩn** | Cho phép Admin sửa trực tiếp qua ô nhập nhanh (quick edit) trên trang Lương; cập nhật tức thì lương dự kiến. | `GET /api/settings`<br>`PUT /api/settings` |
| **Theo dõi ngày công thực tế** | Hệ thống tự đếm công từ chấm công, hiển thị trực quan so sánh với công chuẩn (badge Đủ công xanh / Thiếu công vàng). | `GET /api/payroll/summary?month=YYYY-MM` |
| **Chốt lương tháng** | Hỗ trợ chốt từng nhân viên (modal thưởng/phạt) & nút "Chốt tất cả" nhân viên chưa chốt. | `POST /api/payroll/generate` |
| **Sửa lương đã chốt** | Sửa khoản Thưởng/Phạt và Ghi chú qua modal; khóa cứng ngày công đã ghi nhận lúc chốt. | `PATCH /api/payroll/{id}` |
| **Chốt lại (Recalculate)** | Modal cảnh báo xác nhận ghi đè số công mới nhất từ dữ liệu chấm công cập nhật. | `POST /api/payroll/generate` (ghi đè) |
| **Giao diện Nhân viên** | Thẻ Phiếu lương chi tiết (Payslip Breakdown) trực quan tháng hiện tại + Bảng lịch sử các tháng đã chốt. | `GET /api/payroll` |
| **Thiết kế UI / Theme** | Tuân thủ Meta Design System (cobalt blue `#0064e0`, pill badge, card padding, số liệu chuẩn xác, thông báo Sonner). | Thiết kế nhất quán `DESIGN.md` |
