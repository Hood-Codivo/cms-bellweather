// src/hooks/useAnalytics.ts
import { useCallback, useEffect, useState } from "react";
import analyticsApi from "@/api/analytics";

export type AnalyticsFilters = {
  from?: string;
  to?: string;
};

export function useAnalytics(initialFilters: AnalyticsFilters = {}) {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);
  const [salesData, setSalesData] = useState<any[] | null>(null);
  const [productData, setProductData] = useState<any[] | null>(null);
  const [marketerData, setMarketerData] = useState<any[] | null>(null);
  const [locationData, setLocationData] = useState<any[] | null>(null);
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAnalytics = useCallback(
    async (filt: AnalyticsFilters = filters) => {
      setIsLoading(true);
      setError(null);

      try {
        const [salesRes, productsRes, marketersRes, locationsRes, overviewRes] =
          await Promise.allSettled([
            analyticsApi.getSales(filt),
            analyticsApi.getProducts(filt),
            analyticsApi.getMarketers(filt),
            analyticsApi.getLocations(filt),
            analyticsApi.getOverview(filt),
          ]);

        if (salesRes.status === "fulfilled") setSalesData(salesRes.value);
        else {
          console.warn("sales analytics failed:", salesRes.reason);
          setSalesData([]);
        }

        if (productsRes.status === "fulfilled")
          setProductData(productsRes.value);
        else {
          console.warn("product analytics failed:", productsRes.reason);
          setProductData([]);
        }

        if (marketersRes.status === "fulfilled")
          setMarketerData(marketersRes.value);
        else {
          console.warn("marketer analytics failed:", marketersRes.reason);
          setMarketerData([]);
        }

        if (locationsRes.status === "fulfilled")
          setLocationData(locationsRes.value);
        else {
          console.warn("location analytics failed:", locationsRes.reason);
          setLocationData([]);
        }

        if (overviewRes.status === "fulfilled")
          setOverviewData(overviewRes.value);
        else {
          console.warn("overview analytics failed:", overviewRes.reason);
          setOverviewData(null);
        }

        setFilters(filt);
      } catch (err: any) {
        console.error("fetchAllAnalytics error:", err);
        setError(err?.message || "Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // convenience wrapper to export (download) analytics data
  const exportAnalytics = useCallback(
    async (filt: AnalyticsFilters = filters) => {
      try {
        const blob = await analyticsApi.export(filt);
        return blob;
      } catch (err) {
        console.error("exportAnalytics error:", err);
        throw err;
      }
    },
    [filters]
  );

  // auto-fetch on mount with initial filters
  useEffect(() => {
    fetchAllAnalytics(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters,
    setFilters,
    salesData,
    productData,
    marketerData,
    locationData,
    overviewData,
    isLoading,
    error,
    fetchAllAnalytics,
    exportAnalytics,
  } as const;
}

export default useAnalytics;
