import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validators/auth.validator";
import { useAuth } from "../hooks/useAuth.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, EyeOff, Loader, Eye, Lock } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch {
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate ml-0.5 block">
                Tài khoản
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-stone group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register("username")}
                  type="text"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-surface-soft border ${
                    errors.username ? "border-critical" : "border-hairline"
                  } rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all placeholder:text-stone`}
                  placeholder="Tên đăng nhập"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-critical mt-1 ml-0.5">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate ml-0.5 block">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary-deep transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-stone group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-10 pr-11 py-2.5 bg-surface-soft border ${
                    errors.password ? "border-critical" : "border-hairline"
                  } rounded-xl text-ink text-xs focus:bg-canvas focus:border-primary outline-none transition-all placeholder:text-stone`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone hover:text-ink cursor-pointer"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-critical mt-1 ml-0.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-0.5">
              <input
                {...register("rememberMe")}
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-hairline text-primary focus:ring-primary accent-[#0064e0] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-steel cursor-pointer hover:text-ink transition-colors select-none"
              >
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

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
