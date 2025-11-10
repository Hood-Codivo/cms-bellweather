import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { SuperAdminDashboard } from "./dashboards/SuperAdminDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { SalesDashboard } from "./dashboards/SalesDashboard";
import MarketerDashboard from "./dashboards/MarketerDashboard";
import { FinanceManagerDashboard } from "./dashboards/FinanceManagerDashboard";

export function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "sales":
      return <SalesDashboard />;
    case "marketer":
      return <MarketerDashboard />;
    case "finance_manager":
      return <FinanceManagerDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
}
