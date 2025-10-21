import api from "./axios";
import { InventoryRecord, InventoryTrendData } from "../types/inventory";

interface GetRecordsParams {
  inventoryItemId: string;
  year?: number;
  month?: number;
}

export const inventoryRecordsApi = {
  getRecords: async (params: GetRecordsParams): Promise<InventoryRecord[]> => {
    const { inventoryItemId, year, month } = params;
    const queryParams = new URLSearchParams({
      inventoryItemId,
      ...(year && { year: year.toString() }),
      ...(month && { month: month.toString() }),
    });

    const response = await api.get(
      `/api/v1/InventoryMonthlyRecord?${queryParams}`
    );
    return response.data;
  },

  getTrend: async (months: number = 12): Promise<InventoryTrendData[]> => {
    const response = await api.get(
      `/api/v1/InventoryMonthlyRecord/trend?months=${months}`
    );
    return response.data;
  },
};

export default inventoryRecordsApi;
