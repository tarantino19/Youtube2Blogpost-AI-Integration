import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. It's NOT a profile check request (which is expected to fail for unauthenticated users)
    // 3. It's NOT a login/register request
    // 4. We're not already on the login page
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isProfileCheck = url.includes("/auth/profile");
      const isAuthRequest =
        url.includes("/auth/login") || url.includes("/auth/register");
      const isOnLoginPage = window.location.pathname === "/login";
      const isOnRegisterPage = window.location.pathname === "/register";

      // Don't redirect if:
      // - It's just checking profile (expected to fail for unauthenticated users)
      // - It's an auth request (login/register)
      // - We're already on login/register page
      if (
        !isProfileCheck &&
        !isAuthRequest &&
        !isOnLoginPage &&
        !isOnRegisterPage
      ) {
        // Only redirect if user was trying to access a protected resource
        console.log("Redirecting to login due to 401 on:", url);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
