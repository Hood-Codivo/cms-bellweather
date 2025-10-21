// src/components/analytics/ProductPerformanceSection.tsx
import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  productData: any[]; // expects [{ productId, name, totalUnits, totalRevenue }, ...]
  chartConfig?: any;
  COLORS?: string[];
}

export const ProductPerformanceSection: React.FC<Props> = ({
  productData = [],
  chartConfig,
  COLORS = [],
}) => {
  if (!Array.isArray(productData) || productData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No product data available</p>
      </div>
    );
  }

  const pieData = productData.map((p) => ({
    name: p.name ?? p.productId ?? "Unnamed",
    totalRevenue: Number(p.totalRevenue ?? 0),
    totalUnits: Number(p.totalUnits ?? 0),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="totalRevenue"
                nameKey="name"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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
      </div>
    </div>
  );
};
