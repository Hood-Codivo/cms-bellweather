import { useState, useCallback, useEffect } from "react";
import { RawMaterial, RawMaterialFormData } from "@/types/production";
import api from "@/api/axios";

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const fetchRawMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/production/raw-materials");
      const data = (response.data || []).map((item: any) => ({
        ...item,
        costPerUnit: Number(item.costPerUnit),
      }));
      setRawMaterials(data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMaterialById = useCallback(async (materialId: string) => {
    try {
      const response = await api.get(`/api/v1/inventory/${materialId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching material by ID:", error);
      return null;
    }
  }, []);

  const addRawMaterial = useCallback(
    async (formData: RawMaterialFormData) => {
      try {
        await api.post("/api/v1/production/raw-materials", formData);
        await fetchRawMaterials(); // Refresh the list
      } catch (error) {
        console.error("Error adding raw material:", error);
        throw error;
      }
    },
    [fetchRawMaterials]
  );

  const updateRawMaterial = useCallback(
    async (id: string, formData: RawMaterialFormData) => {
      try {
        await api.put(`/api/v1/production/raw-materials/${id}`, formData);
        await fetchRawMaterials(); // Refresh the list
      } catch (error) {
        console.error("Error updating raw material:", error);
        throw error;
      }
    },
    [fetchRawMaterials]
  );

  const deleteRawMaterial = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/v1/production/raw-materials/${id}`);
        await fetchRawMaterials(); // Refresh the list
      } catch (error) {
        console.error("Error deleting raw material:", error);
        throw error;
      }
    },
    [fetchRawMaterials]
  );

  return {
    rawMaterials,
    isLoading,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    fetchRawMaterials,
    getMaterialById,
  };
};
