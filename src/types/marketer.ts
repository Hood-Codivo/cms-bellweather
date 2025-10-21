export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface MarketerData {
  id: string;
  userId: string;
  name: string;
  email: string;
  employeeId: string;
  commissionRate: number;
  department: string;
  position: string;
  performance: any;
  user: UserData;
}

export interface UseMarketingDataReturn {
  dashboardData: any;
  performanceData: any[];
  rankings: any[];
  userStaffData: MarketerData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (filters: Record<string, any>) => Promise<void>;
  fetchPerformanceMetrics: (dateRange: {
    from: string;
    to: string;
  }) => Promise<any>;
  fetchProductSales: (dateRange: { from: string; to: string }) => Promise<any>;
  fetchCommissions: (dateRange: { from: string; to: string }) => Promise<any>;
  fetchRankings: (dateRange: { from: string; to: string }) => Promise<any>;
  clearError: () => void;
}
