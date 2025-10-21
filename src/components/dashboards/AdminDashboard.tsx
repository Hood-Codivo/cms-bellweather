import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingCart,
  Package,
  BarChart2,
  TrendingUp,
  DollarSign,
  Award,
  Star,
  RefreshCw,
} from "lucide-react";
import { useAllMarketersData } from "@/hooks/useMarketer";
import { marketingUtils } from "@/hooks/useMarketer";
import { Button } from "@/components/ui/button";

type PerformanceData = {
  id: string;
  name: string;
  department: string;
  totalSales: number;
  totalCommission: number;
  totalOrders: number;
  conversionRate: number;
  rank: number;
};

const formatCurrency = marketingUtils.formatCurrency;
const formatPercent = marketingUtils.formatPercent;

export function AdminDashboard() {
  const { isLoading, error, fetchMarketers, fetchAllMarketersPerformance } =
    useAllMarketersData();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchMarketers();
        const performance = await fetchAllMarketersPerformance({
          from: dateRange.from,
          to: dateRange.to,
        });

        // Transform the data to match our PerformanceData type
        const formattedData = Array.isArray(performance)
          ? performance.map((marketer: any, index: number) => ({
              id: marketer.marketerId || marketer.id || `marketer-${index}`,
              name:
                marketer.name ||
                `${marketer.user?.firstName || ""} ${
                  marketer.user?.lastName || ""
                }`.trim() ||
                marketer.employeeId ||
                "Unknown",
              department: marketer.department || "marketing",
              totalSales: marketer.totalSalesAmount || marketer.totalSales || 0,
              totalCommission: marketer.totalCommission || 0,
              totalOrders: marketer.orderCount || marketer.totalOrders || 0,
              conversionRate: marketer.conversionRate || 0,
              rank: index + 1,
            }))
          : [];

        setPerformanceData(formattedData);
      } catch (error) {
        console.error("Error loading marketing data:", error);
        setPerformanceData([]);
      }
    };

    loadData();
  }, [dateRange]);

  const totalSales = performanceData.reduce(
    (sum, marketer) => sum + marketer.totalSales,
    0
  );
  const totalCommission = performanceData.reduce(
    (sum, marketer) => sum + marketer.totalCommission,
    0
  );
  const totalOrders = performanceData.reduce(
    (sum, marketer) => sum + marketer.totalOrders,
    0
  );
  const avgConversionRate =
    performanceData.length > 0
      ? performanceData.reduce(
          (sum, marketer) => sum + marketer.conversionRate,
          0
        ) / performanceData.length
      : 0;

  const handleRefresh = () => {
    fetchMarketers();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasMarketingAccess =
    performanceData.length > 0 ||
    (error && (error.includes("403") || error.includes("401")));

  if (error && !hasMarketingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor marketer and sales team performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="border rounded p-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="border rounded p-1 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {!hasMarketingAccess && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have permission to view marketing data. Please contact
                an administrator if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasMarketingAccess ? "Total Sales" : "Access Restricted"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasMarketingAccess ? formatCurrency(totalSales) : "—"}
            </div>
            {hasMarketingAccess && (
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Team Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData.length}{" "}
              {performanceData.length === 1 ? "team member" : "team members"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commissions
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCommission)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(avgConversionRate)} avg conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Across all marketers and sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                performanceData.filter((m) => m.department === "marketing")
                  .length
              }{" "}
              marketers,{" "}
              {performanceData.filter((m) => m.department === "sales").length}{" "}
              sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>
            Performance metrics for all marketers and sales team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.map((marketer) => (
                  <tr key={marketer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {marketer.rank <= 3 ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            marketer.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : marketer.rank === 2
                              ? "bg-gray-100 text-gray-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {marketer.rank === 1
                            ? "🥇"
                            : marketer.rank === 2
                            ? "🥈"
                            : "🥉"}{" "}
                          {marketer.rank}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {marketer.rank}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {marketer.name
                            ? marketer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {marketer.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {marketer.department || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          marketer.department === "marketing"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {marketer.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(marketer.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(marketer.totalCommission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {marketer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          marketer.conversionRate >= 50
                            ? "text-green-600"
                            : marketer.conversionRate >= 30
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercent(marketer.conversionRate / 100)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Status
          </CardTitle>
          <CardDescription>Raw materials and finished goods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Steel Sheets</h4>
                <p className="text-sm text-muted-foreground">Raw Material</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">245 units</div>
                <Badge variant="secondary">Low Stock</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Electronic Components</h4>
                <p className="text-sm text-muted-foreground">Raw Material</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">1,230 units</div>
                <Badge variant="default">In Stock</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Finished Products</h4>
                <p className="text-sm text-muted-foreground">Ready to Ship</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">456 units</div>
                <Badge variant="default">Available</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
