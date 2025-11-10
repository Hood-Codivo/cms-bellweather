import React, { useState } from "react";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  Calendar,
  RefreshCw,
  FileText,
  BarChart3,
  ShoppingCart,
  Award,
  ArrowRight,
} from "lucide-react";
import { useFinanceManagerDashboard } from "@/hooks/useFinanceManagerDashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export function FinanceManagerDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const { data, isLoading, error, refetch } = useFinanceManagerDashboard(
    dateRange.from,
    dateRange.to
  );

  const handleDateChange = (field: "from" | "to", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
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
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No data available</p>
      </div>
    );
  }

  const { overview, expenses, payroll, sales, transactions } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Finance Manager Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive financial overview and management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="from">From:</Label>
            <Input
              id="from"
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="to">To:</Label>
            <Input
              id="to"
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="w-40"
            />
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Period: {formatDate(overview.period.from)} -{" "}
              {formatDate(overview.period.to)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {overview.metrics.totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.metrics.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expense ratio: {formatPercent(overview.metrics.expenseRatio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.metrics.totalPayroll)}
            </div>
            <p className="text-xs text-muted-foreground">
              Payroll ratio: {formatPercent(overview.metrics.payrollRatio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {overview.metrics.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                overview.metrics.netProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(overview.metrics.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Profit margin: {formatPercent(overview.metrics.profitMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commissions
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.metrics.totalCommissions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.metrics.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(overview.metrics.averageTransactionValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.metrics.averageTransactionValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expenses Summary
            </CardTitle>
            <CardDescription>
              Total: {formatCurrency(expenses.summary.total)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {expenses.summary.byStatus.pending.count}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-sm font-semibold text-yellow-700">
                  {formatCurrency(expenses.summary.byStatus.pending.total)}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {expenses.summary.byStatus.approved.count}
                </div>
                <div className="text-xs text-muted-foreground">Approved</div>
                <div className="text-sm font-semibold text-green-700">
                  {formatCurrency(expenses.summary.byStatus.approved.total)}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  {expenses.summary.byStatus.rejected.count}
                </div>
                <div className="text-xs text-muted-foreground">Rejected</div>
                <div className="text-sm font-semibold text-red-700">
                  {formatCurrency(expenses.summary.byStatus.rejected.total)}
                </div>
              </div>
            </div>

            {expenses.pending.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Pending Approvals</h4>
                <div className="space-y-2">
                  {expenses.pending.slice(0, 5).map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{expense.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {expenses.pending.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    +{expenses.pending.length - 5} more pending expenses
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payroll Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Payroll Summary
            </CardTitle>
            <CardDescription>
              Total: {formatCurrency(payroll.summary.total)} | Net Pay:{" "}
              {formatCurrency(payroll.summary.netPay)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Base Salary</div>
                <div className="text-xl font-bold">
                  {formatCurrency(payroll.summary.baseSalary)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Commissions</div>
                <div className="text-xl font-bold">
                  {formatCurrency(payroll.summary.commissions)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Draft</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {payroll.summary.byStatus.draft.count} payrolls
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(payroll.summary.byStatus.draft.totalGross)}{" "}
                    gross
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-sm">Approved</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {payroll.summary.byStatus.approved.count} payrolls
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(
                      payroll.summary.byStatus.approved.totalGross
                    )}{" "}
                    gross
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm">Paid</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {payroll.summary.byStatus.paid.count} payrolls
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(payroll.summary.byStatus.paid.totalGross)}{" "}
                    gross
                  </div>
                </div>
              </div>
            </div>

            {payroll.recent.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Payrolls</h4>
                <div className="space-y-2">
                  {payroll.recent.slice(0, 3).map((pay: any) => (
                    <div
                      key={pay.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {pay.employeeName || "Employee"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pay.period || "Period"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(pay.netPay || pay.total)}
                        </div>
                        <Badge
                          variant={
                            pay.status === "paid"
                              ? "default"
                              : pay.status === "approved"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {pay.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Analytics
          </CardTitle>
          <CardDescription>
            Revenue: {formatCurrency(sales.summary.totalRevenue)} | Commissions:{" "}
            {formatCurrency(sales.summary.totalCommissions)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Top Products */}
            {sales.topProducts && sales.topProducts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Top Products</h4>
                <div className="space-y-2">
                  {sales.topProducts.map((product: any, index: number) => (
                    <div
                      key={product.id || index}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {product.name || product.productName || "Product"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {product.quantity || 0}
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        {formatCurrency(product.revenue || product.total || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Marketers */}
            {sales.topMarketers && sales.topMarketers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Top Marketers</h4>
                <div className="space-y-2">
                  {sales.topMarketers.map((marketer: any, index: number) => (
                    <div
                      key={marketer.id || marketer.marketerId || index}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {marketer.name ||
                            `${marketer.firstName || ""} ${
                              marketer.lastName || ""
                            }`.trim() ||
                            "Marketer"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {marketer.salesCount || 0} sales
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(
                            marketer.commission || marketer.totalCommission || 0
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Sales */}
            {sales.monthly && sales.monthly.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Monthly Breakdown</h4>
                <div className="space-y-2">
                  {sales.monthly
                    .slice(0, 6)
                    .map((month: any, index: number) => (
                      <div
                        key={month.month || index}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <div className="font-medium">
                          {month.month || `Month ${index + 1}`}
                        </div>
                        <div className="text-right font-semibold">
                          {formatCurrency(month.revenue || month.total || 0)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {transactions.recent && transactions.recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest 20 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.recent.map(
                    (transaction: any, index: number) => (
                      <TableRow key={transaction.id || index}>
                        <TableCell>
                          {formatDate(
                            transaction.date || transaction.createdAt
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "sale"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.type || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.description ||
                            transaction.category ||
                            transaction.productName ||
                            "Transaction"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              transaction.type === "expense"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {transaction.type === "expense" ? "-" : "+"}
                            {formatCurrency(
                              Math.abs(
                                transaction.amount || transaction.total || 0
                              )
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "approved" ||
                              transaction.status === "paid"
                                ? "default"
                                : transaction.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {transaction.status || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
