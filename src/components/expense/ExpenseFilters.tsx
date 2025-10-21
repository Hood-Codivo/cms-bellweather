import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpenseFilters } from "@/types/business";

interface ExpenseFiltersProps {
  onFiltersChange: (filters: ExpenseFilters) => void;
}

const EXPENSE_CATEGORIES = [
  "Travel",
  "Office Supplies",
  "Marketing",
  "Utilities",
  "Equipment",
  "Software",
  "Training",
  "Miscellaneous",
];

export function ExpenseFilters({ onFiltersChange }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    status: undefined,
    category: undefined,
    from: undefined,
    to: undefined,
  });

  const handleFilterChange = (
    field: keyof ExpenseFilters,
    value: string | undefined
  ) => {
    const newFilters = {
      ...filters,
      [field]: value === "all" ? undefined : value || undefined,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ExpenseFilters = {
      status: undefined,
      category: undefined,
      from: undefined,
      to: undefined,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            handleFilterChange("status", value || undefined)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            handleFilterChange("category", value || undefined)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="from">From Date</Label>
        <Input
          id="from"
          type="date"
          value={filters.from || ""}
          onChange={(e) =>
            handleFilterChange("from", e.target.value || undefined)
          }
          className="w-40"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="to">To Date</Label>
        <Input
          id="to"
          type="date"
          value={filters.to || ""}
          onChange={(e) =>
            handleFilterChange("to", e.target.value || undefined)
          }
          className="w-40"
        />
      </div>

      <Button variant="outline" onClick={clearFilters} className="h-10">
        Clear Filters
      </Button>
    </div>
  );
}
