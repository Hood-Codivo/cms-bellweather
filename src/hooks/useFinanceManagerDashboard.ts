import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

export interface FinanceManagerDashboardData {
  overview: {
    metrics: {
      totalRevenue: number;
      totalExpenses: number;
      totalPayroll: number;
      totalCommissions: number;
      netProfit: number;
      profitMargin: number;
      expenseRatio: number;
      payrollRatio: number;
      totalSales: number;
      totalTransactions: number;
      averageTransactionValue: number;
    };
    period: {
      from: string;
      to: string;
    };
  };
  expenses: {
    summary: {
      total: number;
      byStatus: {
        pending: { count: number; total: number };
        approved: { count: number; total: number };
        rejected: { count: number; total: number };
      };
    };
    pending: any[];
    byCategory: any[];
  };
  payroll: {
    summary: {
      total: number;
      netPay: number;
      baseSalary: number;
      commissions: number;
      count: number;
      byStatus: {
        draft: { count: number; totalGross: number; totalNet: number };
        approved: { count: number; totalGross: number; totalNet: number };
        paid: { count: number; totalGross: number; totalNet: number };
      };
    };
    recent: any[];
  };
  sales: {
    summary: {
      totalRevenue: number;
      totalCommissions: number;
      totalQuantity: number;
      totalSales: number;
    };
    monthly: any[];
    topProducts: any[];
    topMarketers: any[];
  };
  transactions: {
    recent: any[];
  };
}

export function useFinanceManagerDashboard(from?: string, to?: string) {
  const [data, setData] = useState<FinanceManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (startDate?: string, endDate?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.append("from", startDate);
        if (endDate) params.append("to", endDate);

        const url = `/api/v1/finance-manager/dashboard${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await api.get(url);
        setData(response.data);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch dashboard data";
        setError(errorMessage);
        console.error("Error fetching finance manager dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboard(from, to);
  }, [fetchDashboard, from, to]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchDashboard(from, to),
  };
}
