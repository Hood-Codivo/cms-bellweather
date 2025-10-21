import React, { useState, useMemo } from "react";
import {
  Plus,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { SalesTable } from "./SalesTable";
import { SalesFilters } from "./SalesFilters";
import { SalesPagination } from "./SalesPagination";
import { AddSalesModal } from "./AddSalesModal";
import { EditSalesModal } from "./EditSalesModal";
import { DeleteSalesDialog } from "./DeleteSalesDialog";
import { SalesRecordDetailed } from "@/types/business";
import { toast } from "sonner";

export function SalesManagement() {
  const { user } = useAuth();
  const {
    sales,
    productTypes,
    marketers,
    customers,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    filters,
    updateFilters,
    resetFilters,
    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
  } = useSales();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecordDetailed | null>(
    null
  );
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has admin privileges
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  const handleAddSale = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addSalesRecord(data);
      setShowAddModal(false);
      toast.success("Sale created successfully");
    } catch (error) {
      toast.error("Failed to create sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSale = async (data: any) => {
    if (!editingSale) return;
    setIsSubmitting(true);
    try {
      await updateSalesRecord(editingSale.id, data);
      setEditingSale(null);
      toast.success("Sale updated successfully");
    } catch (error) {
      toast.error("Failed to update sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSaleId) return;
    setIsSubmitting(true);
    try {
      await deleteSalesRecord(deletingSaleId);
      setDeletingSaleId(null);
      toast.success("Sale deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.totalAmount || "0"),
      0
    );
    const totalSales = sales.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalCommission = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.commissionAmount || "0"),
      0
    );

    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      totalCommission,
    };
  }, [sales]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics - Only show for admin users */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦
                  {statistics.totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦
                  {statistics.averageOrderValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Commission
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦
                  {statistics.totalCommission.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <div className="text-2xl font-bold">{statistics.totalSales}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales Management</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Sale
        </Button>
      </div>

      {/* Filters */}
      {isAdmin && (
        <div className="space-y-4 mb-6">
          <SalesFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            customers={customers}
            productTypes={productTypes}
            marketers={marketers}
          />
        </div>
      )}
      {/* Sales Table */}
      <SalesTable
        sales={sales}
        onEdit={setEditingSale}
        onDelete={setDeletingSaleId}
      />

      {/* Pagination */}
      <SalesPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />

      {/* Modals */}
      <AddSalesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSale}
        productTypes={productTypes}
        marketers={marketers}
        customers={customers}
      />

      <EditSalesModal
        isOpen={!!editingSale}
        onClose={() => setEditingSale(null)}
        record={editingSale}
        onSubmit={handleEditSale}
        productTypes={productTypes}
        marketers={marketers}
        customers={customers}
      />

      <DeleteSalesDialog
        isOpen={!!deletingSaleId}
        onClose={() => setDeletingSaleId(null)}
        onConfirm={handleDeleteSale}
        customerName={editingSale?.customer?.name}
      />
    </div>
  );
}
