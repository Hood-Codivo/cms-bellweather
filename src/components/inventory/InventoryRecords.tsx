import React, { useState, useEffect } from "react";
import {
  useInventoryMonthlyRecords,
  InventoryMonthlyRecord,
  MonthlyRecordFilters,
  InventoryValueTrend,
} from "../../hooks/useInventoryMonthlyRecords";

const InventoryMonthlyRecords: React.FC = () => {
  const {
    records,
    loading,
    error,
    getAllRecords,
    getRecordsByItemName,
    getValueTrend,
    clearError,
  } = useInventoryMonthlyRecords();

  // Filter states
  const [filters, setFilters] = useState<MonthlyRecordFilters>({});
  const [searchItemName, setSearchItemName] = useState("");
  const [itemRecords, setItemRecords] = useState<InventoryMonthlyRecord[]>([]);
  const [trendData, setTrendData] = useState<InventoryValueTrend[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "item" | "trend">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load all records on component mount
  useEffect(() => {
    if (activeTab === "all") {
      getAllRecords({
        ...filters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
    }
  }, [getAllRecords, filters, currentPage, activeTab]);

  // Handle filter changes
  const handleFilterChange = (
    key: keyof MonthlyRecordFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle item search
  const handleItemSearch = async () => {
    if (!searchItemName.trim()) return;

    const data = await getRecordsByItemName(searchItemName.trim());
    setItemRecords(data);
  };

  // Handle trend data fetch
  const handleTrendFetch = async (months: number = 12, itemName?: string) => {
    const data = await getValueTrend(months, itemName);
    setTrendData(data);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get month name
  const getMonthName = (monthNumber: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inventory Monthly Records
      </h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: "all", label: "All Records" },
          { key: "item", label: "Item Search" },
          { key: "trend", label: "Value Trends" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === key
                ? "bg-blue-500 text-white border-b-2 border-blue-500"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* All Records Tab */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={filters.name || ""}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={filters.year || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "year",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={filters.month || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "month",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Levels
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.category || "No category"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getMonthName(record.month)} {record.year}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.quantity.toLocaleString()} {record.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(record.costPerUnit)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(record.totalCost)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div>Min: {record.minStockLevel}</div>
                            <div>Reorder: {record.reorderLevel}</div>
                            <div>Max: {record.maxStockLevel}</div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={records.length < itemsPerPage || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Item Search Tab */}
      {activeTab === "item" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Search Records for Specific Item
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchItemName}
                onChange={(e) => setSearchItemName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name..."
                onKeyPress={(e) => e.key === "Enter" && handleItemSearch()}
              />
              <button
                onClick={handleItemSearch}
                disabled={!searchItemName.trim() || loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>

          {itemRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  Records for "{searchItemName}"
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost/Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recorded
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itemRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getMonthName(record.month)} {record.year}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.quantity.toLocaleString()} {record.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(record.costPerUnit)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(record.totalCost)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(record.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend Tab */}
      {activeTab === "trend" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Inventory Value Trends
            </h3>
            <div className="flex gap-4">
              <select
                onChange={(e) => handleTrendFetch(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>Last 12 months</option>
                <option value={6}>Last 6 months</option>
                <option value={3}>Last 3 months</option>
              </select>
              <button
                onClick={() => handleTrendFetch()}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Load Trends
              </button>
            </div>
          </div>

          {trendData.length > 0 && (
            <div className="grid gap-6">
              {trendData.map((trend) => (
                <div
                  key={`${trend.year}-${trend.month}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {getMonthName(trend.month)} {trend.year}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(trend.totalValue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trend.itemCount} items
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-2">
                      {trend.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({item.quantity} units)
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(item.totalValue)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.costPerUnit)}/unit
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryMonthlyRecords;
