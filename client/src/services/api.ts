import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling and automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors for automatic refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = error.config?.url || "";
      const isProfileCheck = url.includes("/auth/profile");
      const isAuthRequest =
        url.includes("/auth/login") || url.includes("/auth/register");
      const isRefreshRequest = url.includes("/auth/refresh");
      const isOnLoginPage = window.location.pathname === "/login";
      const isOnRegisterPage = window.location.pathname === "/register";

      // Don't attempt refresh for:
      // - Profile checks (expected to fail for unauthenticated users)
      // - Auth requests (login/register)
      // - Refresh requests (to prevent infinite loops)
      // - When already on login/register pages
      if (
        isProfileCheck ||
        isAuthRequest ||
        isRefreshRequest ||
        isOnLoginPage ||
        isOnRegisterPage
      ) {
        return Promise.reject(error);
      }

      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry original request after refresh completes
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await api.post("/auth/refresh");

        // Refresh successful, process queued requests
        processQueue(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError);

        // Redirect to login only if we're not already there
        if (!isOnLoginPage && !isOnRegisterPage) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or when refresh is not applicable, handle as before
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isProfileCheck = url.includes("/auth/profile");
      const isAuthRequest =
        url.includes("/auth/login") || url.includes("/auth/register");
      const isOnLoginPage = window.location.pathname === "/login";
      const isOnRegisterPage = window.location.pathname === "/register";

      if (
        !isProfileCheck &&
        !isAuthRequest &&
        !isOnLoginPage &&
        !isOnRegisterPage
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
