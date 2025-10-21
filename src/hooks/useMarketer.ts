import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/api/axios";
import { MarketerData, UseMarketingDataReturn } from "@/types/marketer";
import { useAuth } from "@/hooks/useAuth";

/**
 * Custom hook for managing marketing data aligned with backend endpoints
 */
export function useMarketingData(
  marketerId: string | null = null
): UseMarketingDataReturn {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [userStaffData, setUserStaffData] = useState<MarketerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Helper function to handle API errors consistently
  const handleApiError = useCallback((err: any) => {
    console.error("API Error:", err);

    if (err.response?.status === 401) {
      setError("Authentication failed. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    } else if (err.response?.status === 403) {
      setError(
        "Access denied. You can only view your own data or need admin privileges."
      );
    } else if (err.response?.status === 404) {
      setError("Data not found. Please check if you have sales data.");
    } else if (err.response?.status === 500) {
      setError("Server error. Please try again later.");
    } else {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred"
      );
    }
  }, []);

  // Get current user's staff ID using the backend endpoint
  const fetchUserStaffData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return null;
      }

      // Check user role first
      const savedUser = localStorage.getItem("currentUser");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      const userRole = currentUser?.role;

      // For superadmin/admin, they might not have staff records
      if (userRole === "super_admin" || userRole === "admin") {
        console.log("Admin user detected, skipping staff data fetch");
        const adminStaffData = {
          id: currentUser?.id || "admin",
          userId: currentUser?.id || "",
          name: currentUser?.firstName
            ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
            : currentUser?.email || "Admin",
          email: currentUser?.email || "",
          employeeId: "",
          commissionRate: 0,
          department: "Administration",
          position: userRole === "super_admin" ? "Super Admin" : "Admin",
          performance: {},
          user: {
            id: currentUser?.id || "",
            email: currentUser?.email || "",
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
            role: userRole,
            isActive: true,
          },
        };
        setUserStaffData(adminStaffData);
        return adminStaffData;
      }

      // Use the backend endpoint to get staff ID for regular users
      const response = await api.get("/api/v1/marketing/my-staff-id");
      console.log("Staff ID response: testing", response);
      const staffData = response.data;
      console.log("Staff data structure:", staffData);

      // Handle different possible response structures
      const userId =
        staffData?.userId || staffData?.id || staffData?.marketerId;
      if (!userId) {
        console.error("No staff ID found in response:", staffData);
        throw new Error("Invalid staff data structure from API");
      }

      const formattedStaffData = {
        id: userId,
        userId: staffData.userId || staffData.user?.id || "",
        name:
          `${staffData.user?.firstName || staffData.firstName || ""} ${
            staffData.user?.lastName || staffData.lastName || ""
          }`.trim() ||
          staffData.name ||
          "Marketer",
        email: staffData.user?.email || staffData.email || "",
        employeeId: staffData.employeeId || "",
        commissionRate: parseFloat(staffData.commissionRate || "0"),
        department: staffData.department || "Marketing",
        position: staffData.position || "Marketer",
        performance: {},
        user: {
          id: staffData.userId || staffData.user?.id || "",
          email: staffData.user?.email || staffData.email || "",
          firstName: staffData.user?.firstName || staffData.firstName || "",
          lastName: staffData.user?.lastName || staffData.lastName || "",
          role: staffData.user?.role || staffData.role || "marketer",
          isActive: true,
        },
      };

      setUserStaffData(formattedStaffData);
      return formattedStaffData;
    } catch (err: any) {
      console.error("Error fetching user staff data:", err);
      // For 404 errors (user not found in marketing system), don't show error for admins
      const savedUser = localStorage.getItem("currentUser");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      if (
        err.response?.status === 404 &&
        (currentUser?.role === "super_admin" || currentUser?.role === "admin")
      ) {
        console.log(
          "Admin user not found in marketing system, using admin data"
        );
        const adminStaffData = {
          id: currentUser?.id || "admin",
          userId: currentUser?.id || "",
          name: currentUser?.firstName
            ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
            : currentUser?.email || "Admin",
          email: currentUser?.email || "",
          employeeId: "",
          commissionRate: 0,
          department: "Administration",
          position:
            currentUser?.role === "super_admin" ? "Super Admin" : "Admin",
          performance: {},
          user: {
            id: currentUser?.id || "",
            email: currentUser?.email || "",
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
            role: currentUser?.role,
            isActive: true,
          },
        };
        setUserStaffData(adminStaffData);
        return adminStaffData;
      }
      handleApiError(err);
      return null;
    }
  }, [handleApiError]);

  // Fetch dashboard data using the correct backend endpoint
  const fetchDashboardData = useCallback(
    async (filters: Record<string, any> = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          setIsLoading(false);
          return;
        }

        // Get current user to check role
        const savedUser = localStorage.getItem("currentUser");
        const currentUser = savedUser ? JSON.parse(savedUser) : null;
        const userRole = currentUser?.role;

        console.log("Current user role:", userRole);

        let dashboardUrl: string;
        let dashboardResponse;

        // Handle different user roles
        if (userRole === "super_admin" || userRole === "admin") {
          // For admins, use admin dashboard endpoint or fetch all marketers data
          console.log("Fetching admin dashboard data");
          try {
            // Try admin dashboard endpoint first
            dashboardResponse = await api.get(
              "/api/v1/marketing/admin-dashboard",
              {
                params: {
                  from: filters.from,
                  to: filters.to,
                  period: filters.period || "month",
                },
              }
            );
          } catch (adminErr: any) {
            console.log(
              "Admin dashboard not available, fetching all marketers data"
            );
            // If admin dashboard doesn't exist, fetch all marketers data and aggregate
            const allMarketersResponse = await api.get(
              "/api/v1/marketing/commissions",
              {
                params: {
                  from: filters.from,
                  to: filters.to,
                },
              }
            );

            // Create aggregated dashboard data for admin
            const marketersData = Array.isArray(allMarketersResponse.data)
              ? allMarketersResponse.data
              : [];

            const totalSales = marketersData.reduce(
              (sum, m) => sum + (m.totalSalesAmount || 0),
              0
            );
            const totalCommission = marketersData.reduce(
              (sum, m) => sum + (m.totalCommission || 0),
              0
            );

            dashboardResponse = {
              data: {
                marketer: {
                  name: "All Marketers",
                  role: userRole,
                },
                overview: {
                  totalSales: totalSales,
                  totalCommission: totalCommission,
                  totalMarketers: marketersData.length,
                  averageCommission:
                    marketersData.length > 0
                      ? totalCommission / marketersData.length
                      : 0,
                },
                monthlyData: [],
                topProducts: [],
                recentSales: [],
                period: filters.period || "month",
                allMarketers: marketersData,
              },
            };
          }
        } else {
          // For regular marketers, always use the "my-dashboard" endpoint
          // This ensures they can only access their own data
          console.log("Fetching marketer's own dashboard data");

          dashboardUrl = "/api/v1/marketing/my-dashboard";

          dashboardResponse = await api.get(dashboardUrl, {
            params: {
              from: filters.from,
              to: filters.to,
              period: filters.period || "month",
            },
          });
        }

        const dashboardData = dashboardResponse.data;

        setDashboardData({
          marketer: dashboardData.marketer,
          overview: dashboardData.overview,
          monthlyData: dashboardData.monthlyData || [],
          topProducts: dashboardData.topProducts || [],
          recentSales: dashboardData.recentSales || [],
          period: dashboardData.period,
          allMarketers: dashboardData.allMarketers, // For admin view
        });
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        handleApiError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [marketerId, userStaffData, fetchUserStaffData, handleApiError]
  );

  // Fetch performance metrics using backend endpoint
  const fetchPerformanceMetrics = useCallback(
    async (filters: Record<string, any> = {}) => {
      try {
        setIsLoading(true);
        const response = await api.get(
          "/api/v1/marketing/performance-metrics",
          {
            params: filters,
          }
        );
        return response.data;
      } catch (err: any) {
        console.error("Error fetching performance metrics:", err);
        handleApiError(err);
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiError]
  );

  // Fetch product sales using backend endpoint
  const fetchProductSales = useCallback(
    async (filters: Record<string, any> = {}) => {
      try {
        const response = await api.get("/api/v1/marketing/product-sales", {
          params: filters,
        });
        return response.data || [];
      } catch (err: any) {
        console.error("Error fetching product sales:", err);
        handleApiError(err);
        return [];
      }
    },
    [handleApiError]
  );

  // Fetch commissions using backend endpoint
  const fetchCommissions = useCallback(
    async (filters: Record<string, any> = {}) => {
      try {
        const response = await api.get("/api/v1/marketing/commissions", {
          params: filters,
        });
        return response.data || [];
      } catch (err: any) {
        console.error("Error fetching commissions:", err);
        handleApiError(err);
        return [];
      }
    },
    [handleApiError]
  );

  // Fetch rankings using backend endpoint
  const fetchRankings = useCallback(
    async (filters: Record<string, any> = {}) => {
      try {
        const response = await api.get("/api/v1/marketing/rankings", {
          params: filters,
        });
        setRankings(response.data?.rankings || []);
        return response.data?.rankings || [];
      } catch (err: any) {
        console.error("Error fetching rankings:", err);
        handleApiError(err);
        return [];
      }
    },
    [handleApiError]
  );

  // Initialize data on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);

        // Set default date range for initial load
        const currentMonth = {
          from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
          to: new Date().toISOString().split("T")[0],
        };

        // Fetch dashboard data with the current month's date range
        await fetchDashboardData(currentMonth);
      } catch (error) {
        console.error("Error initializing dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []); // Empty dependency array to prevent infinite loop

  return {
    // State
    dashboardData,
    performanceData,
    rankings,
    userStaffData,
    isLoading,
    error,

    // Actions
    fetchDashboardData,
    fetchPerformanceMetrics,
    fetchProductSales,
    fetchCommissions,
    fetchRankings,
    clearError: () => setError(null),
  };
}
export function useAllMarketersData() {
  const [marketers, setMarketers] = useState<MarketerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  // const handleApiError = useCallback(
  //   (error: any) => {
  //     console.error("API Error:", error);
  //     const errorMessage =
  //       error.response?.data?.error ||
  //       error.message ||
  //       "An error occurred while fetching data";
  //     setError(errorMessage);

  //     // Handle 401 Unauthorized errors
  //     if (error.response?.status === 401) {
  //       console.log("Authentication error, logging out...");
  //       logout();
  //     }
  //   },
  //   [logout]
  // );

  const fetchMarketers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setMarketers([]);
        return [];
      }

      // Add debug logging
      console.log(
        "Fetching marketers with token:",
        localStorage.getItem("token") ? "Token exists" : "No token found"
      );

      const response = await api.get("/api/v1/staff", {
        params: {
          role: "marketer",
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setMarketers(data);
      return data;
    } catch (err: any) {
      console.error("Error fetching marketers:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("User not authorized to access marketer data");
      }
      setMarketers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllMarketersPerformance = useCallback(
    async (filters: Record<string, any> = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check for authentication token
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          return [];
        }

        // Prepare query parameters
        const params = new URLSearchParams();
        if (filters.from) params.append("from", filters.from);
        if (filters.to) params.append("to", filters.to);

        // Add debug logging
        console.log("Fetching marketer performance with params:", {
          from: filters.from,
          to: filters.to,
        });

        // Make the API request with proper error handling
        let response;
        try {
          response = await api.get(`/api/v1/marketing/commissions`, {
            params: {
              from: filters.from,
              to: filters.to,
            },
            validateStatus: (status) => status < 500, // Don't throw for 4xx errors
          });

          // Handle 401/403 responses
          if (response.status === 401 || response.status === 403) {
            console.error("Access denied:", response.data);
            setError("You do not have permission to view this data");
            return [];
          }

          // Handle other error statuses
          if (response.status >= 400) {
            console.error("API Error:", response.data);
            setError(
              response.data?.error || "Failed to fetch performance data"
            );
            return [];
          }
        } catch (err: any) {
          console.error("Request failed:", err);
          setError(err.message || "Failed to fetch performance data");
          return [];
        }

        const performanceData = Array.isArray(response.data)
          ? response.data
          : [];
        console.log("Received performance data:", performanceData);

        // Transform the data to match expected format
        const formattedData = performanceData.map((marketer: any) => ({
          marketerId: marketer.marketerId || marketer.id || "",
          id: marketer.marketerId || marketer.id || "",
          name:
            marketer.name ||
            `${marketer.firstName || ""} ${marketer.lastName || ""}`.trim() ||
            "Unknown",
          email: marketer.email || "",
          totalSalesAmount: marketer.totalSalesAmount || 0,
          totalCommission: marketer.totalCommission || 0,
          orderCount: marketer.orderCount || 0,
        }));

        return formattedData;
      } catch (err: any) {
        console.error("Error fetching all marketers performance:", err);
        setError(
          err.response?.data?.error || "Failed to fetch marketers performance"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleApiError = (err: any) => {
    if (err.response?.status === 401) {
      setError("Authentication failed. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    } else if (err.response?.status === 403) {
      setError("Access denied. Please check your permissions.");
    } else {
      setError(err.response?.data?.error || err.message || "An error occurred");
    }
  };

  useEffect(() => {
    fetchMarketers();
  }, [fetchMarketers]);

  return {
    marketers,
    isLoading,
    error,
    fetchMarketers,
    fetchAllMarketersPerformance,
    refreshData: fetchMarketers,
    clearError: () => setError(null),
  };
}

/**
 * Hook specifically for user's own marketing data (convenience hook)
 */
export function useMyMarketingData(): UseMarketingDataReturn {
  const { user } = useAuth();
  return useMarketingData(null); // null means use current user's data
}

/**
 * Utility functions for data formatting
 */
export const marketingUtils = {
  formatCurrency: (amount: any, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount || 0),

  formatPercent: (value: number, decimals = 1) =>
    `${(value * 100).toFixed(decimals)}%`,

  formatNumber: (value: any) =>
    new Intl.NumberFormat("en-US").format(value || 0),

  calculateGrowth: (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  getPerformanceColor: (value, thresholds = { good: 80, average: 60 }) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.average) return "text-yellow-600";
    return "text-red-600";
  },

  getPerformanceBadgeVariant: (
    value: number,
    thresholds = { good: 80, average: 60 }
  ) => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.average) return "warning";
    return "destructive";
  },

  groupDataByPeriod: (data, periodType = "month") => {
    const grouped = {};

    data.forEach((item: { date: any; saleDate: any }) => {
      const date = new Date(item.date || item.saleDate);
      let key: string;

      switch (periodType) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = startOfWeek.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "quarter":
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  },

  calculateAverages: (data, field) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
    return sum / data.length;
  },

  findTopPerformers: (data, metric, limit = 5) => {
    return [...data]
      .sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0))
      .slice(0, limit);
  },

  calculateCommissionProjection: (
    currentSales: number,
    commissionRate: number,
    remainingDays: number,
    avgDailySales: number
  ) => {
    const projectedTotalSales = currentSales + avgDailySales * remainingDays;
    return projectedTotalSales * commissionRate;
  },

  getDateRangeOptions: () => [
    {
      label: "Today",
      value: "today",
      from: new Date().toISOString().split("T")[0],
      to: new Date().toISOString().split("T")[0],
    },
    {
      label: "This Week",
      value: "week",
      from: (() => {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return date.toISOString().split("T")[0];
      })(),
      to: new Date().toISOString().split("T")[0],
    },
    {
      label: "This Month",
      value: "month",
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      to: new Date().toISOString().split("T")[0],
    },
    {
      label: "Last Month",
      value: "lastMonth",
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        .toISOString()
        .split("T")[0],
      to: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        .toISOString()
        .split("T")[0],
    },
    {
      label: "Last 3 Months",
      value: "3months",
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
        .toISOString()
        .split("T")[0],
      to: new Date().toISOString().split("T")[0],
    },
  ],

  // Role-based utility functions
  canViewAllMarketersData: (userRole: string) => {
    return ["admin", "super_admin"].includes(userRole);
  },

  canEditMarketingGoals: (userRole: string, isOwnData = false) => {
    if (["admin", "super_admin"].includes(userRole)) return true;
    if (["marketer", "sales"].includes(userRole) && isOwnData) return true;
    return false;
  },

  canViewMarketingData: (userRole) => {
    return ["admin", "super_admin", "marketer", "sales"].includes(userRole);
  },
};
