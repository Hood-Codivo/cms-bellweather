import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingCart,
  Megaphone,
  Factory,
  Package,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Shield,
  BarChart3,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: null },
  {
    name: "Staff Management",
    href: "/staff",
    icon: Users,
    permission: "canManageStaff" as const,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    permission: "canManageCustomers" as const,
  },
  {
    name: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    permission: "canManagePayroll" as const,
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    permission: "canManageSales" as const,
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    permission: "canManageMarketing" as const,
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
    permission: "canManageProduction" as const,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    permission: "canManageProduction" as const,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    permission: "canManageExpenses" as const,
  },
  // For super_admin and finance_manager
  {
    name: "Financial Management",
    href: "/financial-management",
    icon: DollarSign,
    permission: "canViewFinancials" as const,
  },
  {
    name: "Analytics & Reporting",
    href: "/analytics-reporting",
    icon: BarChart3,
    permission: "canViewAllData" as const,
  },
];

export function Sidebar() {
  const { user, logout, switchRole } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "sales":
        return "bg-green-100 text-green-800";
      case "marketer":
        return "bg-orange-100 text-orange-800";
      case "finance_manager":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredNavigation = navigationItems.filter(
    (item) => !item.permission || permissions[item.permission]
  );

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 flex justify-center">
        <img
          src="/images/BELLWETHER logo.png"
          alt="Bellwether Logo"
          className="h-12 object-contain"
        />
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {(user?.name || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar> */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{user?.name || "User"}</h3>
            <Badge className={`text-xs ${getRoleColor(user?.role || "")}`}>
              {(user?.role || "").replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Role Switcher for Super Admin
        {user.role === "super_admin" && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Switch View:</p>
            <div className="flex flex-wrap gap-1">
              {["super_admin", "admin", "sales", "marketer"].map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => switchRole(role as any)}
                  className="text-xs h-6"
                >
                  {role.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        )} */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* <NavLink
          to="/settings"
          className={({ isActive }) => `w-full ${isActive ? 'bg-accent' : ''}`}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </NavLink> */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-red-600 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
