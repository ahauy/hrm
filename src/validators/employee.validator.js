import * as yup from "yup";

/**
 * Schema xác thực khi Tạo nhân viên mới
 */
export const createEmployeeSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được quá 50 ký tự")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới hoặc gạch ngang"
    ),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: yup
    .string()
    .trim()
    .required("Vui lòng nhập họ và tên")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được quá 100 ký tự"),
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập địa chỉ email")
    .email("Địa chỉ email không đúng định dạng"),
  phone: yup.string().trim().nullable(),
  position: yup.string().trim().nullable(),
  department: yup.string().trim().nullable(),
  baseSalary: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) {
        return 0;
      }
      return Number(originalValue);
    })
    .typeError("Lương cơ bản không hợp lệ")
    .min(0, "Lương cơ bản không được nhỏ hơn 0"),
  role: yup
    .string()
    .oneOf(["admin", "employee"], "Vai trò phải là admin hoặc employee")
    .required("Vai trò phải là admin hoặc employee"),
  joinDate: yup.string().nullable(),
});

/**
 * Schema xác thực khi Chỉnh sửa thông tin nhân viên
 * - Không cho phép chỉnh sửa username
 * - Mật khẩu là tùy chọn (chỉ kiểm tra độ dài khi người dùng nhập mật khẩu mới)
 */
export const updateEmployeeSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Vui lòng nhập họ và tên")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được quá 100 ký tự"),
  email: yup
    .string()
    .trim()
    .required("Vui lòng nhập địa chỉ email")
    .email("Địa chỉ email không đúng định dạng"),
  password: yup
    .string()
    .test(
      "min-length-if-present",
      "Mật khẩu mới phải có ít nhất 6 ký tự nếu bạn muốn thay đổi",
      (val) => !val || val.length >= 6
    ),
  phone: yup.string().trim().nullable(),
  position: yup.string().trim().nullable(),
  department: yup.string().trim().nullable(),
  baseSalary: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) {
        return 0;
      }
      return Number(originalValue);
    })
    .typeError("Lương cơ bản không hợp lệ")
    .min(0, "Lương cơ bản không được nhỏ hơn 0"),
  role: yup
    .string()
    .oneOf(["admin", "employee"], "Vai trò phải là admin hoặc employee")
    .required("Vai trò phải là admin hoặc employee"),
  joinDate: yup.string().nullable(),
});
