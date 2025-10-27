import { useState, useCallback } from "react";
import api from "@/api/axios";

// Updated interfaces to match API responses
export interface FinancialOverview {
  inventoryValuation: null;
  period: {
    from: string;
    to: string;
  };
  sales: {
    total: number;
    count: number;
  };
  expenses: {
    inventoryTotal: null;
    total: number;
    count: number;
  };
  payroll: {
    total: number;
    count: number;
  };
  commissions: number;
  profit: {
    gross: number;
    net: number;
  };
}

export interface ExpenseBreakdownItem {
  amount: number;
  category: string;
  total: number;
}

export interface MonthlySummaryItem {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecordFilters {
  type?: string;
  category?: string;
  from?: string;
  to?: string;
}

export interface CreateFinancialRecordRequest {
  date: string;
  type: "Revenue" | "Expense";
  amount: number;
  category?: string;
  description?: string;
}

export interface UpdateFinancialRecordRequest {
  date?: string;
  type?: "Revenue" | "Expense";
  amount?: number;
  category?: string;
  description?: string;
}

export interface SalesSummaryItem {
  period: string;
  totalSales: number;
  salesCount: number;
  averageOrderValue: number;
}

export interface ExpenseSummaryResponse {
  inventoryTotal: number;
  breakdown: any;
  regularExpensesTotal: number;
  total: number;
  period: string;
  totalExpenses: number;
  items: ExpenseBreakdownItem[];
}

export interface ProfitLossStatement {
  period: {
    from: string;
    to: string;
  };
  revenue: number;
  expenses: {
    byCategory: Record<string, number>;
    total: number;
  };
  payroll: {
    baseSalary: number;
    commissions: number;
    overtime: number;
    deductions: number;
    taxes: number;
    total: number;
  };
  salesCommissions: number;
  profit: {
    gross: number;
    operating: number;
    net: number;
  };
}

export interface CashFlowStatement {
  period: string;
  inflows: number;
  outflows: {
    expenses: number;
    payroll: number;
    total: number;
  };
  netCashFlow: number;
  runningBalance: number;
}

export function useFinancialRecords() {
  const [financialOverview, setFinancialOverview] =
    useState<FinancialOverview | null>(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState<
    ExpenseBreakdownItem[]
  >([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryItem[]>(
    []
  );
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummaryItem[]>([]);
  const [expenseSummary, setExpenseSummary] =
    useState<ExpenseSummaryResponse | null>(null);
  const [profitLossStatement, setProfitLossStatement] =
    useState<ProfitLossStatement | null>(null);
  const [cashFlowStatement, setCashFlowStatement] =
    useState<CashFlowStatement | null>(null);

  const fetchWithRetry = async <T>(
    requestFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        if (attempt > 1) {
          console.log(`Request succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Only wait if there are more retries left
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  };

  const fetchFinancialOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching financial overview...");

    try {
      const response = await fetchWithRetry(() =>
        api.get("/api/v1/financial/overview")
      );

      console.log("Financial overview response:", response.data);
      setFinancialOverview(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch financial overview";

      console.error("Error in fetchFinancialOverview:", {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpenseBreakdown = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/financial/expense-summary");

      // Transform to match ExpenseBreakdownItem[]
      const breakdown = Object.entries(
        response.data.data[0]?.categories || {}
      ).map(([category, total]) => ({ category, total: Number(total) }));

      setExpenseBreakdown(breakdown as ExpenseBreakdownItem[]);
    } catch (err: any) {
      setError("Failed to fetch expense breakdown");
      console.error("Error fetching expense breakdown:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMonthlySummary = useCallback(
    async (filters?: { from?: string; to?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append("from", filters.from);
        if (filters?.to) params.append("to", filters.to);

        const response = await api.get(
          `/api/v1/financial/records/monthly-summary?${params.toString()}`
        );

        // Get the year from the response
        const year = response.data.year;

        // Transform the data
        // Transform the data - note: year is at response.data.year, not in each item
        const monthlyData = response.data.data.map((item: any) => ({
          period: `${year}-${item.month.toString().padStart(2, "0")}`,
          revenue: item.revenue,
          expenses: item.expenses,
          profit: item.profit,
        }));

        setMonthlySummary(monthlyData);
        console.log(monthlyData);
      } catch (err: any) {
        setError("Failed to fetch monthly summary");
        console.error("Error fetching monthly summary:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchRecords = useCallback(async (filters?: FinancialRecordFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.from) params.append("from", filters.from);
      if (filters?.to) params.append("to", filters.to);

      const response = await api.get(
        `/api/v1/financial/records?${params.toString()}`
      );

      setRecords(response.data.records || []);
    } catch (err: any) {
      setError("Failed to fetch financial records");
      console.error("Error fetching records:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRecord = useCallback(
    async (data: CreateFinancialRecordRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post("/api/v1/financial/records", data);
        await Promise.all([
          fetchFinancialOverview(),
          fetchExpenseBreakdown(),
          fetchRecords(),
        ]);
        return response.data;
      } catch (err: any) {
        setError("Failed to create financial record");
        console.error("Error creating record:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFinancialOverview, fetchExpenseBreakdown, fetchRecords]
  );

  const updateRecord = useCallback(
    async (id: string, data: UpdateFinancialRecordRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.put(`/api/v1/financial/records/${id}`, data);
        await Promise.all([
          fetchFinancialOverview(),
          fetchExpenseBreakdown(),
          fetchRecords(),
        ]);
        return response.data;
      } catch (err: any) {
        setError("Failed to update financial record");
        console.error("Error updating record:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFinancialOverview, fetchExpenseBreakdown, fetchRecords]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/api/v1/financial/records/${id}`);
        await Promise.all([
          fetchFinancialOverview(),
          fetchExpenseBreakdown(),
          fetchRecords(),
        ]);
      } catch (err: any) {
        setError("Failed to delete financial record");
        console.error("Error deleting record:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFinancialOverview, fetchExpenseBreakdown, fetchRecords]
  );

  const getRecord = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/financial/records/${id}`);
      return response.data;
    } catch (err: any) {
      setError("Failed to fetch financial record");
      console.error("Error fetching record:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSalesSummary = useCallback(
    async (filters?: { period?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.period) params.append("period", filters.period);

        const response = await api.get(
          `/api/v1/financial/sales-summary?${params.toString()}`
        );
        setSalesSummary(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError("Failed to fetch sales summary");
        console.error("Error fetching sales summary:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchExpenseSummary = useCallback(
    async (filters?: { period?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.period) params.append("period", filters.period);

        const response = await api.get(
          `/api/v1/financial/expense-summary?${params.toString()}`
        );

        // Transform the data
        if (response.data.data && response.data.data.length > 0) {
          const firstItem = response.data.data[0];
          const transformedData = {
            period: firstItem.period,
            totalExpenses: firstItem.totalExpenses,
            items: Object.entries(firstItem.categories || {}).map(
              ([category, amount]) => ({
                category,
                amount: Number(amount),
                percentage: (Number(amount) / firstItem.totalExpenses) * 100,
              })
            ),
          };
          setExpenseSummary(transformedData as any);
        } else {
          setExpenseSummary(null);
        }
      } catch (err: any) {
        setError("Failed to fetch expense summary");
        console.error("Error fetching expense summary:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchProfitLossStatement = useCallback(
    async (filters?: { period?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.period) params.append("period", filters.period);

        const response = await api.get(
          `/api/v1/financial/profit-loss?${params.toString()}`
        );
        setProfitLossStatement(response.data);
      } catch (err: any) {
        setError("Failed to fetch profit and loss statement");
        console.error("Error fetching profit and loss statement:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchCashFlowStatement = useCallback(
    async (filters?: { period?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.period) params.append("period", filters.period);

        const response = await api.get(
          `/api/v1/financial/cash-flow?${params.toString()}`
        );

        // Handle array response
        const data =
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : response.data;

        setCashFlowStatement(data);
      } catch (err: any) {
        setError("Failed to fetch cash flow statement");
        console.error("Error fetching cash flow statement:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    // Data
    financialOverview,
    expenseBreakdown,
    monthlySummary,
    records,
    isLoading,
    error,
    salesSummary,
    expenseSummary,
    profitLossStatement,
    cashFlowStatement,

    // Fetch methods
    fetchFinancialOverview,
    fetchExpenseBreakdown,
    fetchMonthlySummary,
    fetchRecords,
    fetchSalesSummary,
    fetchExpenseSummary,
    fetchProfitLossStatement,
    fetchCashFlowStatement,

    // CRUD methods
    createRecord,
    updateRecord,
    deleteRecord,
    getRecord,
  };
}
