import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { RolePermissions } from "@/types/auth";

export function usePermissions(): RolePermissions {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canManageStaff: false,
        canManagePayroll: false,
        canViewFinancials: false,
        canManageProduction: false,
        canManageSales: false,
        canManageMarketing: false,
        canManageExpenses: false,
        canViewAllData: false,
        canManageCustomers: false,
      };
    }

    switch (user.role) {
      case "super_admin":
        return {
          canManageStaff: true,
          canManagePayroll: true,
          canViewFinancials: true,
          canManageProduction: true,
          canManageSales: true,
          canManageMarketing: true,
          canManageExpenses: true,
          canViewAllData: true,
          canManageCustomers: true,
        };

      case "admin":
        return {
          canManageStaff: false,
          canManagePayroll: false,
          canViewFinancials: false,
          canManageProduction: true,
          canManageSales: false,
          canManageMarketing: false,
          canManageExpenses: true,
          canViewAllData: false,
          canManageCustomers: true,
        };

      case "sales":
        return {
          canManageStaff: false,
          canManagePayroll: false,
          canViewFinancials: false,
          canManageProduction: false,
          canManageSales: true,
          canManageMarketing: false,
          canManageExpenses: false,
          canViewAllData: false,
          canManageCustomers: false,
        };

      case "marketer":
        return {
          canManageStaff: false,
          canManagePayroll: false,
          canViewFinancials: false,
          canManageProduction: false,
          canManageSales: false,
          canManageMarketing: true,
          canManageExpenses: false,
          canViewAllData: false,
          canManageCustomers: false,
        };

      case "finance_manager":
        return {
          canManageStaff: false,
          canManagePayroll: true,
          canViewFinancials: true,
          canManageProduction: false,
          canManageSales: false,
          canManageMarketing: false,
          canManageExpenses: true,
          canViewAllData: true,
          canManageCustomers: false,
        };

      default:
        return {
          canManageStaff: false,
          canManagePayroll: false,
          canViewFinancials: false,
          canManageProduction: false,
          canManageSales: false,
          canManageMarketing: false,
          canManageExpenses: false,
          canViewAllData: false,
          canManageCustomers: false,
        };
    }
  }, [user]);
}
