export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  salary?: number;
  commissionRate?: number;
  hireDate: string;
  status: "active" | "inactive";
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = "super_admin" | "admin" | "sales" | "marketer";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

export interface RolePermissions {
  canManageStaff: boolean;
  canManagePayroll: boolean;
  canViewFinancials: boolean;
  canManageProduction: boolean;
  canManageSales: boolean;
  canManageMarketing: boolean;
  canManageExpenses: boolean;
  canViewAllData: boolean;
  canManageCustomers: boolean;
}
