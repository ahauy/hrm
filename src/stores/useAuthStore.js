import { create } from 'zustand'
import { authServices } from '../services/authServices'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || "", // accesstoken
  isAuthLoading: true, 
  profile: null, // quan lt cac thong tin cua nguoi dang nhap

  login: async (dataFormLogin) => {
    const resLogin = await authServices.login(dataFormLogin)
    console.log(resLogin)
    localStorage.setItem("token", resLogin.token)

    const profile = await authServices.getProfile()
    // console.log(profile)
    set({token: resLogin.token, profile: profile, isAuthLoading: false})
  },

  setToken: (token) => {
    localStorage.setItem("token", token)
    set({ token })  
  },

  setProfile: (profile) => {
    set({ profile })
  },

  setAuthLoading: async () => {
    try {
      set({ isAuthLoading: true })
      const token = localStorage.getItem("token")
      if(!token) {
        set({ token: "", profile: null, isAuthLoading: false })
        return;
      }
      const profile = await authServices.getProfile()
      set({token, profile, isAuthLoading: false})
    } catch (error) {
      console.log("Error in useAuthStore.setAuthLoading:", error)
      localStorage.removeItem("token")
      set({ token: "", profile: null, isAuthLoading: false })
    } finally {
      set({ isAuthLoading: false })
    }
  },

  logOut: async () => {
    try {
      await authServices.logout()
      localStorage.removeItem("token")
      set({ token: "", profile: null, isAuthLoading: false })
    } catch (error) {
      console.log("Error in useAuthStore.logOut:", error)
      set({ token: "", profile: null, isAuthLoading: false })
    }
  },
})) 