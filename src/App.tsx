import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardRouter } from "@/components/DashboardRouter";
import { StaffManagement } from "@/components/staff/StaffManagement";
import { PayrollManagement } from "@/components/payroll/PayrollManagement";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { SalesManagement } from "@/components/sales/SalesManagement";
import { ExpenseManagement } from "@/components/expense/ExpenseManagement";
import NotFound from "./pages/NotFound";
import MarketingManagement from "./components/marketing/MarketingManagement";
import EnhancedProductionManagement from "./components/production/EnhancedProductionManagement";
import FinancialManagement from "./components/financialManagement/FinancialManagement";
import AnalyticsReporting from "./components/analyticsReporting/AnalyticsReporting";
import { LoginForm } from "@/components/auth/LoginForm";
import { SettingsPage } from "@/pages/Settings";
import CustomerList from "@/components/customer/CustomerList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginForm />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardRouter />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredPermission="canManageStaff">
                  <DashboardLayout>
                    <StaffManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll"
              element={
                <ProtectedRoute requiredPermission="canManagePayroll">
                  <DashboardLayout>
                    <PayrollManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sales"
              element={
                <ProtectedRoute requiredPermission="canManageSales">
                  <DashboardLayout>
                    <SalesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketing"
              element={
                <ProtectedRoute requiredPermission="canManageMarketing">
                  <DashboardLayout>
                    <MarketingManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/production"
              element={
                <ProtectedRoute requiredPermission="canManageProduction">
                  <DashboardLayout>
                    <EnhancedProductionManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute requiredPermission="canManageProduction">
                  <DashboardLayout>
                    <InventoryManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute requiredPermission="canManageExpenses">
                  <DashboardLayout>
                    <ExpenseManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/financial-management"
              element={
                <ProtectedRoute requiredPermission="canViewFinancials">
                  <DashboardLayout>
                    <FinancialManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics-reporting"
              element={
                <ProtectedRoute requiredPermission="canViewAllData">
                  <DashboardLayout>
                    <AnalyticsReporting />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute requiredPermission="canManageCustomers">
                  <DashboardLayout>
                    <CustomerList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
