import { FormikProvider, useFormik } from "formik";
import {
  UserPlus,
  UserCheck,
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Building,
  Calendar,
  Shield,
  Save,
  Banknote,
} from "lucide-react";
import Modal from "@/components/modal/Modal";
import { InputField, RadioGroupField } from "@/components/form";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/validators/employee.validator";
import { employeeServices } from "../services/employeeServices";
import { queryClient, QUERY_KEYS } from "@/config/queryClient";
import { toast } from "sonner";

/**
 * Modal dùng chung để Thêm mới hoặc Chỉnh sửa thông tin nhân viên
 * @param {boolean} isOpen - Trạng thái mở modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {Function} onSuccess - Callback gọi lại khi lưu thành công
 * @param {Object|null} employee - Dữ liệu nhân viên cần sửa (nếu null thì là chế độ Thêm mới)
 */
export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSuccess,
  employee = null,
}) {
  const isEditMode = Boolean(employee);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: employee?.username || "",
      password: "",
      fullName: employee?.fullName || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      position: employee?.position || "",
      department: employee?.department || "",
      baseSalary: employee?.baseSalary ?? 0,
      role: employee?.role === "admin" ? "admin" : "employee",
      joinDate: employee?.joinDate
        ? employee.joinDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
    validationSchema: isEditMode ? updateEmployeeSchema : createEmployeeSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          // Chế độ chỉnh sửa: Không gửi username, chỉ gửi password nếu người dùng nhập
          const updatePayload = {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone?.trim() || "",
            position: values.position?.trim() || "",
            department: values.department?.trim() || "",
            baseSalary: Number(values.baseSalary) || 0,
            role: values.role,
            joinDate: values.joinDate || undefined,
          };

          if (values.password && values.password.trim() !== "") {
            updatePayload.password = values.password.trim();
          }

          await employeeServices.updateEmployee(employee.id, updatePayload);
          toast.success(`Cập nhật thông tin nhân viên "${values.fullName}" thành công!`);
        } else {
          // Chế độ tạo mới: Gửi đầy đủ thông tin chuẩn API
          const createPayload = {
            username: values.username.trim(),
            password: values.password.trim(),
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone?.trim() || "",
            position: values.position?.trim() || "",
            department: values.department?.trim() || "",
            baseSalary: Number(values.baseSalary) || 0,
            role: values.role,
            joinDate: values.joinDate || undefined,
          };

          await employeeServices.createEmployee(createPayload);
          toast.success(`Thêm nhân viên mới "${values.fullName}" thành công!`);
        }

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees });
        handleClose();
        onSuccess?.();
      } catch (error) {
        console.error("Lỗi khi lưu nhân viên:", error);
        const serverMsg =
          error.response?.data?.message ||
          (isEditMode
            ? "Không thể cập nhật thông tin nhân viên"
            : "Không thể thêm nhân viên mới");
        toast.error(serverMsg);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose?.();
  };

  const roleOptions = [
    {
      value: "employee",
      label: "Nhân viên thường",
      description: "Chỉ được chấm công, xin nghỉ và xem bảng lương cá nhân",
      icon: User,
      iconClassName: "text-steel",
    },
    {
      value: "admin",
      label: "Quản trị viên (Admin)",
      description: "Toàn quyền quản lý nhân viên, duyệt phép, tính lương và cài đặt",
      icon: Shield,
      iconClassName: "text-primary",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={
        isEditMode ? (
          <UserCheck className="w-5 h-5" />
        ) : (
          <UserPlus className="w-5 h-5" />
        )
      }
      title={isEditMode ? "Chỉnh sửa hồ sơ nhân viên" : "Thêm nhân viên mới"}
      description={
        isEditMode
          ? `Cập nhật thông tin chi tiết cho tài khoản @${employee?.username}`
          : "Tạo tài khoản và thiết lập hồ sơ nhân sự mới trong hệ thống"
      }
      size="lg"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={formik.isSubmitting}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? "Lưu thay đổi" : "Tạo nhân viên"}</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Hàng 1: Tên đăng nhập & Mật khẩu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              name="username"
              label="Tên đăng nhập"
              required
              disabled={isEditMode}
              icon={User}
              placeholder="VD: nguyenvanan"
              helperText={
                isEditMode
                  ? "Tên đăng nhập được cố định và không thể chỉnh sửa."
                  : undefined
              }
            />

            <InputField
              name="password"
              type="password"
              label={isEditMode ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu ban đầu"}
              required={!isEditMode}
              icon={Lock}
              showPasswordToggle
              placeholder={
                isEditMode
                  ? "Bỏ trống nếu giữ nguyên mật khẩu"
                  : "Tối thiểu 6 ký tự"
              }
            />
          </div>

          {/* Hàng 2: Họ và tên & Địa chỉ Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              name="fullName"
              label="Họ và tên"
              required
              icon={User}
              placeholder="VD: Nguyễn Văn An"
            />

            <InputField
              name="email"
              type="email"
              label="Địa chỉ Email"
              required
              icon={Mail}
              placeholder="VD: an.nguyen@company.com"
            />
          </div>

          {/* Hàng 3: Số điện thoại & Ngày vào làm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              name="phone"
              type="tel"
              label="Số điện thoại"
              icon={Phone}
              placeholder="VD: 0912345678"
            />

            <InputField
              name="joinDate"
              type="date"
              label="Ngày vào làm"
              icon={Calendar}
            />
          </div>

          {/* Hàng 4: Phòng ban & Chức vụ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField
                name="department"
                label="Phòng ban"
                icon={Building}
                list="department-suggestions"
                placeholder="VD: Kỹ thuật, Kinh doanh, Nhân sự..."
              />
              <datalist id="department-suggestions">
                <option value="Kỹ thuật" />
                <option value="Kinh doanh" />
                <option value="Nhân sự" />
                <option value="Marketing" />
                <option value="Kế toán" />
                <option value="Vận hành" />
              </datalist>
            </div>

            <InputField
              name="position"
              label="Chức vụ / Vị trí"
              icon={Briefcase}
              placeholder="VD: Kỹ sư phần mềm, Chuyên viên tuyển dụng..."
            />
          </div>

          {/* Hàng 5: Lương cơ bản */}
          <InputField
            name="baseSalary"
            type="number"
            step="500000"
            min="0"
            label="Lương cơ bản (VND / tháng)"
            icon={Banknote}
            placeholder="VD: 10000000"
            inputClassName="font-mono"
            helperText="Mức lương cơ sở dùng để tính lương theo ngày công trong kỳ chốt lương."
          />

          {/* Hàng 6: Vai trò hệ thống (Role) */}
          <RadioGroupField
            name="role"
            label="Vai trò hệ thống"
            required
            options={roleOptions}
          />
        </form>
      </FormikProvider>
    </Modal>
  );
}
