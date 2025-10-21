import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import {
  SalesRecordDetailed,
  ProductType,
  Marketer,
  Customer,
  Creator,
} from "@/types/business";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useSales } from "@/hooks/useSales";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount || 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value || 0);

export function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has sales access
    const hasAccess =
      user && ["admin", "super_admin", "sales", "marketer"].includes(user.role);
    if (!hasAccess) {
      toast.error("You do not have permission to access this page");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Don't render the dashboard if user doesn't have permission
  const hasAccess =
    user && ["admin", "super_admin", "sales", "marketer"].includes(user.role);
  if (!hasAccess) {
    return null;
  }

  const {
    sales,
    productTypes,
    marketers,
    isLoading,
    error,
    page: currentPage,
    pageSize,
    total,
    setPage: goToPage,
  } = useSales();

  const totalPages = Math.ceil((total || 0) / (pageSize || 10));
  const safeSalesData = sales || [];

  const refreshData = () => goToPage(currentPage);

  const clearError = () => {
    // Since setError isn't exposed, refresh to clear
    refreshData();
  };

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  if (isLoading && (!sales || sales.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading sales data...</span>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Sales Data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={refreshData} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Define the stats type
  interface SalesStats {
    totalSales: number;
    todaysSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProductType: string;
    recentSales: SalesRecordDetailed[];
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Filter to get only today's sales
  const todaysSales = (sales || []).filter((sale) => {
    const saleDate = new Date(sale.saleDate || sale.createdAt)
      .toISOString()
      .split("T")[0];
    return saleDate === today;
  });

  // Define the sales data type for the table with all required fields
  interface SalesTableData {
    id: string;
    customerName: string;
    productType: string;
    quantity: number;
    amount: number;
    saleDate: string;
    status: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }

  // Transform today's sales data for the table
  const tableData: SalesTableData[] = todaysSales.map((sale) => ({
    id: sale?.id || "",
    customerName: sale?.customer?.name || "Unknown Customer",
    productType: sale?.productionType?.name || "Unknown Product",
    quantity: sale?.quantity || 0,
    amount: parseFloat(sale?.totalAmount || "0") || 0,
    saleDate: sale?.saleDate || sale?.createdAt || new Date().toISOString(),
    status: "completed",
    createdBy: sale.createdBy || {
      id: "user-id-456",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
    },
  }));

  // Calculate stats from today's sales only
  const stats: SalesStats = {
    totalSales: todaysSales.length,
    todaysSales: todaysSales.length,
    totalRevenue: todaysSales.reduce(
      (sum, sale) => sum + (parseFloat(sale?.totalAmount || "0") || 0),
      0
    ),
    averageOrderValue:
      todaysSales.length > 0
        ? todaysSales.reduce(
            (sum, sale) => sum + (parseFloat(sale?.totalAmount || "0") || 0),
            0
          ) / todaysSales.length
        : 0,
    topProductType:
      todaysSales.length > 0
        ? todaysSales[0]?.productionType?.name || "N/A"
        : "N/A",
    recentSales: todaysSales,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor sales performance and track revenue
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
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!hasAccess && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats.totalSales} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {hasAccess && (
                <>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Orders completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {hasAccess && (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.averageOrderValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per sale</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Marketers
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {hasAccess && (
                <>
                  <div className="text-2xl font-bold">{marketers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Marketing team
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {safeSalesData.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sales data found</p>
              <p className="text-sm text-muted-foreground">
                Sales data will appear here once transactions are recorded
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.productType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(sale.quantity || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(sale.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            sale.status === "completed"
                              ? "default"
                              : sale.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.createdBy?.firstName} {sale.createdBy?.lastName}
                        <div className="text-xs text-gray-400">
                          {sale.createdBy?.email}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Types
          </CardTitle>
          <CardDescription>Available product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {productTypes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No product types found</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {productTypes.map((type: ProductType) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {type.category || "General"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
