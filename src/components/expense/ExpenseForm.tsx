import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseFormData } from "@/types/business";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: any;
  isSubmitting?: boolean;
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

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>({
    category: EXPENSE_CATEGORIES[0] || "Travel",
    description: "",
    amount: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        category: initialData.category || "",
        description: initialData.description || "",
        amount: initialData.amount || 0,
        expenseDate: initialData.expenseDate
          ? new Date(initialData.expenseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        receiptUrl: initialData.receiptUrl || "",
      });
    } else {
      setForm({
        category: "",
        description: "",
        amount: 0,
        expenseDate: new Date().toISOString().split("T")[0],
        receiptUrl: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.category ||
      !form.description ||
      form.amount <= 0 ||
      !form.expenseDate
    ) {
      return;
    }
    onSubmit(form);
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter expense description..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseDate">Expense Date *</Label>
            <Input
              id="expenseDate"
              type="date"
              value={form.expenseDate}
              onChange={(e) => handleInputChange("expenseDate", e.target.value)}
              required
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
            <Input
              id="receiptUrl"
              type="url"
              value={form.receiptUrl}
              onChange={(e) => handleInputChange("receiptUrl", e.target.value)}
              placeholder="https://example.com/receipt.pdf"
            />
          </div> */}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
