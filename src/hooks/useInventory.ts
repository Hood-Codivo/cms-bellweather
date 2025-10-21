import { useState, useCallback, useMemo, useEffect } from "react";
import {
  InventoryItem,
  InventoryFormData,
  InventoryFilter,
} from "@/types/inventory";
import api from "@/api/axios";

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<InventoryFilter>({
    search: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get("/api/v1/inventory")
      .then((res) => {
        // Convert costPerUnit to number for each item
        const data = (res.data || []).map((item: any) => ({
          ...item,
          costPerUnit: Number(item.costPerUnit),
        }));
        setItems(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map((item) => item.category))];
    return uniqueCategories.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(filter.search.toLowerCase());
      const matchesCategory =
        !filter.category || item.category === filter.category;
      return matchesSearch && matchesCategory;
    });
  }, [items, filter]);

  const addItem = useCallback(async (formData: InventoryFormData) => {
    await api.post("/api/v1/inventory", formData);
  }, []);

  const updateItem = useCallback(
    async (id: string, formData: InventoryFormData) => {
      try {
        await api.put(`/api/v1/inventory/${id}`, formData);

        // Update local state after successful API call
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, ...formData, lastUpdated: new Date().toISOString() }
              : item
          )
        );
      } catch (error) {
        console.error("Error updating inventory item:", error);
        throw error;
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/v1/inventory/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }
  }, []);

  const getItemById = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    items: filteredItems,
    allItems: items,
    filter,
    setFilter,
    categories,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    isLoading,
  };
};
