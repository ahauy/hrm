# UI Review Report: HRM Dashboard & Layout Redesign

**Surface(s) reviewed**: Product UI (In-app Dashboard, Attendance, Table, Main Layout, Sidebar, Header)  
**Rubric(s) applied**: `design-taste-product §10/§11` & `design-taste-frontend §9`  
**Screenshot pass**: Skipped — Playwright Chromium distribution 'chrome' not found at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`  
**Initial Result**: FAIL  
**Post-Remediation Result**: **PASS** (Đã xử lý triệt để toàn bộ 6/6 AI Tells theo chuẩn `ui-taste-pro` & `design-taste-product`)

---

### Bảng tổng hợp & Kết quả khắc phục (Remediation Status)

| Khu vực | Chi tiết phát hiện (Finding) | Mức độ | Trạng thái xử lý | Giải pháp thực tế đã triển khai |
| :--- | :--- | :--- | :--- | :--- |
| **Attendance Card** | **Cards inside Cards (Thẻ lồng trong thẻ):** Hai thẻ "Giờ vào ca" và "Giờ tan ca" lồng bên trong thẻ lớn. | **HIGH** | **RESOLVED** | Làm phẳng hoàn toàn (`flatten`): Bỏ toàn bộ viền và đổ bóng lồng nhau; chuyển thành cụm dữ liệu trực quan với font số `tabular-nums` và vạch phân cách hairline tinh tế. Bổ sung `active:scale-[0.98]` tactile feedback cho các nút hành động. |
| **KPI Metrics Grid** | **Card Soup & Rập khuôn 4 cột:** 4 hộp thẻ vuông chia đều tăm tắp với icon pastel rập khuôn. | **HIGH** | **RESOLVED** | Chuyển sang bố cục bất đối xứng có nhịp điệu (Asymmetric layout): Thẻ chỉ số trọng tâm chiếm 4/12 cột bên trái; Dải tóm lược trạng thái (Interactive Workflow Strip) chiếm 8/12 cột bên phải với dot tròn nhỏ, cho phép bấm trực tiếp để lọc bảng dữ liệu. |
| **Main Layout Footer** | **Marketing Footer trong ứng dụng nội bộ:** Footer kiểu tin tức ở đáy màn hình làm mất diện tích cuộn. | **MEDIUM** | **RESOLVED** | Gỡ bỏ hoàn toàn `Footer` ở đáy layout nội bộ. Đưa thông tin phiên bản `v1.0.0` và trạng thái hệ thống khiêm tốn về chân `Sidebar`. |
| **Bảng dữ liệu (Data Table)** | **Thiếu bộ lọc tương tác (Filter/Tabs):** Bảng dữ liệu không có lọc trạng thái hay tìm kiếm. | **MEDIUM** | **RESOLVED** | Thêm thanh Filter Tabs (`Tất cả` / `Chờ duyệt` / `Đã duyệt` / `Từ chối`) kèm số lượng động và ô tìm kiếm nhanh (theo tên, lý do, ID) trên đầu bảng. |
| **Trạng thái Trống (Empty State)** | **Empty state thụ động (Passive Empty):** Bảng trống không có nút dẫn tiếp (Next action). | **HIGH** | **RESOLVED** | Bổ sung **Actionable Empty State**: Khi nhân viên chưa có đơn, hiển thị nút bấm nổi bật `[+ Tạo đơn xin nghỉ phép]`; khi đang lọc không có kết quả, hiển thị nút `[Xóa bộ lọc]`. |
| **Sidebar Navigation** | **Danh sách phẳng không phân nhóm (Ungrouped Rail):** Menu phẳng lì, nhãn trùng lặp. | **MEDIUM** | **RESOLVED** | Phân nhóm rõ ràng theo 4 danh mục: **Tổng quan**, **Quản trị nhân sự**, **Tài chính**, **Hệ thống**; chuẩn hóa nhãn chính xác theo router thực tế. |
| **Header Elements** | **Decorative Non-functional Tells:** Ô tìm kiếm giả lập, thiếu phím tắt. | **LOW** | **RESOLVED** | Bổ sung phím tắt `⌘K` tinh tế trên ô tìm kiếm nhanh. |

---

# UI Review Report: HRM Attendance Feature (`/attendance`)

**Surface(s) reviewed**: Product UI (Employee Attendance Tracker, Monthly Calendar Grid, Admin Company Attendance Table, Employee Calendar Modal)  
**Rubric(s) applied**: `design-taste-product §10/§11` & `design-taste-frontend §9`  
**Screenshot pass**: Skipped — Playwright Chromium distribution 'chrome' not found at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`  
**Initial Result**: FAIL  
**Post-Remediation Result**: **PASS** (Đã khắc phục triệt để toàn bộ 6/6 AI Tells theo chuẩn `design-taste-product` & `design-taste-frontend`)

