import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SalesForm } from "./SalesForm";
import { Customer, ProductType, Marketer } from "@/types/business";

interface AddSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  customers: Customer[];
  productTypes: ProductType[];
  marketers: Marketer[];
  isSubmitting?: boolean;
}

export function AddSalesModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  productTypes,
  marketers,
  isSubmitting = false,
}: AddSalesModalProps) {
  const handleSubmit = (data: any) => {
    // Use the manually entered unitPrice if provided, else fallback to productType's unitPrice
    const selectedProduct = (productTypes || []).find(
      (p) => p.id === data.productType
    );
    const price =
      data.unitPrice !== undefined && data.unitPrice !== ""
        ? Number(data.unitPrice)
        : selectedProduct?.unitPrice || 0;

    const formattedData = {
      date: new Date(data.date).toISOString(),
      productType: data.productType,
      quantity: data.quantity,
      marketerId: data.marketerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || "",
      deliveryLocation: data.deliveryLocation,
      notes: data.notes || "",
      unitPrice: price,
    };

    onSubmit(formattedData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
          <DialogDescription>
            Create a new sales record. Fill in all the required information
            below.
          </DialogDescription>
        </DialogHeader>
        <SalesForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          customers={customers}
          productTypes={productTypes}
          marketers={marketers}
          isSubmitting={isSubmitting}
          // showUnitPriceInput={true} // <-- show editable unitPrice input
        />
      </DialogContent>
    </Dialog>
  );
}
