import { useAuthStore } from "../stores/useAuthStore.js";

/**
 * Custom Hook useAuth
 * Gói gọn profile, vai trò và các hành động xác thực tài khoản
 */
export function useAuth() {
  const profile = useAuthStore((state) => state.profile);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const logOut = useAuthStore((state) => state.logOut);
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const setProfile = useAuthStore((state) => state.setProfile);

  const role = profile?.role?.trim()?.toLowerCase() || "";
  const isAdmin = Boolean(role.includes("admin"));
  const isEmployee = Boolean(role.includes("employee") || (!isAdmin && profile));

  return {
    profile,
    isAuthLoading,
    token,
    role,
    isAdmin,
    isEmployee,
    login,
    logOut,
    setAuthLoading,
    setProfile,
  };
}
