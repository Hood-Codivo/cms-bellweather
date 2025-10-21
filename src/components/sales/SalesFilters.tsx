import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer, ProductType, Marketer } from "@/types/business";

interface SalesFiltersProps {
  filters: {
    search: string;
    productType: string;
    marketer: string;
    customer: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
  onFiltersChange: (filters: Partial<SalesFiltersProps["filters"]>) => void;
  onReset: () => void;
  customers: Customer[];
  productTypes: ProductType[];
  marketers: Marketer[];
}

export function SalesFilters({
  filters,
  onFiltersChange,
  onReset,
  customers,
  productTypes,
  marketers,
}: SalesFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Update local search value when filters change externally (e.g., on reset)
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  // Apply search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFiltersChange]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({ [key]: value });
  };

  const handleSearch = () => {
    onFiltersChange({ search: searchValue });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDateRangeChange = (key: "from" | "to", value: string) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  const handleReset = () => {
    onReset();
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      search: "",
      productType: "all",
      marketer: "all",
      customer: "all",
      dateRange: { from: "", to: "" },
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.productType && filters.productType !== "all") ||
    (filters.marketer && filters.marketer !== "all") ||
    (filters.customer && filters.customer !== "all") ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by customer, product, or marketer..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <Select
            value={filters.productType || "all"}
            onValueChange={(value) => handleFilterChange("productType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {productTypes.map((product) => (
                <SelectItem key={product.name} value={product.name}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.marketer || "all"}
            onValueChange={(value) => handleFilterChange("marketer", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Marketer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Marketers</SelectItem>
              {marketers.map((marketer) => (
                <SelectItem key={marketer.id} value={marketer.id}>
                  {marketer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.customer || "all"}
            onValueChange={(value) => handleFilterChange("customer", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div></div>

        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="From"
            value={filters.dateRange.from}
            onChange={(e) => handleDateRangeChange("from", e.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.dateRange.to}
            onChange={(e) => handleDateRangeChange("to", e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
