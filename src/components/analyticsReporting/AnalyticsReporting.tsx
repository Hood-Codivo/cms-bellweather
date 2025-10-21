// src/components/analytics/AnalyticsReporting.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnalyticsFilters } from "@/api/analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import useAnalytics from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/utils";
import { SalesAnalyticsSection } from "./SalesAnalyticsSection";
import { ProductPerformanceSection } from "./ProductPerformanceSection";
import { MarketerPerformanceSection } from "./MarketerPerformanceSection";
import { LocationAnalyticsSection } from "./LocationAnalyticsSection";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const chartConfig = {
  sales: { label: "Sales", color: "#0088FE" },
  revenue: { label: "Revenue", color: "#00C49F" },
  orders: { label: "Orders", color: "#FFBB28" },
  products: { label: "Products", color: "#FF8042" },
};

const marketerChartConfig = {
  ...chartConfig,
  title: "Marketer Performance",
};

const AnalyticsReporting = () => {
  const {
    salesData,
    productData,
    marketerData,
    locationData,
    overviewData,
    isLoading,
    error,
    fetchAllAnalytics,
    exportAnalytics,
  } = useAnalytics();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    from: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const onFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchAllAnalytics(next);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("Analytics Report", 20, 30);

      // Date range
      doc.setFontSize(12);
      doc.text(`Period: ${filters.from} to ${filters.to}`, 20, 45);

      // Summary data
      if (overviewData?.summary) {
        doc.setFontSize(16);
        doc.text("Summary", 20, 65);

        doc.setFontSize(12);
        const summary = overviewData.summary;
        doc.text(
          `Total Revenue: ${formatCurrency(summary.totalRevenue || 0)}`,
          20,
          80
        );
        doc.text(`Total Orders: ${summary.totalOrders || 0}`, 20, 90);
        doc.text(`Total Customers: ${summary.totalCustomers || 0}`, 20, 100);
        doc.text(
          `Average Order Value: ${formatCurrency(
            summary.averageOrderValue || 0
          )}`,
          20,
          110
        );
      }

      // Sales data
      if (salesData && salesData.length > 0) {
        doc.setFontSize(16);
        doc.text("Sales Data", 20, 130);

        doc.setFontSize(10);
        let yPos = 145;
        salesData.forEach((item: any, index: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(
            `${item.period}: Revenue - ${formatCurrency(
              item.totalRevenue || 0
            )}, Orders - ${item.totalOrders || 0}`,
            20,
            yPos
          );
          yPos += 10;
        });
      }

      // Save the PDF
      doc.save(`analytics_report_${filters.from}_to_${filters.to}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const generateExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Summary sheet
      if (overviewData?.summary) {
        const summaryData = [
          ["Metric", "Value"],
          [
            "Total Revenue",
            formatCurrency(overviewData.summary.totalRevenue || 0),
          ],
          ["Total Orders", overviewData.summary.totalOrders || 0],
          ["Total Customers", overviewData.summary.totalCustomers || 0],
          [
            "Average Order Value",
            formatCurrency(overviewData.summary.averageOrderValue || 0),
          ],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      }

      // Sales data sheet
      if (salesData && salesData.length > 0) {
        const salesHeaders = ["Period", "Total Revenue", "Total Orders"];
        const salesRows = salesData.map((item: any) => [
          item.period,
          item.totalRevenue || 0,
          item.totalOrders || 0,
        ]);
        const salesDataWithHeaders = [salesHeaders, ...salesRows];
        const salesSheet = XLSX.utils.aoa_to_sheet(salesDataWithHeaders);
        XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Data");
      }

      // Product data sheet
      if (productData && productData.length > 0) {
        const productHeaders = ["Product", "Total Revenue", "Total Orders"];
        const productRows = productData.map((item: any) => [
          item.name || "Unknown",
          item.totalRevenue || 0,
          item.totalOrders || 0,
        ]);
        const productDataWithHeaders = [productHeaders, ...productRows];
        const productSheet = XLSX.utils.aoa_to_sheet(productDataWithHeaders);
        XLSX.utils.book_append_sheet(
          workbook,
          productSheet,
          "Product Performance"
        );
      }

      // Save the Excel file
      XLSX.writeFile(
        workbook,
        `analytics_report_${filters.from}_to_${filters.to}.xlsx`
      );
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Excel generation failed:", error);
      toast.error("Failed to generate Excel file");
    }
  };

  const exportToPDF = () => generatePDF();
  const exportToExcel = () => generateExcel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchAllAnalytics(filters)}>Retry</Button>
        </div>
      </div>
    );
  }

  // If no data at all return friendly message
  if (
    !isLoading &&
    (!salesData || salesData.length === 0) &&
    (!productData || productData.length === 0) &&
    (!marketerData || marketerData.length === 0) &&
    (!locationData || locationData.length === 0) &&
    !overviewData
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No analytics data available</p>
          <Button onClick={() => fetchAllAnalytics(filters)}>
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.from || ""}
              onChange={(e) => onFilterChange("from", e.target.value)}
            />
          </div>
          <div>
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.to || ""}
              onChange={(e) => onFilterChange("to", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {overviewData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overviewData.summary.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{overviewData?.growth?.revenueGrowth || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData.summary.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{overviewData?.growth?.orderGrowth || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData.summary.totalCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{overviewData?.growth?.customerGrowth || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overviewData.summary.averageOrderValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Best selling:{" "}
                {overviewData?.topMetrics?.bestSellingProduct || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="marketers">Marketer Performance</TabsTrigger>
          <TabsTrigger value="locations">Location Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="totalRevenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Product Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        dataKey="totalRevenue"
                        nameKey="name"
                      >
                        {(productData || []).map((entry: any, idx: number) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#0088FE"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <SalesAnalyticsSection
            salesData={salesData || []}
            chartConfig={chartConfig}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformanceSection
            productData={productData || []}
            chartConfig={chartConfig}
            COLORS={COLORS}
          />
        </TabsContent>

        <TabsContent value="marketers">
          <MarketerPerformanceSection
            marketerData={marketerData || []}
            chartConfig={marketerChartConfig}
            COLORS={COLORS}
          />
        </TabsContent>

        <TabsContent value="locations">
          <LocationAnalyticsSection
            locationData={locationData || []}
            chartConfig={chartConfig}
            COLORS={COLORS}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReporting;
