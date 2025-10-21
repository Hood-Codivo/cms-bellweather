// src/api/rawMaterials.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

// Shape matches GET /raw-materials
export interface RawMaterial {
  category: string;
  id: number;
  name: string;
  unit: string;
}

// GET /raw-materials
export function useRawMaterials() {
  return useQuery<RawMaterial[], Error>({
    queryKey: ["rawMaterials"],
    queryFn: () => api.get<RawMaterial[]>("/raw-materials").then((r) => r.data),
  });
}

// GET /raw-materials/:id
export function useRawMaterialItem(id: string | number) {
  return useQuery<RawMaterial, Error>({
    queryKey: ["rawMaterial", id],
    queryFn: () =>
      api.get<RawMaterial>(`/raw-materials/${id}`).then((r) => r.data),
    enabled: !!id && id !== "new",
  });
}
export function useCreateRawMaterial() {
  const qc = useQueryClient();
  return useMutation<RawMaterial, Error, { name: string; unit?: string }>({
    mutationFn: (data) =>
      api.post<RawMaterial>("/raw-materials", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
    },
  });
}

// PUT /raw-materials/:id
export function useUpdateRawMaterial() {
  const qc = useQueryClient();
  return useMutation<
    RawMaterial,
    Error,
    { id: number; name: string; unit: string }
  >({
    mutationFn: ({ id, name, unit }) =>
      api
        .put<RawMaterial>(`/raw-materials/${id}`, { name, unit })
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      qc.invalidateQueries({ queryKey: ["rawMaterial", vars.id] });
    },
  });
}

// DELETE /raw-materials/:id
export function useDeleteRawMaterial() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/raw-materials/${id}`).then(() => {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
    },
  });
}
