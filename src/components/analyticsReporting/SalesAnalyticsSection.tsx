// src/components/analytics/SalesAnalyticsSection.tsx
import React from "react";
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
  ResponsiveContainer,
} from "recharts";

interface Props {
  salesData: any[]; // expects array like [{ period: '2024-01', totalRevenue: 15000.5, totalOrders: 45 }, ...]
  chartConfig?: any;
}

export const SalesAnalyticsSection: React.FC<Props> = ({
  salesData = [],
  chartConfig,
}) => {
  if (!Array.isArray(salesData) || salesData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  // try to normalize to { date/period, sales, orders } for older chart expectations
  const chartData = salesData.map((row: any) => ({
    period: row.period ?? row.date ?? row.month ?? "",
    totalRevenue: Number(row.totalRevenue ?? row.sales ?? 0),
    totalOrders: Number(row.totalOrders ?? row.orders ?? 0),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="totalRevenue" fill="#0088FE" name="Revenue" />
          <Bar dataKey="totalOrders" fill="#00C49F" name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
