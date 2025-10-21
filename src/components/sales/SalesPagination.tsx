import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageCount?: number; // Total number of pages from backend
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const SalesPagination: React.FC<SalesPaginationProps> = ({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  // Calculate total pages from backend pageCount or fallback to calculation
  const totalPages = pageCount || Math.ceil(total / pageSize);

  // Don't show pagination if there's only one page and no items
  if ((totalPages <= 1 && total <= pageSize) || total === 0) return null;
  
  // Calculate the range of items being shown
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Page info and size selector */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {total} results
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="inline-block h-3 w-3 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Loading...
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
          title="First page"
        >
          «
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 p-0"
          title="Previous page"
        >
          ‹
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span key={index} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={index}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                disabled={isLoading}
                onClick={() => onPageChange(pageNum as number)}
                className={`min-w-[32px] h-8 p-0 ${
                  page === pageNum ? "font-bold" : ""
                }`}
                aria-current={page === pageNum ? "page" : undefined}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 p-0"
          title="Next page"
        >
          ›
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
          title="Last page"
        >
          »
        </Button>
      </div>
    </div>
  );
};
