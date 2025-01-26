import axiosIntense from "@/http/axios";

import { create } from "zustand";

const useAuth = create((set) => ({
  userInfo: null,
  isLoading: false,
  error: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setUserInfo: (userInfo) => set({ userInfo }),

  getUserInfo: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosIntense.get("/auth/user-info");
      set({ userInfo: data.data });
    } catch (error) {
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuth;