### Bảng tổng hợp phát hiện & Kết quả khắc phục (Remediation Status)

| Khu vực | Chi tiết phát hiện (Finding) | Mức độ | Trạng thái | Giải pháp thực tế đã triển khai |
| :--- | :--- | :---: | :---: | :--- |
| **AttendancePage Header** | **Marketing/Policy Banner Leak (`design-taste-product §10`):** Banner chữ tĩnh choán 200px chiều cao màn hình mỗi ngày. | **HIGH** | **RESOLVED** | Gỡ bỏ toàn bộ banner tĩnh. Đưa quy chế ca làm vào phụ đề tinh tế kèm nút `[Xem quy chế tính công & ân hạn ⓘ]` mở Modal tra cứu theo nhu cầu. |
| **Admin KPI Grid** | **Card Soup 4 cột rập khuôn (`design-taste-frontend §9.D`):** 4 hộp thẻ metric rập khuôn chia đều 4 cột. | **HIGH** | **RESOLVED** | Chuyển sang bố cục **Bất đối xứng (Asymmetric Hub & Interactive Strip)**: Thẻ hiệu suất công ty (5/12 cột) + Dải thẻ ngoại lệ tương tác (7/12 cột) cho phép bấm trực tiếp vào "Lượt đi muộn", "Quên Check-out", "Đạt chuẩn" để lọc bảng. |
| **Calendar Day Cells** | **Visual Clutter & Repetitive Icons (`design-taste-frontend §9.C`):** 60+ icon LogIn/LogOut lặp lại gây rối mắt. | **MEDIUM** | **RESOLVED** | Loại bỏ hoàn toàn icon lặp lại; chuẩn hóa hiển thị thời gian tinh gọn `08:25 → 18:02` (`font-mono tabular-nums`) kết hợp **vạch màu chỉ báo bên trái (Accent Border)** và **Status Dot** tinh tế. |
| **Admin Data Table** | **Fake Data Table Tells (`design-taste-product §10`):** Bảng quản lý thiếu tính năng Sorting và đếm hàng. | **MEDIUM** | **RESOLVED** | Bổ sung tương tác sắp xếp đa chiều (Sort theo Nhân viên, Phòng ban, Đúng giờ, Đi muộn, Thiếu out, Tổng công) kèm icon mũi tên và dòng thống kê `Hiển thị X / Y nhân sự`. |
| **Day Detail Modal** | **Cards inside Cards (`design-taste-product §10`):** Modal chi tiết ngày chứa thẻ lồng nhau. | **LOW** | **RESOLVED** | Làm phẳng (`flatten`): Bỏ viền lồng nhau, chuyển sang cụm thông tin 2 cột phẳng có vạch ngăn hairline tinh tế. |
| **Status Animation** | **Animate-Pulse Distraction (`design-taste-frontend §9.F`):** Trạng thái đang làm chớp nháy liên tục. | **LOW** | **RESOLVED** | Gỡ bỏ `animate-pulse`, chuyển sang trạng thái tĩnh với dot tròn cố định và badge màu vững chãi. |


