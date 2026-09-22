import { FormikProvider, useFormik } from "formik";
import { InputField, CheckboxField } from "@/components/form";
import { loginSchema } from "@/validators/auth.validator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, Loader, Lock } from "lucide-react";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await login(values);
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } catch {
        toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen bg-canvas font-sans">
      {/* Cột trái: Thương hiệu & Không gian làm việc hiện đại */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-ink-deep">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
          alt="Modern Workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-35 hover:scale-105 transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/60 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
              H
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              HRM Platform
            </span>
          </div>
          <p className="text-stone font-normal text-sm leading-relaxed max-w-sm">
            Nền tảng quản trị nhân sự & theo dõi chấm công toàn diện, chuẩn xác và hiện đại.
          </p>
        </div>
      </div>

      {/* Cột phải: Biểu mẫu Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-canvas">
        <div className="w-full max-w-md space-y-7">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-ink-deep mb-1 text-center lg:text-left">
              Đăng nhập hệ thống
            </h2>
            <p className="text-xs text-steel text-center lg:text-left">
              Chào mừng bạn trở lại. Vui lòng nhập thông tin để truy cập.
            </p>
          </div>

          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="space-y-5 mt-6">
              <InputField
                name="username"
                label="Tài khoản"
                placeholder="Tên đăng nhập"
                icon={User}
              />

              <InputField
                name="password"
                type="password"
                label="Mật khẩu"
                placeholder="••••••••"
                icon={Lock}
                showPasswordToggle
                rightElement={
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary-deep transition-colors cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                }
              />

              <CheckboxField
                name="rememberMe"
                label="Ghi nhớ đăng nhập trên thiết bị này"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-deep active:bg-primary-deep text-white py-3 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>
          </FormikProvider>

          <div className="pt-6 text-center border-t border-hairline-soft">
            <p className="text-xs text-stone">
              &copy; {new Date().getFullYear()} HRM Platform. Bảo mật & quyền riêng tư.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
