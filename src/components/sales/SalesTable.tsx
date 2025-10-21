import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesRecordDetailed } from "@/types/business";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface SalesTableProps {
  sales: SalesRecordDetailed[];
  onEdit: (record: SalesRecordDetailed) => void;
  onDelete: (id: string) => void;
}

export function SalesTable({ sales, onEdit, onDelete }: SalesTableProps) {
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user && (user.role === "super_admin" || user.role === "admin");
  
  // Filter sales for today and handle user roles
  const filteredSales = React.useMemo(() => {
    if (!sales || !Array.isArray(sales)) return [];
    
    // If user is admin/superadmin, show all sales
    if (isAdmin) {
      return sales;
    }
    
    // For non-admin users, show only today's sales and exclude admin/superadmin users
    const today = new Date().toDateString();
    return sales.filter(sale => {
      if (!sale || !sale.saleDate) return false;
      
      const saleDate = new Date(sale.saleDate).toDateString();
      const isToday = saleDate === today;
      const isNotAdmin = sale.salesPerson?.user?.role && 
                        !['super_admin', 'admin'].includes(sale.salesPerson.user.role);
      
      return isToday && isNotAdmin;
    });
  }, [sales, isAdmin]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "MMM dd, yyyy");
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  if (filteredSales.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sales records found. Add your first sale to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Marketer</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Created By</TableHead>
            {isAdmin && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{formatDate(sale.saleDate)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{sale.customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {sale.customer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{sale.productionType.name}</div>
                  {/* <div className="text-sm text-muted-foreground">
                    ID: {sale.productionType.id}
                  </div> */}
                </div>
              </TableCell>
              <TableCell>{sale.quantity.toLocaleString()}</TableCell>
              <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
              <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {sale.salesPerson.user.firstName}{" "}
                    {sale.salesPerson.user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sale.salesPerson.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(sale.commissionAmount)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {sale.deliveryLocation}
              </TableCell>
              <TableCell>
                <div className="whitespace-nowrap">
                  {formatDate(sale.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                {sale.createdBy ? (
                  <div>
                    <div className="font-medium">
                      {sale.createdBy.firstName} {sale.createdBy.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sale.createdBy.email}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(sale)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(sale.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
