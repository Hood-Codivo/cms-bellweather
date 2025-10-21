// src/api/analytics.ts
import api from "./axios";

export interface DateRange {
  from?: string;
  to?: string;
  period?: 'day' | 'week' | 'month' | 'quarter';
}

export interface AnalyticsFilters extends DateRange {
  from?: string;
  to?: string;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export const analyticsApi = {
  getSales: (filters: AnalyticsFilters = {}) =>
    api.get("/api/v1/analytics/sales", { params: filters }).then((r) => r.data),

  getProducts: (filters: AnalyticsFilters = {}) =>
    api
      .get("/api/v1/analytics/products", { params: filters })
      .then((r) => r.data),

  getMarketers: (filters: AnalyticsFilters = {}) =>
    api
      .get("/api/v1/analytics/marketers", { params: filters })
      .then((r) => r.data),

  getLocations: (filters: AnalyticsFilters = {}) =>
    api
      .get("/api/v1/analytics/locations", { params: filters })
      .then((r) => r.data),

  getOverview: (filters: AnalyticsFilters = {}) =>
    api
      .get("/api/v1/analytics/overview", { params: filters })
      .then((r) => r.data),

  // export: returns a blob (CSV/Excel/PDF) — caller handles saving.
  export: (filters: AnalyticsFilters = {}) =>
    api
      .get("/api/v1/analytics/export", {
        params: filters,
        responseType: "blob",
      })
      .then((r) => r.data),
      
  getAdminDashboard: (filters: DateRange = {}) =>
    api
      .get("/api/v1/marketing/admin-dashboard", { params: filters })
      .then((r) => r.data),
};

export default analyticsApi;
