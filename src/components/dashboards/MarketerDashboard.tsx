import { useState, useEffect, useContext } from "react";
import {
  useMyMarketingData,
  useAllMarketersData,
  marketingUtils,
} from "@/hooks/useMarketer";
import { AuthContext } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  Filter,
  User,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface MarketerData {
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

export default function MarketingPerformanceDashboard() {
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isSales = user?.role === "sales";
  const isMarketer = user?.role === "marketer";

  const [selectedMarketer, setSelectedMarketer] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [viewMode, setViewMode] = useState(
    isSuperAdmin ? "overview" : "individual"
  );

  // For individual marketer view
  const { dashboardData, isLoading, error, fetchDashboardData } =
    useMyMarketingData();

  // For superadmin overview
  const {
    marketers = [],
    fetchMarketers,
    fetchAllMarketersPerformance,
  } = useAllMarketersData();

  const [allMarketersPerformance, setAllMarketersPerformance] = useState<any[]>(
    []
  );
  const [performanceMetrics, setPerformanceMetrics] = useState<
    Record<string, any>
  >({});
  const [productSales, setProductSales] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    if ((isSuperAdmin || isAdmin) && viewMode === "overview") {
      // For admin users in overview mode
      fetchMarketers();
      loadAllMarketersPerformance();
    } else if (viewMode === "individual" && selectedMarketer) {
      // For viewing a specific marketer (admin viewing individual)
      fetchDashboardData(dateRange);
    } else if (isMarketer || isSales) {
      // For marketers/sales viewing their own data
      fetchDashboardData(dateRange);
    }
  }, [viewMode, selectedMarketer, dateRange, user?.role]);

  const loadAllMarketersPerformance = async () => {
    try {
      const data = await fetchAllMarketersPerformance(dateRange);
      setAllMarketersPerformance(data);
    } catch (err) {
      console.error("Error loading marketers performance:", err);
    }
  };

  const loadAdditionalData = async () => {
    try {
      // Additional data loading can be added here when needed
    } catch (err) {
      console.error("Error loading additional data:", err);
    }
  };

  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = marketingUtils.formatCurrency;

  // Extract data from dashboardData without mock fallbacks
  const marketer = dashboardData?.marketer || {
    id: "demo",
    name: user?.name || user?.email?.split("@")[0] || "Marketer",
    email: user?.email || "",
    employeeId: "DEMO001",
    commissionRate: 0.05,
    department: "Sales",
    position: "Sales Representative",
  };
  const overview = dashboardData?.overview || {
    totalSales: 0,
    totalCommission: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalUnits: 0,
  };
  const monthlyData = dashboardData?.monthlyData || [];
  const topProducts = dashboardData?.topProducts || [];
  const recentSales = dashboardData?.recentSales || [];

  // Calculate commission percentage
  const commissionRate = marketer?.commissionRate || 0;
  const commissionPercentage = (commissionRate * 100).toFixed(1);

  // Show loading state
  if ((isMarketer || isSales) && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => fetchDashboardData(dateRange)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
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
              {isSuperAdmin
                ? "Marketing Performance Dashboard"
                : "My Performance Dashboard"}
            </h1>
            <p className="text-gray-600">
              {isSuperAdmin
                ? "Monitor all marketers' performance"
                : `Welcome back, ${
                    user?.name ||
                    user?.email?.split("@")[0] ||
                    "Sales Professional"
                  }`}
            </p>
          </div>

          <div className="flex gap-4 items-center">
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
            <Button
              onClick={() =>
                isSuperAdmin
                  ? loadAllMarketersPerformance()
                  : fetchDashboardData(dateRange)
              }
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {isSuperAdmin && (
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isSuperAdmin && viewMode === "overview" ? (
          <SuperAdminOverview
            marketers={allMarketersPerformance}
            onSelectMarketer={setSelectedMarketer}
            formatCurrency={formatCurrency}
          />
        ) : (
          <>
            {/* Profile Card - Only show for individual view */}
            {(viewMode === "individual" || !isSuperAdmin) && (
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {marketer?.name || user?.name}
                        </h2>
                        <p className="text-white/80">
                          {marketer?.position || "Sales"} •{" "}
                          {marketer?.department || "Sales"}
                        </p>
                        <p className="text-white/80">
                          {marketer?.email || user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {commissionPercentage}%
                      </div>
                      <div className="text-white/80">Commission Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Sales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(overview?.totalSales || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    From {overview?.totalOrders || 0} orders
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
                    {formatCurrency(overview?.totalCommission || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {overview?.totalSales > 0
                      ? (
                          (overview.totalCommission / overview.totalSales) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of sales
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
                    {overview?.totalUnits || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Total units moved
                  </p>
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
                    {formatCurrency(overview?.avgOrderValue || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalSales"
                      fill="#00C49F"
                      name="Sales Revenue"
                    />
                    <Bar
                      dataKey="totalCommission"
                      fill="#8884d8"
                      name="Commission Earned"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {product.unitsSold} units • {product.orderCount}{" "}
                              orders
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topProducts}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="revenue"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {topProducts.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
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
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentSales.map((sale) => (
                        <tr key={sale.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(sale.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {sale.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                            {formatCurrency(sale.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-600">
                            {formatCurrency(sale.commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                sale.customerType === "business"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {sale.customerType === "business"
                                ? "Business"
                                : "Individual"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {recentSales.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent sales found for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Super Admin Overview Component
function SuperAdminOverview({ marketers, onSelectMarketer, formatCurrency }) {
  const [sortField, setSortField] = useState("totalSalesAmount");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedMarketers = [...marketers].sort((a, b) => {
    const aValue = a[sortField] || 0;
    const bValue = b[sortField] || 0;

    if (sortOrder === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="ml-1">↕</span>;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Marketers Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Marketer <SortIcon field="name" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("totalSalesAmount")}
                  >
                    Total Sales <SortIcon field="totalSalesAmount" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("totalCommission")}
                  >
                    Commission <SortIcon field="totalCommission" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("orderCount")}
                  >
                    Orders <SortIcon field="orderCount" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMarketers.map((marketer) => (
                  <tr key={marketer.marketerId || marketer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {marketer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {marketer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(marketer.totalSalesAmount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600">
                        {formatCurrency(marketer.totalCommission || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {marketer.orderCount || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {marketers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No marketer data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={marketers.slice(0, 10)} // Show top 10 performers
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar
                  dataKey="totalSalesAmount"
                  fill="#00C49F"
                  name="Sales Revenue"
                />
                <Bar
                  dataKey="totalCommission"
                  fill="#8884d8"
                  name="Commission"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Marketer</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketers}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="orderCount"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {marketers.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
