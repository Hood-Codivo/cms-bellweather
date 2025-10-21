import api from "@/api/axios";
import { useState, useEffect, useCallback } from "react";

export interface InventoryMonthlyRecord {
  id: string;
  productId?: string;
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  year: number;
  month: number;
  costPerUnit: number;
  totalCost: number;
  supplier?: string;
  location: string;
  lastRestocked: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryValueTrendItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  costPerUnit: number;
  totalValue: number;
}

export interface InventoryValueTrend {
  year: number;
  month: number;
  totalValue: number;
  itemCount: number;
  items: InventoryValueTrendItem[];
}

export interface MonthlyRecordFilters {
  name?: string;
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}

// Dynamic API URL configuration for both development and production

export const useInventoryMonthlyRecords = () => {
  const [records, setRecords] = useState<InventoryMonthlyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all monthly records with filters
  const getAllRecords = useCallback(
    async (filters: MonthlyRecordFilters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.name) params.append("name", filters.name);
        if (filters.year) params.append("year", filters.year.toString());
        if (filters.month) params.append("month", filters.month.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.offset) params.append("offset", filters.offset.toString());

        const response = await api.get("/api/v1/inventoryMonthlyRecord", {
          params,
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.data;
        setRecords(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching monthly records:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get records for specific item by name
  const getRecordsByItemName = useCallback(
    async (
      itemName: string,
      year?: number,
      month?: number
    ): Promise<InventoryMonthlyRecord[]> => {
      setLoading(true);
      setError(null);

      try {
        const encodedName = encodeURIComponent(itemName);
        let url = `${api}/api/v1/inventoryMonthlyRecord/item/${encodedName}`;

        const params = new URLSearchParams();
        if (year) params.append("year", year.toString());
        if (month) params.append("month", month.toString());

        if (params.toString()) {
          url += `?${params}`;
        }

        const response = await api.get(url);

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.data;
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching records for item:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get inventory value trend
  const getValueTrend = useCallback(
    async (
      months: number = 12,
      itemName?: string
    ): Promise<InventoryValueTrend[]> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("months", months.toString());
        if (itemName) params.append("name", itemName);

        const response = await api.get(
          `${api}/api/v1/inventoryMonthlyRecord/trend?${params}`
        );

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.data;
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching value trend:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    records,
    loading,
    error,
    getAllRecords,
    getRecordsByItemName,
    getValueTrend,
    clearError,
  };
};
