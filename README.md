# 🏢 Project HRM - Human Resource Management System

Hệ thống Quản lý Nhân sự (HRM) được xây dựng trên nền tảng **React 19**, **Vite**, **Tailwind CSS v4** và **React Router DOM v7**.

---

## 📌 Mục lục
- [1. Yêu cầu môi trường](#1-yêu-cầu-môi-trường)
- [2. Hướng dẫn cài đặt và khởi chạy](#2-hướng-dẫn-cài-đặt-và-khởi-chạy)
- [3. Cấu trúc thư mục & Ý nghĩa chi tiết](#3-cấu-trúc-thư-mục--ý-nghĩa-chi-tiết)
- [4. Các lệnh có sẵn (Scripts)](#4-các-lệnh-có-sẵn-scripts)
- [5. Quy ước làm việc nhóm (Team Collaboration)](#5-quy-ước-làm-việc-nhóm-team-collaboration)

---

## 1. Yêu cầu môi trường

Trước khi bắt đầu, đảm bảo máy của bạn đã cài đặt:
- **Node.js**: phiên bản `>= 18.x` (khuyên dùng Node `20.x LTS` hoặc mới hơn)
- **Trình quản lý gói**: `npm` (đi kèm Node) hoặc `yarn`, `pnpm`
- **Git**: để quản lý mã nguồn

Kiểm tra phiên bản trong terminal:
```bash
node -v
npm -v
```

---

## 2. Hướng dẫn cài đặt và khởi chạy

Thực hiện các bước sau để thiết lập dự án trên máy cá nhân:

### Bước 1: Clone dự án về máy
```bash
git clone <URL_REPOSITORY_GITHUB_CUA_BAN>
cd project-hrm
```

### Bước 2: Cài đặt các thư viện phụ thuộc (dependencies)
```bash
npm install
```

### Bước 3: Khởi chạy môi trường phát triển (Development)
```bash
npm run dev
```
> 🚀 Dự án sẽ chạy tại địa chỉ: **`http://localhost:5174/`** (đã được cấu hình cổng cố định trong `vite.config.js`).

### Bước 4: Kiểm tra lỗi cú pháp và code style (Linting)
```bash
npm run lint
```

### Bước 5: Đóng gói dự án (Production Build)
```bash
npm run build
npm run preview   # Xem trước bản build production tại local
```

---

## 3. Cấu trúc thư mục & Ý nghĩa chi tiết

Dự án áp dụng mô hình phân tách theo tầng (**Layer-based Architecture**) giúp code rõ ràng, dễ bảo trì và tránh xung đột khi nhiều người cùng tham gia phát triển:

```text
project-hrm/
├── public/                  # Tài nguyên tĩnh công khai (không qua Vite build)
│   ├── favicon.svg          # Favicon website
│   └── icons.svg            # File biểu tượng SVG dùng chung
├── src/                     # Toàn bộ mã nguồn chính của ứng dụng
│   ├── assets/              # Tài nguyên tĩnh xử lý qua bundler (ảnh, icon nội bộ, fonts)
│   ├── components/          # UI Components tái sử dụng (Button, Input, Modal, Table...)
│   ├── hooks/               # Custom React Hooks chứa logic tái sử dụng (useAuth, useDebounce...)
│   ├── layouts/             # Khung giao diện dùng chung (MainLayout, AuthLayout, Sidebar, Header...)
│   ├── pages/               # Màn hình/Trang theo từng route (Dashboard, Employees, Payroll...)
│   ├── services/            # Tầng gọi API (Cấu hình Axios/Fetch, endpoints theo từng module)
│   ├── stores/              # Quản lý state toàn cục (Zustand / Redux / Context API)
│   ├── utils/               # Hàm tiện ích thuần túy (format ngày tháng, tiền tệ, helpers...)
│   ├── validators/          # Schema / Hàm kiểm tra tính hợp lệ của dữ liệu form (Zod/Yup)
│   ├── App.jsx              # Component gốc, cấu hình định tuyến (Routes) và Providers
│   ├── index.css            # Stylesheets toàn cục & cấu hình Tailwind CSS
│   └── main.jsx             # Điểm khởi chạy (Entry point) gắn kết React vào DOM
├── .gitignore               # Danh sách file/thư mục Git bỏ qua (node_modules, dist, ...)
├── eslint.config.js         # Cấu hình ESLint chuẩn hóa mã nguồn
├── index.html               # File HTML chính của ứng dụng SPA
├── package.json             # Danh sách dependencies và các script dự án
├── vite.config.js           # Cấu hình Vite bundler & Tailwind CSS
└── README.md                # Tài liệu hướng dẫn dự án
```

### Chi tiết vai trò của từng thư mục trong `src/`:

| Thư mục | Mục đích & Quy ước sử dụng | Ví dụ |
| :--- | :--- | :--- |
| **`assets/`** | Chứa hình ảnh, logo, vector, fonts được import trực tiếp vào các file component. Vite sẽ tối ưu và băm mã (hash) khi build. | `logo.png`, `empty-state.svg` |
| **`components/`** | Chứa các thành phần giao diện nhỏ, tái sử dụng được ở nhiều nơi. Không chứa logic riêng biệt của một nghiệp vụ cụ thể. | `Button.jsx`, `Input.jsx`, `Modal.jsx`, `DataTable.jsx` |
| **`hooks/`** | Custom hooks tách riêng logic React (state, effect, context) để tái sử dụng giữa các component. | `useAuth.js`, `useDebounce.js`, `usePagination.js` |
| **`layouts/`** | Khung hiển thị tổng thể bao bọc các trang con, định vị phần đầu trang (Header), menu thanh bên (Sidebar), chân trang (Footer). | `MainLayout.jsx`, `AuthLayout.jsx`, `Sidebar.jsx` |
| **`pages/`** | Các màn hình tương ứng với đường dẫn URL (Route). Mỗi trang tập hợp các components và layouts lại để tạo thành giao diện hoàn chỉnh. | `DashboardPage.jsx`, `EmployeeListPage.jsx`, `LoginPage.jsx` |
| **`services/`** | Nơi xử lý toàn bộ việc gọi API ra bên ngoài (API client, cấu hình baseURL, header token, interceptors). | `apiClient.js`, `authService.js`, `employeeService.js` |
| **`stores/`** | Quản lý trạng thái chia sẻ trên toàn ứng dụng (thông tin tài khoản đăng nhập, trạng thái sidebar, theme, notifications). | `authStore.js`, `appStore.js` |
| **`utils/`** | Các hàm xử lý dữ liệu thuần JavaScript (Pure Functions), không liên quan đến React hook hay UI. | `formatDate.js`, `formatCurrency.js`, `storage.js` |
| **`validators/`** | Định nghĩa luật kiểm tra tính hợp lệ dữ liệu (Form validation), hỗ trợ validate trước khi gửi lên server. | `employeeValidator.js`, `authValidator.js` |

> 💡 **Lưu ý**: Các thư mục rỗng ban đầu đã được gắn sẵn file `.gitkeep` để Git có thể theo dõi và đẩy lên GitHub. Khi bạn thêm file thực tế vào thư mục, có thể xóa file `.gitkeep` đó đi.

---

## 4. Các lệnh có sẵn (Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy máy chủ phát triển cục bộ với tính năng Hot Module Replacement (HMR). |
| `npm run build` | Biên dịch và tối ưu mã nguồn sang thư mục `dist/` để sẵn sàng triển khai thực tế. |
| `npm run preview` | Khởi chạy máy chủ thử nghiệm cục bộ để kiểm tra gói đã build trong `dist/`. |
| `npm run lint` | Chạy công cụ kiểm tra lỗi cú pháp và quy chuẩn code theo ESLint. |

---

## 5. Quy ước làm việc nhóm (Team Collaboration)

Để phối hợp nhịp nhàng và tránh xung đột code (merge conflicts), toàn đội cần tuân thủ các quy chuẩn sau:

### 5.1. Quy tắc đặt tên (Naming Conventions)
- **Component, Page, Layout**: Đặt theo định dạng `PascalCase` (ví dụ: `Button.jsx`, `EmployeeList.jsx`, `MainLayout.jsx`).
- **Hooks**: Bắt đầu bằng chữ `use` viết thường, theo định dạng `camelCase` (ví dụ: `useAuth.js`, `useDebounce.js`).
- **Services, Stores, Utils, Validators**: Đặt theo định dạng `camelCase` (ví dụ: `authService.js`, `formatDate.js`, `authValidator.js`).
- **CSS / Styling**: Ưu tiên sử dụng utility classes của **Tailwind CSS**.

### 5.2. Quy trình làm việc với Git & GitHub
1. **Nhánh chính**:
   - `main`: Nhánh ổn định, sẵn sàng deploy production. Không commit trực tiếp lên `main`.
   - `develop` *(nếu có)*: Nhánh tích hợp code các tính năng chuẩn bị release.
2. **Quy tắc tạo nhánh tính năng**:
   ```bash
   # Tạo nhánh mới từ develop hoặc main
   git checkout -b feature/<ten-tinh-nang>
   # Ví dụ:
   git checkout -b feature/employee-list
   git checkout -b fix/login-auth-token
   ```
3. **Quy tắc viết Commit Message** (chuẩn Conventional Commits):
   - `feat: <mô tả>`: Thêm tính năng mới (ví dụ: `feat: add employee filter by department`)
   - `fix: <mô tả>`: Sửa lỗi (ví dụ: `fix: resolve token expiry issue on refresh`)
   - `docs: <mô tả>`: Thay đổi tài liệu, README
   - `style: <mô tả>`: Chỉnh sửa CSS, định dạng code không ảnh hưởng logic
   - `refactor: <mô tả>`: Tái cấu trúc mã nguồn
4. **Quy trình Pull Request (PR)**:
   - Đẩy nhánh cá nhân lên GitHub: `git push origin feature/<ten-tinh-nang>`.
   - Tạo Pull Request hướng vào nhánh chính.
   - Ít nhất **1 thành viên khác review** và chấp thuận trước khi merge.

