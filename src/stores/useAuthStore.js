import { create } from "zustand";
import { authServices } from "@/services/authServices";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || "",
  isAuthLoading: true,
  profile: null,

  login: async (dataFormLogin) => {
    const resLogin = await authServices.login(dataFormLogin);
    localStorage.setItem("token", resLogin.token);
    const profile = await authServices.getProfile();
    set({ token: resLogin.token, profile, isAuthLoading: false });
  },

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setAuthLoading: async () => {
    try {
      set({ isAuthLoading: true });
      const token = localStorage.getItem("token");
      if (!token) {
        set({ token: "", profile: null, isAuthLoading: false });
        return;
      }
      const profile = await authServices.getProfile();
      set({ token, profile, isAuthLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({ token: "", profile: null, isAuthLoading: false });
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logOut: async () => {
    try {
      await authServices.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("token");
      set({ token: "", profile: null, isAuthLoading: false });
    }
  },
})); 