import axiosIntense from "@/http/axios";

import { create } from "zustand";

const useUsers = create((set) => ({
  users: null,
  isLoading: false,
  error: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setUsers: (users) => set({ users }),

  getUsers: async () => {
    set({ isLoading: true });
    set({ users: null });
    try {
      const { data } = await axiosIntense.get("/auth/get-users");
      set({ users: data.data.users });
    } catch (error) {
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUsers;
