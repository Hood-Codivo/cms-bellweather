import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Configure global axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

const api = axios.create({
  // baseURL: "http://localhost:3000",
  baseURL: "https://bellweather-backend-1.onrender.com",
  withCredentials: true, // Ensure credentials are sent with requests
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    // Fix: Check both storage keys for user data
    const userData =
      localStorage.getItem("currentUser") || localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    // Always set the Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Note: Custom headers removed to prevent CORS issues
    // User role and permissions should be handled server-side or through the JWT token

    // Ensure X-Requested-With header is set
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    console.log("Request sent to:", config.url);

    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || "";

      console.error("Response error:", {
        status,
        url,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Don't automatically logout for certain API 401/403 errors
      const isMarketingApi = url.includes("/marketing/");
      const isSalesApi = url.includes("/sales/");
      const isProductionApi = url.includes("/production/");
      const isStaffApi = url.includes("/staff/");

      if (status === 401) {
        // Check if it's a core authentication issue vs API-specific permissions
        if (
          url.includes("/auth/validate-token") ||
          url.includes("/auth/login")
        ) {
          console.error("Core authentication failed - redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        if (isMarketingApi || isSalesApi || isProductionApi || isStaffApi) {
          console.error(
            `API access denied (${url}) - insufficient permissions`
          );
          // Don't return empty data - let the component handle the error
          return Promise.reject(error);
        } else {
          console.error("Authentication error - redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } else if (status === 403) {
        console.error("Forbidden - insufficient permissions for:", url);
        return Promise.reject(error);
      } else if (status === 404) {
        console.error("Resource not found:", url);
      } else if (status >= 500) {
        console.error("Server error occurred for:", url);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
