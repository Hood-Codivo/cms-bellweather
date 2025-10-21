import { useState, useCallback, useMemo, useEffect } from "react";
import {
  SalesRecordDetailed,
  Customer,
  ProductType,
  Marketer,
} from "@/types/business";
import api from "@/api/axios";

interface SalesFilters {
  search: string;
  productType: string;
  marketer: string;
  customer: string;
  dateRange: {
    from: string;
    to: string;
  };
}

interface UseSalesReturn {
  sales: SalesRecordDetailed[];
  productTypes: ProductType[];
  marketers: Marketer[];
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total: number;
  pageCount: number; // ADDED: Missing return value
  filters: {
    search: string;
    productType: string;
    marketer: string;
    customer: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
  updateFilters: (
    filters: Partial<{
      search: string;
      productType: string;
      marketer: string;
      customer: string;
      dateRange: { from: string; to: string };
    }>
  ) => void;
  resetFilters: () => void;
  addSalesRecord: (data: any) => Promise<void>;
  updateSalesRecord: (id: string, data: any) => Promise<void>;
  deleteSalesRecord: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  getProductionTypeById: (id: string) => Promise<ProductType | null>;
}

export function useSales(): UseSalesReturn {
  const [sales, setSales] = useState<SalesRecordDetailed[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [filters, setFilters] = useState<SalesFilters>({
    search: "",
    productType: "all",
    marketer: "all",
    customer: "all",
    dateRange: {
      from: "",
      to: "",
    },
  });

  // Helper function to get user data from both storage keys
  const getUserData = useCallback(() => {
    const userData =
      localStorage.getItem("currentUser") || localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Check if user has sales access
  const hasSalesAccess = useCallback(() => {
    const user = getUserData();
    const userRole = user?.role?.toLowerCase();
    return ["admin", "super_admin", "sales", "marketer"].includes(
      userRole || ""
    );
  }, [getUserData]);

  // Fetch sales records
  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setSales([]);
        setTotal(0);
        setPageCount(0);
        return;
      }

      // Check if user has sales access
      if (!hasSalesAccess()) {
        setError(
          "Access denied. You don't have permission to view sales data."
        );
        setSales([]);
        setTotal(0);
        setPageCount(0);
        return;
      }

      // Build query parameters - fetch all data for client-side filtering
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "10000");

      console.log("Fetching all sales data for client-side filtering");
      const response = await api.get("/api/v1/sales", { params });
      console.log("Sales API response:", response.data);

      // Handle different response formats
      if (response.data) {
        let salesData: SalesRecordDetailed[] = [];
        let totalCount = 0;

        // Handle paginated response format
        if (Array.isArray(response.data.data) && response.data.meta) {
          salesData = response.data.data;
          totalCount = response.data.meta.total || response.data.data.length;
        }
        // Handle non-paginated array response
        else if (Array.isArray(response.data)) {
          salesData = response.data;
          totalCount = response.data.length;
        }
        // Handle direct data array
        else if (response.data.items && Array.isArray(response.data.items)) {
          salesData = response.data.items;
          totalCount = response.data.total || response.data.items.length;
        }
        // Fallback for other formats
        else {
          console.warn("Unexpected API response format:", response.data);
          salesData = Array.isArray(response.data) ? response.data : [];
          totalCount = salesData.length;
        }

        setSales(salesData);
        setTotal(totalCount);
        setPageCount(1); // Client-side pagination
      } else {
        setSales([]);
        setTotal(0);
        setPageCount(0);
      }
      setHasTriedAuth(true);
    } catch (err: any) {
      console.error("Error fetching sales:", err);

      // Handle specific error types
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. You don't have permission to view sales data."
        );
        setSales([]);
        setTotal(0);
        setPageCount(0);
      } else if (err.response?.status === 404) {
        setError(
          "Sales endpoint not found. Please check if the sales module is configured properly."
        );
        setSales([]);
        setTotal(0);
        setPageCount(0);
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
        setSales([]);
        setTotal(0);
        setPageCount(0);
      } else {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Unknown error";
        setError(`Failed to fetch sales: ${errorMessage}`);
        setSales([]);
        setTotal(0);
        setPageCount(0);
      }
      setHasTriedAuth(true);
    } finally {
      setIsLoading(false);
    }
  }, [hasSalesAccess]);

  // Client-side filtering
  const filteredSales = useMemo(() => {
    if (!sales.length) return [];

    let filtered = sales;

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.customer.name.toLowerCase().includes(searchTerm) ||
          sale.customer.email.toLowerCase().includes(searchTerm) ||
          sale.productionType.name.toLowerCase().includes(searchTerm) ||
          `${sale.salesPerson.user.firstName} ${sale.salesPerson.user.lastName}`
            .toLowerCase()
            .includes(searchTerm) ||
          sale.salesPerson.user.email.toLowerCase().includes(searchTerm) ||
          (sale.notes && sale.notes.toLowerCase().includes(searchTerm))
      );
    }

    // Product type filter
    if (filters.productType && filters.productType !== "all") {
      filtered = filtered.filter(
        (sale) =>
          sale.productionType.name.toLowerCase() ===
          filters.productType.toLowerCase()
      );
    }

    // Marketer filter
    if (filters.marketer && filters.marketer !== "all") {
      filtered = filtered.filter(
        (sale) => sale.salesPerson.id === filters.marketer
      );
    }

    // Customer filter
    if (filters.customer && filters.customer !== "all") {
      filtered = filtered.filter(
        (sale) => sale.customer.id === filters.customer
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        const from = filters.dateRange.from
          ? new Date(filters.dateRange.from)
          : null;
        const to = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

        if (from && saleDate < from) return false;
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          if (saleDate > toDate) return false;
        }
        return true;
      });
    }

    return filtered;
  }, [sales, filters]);

  // Client-side pagination
  const displayedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredSales.slice(start, end);
  }, [filteredSales, page, pageSize]);

  // Update total and pageCount for client-side pagination
  const filteredTotal = filteredSales.length;
  const filteredPageCount = Math.ceil(filteredTotal / pageSize);

  // Fetch production types
  const fetchProductTypes = useCallback(async () => {
    try {
      if (!hasSalesAccess()) {
        setProductTypes([]);
        return;
      }

      const response = await api.get("/api/v1/production/types");
      setProductTypes(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Error fetching product types:", err);
      setProductTypes([]);

      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("User doesn't have access to product types");
      }
    }
  }, [hasSalesAccess]);

  // Fetch marketers
  const fetchMarketers = useCallback(async () => {
    try {
      if (!hasSalesAccess()) {
        setMarketers([]);
        return;
      }

      const response = await api.get("/api/v1/staff");

      const staffData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Filter for marketers only and transform the data
      const transformedMarketers = staffData
        .filter((staff: any) => {
          const userRole =
            staff.user?.role?.toLowerCase() || staff.role?.toLowerCase() || "";
          return userRole === "marketer";
        })
        .map((marketer: any) => ({
          id: marketer.id,
          name:
            `${marketer.user?.firstName || ""} ${
              marketer.user?.lastName || ""
            }`.trim() ||
            marketer.name ||
            "Unknown",
          email: marketer.user?.email || marketer.email || "",
          phone: marketer.user?.phone || marketer.phone || "",
          commissionRate: parseFloat(marketer.commissionRate) || 0,
          department: marketer.department || "",
          status: marketer.isActive ? "active" : "inactive",
          role: marketer.user?.role || marketer.role || "",
        }));

      setMarketers(transformedMarketers);
    } catch (err: any) {
      console.error("Error fetching marketers:", err);
      setMarketers([]);

      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("User doesn't have access to marketers data");
      }
    }
  }, [hasSalesAccess]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      if (!hasSalesAccess()) {
        setCustomers([]);
        return;
      }

      const response = await api.get("/api/v1/customers");
      const customersData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setCustomers(customersData);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setCustomers([]);

      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("User doesn't have access to customers data");
      }
    }
  }, [hasSalesAccess]);

  // Get customer by ID
  const getCustomerById = useCallback(
    async (id: string) => {
      if (!id) return null;
      try {
        const response = await api.get(`/api/v1/customers/${id}`);
        return response.data;
      } catch {
        return customers.find((c) => c.id === id) || null;
      }
    },
    [customers]
  );

  // Get production type by ID
  const getProductionTypeById = useCallback(
    async (id: string) => {
      if (!id) return null;
      try {
        const response = await api.get(`/api/v1/production/types/${id}`);
        return response.data;
      } catch {
        return productTypes.find((p) => p.id === id) || null;
      }
    },
    [productTypes]
  );

  // Add sales record
  const addSalesRecord = useCallback(
    async (data: any) => {
      if (!hasSalesAccess()) {
        throw new Error("You don't have permission to add sales records.");
      }
      try {
        await api.post("/api/v1/sales", data);
        await fetchSales();
      } catch (err) {
        console.error("Error adding sales record:", err);
        throw err;
      }
    },
    [fetchSales, hasSalesAccess]
  );

  // Update sales record
  const updateSalesRecord = useCallback(
    async (id: string, data: any) => {
      if (!hasSalesAccess()) {
        throw new Error("You don't have permission to update sales records.");
      }
      try {
        await api.put(`/api/v1/sales/${id}`, data);
        await fetchSales();
      } catch (err) {
        console.error("Error updating sales record:", err);
        throw err;
      }
    },
    [fetchSales, hasSalesAccess]
  );

  // Delete sales record
  const deleteSalesRecord = useCallback(
    async (id: string) => {
      if (!hasSalesAccess()) {
        throw new Error("You don't have permission to delete sales records.");
      }
      try {
        await api.delete(`/api/v1/sales/${id}`);
        await fetchSales();
      } catch (err) {
        console.error("Error deleting sales record:", err);
        throw err;
      }
    },
    [fetchSales, hasSalesAccess]
  );

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (hasSalesAccess()) {
      fetchSales();
    } else {
      setIsLoading(false);
      setError("Access denied. You don't have permission to view sales data.");
    }
  }, [fetchSales, hasSalesAccess]);

  useEffect(() => {
    if (hasSalesAccess()) {
      fetchProductTypes();
      fetchMarketers();
      fetchCustomers();
    }
  }, [fetchProductTypes, fetchMarketers, fetchCustomers, hasSalesAccess]);

  const statistics = useMemo(() => {
    const totalRevenue = sales.reduce(
      (sum, record) => sum + parseFloat(record.totalAmount || "0"),
      0
    );
    const totalSales = sales.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
    };
  }, [sales]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SalesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      productType: "all",
      marketer: "all",
      customer: "all",
      dateRange: {
        from: "",
        to: "",
      },
    });
    setPage(1);
  }, []);

  return {
    sales: displayedSales,
    updateFilters,
    resetFilters,
    productTypes,
    marketers,
    customers,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    total: filteredTotal,
    pageCount: filteredPageCount,
    filters,
    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
    getCustomerById,
    getProductionTypeById,
  } as const;
}
