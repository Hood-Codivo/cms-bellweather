// src/api/inventory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

export interface InventoryItemDetail {
  id: number;
  rawMaterialId: number;
  quantity: number;
  reorderLevel: number;
  rawMaterial: { id: number; name: string; unit: string };
}

// GET /inventory/:id
export function useInventoryItem(id: string | number) {
  return useQuery<InventoryItemDetail, Error>({
    queryKey: ["inventoryItem", id],
    queryFn: () =>
      api.get<InventoryItemDetail>(`/inventory/${id}`).then((r) => r.data),
    enabled: !!id && id !== "new",
  });
}

// POST /inventory
export function useCreateOrUpdateInventory() {
  const qc = useQueryClient();
  return useMutation<
    InventoryItemDetail,
    Error,
    { rawMaterialId: number; quantity: number; reorderLevel: number }
  >({
    mutationFn: (data) =>
      api.post<InventoryItemDetail>("/inventory", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// PUT /inventory/:id
export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation<
    InventoryItemDetail,
    Error,
    { id: number; quantity: number; reorderLevel: number }
  >({
    mutationFn: ({ id, quantity, reorderLevel }) =>
      api
        .put<InventoryItemDetail>(`/inventory/${id}`, {
          quantity,
          reorderLevel,
        })
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventoryItem", vars.id] });
    },
  });
}

// DELETE /inventory/:id
export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/inventory/${id}`).then(() => {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// GET /inventory (all)
export interface InventoryListItem {
  id: number;
  rawMaterialId: number;
  quantity: number;
  reorderLevel: number;
  rawMaterial: { id: number; name: string; unit: string };
  purchases?: {
    supplier: string;
    id: number;
    date: string;
    quantity: number;
    cost: number;
  }[];
}

export function useInventoryList() {
  return useQuery<InventoryListItem[], Error>({
    queryKey: ["inventory"],
    queryFn: () =>
      api.get<InventoryListItem[]>("/inventory").then((r) => r.data),
  });
}

// POST /reorders
export function useCreateReorder() {
  const qc = useQueryClient();
  return useMutation<
    any,
    Error,
    {
      inventoryId: number;
      quantity: number;
      estimatedCost: number;
      supplier?: string;
      notes?: string;
    }
  >({
    mutationFn: (data) => api.post("/reorders", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
