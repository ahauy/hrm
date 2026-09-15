import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validators/auth.validator";
// import { authServices } from "../services/authServices.js"
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, EyeOff, Loader, Eye, Lock } from "lucide-react";

const LoginPage = () => {
  // khai bao cac state
  const [showPassword, setShowPassword] = useState(false); // hiener thi password
  const [isLoading, setIsLoading] = useState(false); // chan an dang nhap nhieu lan

  // khai bao react-hook-form
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

  // lay cac state trong zudtand store
  // const setToken = useAuthStore((state) => state.setToken)
  // const setProfile = useAuthStore((state) => state.setProfile)
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success("Đăng nhập thành công!");

      // const resProfile = await authServices.getProfile()
      // setProfile(resProfile)

      navigate("/dashboard");
    } catch (error) {
      console.log("Error in LoginPage.onSubmit:", error);
      toast.error("Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Side: Imagery (Quiet Luxury) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-neutral-900">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 hover:scale-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/80 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white">
          <h1 className="text-4xl font-serif tracking-tight mb-2">
            HRM
          </h1>
          {/* <p className="text-neutral-300 font-light tracking-widest uppercase text-sm">
            Curated Excellence for Modern Living
          </p> */}
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-neutral-900 mb-2 text-center">
              HRM Admin Portal
            </h2>
            <p className="text-neutral-500 font-light text-center">
              Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-neutral-500 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                </div>
                <input
                  {...register("username")}
                  type="text"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-neutral-50 border ${
                    errors.username ? "border-red-300" : "border-neutral-200"
                  } text-neutral-900 text-sm focus:ring-0 focus:border-neutral-900 transition-all duration-300 outline-none`}
                  placeholder="admin@tenclothes.com"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-neutral-500 ml-1">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-11 pr-12 py-3.5 bg-neutral-50 border ${
                    errors.password ? "border-red-300" : "border-neutral-200"
                  } text-neutral-900 text-sm focus:ring-0 focus:border-neutral-900 transition-all duration-300 outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-900"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-1">
              <input
                {...register("rememberMe")}
                id="remember"
                type="checkbox"
                className="w-4 h-4 border-neutral-300 text-neutral-900 focus:ring-0 rounded-none cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-900 transition-colors"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white py-4 text-sm font-medium uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
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

          <div className="pt-12 text-center">
            <p className="text-xs text-neutral-400">
              &copy; {new Date().getFullYear()} HRM Admin System. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
