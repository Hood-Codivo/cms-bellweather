import { useState, useCallback, useEffect } from "react";
import { ProductionLog, ProductionLogFormData } from "@/types/production";
import api from "@/api/axios";

export const useProductionLogs = () => {
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductionLogs();
  }, []);

  const fetchProductionLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/production/logs");
      setProductionLogs(response.data || []);
    } catch (error) {
      console.error("Error fetching production logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProductionLog = useCallback(
    async (formData: ProductionLogFormData) => {
      try {
        const response = await api.post("/api/v1/production/logs", formData);
        await fetchProductionLogs(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error("Error creating production log:", error);
        throw error;
      }
    },
    [fetchProductionLogs]
  );

  const updateProductionLog = useCallback(
    async (id: string, formData: ProductionLogFormData) => {
      try {
        const response = await api.put(
          `/api/v1/production/logs/${id}`,
          formData
        );
        await fetchProductionLogs(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error("Error updating production log:", error);
        throw error;
      }
    },
    [fetchProductionLogs]
  );

  const deleteProductionLog = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/v1/production/logs/${id}`);
        await fetchProductionLogs(); // Refresh the list
      } catch (error) {
        console.error("Error deleting production log:", error);
        throw error;
      }
    },
    [fetchProductionLogs]
  );

  return {
    productionLogs,
    isLoading,
    createProductionLog,
    updateProductionLog,
    deleteProductionLog,
    fetchProductionLogs,
  };
};
