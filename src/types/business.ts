import { UserRole } from "./auth";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  salary: number;
  commissionRate?: number;
  hireDate: string;
  status: "active" | "inactive";
  avatar?: string;
  phoneNumber?: string;
  address?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  commission: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  payPeriod: string;
  payDate: string;
  status: "pending" | "paid" | "cancelled";
}

export interface Commission {
  id: string;
  marketerId: string;
  marketerName: string;
  saleId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  dateEarned: string;
  status: "pending" | "paid";
}

export interface SalesRecord {
  id: string;
  salespersonId: string;
  salespersonName: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionAmount: number;
  saleDate: string;
}

export interface ProductionMetric {
  id: string;
  productName: string;
  targetQuantity: number;
  actualQuantity: number;
  efficiency: number;
  date: string;
  machineHours: number;
  materialUsed: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  stockQuantity: number;
}

export interface ProductionType {
  id: string;
  name: string;
  baseMaterial: string;
  baseUnit: string;
  rawMaterialsRequired: {
    materialId: string;
    materialName: string;
    quantityPerUnit: number;
  }[];
}

export interface ProductionLog {
  id: string;
  date: string;
  productionType: ProductionType;
  baseMaterial: string;
  quantity: number;
  unitsProduced: number;
  machine: string;
  operator: string;
  shift: "morning" | "afternoon" | "night";
  rawMaterialsUsed: {
    materialId: string;
    materialName: string;
    quantityUsed: number;
    unit: string;
    cost: number;
  }[];
  totalCost: number;
  notes?: string;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Base creator interface
export interface Creator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Sales-specific types
export interface SalesRecordDetailed {
  customerPhone: string;
  id: string;
  salesPersonId: string;
  customerId: string;
  productionTypeId: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  commissionRate: string;
  commissionAmount: string;
  saleDate: string;
  deliveryLocation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  salesPerson: SalesPerson;
  productionType: ProductionType;
  createdBy: Creator;
  updatedBy?: Creator;
}

export interface SalesPerson {
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive";
}

export interface ProductType {
  unitPrice: number;
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  description?: string;
}

export interface Marketer {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionRate: number;
  department: string;
  status: "active" | "inactive";
}

// Expense type for tracking extra expenses
export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdById: string;
  approvedById?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ExpenseFormData {
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string;
}

// Fixed ExpenseSummary interface - replace the existing one in your types file
export interface ExpenseSummary {
  total: number; // This should be a number, not a function
  byCategory: Array<{
    _sum: {
      amount: string;
    };
    category: string;
  }>;
}

// Alternative: If you want to keep the old structure AND the new one, you can have:
export interface ExpenseSummaryOld {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  byCategory: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

// And the new API structure:
export interface ExpenseSummaryNew {
  total: number;
  byCategory: Array<{
    _sum: {
      amount: string;
    };
    category: string;
  }>;
}

export interface ExpenseFilters {
  status?: "pending" | "approved" | "rejected";
  category?: string;
  from?: string;
  to?: string;
}

// Use ExpenseSummaryNew as your main type for the API response
// export type ExpenseSummary = ExpenseSummaryNew;
