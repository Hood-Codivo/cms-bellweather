import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Target,
  RefreshCw,
  Award,
  Users,
  Star,
  BarChart3,
  Download,
  Search,
  AlertCircle,
} from "lucide-react";

import { analyticsApi } from "@/api/analytics";
import { useQuery } from "@tanstack/react-query";

// Define interfaces based on your backend response structure
interface AdminDashboardData {
  summary: {
    totalSales: number;
    totalCommissions: number;
    totalTransactions: number;
    totalQuantity: number;
    averageOrderValue: number;
  };
  marketerPerformance: Array<{
    id: string;
    name: string;
    totalSales: number;
    totalTransactions: number;
  }>;
  salesTrend: Array<{
    month: string;
    totalSales: number;
    transactionCount: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

interface MarketerDashboardData {
  marketer: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    commissionRate: number;
    department: string;
    position: string;
  };
  overview: {
    totalSales: number;
    totalCommission: number;
    totalUnits: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  monthlyData: Array<{
    period: string;
    totalSales: number;
    totalCommission: number;
    totalUnits: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    commission: number;
    orderCount: number;
  }>;
  recentSales: Array<{
    id: string;
    date: string;
    customerName: string;
    customerType: string;
    productName: string;
    quantity: number;
    amount: number;
    commission: number;
  }>;
  period: {
    from: string;
    to: string;
  };
}

// Mock user data - replace with actual auth context
const mockUser = {
  role: "admin", // or 'marketer'
  id: "user123",
};

export default function MarketingManagement() {
  const user = mockUser; // Replace with actual useAuth hook
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [adminDashboardData, setAdminDashboardData] =
    useState<AdminDashboardData | null>(null);
  const [marketerDashboardData, setMarketerDashboardData] =
    useState<MarketerDashboardData | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => {
    return '₦' + new Intl.NumberFormat("en-NG", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch data based on user role
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAdmin) {
        // Call admin dashboard endpoint
        const response = await analyticsApi.getAdminDashboard({
          from: dateRange.from,
          to: dateRange.to,
          period: filterPeriod as any
        });
        setAdminDashboardData(response);
      } else {
        // Call individual marketer dashboard endpoint
        const response = await analyticsApi.getOverview({
          from: dateRange.from,
          to: dateRange.to,
          period: filterPeriod as any
        });
        setMarketerDashboardData(response);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");

      // Set all data to 0 on error
      if (isAdmin) {
        setAdminDashboardData({
          summary: {
            totalSales: 0,
            totalCommissions: 0,
            totalTransactions: 0,
            totalQuantity: 0,
            averageOrderValue: 0,
          },
          marketerPerformance: [],
          salesTrend: [],
          dateRange: {
            start: dateRange.from,
            end: dateRange.to,
          },
        });
      } else {
        setMarketerDashboardData({
          marketer: {
            id: "0",
            name: "",
            email: "",
            employeeId: "",
            commissionRate: 0,
            department: "",
            position: "",
          },
          overview: {
            totalSales: 0,
            totalCommission: 0,
            totalUnits: 0,
            totalOrders: 0,
            avgOrderValue: 0,
          },
          monthlyData: [],
          topProducts: [],
          recentSales: [],
          period: {
            from: dateRange.from,
            to: dateRange.to,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use React Query for better data fetching
  const queryKey = ['marketingDashboard', dateRange.from, dateRange.to, filterPeriod, isAdmin] as const;
  
  const { refetch: refetchData, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        await fetchDashboardData();
        return true;
      } catch (error) {
        console.error('Error in queryFn:', error);
        setError('Failed to load dashboard data. Please try again.');
        throw error;
      }
    },
    enabled: false, // Disable automatic fetching
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      console.error('Query error:', queryError);
      setError('Failed to load dashboard data. Please try again.');
    }
  }, [queryError]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    refetchData();
  }, [dateRange.from, dateRange.to, filterPeriod, isAdmin, refetchData]);

  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    refetchData();
  };

  const handleExportData = async () => {
    try {
      const blob = await analyticsApi.export({
        from: dateRange.from,
        to: dateRange.to,
        format: 'xlsx'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `marketing-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    }
  };

  // Get current data based on user role
  const currentData = isAdmin ? adminDashboardData : marketerDashboardData;

  // Prepare overview data
  const overview = isAdmin
    ? {
        totalSales: adminDashboardData?.summary.totalSales || 0,
        totalCommission: adminDashboardData?.summary.totalCommissions || 0,
        totalOrders: adminDashboardData?.summary.totalTransactions || 0,
        avgOrderValue: adminDashboardData?.summary.averageOrderValue || 0,
        totalUnits: adminDashboardData?.summary.totalQuantity || 0,
      }
    : {
        totalSales: marketerDashboardData?.overview.totalSales || 0,
        totalCommission: marketerDashboardData?.overview.totalCommission || 0,
        totalOrders: marketerDashboardData?.overview.totalOrders || 0,
        avgOrderValue: marketerDashboardData?.overview.avgOrderValue || 0,
        totalUnits: marketerDashboardData?.overview.totalUnits || 0,
      };

  // Prepare chart data
  const chartData = isAdmin
    ? adminDashboardData?.salesTrend.map((item) => ({
        month: item.month,
        totalSales: item.totalSales,
        totalCommission: 0, // Not provided in admin API
      })) || []
    : marketerDashboardData?.monthlyData.map((item) => ({
        month: item.period,
        totalSales: item.totalSales,
        totalCommission: item.totalCommission,
      })) || [];

  // Filter sales data for individual marketers
  const filteredSales =
    marketerDashboardData?.recentSales.filter(
      (sale) =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "Marketing Overview" : "Marketing Management"}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? "Monitor all marketing activities and performance across the organization"
                : "Manage your marketing activities, track performance, and analyze results"}
            </p>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange("from", e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange("to", e.target.value)}
              className="w-40"
            />
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sales Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(overview.totalSales)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From {overview.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Commission Earned
              </CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(overview.totalCommission)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {overview.totalSales > 0
                  ? (
                      (overview.totalCommission / overview.totalSales) *
                      100
                    ).toFixed(1)
                  : 0}
                % commission rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Units Sold
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overview.totalUnits.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">Total units moved</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Order Value
              </CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(overview.avgOrderValue)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="products">
              {isAdmin ? "Marketers" : "Products"}
            </TabsTrigger>
            <TabsTrigger value="sales">
              {isAdmin ? "Summary" : "Sales History"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis
                          tickFormatter={(value) =>
                            `$${value.toLocaleString()}`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar
                          dataKey="totalSales"
                          fill="#00C49F"
                          name="Sales Revenue"
                          radius={[4, 4, 0, 0]}
                        />
                        {!isAdmin && (
                          <Bar
                            dataKey="totalCommission"
                            fill="#8884d8"
                            name="Commission"
                            radius={[4, 4, 0, 0]}
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No performance data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#00C49F"
                        strokeWidth={2}
                        name="Sales"
                      />
                      {!isAdmin && (
                        <Line
                          type="monotone"
                          dataKey="totalCommission"
                          stroke="#8884d8"
                          strokeWidth={2}
                          name="Commission"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No performance data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {isAdmin ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Marketers Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminDashboardData?.marketerPerformance.map(
                      (marketer, index) => (
                        <div
                          key={marketer.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{marketer.name}</p>
                              <p className="text-sm text-gray-600">
                                {marketer.totalTransactions} transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(marketer.totalSales)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {marketer.totalTransactions} orders
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {!adminDashboardData?.marketerPerformance.length && (
                    <div className="text-center py-8 text-gray-500">
                      No marketer data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketerDashboardData?.topProducts.map(
                      (product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-600">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.orderCount} orders
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-sm text-purple-600">
                              {formatCurrency(product.commission)} commission
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.unitsSold} units sold
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {!marketerDashboardData?.topProducts.length && (
                    <div className="text-center py-8 text-gray-500">
                      No product data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            {isAdmin ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Marketers Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Marketer</TableHead>
                          <TableHead>Total Sales</TableHead>
                          <TableHead>Transactions</TableHead>
                          <TableHead>Avg Transaction Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminDashboardData?.marketerPerformance.map(
                          (marketer) => (
                            <TableRow key={marketer.id}>
                              <TableCell className="font-medium">
                                {marketer.name}
                              </TableCell>
                              <TableCell className="font-bold text-green-600">
                                {formatCurrency(marketer.totalSales)}
                              </TableCell>
                              <TableCell>
                                {marketer.totalTransactions}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(
                                  marketer.totalTransactions > 0
                                    ? marketer.totalSales /
                                        marketer.totalTransactions
                                    : 0
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {!adminDashboardData?.marketerPerformance.length && (
                    <div className="text-center py-8 text-gray-500">
                      No marketer data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Sales History
                    </CardTitle>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search sales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {new Date(sale.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="font-medium">
                              {sale.customerName}
                            </TableCell>
                            <TableCell>{sale.productName}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell className="font-bold text-green-600">
                              {formatCurrency(sale.amount)}
                            </TableCell>
                            <TableCell className="font-bold text-purple-600">
                              {formatCurrency(sale.commission)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sale.customerType === "new"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {sale.customerType === "new"
                                  ? "New"
                                  : "Returning"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredSales.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? "No sales found matching your search"
                        : "No sales found for the selected period"}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
