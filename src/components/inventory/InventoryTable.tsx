import { useState } from "react";
import { InventoryItem } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable = ({
  items,
  onEdit,
  onDelete,
}: InventoryTableProps) => {
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const isLowStock = (item: InventoryItem) =>
    item.quantity <= item.reorderLevel;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("name")}
            >
              Name{" "}
              {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("category")}
            >
              Category{" "}
              {sortField === "category" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("quantity")}
            >
              Stock{" "}
              {sortField === "quantity" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Reorder Level</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("costPerUnit")}
            >
              Cost/Unit{" "}
              {sortField === "costPerUnit" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow
              key={item.id}
              className={isLowStock(item) ? "bg-red-50" : ""}
            >
              <TableCell className="font-medium">
                {item.name}
                {isLowStock(item) && (
                  <AlertTriangle className="inline ml-2 h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.category}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    isLowStock(item) ? "text-red-600 font-semibold" : ""
                  }
                >
                  {item.quantity}
                </span>
              </TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell className="text-right">{item.reorderLevel}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.costPerUnit)}
              </TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell>{formatDate(item.lastUpdated)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sortedItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No inventory items found
        </div>
      )}
    </div>
  );
};
