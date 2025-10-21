import { useState, useEffect } from "react";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: "individual" | "business";
  createdAt: string;
  updatedAt: string;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  fetchCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<void>;
  clearSelectedCustomer: () => void;
  refetch: () => Promise<void>;
}

// Configure the base URL for your backend API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("Making API request:", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("API response received:", {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
    });
    return response;
  },
  (error) => {
    console.error("Response interceptor error:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    console.log("Starting to fetch customers...");
    setLoading(true);
    setError(null);

    try {
      console.log("Making API request to /api/v1/customers");
      const response = await apiClient.get("/api/v1/customers");

      // Check if we got HTML instead of JSON (common routing issue)
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        console.error(
          "Received HTML instead of JSON - check your backend server and routing"
        );
        throw new Error(
          "Backend API not accessible. Please check if the backend server is running."
        );
      }

      // Handle different response structures
      let customersData = response.data;

      // If the response is wrapped in a data property
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        customersData = response.data.data;
      }

      if (!Array.isArray(customersData)) {
        console.error("Unexpected API response format:", response.data);
        throw new Error("Invalid data format received from server");
      }

      console.log(`Successfully fetched ${customersData.length} customers`);
      setCustomers(customersData);
    } catch (err: any) {
      let errorMessage = "Failed to fetch customers";

      if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        errorMessage =
          "Unable to connect to the backend server. Please check if the server is running.";
      } else if (err.response) {
        // Server responded with error status
        errorMessage =
          err.response.data?.message ||
          `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error("Error fetching customers:", {
        error: err,
        message: errorMessage,
        code: err.code,
        response: err.response,
      });

      setError(errorMessage);
    } finally {
      console.log("Finished fetch operation, loading set to false");
      setLoading(false);
    }
  };

  const getCustomerById = async (id: string) => {
    console.log(`Fetching customer with ID: ${id}`);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/api/v1/customers/${id}`);

      // Check if we got HTML instead of JSON
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        throw new Error(
          "Backend API not accessible. Please check if the backend server is running."
        );
      }

      if (!response.data) {
        throw new Error("No data received for customer");
      }

      console.log("Successfully fetched customer details");
      setSelectedCustomer(response.data);
    } catch (err: any) {
      let errorMessage = `Failed to fetch customer details (ID: ${id})`;

      if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        errorMessage =
          "Unable to connect to the backend server. Please check if the server is running.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message ||
          `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error("Error fetching customer by ID:", {
        error: err,
        message: errorMessage,
        id: id,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  const refetch = fetchCustomers;

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    selectedCustomer,
    fetchCustomers,
    getCustomerById,
    clearSelectedCustomer,
    refetch,
  };
}

export default useCustomers;
