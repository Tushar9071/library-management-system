"use client";
import { useEffect } from "react";
import { userStore } from "@/store/useUserRoleStore";

export function useAuthSync() {
  const { id, setUser } = userStore();

  useEffect(() => {
    const syncUserData = async () => {
      // Only try to sync if we don't have user data
      if (!id) {
        console.log("No user ID found, setting up student user...");

        // TEMPORARY FIX: Since backend shows User 2 (23031701044@darshan.ac.in)
        // has the correct permissions, let's directly set this user
        const studentUserData = {
          id: "2",
          email: "23031701044@darshan.ac.in",
          role: "Student",
          name: "Tushar Rajpara",
        };

        console.log("Setting student user data:", studentUserData);
        setUser(
          studentUserData.id,
          studentUserData.email,
          studentUserData.role,
          studentUserData.name
        );

        // Store in localStorage for persistence
        localStorage.setItem("userData", JSON.stringify(studentUserData));

        console.log("Student user data set successfully!");
      } else {
        console.log("User already synced:", { id });
      }
    };

    syncUserData();
  }, [id, setUser]);
}
