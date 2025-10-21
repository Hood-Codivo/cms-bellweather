// First, update your ExpenseSummary type in @/types/business
// Remove local ExpenseSummary declaration to avoid import conflict.

// Updated useExpense hook
import { useState, useCallback, useEffect } from "react";
import api from "@/api/axios";
import {
  Expense,
  ExpenseFormData,
  ExpenseSummary,
  ExpenseFilters,
} from "@/types/business";

export function useExpense() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  const fetchExpenses = useCallback(async (filters?: ExpenseFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.from) params.append("from", filters.from);
      if (filters?.to) params.append("to", filters.to);

      const response = await api.get(`/api/v1/expense?${params.toString()}`);
      const raw = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setExpenses(raw);
    } catch (err: any) {
      setError("Failed to fetch expenses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpenseById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/expense/${id}`);
      return response.data;
    } catch (err: any) {
      setError("Failed to fetch expense");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExpense = useCallback(
    async (data: ExpenseFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post("/api/v1/expense", data);
        await fetchExpenses();
        return response.data;
      } catch (err: any) {
        setError("Failed to create expense");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, data: Partial<ExpenseFormData>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.put(`/api/v1/expense/${id}`, data);
        await fetchExpenses();
        return response.data;
      } catch (err: any) {
        setError("Failed to update expense");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/api/v1/expense/${id}`);
        await fetchExpenses();
      } catch (err: any) {
        setError("Failed to delete expense");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const approveExpense = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post(`/api/v1/expense/${id}/approve`);
        await fetchExpenses();
        return response.data;
      } catch (err: any) {
        setError("Failed to approve expense");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const rejectExpense = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post(`/api/v1/expense/${id}/reject`);
        await fetchExpenses();
        return response.data;
      } catch (err: any) {
        setError("Failed to reject expense");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const fetchExpenseSummary = useCallback(
    async (from?: string, to?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);

        const response = await api.get(
          `/api/v1/expense/reports/summary?${params.toString()}`
        );

        // The API returns: { total: 110000, byCategory: [...] }
        setSummary(response.data);
      } catch (err: any) {
        setError("Failed to fetch expense summary");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
  }, [fetchExpenses, fetchExpenseSummary]);

  return {
    expenses,
    summary, // This now contains { total: number, byCategory: [...] }
    isLoading,
    error,
    fetchExpenses,
    fetchExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    fetchExpenseSummary,
  };
}
