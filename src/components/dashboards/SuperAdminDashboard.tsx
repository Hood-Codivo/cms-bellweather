import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Building,
  Target,
  RefreshCw,
  Package,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import { useStaff } from "@/hooks/useStaff";
import { useSales } from "@/hooks/useSales";
import { useInventory } from "@/hooks/useInventory";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";
import { useAllMarketersData } from "@/hooks/useMarketer";
import { useProductionLogs } from "@/hooks/useProductionLogs";
import { useProductionTypes } from "@/hooks/useProductionTypes";

export function SuperAdminDashboard() {
  const { staff, fetchStaff, isLoading: staffLoading } = useStaff();
  const { sales, isLoading: salesLoading } = useSales();
  const { allItems, isLoading: inventoryLoading } = useInventory();
  const {
    financialOverview,
    fetchFinancialOverview,
    isLoading: financialLoading,
  } = useFinancialRecords();
  const { fetchAllMarketersPerformance } = useAllMarketersData();
  const { productionLogs = [], isLoading: productionLogsLoading } =
    useProductionLogs();
  const { productionTypes, isLoading: productionTypesLoading } =
    useProductionTypes();

  const getProductionTypeName = (productionTypeId: string) => {
    const productionType = productionTypes.find(
      (pt) => pt.id === productionTypeId
    );
    return productionType?.name || "Unknown Product";
  };

  const [marketingData, setMarketingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchStaff(),
          fetchFinancialOverview(),
          loadMarketingData(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadMarketingData = async () => {
    try {
      const dateRange = {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        to: new Date().toISOString().split("T")[0],
      };
      const data = await fetchAllMarketersPerformance(dateRange);
      setMarketingData(data || []);
    } catch (error) {
      console.error("Error loading marketing data:", error);
      setMarketingData([]);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStaff(),
        fetchFinancialOverview(),
        loadMarketingData(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics from real data
  const totalStaff = staff.length;
  const activeStaff = staff.filter((member) => member.isActive).length;

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + parseFloat(sale.totalAmount || "0"),
    0
  );
  const totalSalesCount = sales.length;

  // Calculate total production by product type
  const productionByType = productionLogs.reduce<Record<string, number>>(
    (acc, log) => {
      const type = getProductionTypeName(log.productionTypeId);
      acc[type] = (acc[type] || 0) + (log.unitsProduced || 0);
      return acc;
    },
    {}
  );

  // Calculate sales by product type
  const salesByType = sales.reduce<Record<string, number>>((acc, sale) => {
    const type = getProductionTypeName(sale.productionTypeId);
    acc[type] = (acc[type] || 0) + (sale.quantity || 0);
    return acc;
  }, {});

  // Calculate net production (production - sales) by type
  const netProductionByType = Object.entries(productionByType).map(
    ([type, produced]) => {
      const sold = salesByType[type] || 0;
      return {
        type,
        totalProduced: produced,
        totalSold: sold,
        remaining: Math.max(0, produced - sold), // Ensure we don't go below 0
      };
    }
  );

  const totalInventoryValue = allItems.reduce(
    (sum, item) => sum + item.quantity * item.costPerUnit,
    0
  );
  const lowStockItems = allItems.filter(
    (item) => item.quantity < item.reorderLevel
  ).length;

  const totalMarketingCommissions = marketingData.reduce(
    (sum, marketer) => sum + (marketer.totalCommission || 0),
    0
  );

  // Calculate profit margin (simplified)
  const grossProfit = financialOverview?.profit?.gross || 0;
  const profitMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Department breakdown from staff data
  const departmentStats = staff.reduce((acc, member) => {
    const dept = member.department || "Other";
    if (!acc[dept]) {
      acc[dept] = { count: 0, active: 0 };
    }
    acc[dept].count++;
    if (member.isActive) acc[dept].active++;
    return acc;
  }, {} as Record<string, { count: number; active: number }>);

  const departmentData = Object.entries(departmentStats).map(
    ([name, stats]) => ({
      name,
      staff: stats.count,
      active: stats.active,
      performance:
        stats.count > 0 ? Math.round((stats.active / stats.count) * 100) : 0,
    })
  );

  if (
    isLoading ||
    staffLoading ||
    salesLoading ||
    inventoryLoading ||
    financialLoading ||
    productionTypesLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Super Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Complete system overview and management
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{activeStaff} active</span> •{" "}
              {totalStaff - activeStaff} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalSalesCount} sales transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lowStockItems > 0 && (
                <span className="text-red-600">
                  {lowStockItems} low stock items
                </span>
              )}
              {lowStockItems === 0 && (
                <span className="text-green-600">All items in stock</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Production vs Sales
              </CardTitle>
              <CardDescription>
                Current production and sales status by product type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {netProductionByType.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-4">
                    No production records available
                  </div>
                ) : (
                  netProductionByType.map(
                    ({ type, totalProduced, totalSold, remaining }) => (
                      <div
                        key={type}
                        className="bg-white border border-blue-100 rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-5 w-5 text-blue-500" />
                          <span className="font-semibold text-blue-700 text-base truncate">
                            {type}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Produced:
                            </span>
                            <span className="font-medium">
                              {totalProduced.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sold:</span>
                            <span className="text-amber-600 font-medium">
                              {totalSold.toLocaleString()}
                            </span>
                          </div>
                          <div className="pt-2 mt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Remaining:
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  remaining < totalProduced * 0.2
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {remaining.toLocaleString()}
                              </span>
                            </div>
                            {remaining < totalProduced * 0.2 && (
                              <div className="text-xs text-red-500 mt-1">
                                Low stock! Time to produce more.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Full width on mobile, 1/3 on desktop */}
        <div className="space-y-6">
          {/* Key Performance Indicators Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Key Metrics
              </CardTitle>
              <CardDescription>Business performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Total Sales</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {totalSalesCount}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Avg. Order Value</span>
                  </div>
                  <span className="font-semibold">
                    {totalSalesCount > 0
                      ? new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(totalRevenue / totalSalesCount)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Active Staff</span>
                  </div>
                  <span className="font-semibold">
                    <span className="text-green-600">{activeStaff}</span> /{" "}
                    {totalStaff}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Inventory Value</span>
                  </div>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(totalInventoryValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Inventory Status
              </CardTitle>
              <CardDescription>Current stock levels and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Total Items</span>
                  </div>
                  <span className="font-semibold">{allItems.length}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Low Stock Items</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      lowStockItems > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {lowStockItems}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Total Value</span>
                  </div>
                  <span className="font-semibold text-purple-600">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(totalInventoryValue)}
                  </span>
                </div>

                {lowStockItems > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {lowStockItems} item{lowStockItems > 1 ? "s" : ""} need
                        {lowStockItems === 1 ? "s" : ""} restocking
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
