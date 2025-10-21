import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useExpense } from "@/hooks/useExpense";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseFilters } from "./ExpenseFilters";
import { formatCurrency } from "@/lib/utils";
import { ExpenseTable } from "./ExpenseTable";

export function ExpenseManagement() {
  const {
    expenses,
    summary,
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    fetchExpenses,
    fetchExpenseSummary, // This is the function you want to use
  } = useExpense();

  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editExpense) {
        await updateExpense(editExpense.id, data);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense(data);
        toast.success("Expense created successfully!");
      }
      setShowForm(false);
      setEditExpense(null);
      // Refresh summary after creating/updating
      await fetchExpenseSummary(filters.from, filters.to);
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors.join(", ")) ||
        err?.message ||
        "Failed to save expense. Please try again.";
      toast.error(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteExpense(deleteId);
      toast.success("Expense deleted successfully!");
      setDeleteId(null);
      // Refresh summary after deleting
      await fetchExpenseSummary(filters.from, filters.to);
    } catch (err: any) {
      toast.error("Failed to delete expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveExpense(id);
      toast.success("Expense approved successfully!");
      // Refresh summary after approval
      await fetchExpenseSummary(filters.from, filters.to);
    } catch (err: any) {
      toast.error("Failed to approve expense. Please try again.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectExpense(id);
      toast.success("Expense rejected successfully!");
      // Refresh summary after rejection
      await fetchExpenseSummary(filters.from, filters.to);
    } catch (err: any) {
      toast.error("Failed to reject expense. Please try again.");
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Fetch both expenses and summary with the same date filters
    fetchExpenses(newFilters);
    fetchExpenseSummary(newFilters.from, newFilters.to);
  };

  // Manual refresh function for summary
  const refreshSummary = () => {
    fetchExpenseSummary(filters.from, filters.to);
  };

  if (isLoading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchExpenses()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            {/* Optional refresh button for summary */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSummary}
              disabled={isLoading}
            >
              ↻
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
              if (expenses.length === 0) return "₦0";
              const total = expenses.reduce((sum, expense) => {
                const amount = typeof expense.amount === 'number' 
                  ? expense.amount 
                  : parseFloat(expense.amount) || 0;
                return sum + amount;
              }, 0);
              return formatCurrency(Number(total.toFixed(2)));
            })()}
            </div>
            {isLoading && (
              <div className="text-xs text-gray-500 mt-1">Updating...</div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Cards */}
        {/* {summary?.byCategory?.map((category, index) => (
          <Card key={category.category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {category.category}
              </CardTitle>
              <Badge variant="outline">{category.category}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(category._sum.amount))}
              </div>
              <div className="text-xs text-gray-500">
                {(summary?.total ?? 0) > 0
                  ? `${(
                      (parseFloat(category._sum.amount) /
                        (summary?.total ?? 1)) *
                      100
                    ).toFixed(1)}% of total`
                  : "0% of total"}
              </div>
            </CardContent>
          </Card>
        ))} */}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <ExpenseFilters onFiltersChange={handleFiltersChange} />
        <Button onClick={() => setShowForm(true)}>Add New Expense</Button>
      </div>

      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        onEdit={(expense) => {
          setEditExpense(expense);
          setShowForm(true);
        }}
        onDelete={(id) => setDeleteId(id)}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={isLoading}
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ExpenseForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditExpense(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editExpense}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
