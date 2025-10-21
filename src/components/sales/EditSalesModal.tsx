import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SalesForm } from "./SalesForm";
import {
  SalesRecordDetailed,
  Customer,
  ProductType,
  Marketer,
} from "@/types/business";

interface EditSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => void;
  customers: Customer[];
  productTypes: ProductType[];
  marketers: Marketer[];
  record: SalesRecordDetailed | null;
}

export function EditSalesModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  productTypes,
  marketers,
  record,
}: EditSalesModalProps) {
  const handleSubmit = (data: any) => {
    if (record) {
      // Ensure unitPrice is set based on selected productType
      const selectedProduct = (productTypes || []).find(
        (p) => p.id === data.productType
      );
      const unitPrice = selectedProduct?.unitPrice || 0;
      onSubmit(record.id, { ...data, unitPrice });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Update the sales record information below.
          </DialogDescription>
        </DialogHeader>
        <SalesForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={record}
          customers={customers}
          productTypes={productTypes}
          marketers={marketers}
        />
      </DialogContent>
    </Dialog>
  );
}
