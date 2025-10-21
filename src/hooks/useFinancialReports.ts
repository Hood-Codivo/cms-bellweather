import { useState, useCallback } from "react";
import api from "@/api/axios";

export interface FinancialReport {
  id: string;
  type: "profit_loss" | "cash_flow" | "budget_vs_actual";
  period: string;
  data: any;
  createdAt: string;
}

export interface GenerateReportRequest {
  type: "profit_loss" | "cash_flow" | "budget_vs_actual";
  period: string;
  filters?: { from?: string; to?: string };
}

export function useFinancialReports() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/financial/reports");
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(
    async (body: GenerateReportRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post("/api/v1/financial/reports", body);
        // Optionally refetch reports after generating
        await fetchReports();
        return response.data;
      } catch (err: any) {
        setError("Failed to generate report");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchReports]
  );

  return { reports, isLoading, error, fetchReports, generateReport };
}
