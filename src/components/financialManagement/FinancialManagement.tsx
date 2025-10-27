import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";
import { usePayroll } from "@/hooks/usePayroll";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
} from "lucide-react";

const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "-";
  }
  return amount.toLocaleString("en-US", { style: "currency", currency: "NGN" });
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#A28FD0",
  "#FFB6B9",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name?: string;
  category?: string;
}

const renderCustomizedLabel = (props: CustomizedLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, category } =
    props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      className="text-white text-xs"
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${category} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatPeriod = (period: any): string => {
  if (!period) return "--";
  if (typeof period === "string") return period;
  if (typeof period === "object" && period.from && period.to) {
    return `${period.from} - ${period.to}`;
  }
  return JSON.stringify(period);
};

const getPeriodDates = (period: string) => {
  const now = new Date();
  let start: Date, end: Date;
  switch (period) {
    case "current":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "previous":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return { start, end };
};

const FinancialManagement: React.FC = () => {
  const {
    financialOverview,
    expenseBreakdown,
    monthlySummary,
    records,
    isLoading,
    error,
    salesSummary,
    expenseSummary,
    profitLossStatement,
    cashFlowStatement,
    fetchFinancialOverview,
    fetchExpenseBreakdown,
    fetchMonthlySummary,
    fetchRecords,
    fetchSalesSummary,
    fetchExpenseSummary,
    fetchProfitLossStatement,
    fetchCashFlowStatement,
  } = useFinancialRecords();

  // Log the financial data for debugging
  console.log("Financial data:", {
    financialOverview,
  });

  // Get payroll data from financialOverview
  const payrolls = financialOverview?.payroll
    ? [
        {
          id: "payroll-total",
          amount: financialOverview.payroll.total,
          date: new Date().toISOString(),
          description: "Total Payroll",
          category: "Payroll",
          type: "expense",
          payPeriodStart: new Date().toISOString(),
          payPeriodEnd: new Date().toISOString(),
          status: "completed",
          staff: {
            id: "staff-total",
            name: "All Staff",
            role: "All",
            email: "all@example.com",
            user: {
              id: "user-total",
              name: "All Staff",
              email: "all@example.com",
              role: "admin",
            },
            department: "All Departments",
            position: "All Positions",
          },
          commissionAmount: 0,
          baseSalary: financialOverview.payroll.total,
        },
      ]
    : [];

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    from: "",
    to: "",
  });

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
    period: "month",
    expensePeriod: "month",
    plPeriod: "current",
    cfPeriod: "current",
  });

  const periodDates = useMemo(
    () => getPeriodDates(dateRange.cfPeriod),
    [dateRange.cfPeriod]
  );
  const { start, end } = periodDates || {};

  const payrollForPeriod = useMemo(() => {
    if (!payrolls?.length || !start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return payrolls
      .filter((p) => {
        const pStart = new Date(p.payPeriodStart);
        const pEnd = new Date(p.payPeriodEnd);
        return (
          pStart <= endDate && pEnd >= startDate && p.status === "completed"
        );
      })
      .reduce((sum, p) => {
        // Check if the staff member is a marketer
        const isMarketer =
          p.staff?.user?.role === "marketer" ||
          p.staff?.department === "marketer" ||
          p.staff?.position === "marketer";

        // Use commissionAmount for marketers, baseSalary for others
        const payAmount = isMarketer
          ? p.commissionAmount || 0
          : p.baseSalary || 0;

        return sum + payAmount;
      }, 0);
  }, [payrolls, start, end]);
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      setInitialLoadError(null);
      console.log("Initializing financial data...");

      try {
        const results = await Promise.allSettled([
          fetchFinancialOverview(),
          fetchExpenseBreakdown(),
          fetchMonthlySummary(),
          fetchRecords(),
          fetchSalesSummary(),
          fetchExpenseSummary(),
          fetchProfitLossStatement(),
          fetchCashFlowStatement(),
        ]);

        // Check for any failed requests
        const errors = results
          .map((result, index) => (result.status === "rejected" ? index : -1))
          .filter((index) => index !== -1);

        if (errors.length > 0) {
          console.error("Some requests failed:", errors);
          if (retryCount < 3) {
            console.log(`Retrying failed requests (${retryCount + 1}/3)...`);
            setTimeout(() => setRetryCount((c) => c + 1), 2000); // Retry after 2 seconds
          } else {
            setInitialLoadError(
              "Failed to load some financial data. Please try refreshing the page."
            );
          }
        } else {
          console.log("All financial data loaded successfully");
        }
      } catch (err) {
        console.error("Error in initializeData:", err);
        setInitialLoadError(
          "Failed to initialize financial data. Please try again."
        );
      }
    };

    initializeData();
  }, [
    fetchFinancialOverview,
    fetchExpenseBreakdown,
    fetchMonthlySummary,
    fetchRecords,
    fetchSalesSummary,
    fetchExpenseSummary,
    fetchProfitLossStatement,
    fetchCashFlowStatement,
    retryCount,
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    const apiFilters = {
      ...filters,
      type: filters.type === "all" ? undefined : filters.type,
      category: filters.category === "all" ? undefined : filters.category,
    };
    fetchRecords(apiFilters);
  };

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        fetchFinancialOverview(),
        fetchExpenseBreakdown(),
        fetchMonthlySummary(
          dateRange.from || dateRange.to ? dateRange : undefined
        ),
        fetchRecords(),
        fetchSalesSummary({ period: dateRange.period }),
        fetchExpenseSummary({ period: dateRange.expensePeriod }),
        fetchProfitLossStatement({ period: dateRange.plPeriod }),
        fetchCashFlowStatement({ period: dateRange.cfPeriod }),
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleApplyDateRange = () => {
    if (dateRange.from || dateRange.to) {
      fetchMonthlySummary(dateRange);
    } else {
      fetchMonthlySummary();
    }
  };

  // Prepare monthly chart data
  const monthlyChartData = monthlySummary.map((item) => {
    // Parse period assuming format "YYYY-MM"
    const [year, month] = item.period.split("-").map(Number);
    const date = new Date(year, month - 1, 1); // month is 1-based, Date constructor is 0-based

    return {
      ...item,
      profit: item.revenue - item.expenses, // Ensure profit is correctly calculated as revenue - expenses
      formattedPeriod: date.toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      }),
    };
  });

  // Prepare sales summary data with formatted periods
  let salesData: any[] = [];
  if (salesSummary.length > 0) {
    salesData = salesSummary.map((item) => ({
      ...item,
      formattedPeriod: formatPeriod(item.period),
    }));
  }
  const inventoryValuation = financialOverview?.inventoryValuation ?? null;
  const expensesTotalFromOverview = financialOverview?.expenses?.total ?? null;
  const inventoryTotalFromOverview =
    financialOverview?.expenses?.inventoryTotal ?? null;
  const totalExpensesCombined =
    (expensesTotalFromOverview ?? 0) + (inventoryTotalFromOverview ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <Button
          onClick={handleRefreshData}
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialOverview?.sales?.total != null
                ? formatCurrency(financialOverview.sales.total)
                : "--"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {financialOverview?.expenses?.total != null
                ? formatCurrency(financialOverview.expenses.total)
                : "--"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Valuation
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryValuation != null
                ? formatCurrency(inventoryValuation)
                : "--"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Sum of (quantity × cost per unit)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (financialOverview?.profit?.net ?? 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {financialOverview?.profit?.net != null
                ? formatCurrency(financialOverview.profit.net)
                : "--"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payroll
            </CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {financialOverview?.payroll?.total != null
                ? formatCurrency(financialOverview.payroll.total)
                : "--"}
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                ((financialOverview?.profit?.net ?? 0) - (financialOverview?.payroll?.total ?? 0)) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {financialOverview?.profit?.net != null && financialOverview?.payroll?.total != null
                ? formatCurrency(financialOverview.profit.net - financialOverview.payroll.total)
                : "--"}
            </div>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit Margin
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financialOverview?.profit?.net != null &&
              financialOverview?.sales?.total != null
                ? `${(
                    (financialOverview.profit.net /
                      financialOverview.sales.total) *
                    100
                  ).toFixed(1)}%`
                : "--"}
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Financial Trends</CardTitle>
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange("from", e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="To"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange("to", e.target.value)}
              className="w-40"
            />
            <Button onClick={handleApplyDateRange} size="sm">
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading monthly trends...</div>
          ) : monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedPeriod" fontSize={12} />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Amount",
                  ]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#FF8042"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No monthly data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sales Summary</CardTitle>
          <div className="flex gap-2">
            <Select
              value={dateRange.period}
              onValueChange={(val) => handleDateRangeChange("period", val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => fetchSalesSummary({ period: dateRange.period })}
              size="sm"
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading sales summary...</div>
          ) : salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedPeriod" fontSize={12} />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Amount",
                  ]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalSales" fill="#00C49F" name="Total Sales" />
                <Bar dataKey="salesCount" fill="#8884d8" name="Sales Count" />
                <Bar
                  dataKey="averageOrderValue"
                  fill="#0088FE"
                  name="Average Order Value"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sales summary data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Summary</CardTitle>
          <div className="flex gap-2">
            <Select
              value={dateRange.expensePeriod}
              onValueChange={(val) =>
                handleDateRangeChange("expensePeriod", val)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                fetchExpenseSummary({ period: dateRange.expensePeriod })
              }
              size="sm"
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading expense summary...</div>
          ) : expenseSummary?.items && expenseSummary.items.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Period: {formatPeriod(expenseSummary.period)}
                </div>
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(expenseSummary.totalExpenses)}
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseSummary.items}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis
                      tickFormatter={(value) =>
                        value === 0 ? "0" : `₦${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Amount"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseSummary.items}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                      >
                        {expenseSummary.items.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseSummary.items.map((item) => (
                        <TableRow key={item.category}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            {formatCurrency(item.amount as any)}
                          </TableCell>
                          <TableCell>
                            {(
                              ((item.amount as any) /
                                expenseSummary.totalExpenses) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profit & Loss Statement</CardTitle>
          <div className="flex gap-2">
            <Select
              value={dateRange.plPeriod}
              onValueChange={(val) => handleDateRangeChange("plPeriod", val)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="previous">Previous Month</SelectItem>
                <SelectItem value="quarter">Current Quarter</SelectItem>
                <SelectItem value="year">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                fetchProfitLossStatement({ period: dateRange.plPeriod })
              }
              size="sm"
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Loading profit & loss statement...
            </div>
          ) : profitLossStatement ? (
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                Period: {formatPeriod(profitLossStatement.period)}
              </div>

              <div className="space-y-2">
                <div className="font-medium">Revenue</div>
                <div className="pl-4 grid grid-cols-2">
                  <div>Total Revenue</div>
                  <div className="text-right font-medium">
                    {formatCurrency(profitLossStatement.revenue)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Expenses</div>
                <div className="pl-4 grid grid-cols-2">
                  {Object.entries(
                    profitLossStatement.expenses?.byCategory || {}
                  ).map(([category, amount]) => (
                    <div key={category} className="contents">
                      <div>{category}</div>
                      <div className="text-right">{formatCurrency(amount)}</div>
                    </div>
                  ))}
                  <div className="font-medium">Total Expenses</div>
                  <div className="text-right font-medium">
                    {formatCurrency(profitLossStatement.expenses?.total)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-2 grid grid-cols-2">
                <div className="font-medium">Net Profit</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    (profitLossStatement.revenue || 0) -
                      (profitLossStatement.expenses?.total || 0)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No profit & loss data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cash Flow Statement</CardTitle>
          <div className="flex gap-2">
            <Select
              value={dateRange.cfPeriod}
              onValueChange={(val) => handleDateRangeChange("cfPeriod", val)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="previous">Previous Month</SelectItem>
                <SelectItem value="quarter">Current Quarter</SelectItem>
                <SelectItem value="year">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                fetchCashFlowStatement({ period: dateRange.cfPeriod })
              }
              size="sm"
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Loading cash flow statement...
            </div>
          ) : cashFlowStatement ? (
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                Period: {formatPeriod(cashFlowStatement.period)}
              </div>

              <div className="space-y-2">
                <div className="font-medium">Inflows</div>
                <div className="pl-4 grid grid-cols-2">
                  <div>Total Inflows</div>
                  <div className="text-right">
                    {formatCurrency(cashFlowStatement.inflows)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Outflows</div>
                <div className="pl-4 grid grid-cols-2">
                  <div>Expenses</div>
                  <div className="text-right">
                    {formatCurrency(cashFlowStatement.outflows?.expenses)}
                  </div>
                  <div>Payroll</div>
                  <div className="text-right">
                    {formatCurrency(payrollForPeriod)}
                  </div>
                  <div className="font-medium">Total Outflows</div>
                  <div className="text-right font-medium">
                    {formatCurrency(
                      (cashFlowStatement.outflows?.expenses || 0) +
                        payrollForPeriod
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-2 grid grid-cols-2">
                <div className="font-medium">Net Cash Flow</div>
                <div className="text-right font-medium">
                  {formatCurrency(cashFlowStatement.netCashFlow)}
                </div>
                <div className="font-medium">Running Balance</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    (cashFlowStatement.inflows || 0) -
                      ((cashFlowStatement.outflows?.expenses || 0) +
                        payrollForPeriod)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cash flow data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Select
              value={filters.type}
              onValueChange={(val) => handleFilterChange("type", val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="From Date"
              value={filters.from}
              onChange={(e) => handleFilterChange("from", e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.to}
              onChange={(e) => handleFilterChange("to", e.target.value)}
              className="w-40"
            />
            <Button onClick={handleApplyFilters} disabled={isLoading}>
              Apply Filters
            </Button>
          </div>

          {/* {isLoading ? (
            <div className="text-center py-8">Loading financial records...</div>
          ) : records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("en-NG")}
                    </TableCell>
                    <TableCell>{record.description || "N/A"}</TableCell>
                    <TableCell>{record.category || "Uncategorized"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.type === "Revenue"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.type}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        record.type === "Revenue"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {record.type === "Revenue" ? "+" : "-"}
                      {formatCurrency(Math.abs(record.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No financial records found
            </div>
          
        </CardContent>
      </Card> */}
    </div>
  );
};

export default FinancialManagement;
function fetchPayrolls(): any {
  throw new Error("Function not implemented.");
}
