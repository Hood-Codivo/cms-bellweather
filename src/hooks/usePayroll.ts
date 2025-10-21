import { useState, useCallback } from "react";
import api from "@/api/axios";

export interface PayrollStaffUser {
  role: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PayrollStaff {
  salary: number;
  commissionRate: number;
  id: string;
  employeeId: string;
  department: string;
  position: string;
  user: PayrollStaffUser;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary?: number;
  commissionAmount?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  deductions?: number;
  grossPay?: number;
  netPay?: number;
  taxDeductions?: number;
  status: string;
  processedById?: string;
  createdAt: string;
  updatedAt: string;
  staff: PayrollStaff;
  processedAt: string;
}

export interface PayrollFormData {
  staffId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary?: number;
  commissionAmount?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  deductions?: number;
}

const parsePayroll = (p: any) => ({
  ...p,
  baseSalary: p.baseSalary !== undefined ? Number(p.baseSalary) : undefined,
  commissionAmount:
    p.commissionAmount !== undefined ? Number(p.commissionAmount) : undefined,
  overtimeHours:
    p.overtimeHours !== undefined ? Number(p.overtimeHours) : undefined,
  overtimeRate:
    p.overtimeRate !== undefined ? Number(p.overtimeRate) : undefined,
  deductions: p.deductions !== undefined ? Number(p.deductions) : undefined,
  grossPay: p.grossPay !== undefined ? Number(p.grossPay) : undefined,
  netPay: p.netPay !== undefined ? Number(p.netPay) : undefined,
  taxDeductions:
    p.taxDeductions !== undefined ? Number(p.taxDeductions) : undefined,
});

export function usePayroll() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all payrolls
  const fetchPayrolls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/payroll");
      const raw = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setPayrolls(raw.map(parsePayroll));
    } catch (err: any) {
      setError("Failed to fetch payrolls");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single payroll by ID
  const fetchPayrollById = useCallback(
    async (id: string): Promise<PayrollRecord | null> => {
      if (!id) return null;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/v1/payroll/${id}`);
        if (response.data && response.data.data) {
          return parsePayroll(response.data.data);
        }
        return parsePayroll(response.data);
      } catch (err: any) {
        setError("Failed to fetch payroll record");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Create payroll
  const createPayroll = useCallback(
    async (data: PayrollFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.post("/api/v1/payroll", data);
        await fetchPayrolls();
      } catch (err: any) {
        setError("Failed to create payroll");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPayrolls]
  );

  // Update payroll
  const updatePayroll = useCallback(
    async (id: string, data: Partial<PayrollFormData>) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.put(`/api/v1/payroll/${id}`, data);
        await fetchPayrolls();
      } catch (err: any) {
        setError("Failed to update payroll");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPayrolls]
  );

  // Delete payroll
  const deletePayroll = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/api/v1/payroll/${id}`);
        await fetchPayrolls();
      } catch (err: any) {
        setError("Failed to delete payroll");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPayrolls]
  );

  return {
    payrolls,
    isLoading,
    error,
    fetchPayrolls,
    fetchPayrollById,
    createPayroll,
    updatePayroll,
    deletePayroll,
  };
}
