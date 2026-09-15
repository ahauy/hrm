import api from "../utils/axios.js"

// export const URL = "https://lesson-starter-1.onrender.com/"

export const authServices = {
  /*
  dataFormLogin: {
    userName: string,
    password: string
  }
  */
  login: async (dataFormLogin) => {
    const res = await api.post("/login", dataFormLogin)
    return res.data; // token: string
  },

  logout: async () => {
    const res = await api.post("/logout")
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get("/api/me")
    return res.data; // profile: object
    /**
     * {
      "id": 1,
      "username": "admin",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
      }
     */
  }
}