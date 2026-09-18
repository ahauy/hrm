import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  AlertCircle,
  Banknote,
} from "lucide-react";
import Modal from "./Modal.jsx";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../../validators/employee.validator.js";
import { employeeServices } from "../../services/employeeServices.js";
import { toast } from "sonner";
import { cn } from "../../utils/cn.js";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      isEditMode ? updateEmployeeSchema : createEmployeeSchema
    ),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      baseSalary: 0,
      role: "employee",
      joinDate: new Date().toISOString().split("T")[0],
    },
  });

  // Cập nhật giá trị form khi mở modal hoặc thay đổi đối tượng nhân viên
  useEffect(() => {
    if (isOpen) {
      if (employee) {
        reset({
          username: employee.username || "",
          password: "", // Luôn để trống trường mật khẩu khi chỉnh sửa
          fullName: employee.fullName || "",
          email: employee.email || "",
          phone: employee.phone || "",
          position: employee.position || "",
          department: employee.department || "",
          baseSalary: employee.baseSalary ?? 0,
          role: employee.role === "admin" ? "admin" : "employee",
          joinDate: employee.joinDate
            ? employee.joinDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        reset({
          username: "",
          password: "",
          fullName: "",
          email: "",
          phone: "",
          position: "",
          department: "",
          baseSalary: 0,
          role: "employee",
          joinDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, employee, reset]);

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        // Chế độ chỉnh sửa: Không gửi username, chỉ gửi password nếu người dùng nhập
        const updatePayload = {
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || "",
          position: data.position?.trim() || "",
          department: data.department?.trim() || "",
          baseSalary: Number(data.baseSalary) || 0,
          role: data.role,
          joinDate: data.joinDate || undefined,
        };

        if (data.password && data.password.trim() !== "") {
          updatePayload.password = data.password.trim();
        }

        await employeeServices.updateEmployee(employee.id, updatePayload);
        toast.success(`Cập nhật thông tin nhân viên "${data.fullName}" thành công!`);
      } else {
        // Chế độ tạo mới: Gửi đầy đủ thông tin chuẩn API
        const createPayload = {
          username: data.username.trim(),
          password: data.password.trim(),
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || "",
          position: data.position?.trim() || "",
          department: data.department?.trim() || "",
          baseSalary: Number(data.baseSalary) || 0,
          role: data.role,
          joinDate: data.joinDate || undefined,
        };

        await employeeServices.createEmployee(createPayload);
        toast.success(`Thêm nhân viên mới "${data.fullName}" thành công!`);
      }

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
  };

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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-hairline bg-canvas text-ink hover:bg-surface-soft transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hàng 1: Tên đăng nhập & Mật khẩu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tên đăng nhập */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Tên đăng nhập <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="username"
                type="text"
                disabled={isEditMode}
                {...register("username")}
                placeholder="VD: nguyenvanan"
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl border bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none transition-all",
                  isEditMode
                    ? "bg-surface-soft text-steel cursor-not-allowed border-hairline-soft"
                    : errors.username
                    ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
                    : "border-hairline-soft focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
            {isEditMode ? (
              <p className="text-[11px] text-stone mt-1">
                Tên đăng nhập được cố định và không thể chỉnh sửa.
              </p>
            ) : (
              errors.username && (
                <p className="flex items-center gap-1 text-[11px] text-critical mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.username.message}</span>
                </p>
              )
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              {isEditMode ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu ban đầu"}{" "}
              {!isEditMode && <span className="text-critical">*</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder={
                  isEditMode
                    ? "Bỏ trống nếu giữ nguyên mật khẩu"
                    : "Tối thiểu 6 ký tự"
                }
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl border bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none transition-all",
                  errors.password
                    ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
                    : "border-hairline-soft focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
            {errors.password && (
              <p className="flex items-center gap-1 text-[11px] text-critical mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Hàng 2: Họ và tên & Địa chỉ Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Họ và tên <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                placeholder="VD: Nguyễn Văn An"
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl border bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none transition-all",
                  errors.fullName
                    ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
                    : "border-hairline-soft focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
            {errors.fullName && (
              <p className="flex items-center gap-1 text-[11px] text-critical mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName.message}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Địa chỉ Email <span className="text-critical">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="VD: an.nguyen@company.com"
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl border bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none transition-all",
                  errors.email
                    ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
                    : "border-hairline-soft focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1 text-[11px] text-critical mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Hàng 3: Số điện thoại & Ngày vào làm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Số điện thoại */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="VD: 0912345678"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Ngày vào làm */}
          <div>
            <label
              htmlFor="joinDate"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Ngày vào làm
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="joinDate"
                type="date"
                {...register("joinDate")}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Hàng 4: Phòng ban & Chức vụ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phòng ban */}
          <div>
            <label
              htmlFor="department"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Phòng ban
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="department"
                type="text"
                list="department-suggestions"
                {...register("department")}
                placeholder="VD: Kỹ thuật, Kinh doanh, Nhân sự..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
          </div>

          {/* Chức vụ */}
          <div>
            <label
              htmlFor="position"
              className="block text-xs font-semibold text-ink-deep mb-1.5"
            >
              Chức vụ / Vị trí
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="position"
                type="text"
                {...register("position")}
                placeholder="VD: Kỹ sư phần mềm, Chuyên viên tuyển dụng..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Hàng 5: Lương cơ bản */}
        <div>
          <label
            htmlFor="baseSalary"
            className="block text-xs font-semibold text-ink-deep mb-1.5"
          >
            Lương cơ bản (VND / tháng)
          </label>
          <div className="relative">
            <Banknote className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="baseSalary"
              type="number"
              step="500000"
              min="0"
              {...register("baseSalary")}
              placeholder="VD: 10000000"
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-xl border border-hairline-soft bg-canvas text-xs font-mono text-ink placeholder:text-stone focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                errors.baseSalary && "border-critical focus:border-critical focus:ring-critical/20"
              )}
            />
          </div>
          {errors.baseSalary ? (
            <p className="flex items-center gap-1 text-[11px] text-critical mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.baseSalary.message}</span>
            </p>
          ) : (
            <p className="text-[11px] text-stone mt-1">
              Mức lương cơ sở dùng để tính lương theo ngày công trong kỳ chốt lương.
            </p>
          )}
        </div>

        {/* Hàng 6: Vai trò hệ thống (Role) */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-ink-deep mb-2">
            Vai trò hệ thống <span className="text-critical">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                "hover:border-primary/50 hover:bg-surface-soft/50"
              )}
            >
              <input
                type="radio"
                value="employee"
                {...register("role")}
                className="mt-0.5 text-primary focus:ring-primary/20"
              />
              <div>
                <p className="text-xs font-semibold text-ink-deep flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-steel" />
                  <span>Nhân viên thường</span>
                </p>
                <p className="text-[11px] text-stone mt-0.5">
                  Chỉ được chấm công, xin nghỉ và xem bảng lương cá nhân
                </p>
              </div>
            </label>

            <label
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                "hover:border-primary/50 hover:bg-surface-soft/50"
              )}
            >
              <input
                type="radio"
                value="admin"
                {...register("role")}
                className="mt-0.5 text-primary focus:ring-primary/20"
              />
              <div>
                <p className="text-xs font-semibold text-ink-deep flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Quản trị viên (Admin)</span>
                </p>
                <p className="text-[11px] text-stone mt-0.5">
                  Toàn quyền quản lý nhân viên, duyệt phép, tính lương và cài đặt
                </p>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="flex items-center gap-1 text-[11px] text-critical mt-1.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.role.message}</span>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
