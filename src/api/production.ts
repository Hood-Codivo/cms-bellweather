// src/api/production.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import { ProductionTypeInitialValues } from "@/types/production";

// Shape returned by GET /production
export interface ProductionLog {
  id: number;
  date: string; // ISO
  productType: string;
  unitsProduced: number;
  rawUsed: number;
  machine: string;
  operator: string;
}

// GET /production
export function useProductionLogs() {
  return useQuery<ProductionLog[], Error>({
    queryKey: ["productionLogs"],
    queryFn: () => api.get<ProductionLog[]>("/production").then((r) => r.data),
  });
}

// POST /production
export function useCreateProductionLog() {
  const qc = useQueryClient();
  return useMutation<
    ProductionLog,
    Error,
    {
      date?: string;
      productType: string;
      unitsProduced: number;
      rawUsed: number;
      machine: string;
      operator: string;
    }
  >({
    mutationFn: (data) =>
      api.post<ProductionLog>("/production", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productionLogs"] });
    },
  });
}

// GET /api/v1/production/types/:id/initial-values
export function useProductionTypeInitialValues(
  productionTypeId: string | null
) {
  return useQuery<ProductionTypeInitialValues, Error>({
    queryKey: ["productionTypeInitialValues", productionTypeId],
    queryFn: () =>
      api
        .get<ProductionTypeInitialValues>(
          `/api/v1/production/types/${productionTypeId}/initial-values`
        )
        .then((r) => r.data),
    enabled: !!productionTypeId,
  });
}
