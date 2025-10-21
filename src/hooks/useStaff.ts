import { useState, useCallback } from "react";
import api from "@/api/axios";

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: string;
  salary: string;
  commissionRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: StaffUser;
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all staff
  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/staff");
      setStaff(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err: any) {
      setError("Failed to fetch staff");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single staff by ID
  const fetchStaffById = useCallback(
    async (id: string): Promise<StaffMember | null> => {
      if (!id) return null;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/v1/staff/${id}`);
        // Some APIs return { data: {...} }, some just {...}
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return response.data;
      } catch (err: any) {
        setError("Failed to fetch staff member");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch single staff by Employee ID
  const fetchStaffByEmployeeId = useCallback(
    async (employeeId: string): Promise<StaffMember | null> => {
      if (!employeeId) return null;
      setIsLoading(true);
      setError(null);
      try {
        // First fetch all staff, then find the one with matching employeeId
        const response = await api.get("/api/v1/staff");
        const staffList = Array.isArray(response.data.data)
          ? response.data.data
          : response.data;
        const staff = staffList.find(
          (s: StaffMember) => s.employeeId === employeeId
        );
        return staff || null;
      } catch (err: any) {
        setError("Failed to fetch staff member");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Add staff
  const addStaff = useCallback(
    async (data: any) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.post("/api/v1/staff", data);
        await fetchStaff();
      } catch (err: any) {
        setError("Failed to add staff");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStaff]
  );

  // Edit staff
  const editStaff = useCallback(
    async (id: string, data: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.put(`/api/v1/staff/${id}`, data);
        console.log("Edit staff response:", response);
        await fetchStaff();
        console.log("Staff list after edit:", staff);
      } catch (err: any) {
        setError("Failed to update staff");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStaff, staff]
  );

  // Delete staff
  const deleteStaff = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/api/v1/staff/${id}`);
        await fetchStaff();
      } catch (err: any) {
        setError("Failed to delete staff");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStaff]
  );

  // Reset marketer salaries
  const resetMarketerSalaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/v1/staff/reset-salaries");

      // Check if the response is successful
      if (response.status === 200 || response.status === 201) {
        // Refresh staff data after successful reset
        await fetchStaff();
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to reset marketer salaries"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset marketer salaries";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStaff]);

  return {
    staff,
    isLoading,
    error,
    fetchStaff,
    fetchStaffById,
    fetchStaffByEmployeeId,
    addStaff,
    editStaff,
    deleteStaff,
    resetMarketerSalaries,
  };
}
