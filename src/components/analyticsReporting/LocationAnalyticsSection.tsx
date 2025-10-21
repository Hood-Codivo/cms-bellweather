import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface LocationAnalyticsSectionProps {
  locationData: any;
  chartConfig: any;
  COLORS: string[];
}

export const LocationAnalyticsSection: React.FC<
  LocationAnalyticsSectionProps
> = ({ locationData, chartConfig, COLORS }) => {
  // Use the array directly
  const data = Array.isArray(locationData) ? locationData : [];
  const isEmpty = data.length === 0;

  return (
    <div>
      {isEmpty ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No location data available</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="totalRevenue"
                nameKey="location"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#0088FE"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
};
