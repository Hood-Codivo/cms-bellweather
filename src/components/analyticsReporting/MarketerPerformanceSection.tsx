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
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface MarketerData {
  marketerId: string;
  name: string;
  totalUnits: number;
  totalRevenue: number;
}

import type { ChartConfig as UIConfig } from "@/components/ui/chart";

interface MarketerPerformanceSectionProps {
  marketerData: MarketerData[] | null;
  chartConfig: UIConfig & { title: string; description?: string };
  COLORS: string[];
}

export const MarketerPerformanceSection: React.FC<MarketerPerformanceSectionProps> = ({
  marketerData,
  chartConfig,
  COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
}) => {
  const data = marketerData || [];
  const isEmpty = data.length === 0;

  // Format revenue for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const units = payload.find((p: any) => p.dataKey === 'totalUnits')?.value;
      const revenue = payload.find((p: any) => p.dataKey === 'totalRevenue')?.value;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {units !== undefined && (
            <p className="text-sm">
              <span className="font-medium">Units Sold:</span> {units}
            </p>
          )}
          {revenue !== undefined && (
            <p className="text-sm">
              <span className="font-medium">Revenue:</span> {formatCurrency(revenue)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{chartConfig.title}</h3>
        {chartConfig.description && (
          <p className="text-sm text-gray-500">{chartConfig.description}</p>
        )}
      </div>
      
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No marketer data available</p>
        </div>
      ) : (
        <div className="flex-1">
          <ChartContainer config={chartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => `₦${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="totalUnits" 
                  name="units"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[0]} />
                  ))}
                </Bar>
                <Bar 
                  yAxisId="right"
                  dataKey="totalRevenue" 
                  name="revenue"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};
