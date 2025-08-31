// API utility for handling authenticated requests
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiRequest = async (
  endpoint: string,
  options: ApiOptions = {}
) => {
  const { requireAuth = true, ...fetchOptions } = options;

  const config: RequestInit = {
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  // Add Authorization header if we have a token and auth is required
  if (requireAuth) {
    // Try to get token from either 'authToken' or 'token' in localStorage
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    console.log("Token found:", token ? "YES" : "NO");
    console.log(
      "Token value:",
      token ? token.substring(0, 20) + "..." : "none"
    );

    if (token && token !== "null" && token !== "undefined") {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      console.warn("No valid authentication token found");
    }
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Handle unauthorized responses
    if (response.status === 401) {
      // Clear invalid tokens and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/auth";
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint: string, requireAuth = true) =>
  apiRequest(endpoint, { method: "GET", requireAuth });

export const apiPost = (endpoint: string, data: any, requireAuth = true) =>
  apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth,
  });

export const apiPut = (endpoint: string, data: any, requireAuth = true) =>
  apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    requireAuth,
  });

export const apiDelete = (endpoint: string, requireAuth = true) =>
  apiRequest(endpoint, { method: "DELETE", requireAuth });

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  return !!(token && token !== "null" && userData);
};

// Helper to get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

// Helper to login and store user data properly
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiPost("/auth/login", { email, password }, false);
    const result = await response.json();

    if (response.ok && result.token) {
      // Store authentication data
      localStorage.setItem("authToken", result.token);
      
      // Store user data if provided
      if (result.user) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role || "public user",
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Update user store
        const { userStore } = await import("@/store/useUserRoleStore");
        userStore.setState(userData);
      }

      return { success: true, data: result };
    } else {
      return { success: false, error: result.message || "Login failed" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login request failed" };
  }
};

// Helper to logout user
export const logoutUser = async () => {
  try {
    await apiPost("/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear all auth data regardless of API response
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token"); // Clear old token format too
    window.location.href = "/auth";
  }
};
