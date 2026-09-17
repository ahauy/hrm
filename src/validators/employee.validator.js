import { z } from "zod";

/**
 * Schema xác thực khi Tạo nhân viên mới
 */
export const createEmployeeSchema = z.object({
  username: z
    .string({ required_error: "Vui lòng nhập tên đăng nhập" })
    .trim()
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
    .max(50, { message: "Tên đăng nhập không được quá 50 ký tự" })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới hoặc gạch ngang",
    }),
  password: z
    .string({ required_error: "Vui lòng nhập mật khẩu" })
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  fullName: z
    .string({ required_error: "Vui lòng nhập họ và tên" })
    .trim()
    .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" })
    .max(100, { message: "Họ và tên không được quá 100 ký tự" }),
  email: z
    .string({ required_error: "Vui lòng nhập địa chỉ email" })
    .trim()
    .email({ message: "Địa chỉ email không đúng định dạng" }),
  phone: z.string().trim().optional().or(z.literal("")),
  position: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["admin", "employee"], {
    errorMap: () => ({ message: "Vai trò phải là admin hoặc employee" }),
  }),
  joinDate: z.string().optional().or(z.literal("")),
});

/**
 * Schema xác thực khi Chỉnh sửa thông tin nhân viên
 * - Không cho phép chỉnh sửa username
 * - Mật khẩu là tùy chọn (chỉ kiểm tra độ dài khi người dùng nhập mật khẩu mới)
 */
export const updateEmployeeSchema = z.object({
  fullName: z
    .string({ required_error: "Vui lòng nhập họ và tên" })
    .trim()
    .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" })
    .max(100, { message: "Họ và tên không được quá 100 ký tự" }),
  email: z
    .string({ required_error: "Vui lòng nhập địa chỉ email" })
    .trim()
    .email({ message: "Địa chỉ email không đúng định dạng" }),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Mật khẩu mới phải có ít nhất 6 ký tự nếu bạn muốn thay đổi",
    }),
  phone: z.string().trim().optional().or(z.literal("")),
  position: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["admin", "employee"], {
    errorMap: () => ({ message: "Vai trò phải là admin hoặc employee" }),
  }),
  joinDate: z.string().optional().or(z.literal("")),
});
