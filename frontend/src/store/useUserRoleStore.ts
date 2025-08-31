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
      try {
        const parsed = JSON.parse(userData);
        // Ensure all required fields have fallback values
        return {
          id: parsed.id || "",
          email: parsed.email || "",
          role: parsed.role || "public user", // Default role instead of empty string
          name: parsed.name || "",
        };
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }
  return { id: "", email: "", role: "public user", name: "" }; // Default role here too
};

export const userStore = create<userStore & userActions>((set) => ({
  ...initUserData(),
  setUser: (id, email, role, name) => set({ id, email, role, name }),
  clearUser: () => set({ id: "", email: "", role: "", name: "" }),
}));
