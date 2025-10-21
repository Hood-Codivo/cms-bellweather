import { useState, useCallback, useEffect } from "react";
import { ProductionType, ProductionTypeFormData } from "@/types/production";
import api from "@/api/axios";

export const useProductionTypes = () => {
  const [productionTypes, setProductionTypes] = useState<ProductionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductionTypes();
  }, []);

  const fetchProductionTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/production/types");
      setProductionTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching production types:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProductionType = useCallback(
    async (formData: ProductionTypeFormData) => {
      try {
        const response = await api.post("/api/v1/production/types", formData);
        await fetchProductionTypes(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error("Error creating production type:", error);
        throw error;
      }
    },
    [fetchProductionTypes]
  );

  const updateProductionType = useCallback(
    async (id: string, formData: ProductionTypeFormData) => {
      try {
        const response = await api.put(
          `/api/v1/production/types/${id}`,
          formData
        );
        await fetchProductionTypes(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error("Error updating production type:", error);
        throw error;
      }
    },
    [fetchProductionTypes]
  );

  const deleteProductionType = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/v1/production/types/${id}`);
        await fetchProductionTypes(); // Refresh the list
      } catch (error) {
        console.error("Error deleting production type:", error);
        throw error;
      }
    },
    [fetchProductionTypes]
  );

  return {
    productionTypes,
    isLoading,
    createProductionType,
    updateProductionType,
    deleteProductionType,
    fetchProductionTypes,
  };
};
