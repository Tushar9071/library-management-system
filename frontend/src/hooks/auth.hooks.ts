import toast from "react-hot-toast";

export const logOut = async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // Important for handling cookies
    });

    if (response.ok) {
      localStorage.clear();
      window.location.href = "/auth";
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "Logout failed");
    }
  } catch (error) {
    console.error("Logout Error:", error);
    toast.error("Logout failed. Please try again.");
  }
};
