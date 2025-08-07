"use client";
import { create } from "zustand";

interface userStore {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface userActions {
  setUser: (id: string, email: string, role: string, name: string) => void;
  clearUser: () => void;
}

const initUserData = (): userStore => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("userData");
    if (userData) {
      return JSON.parse(userData);
    }
  }
  return { id: "", email: "", role: "", name: "" };
};

export const userStore = create<userStore & userActions>((set) => ({
  ...initUserData(),
  setUser: (id, email, role, name) => set({ id, email, role, name }),
  clearUser: () => set({ id: "", email: "", role: "", name: "" }),
}));
