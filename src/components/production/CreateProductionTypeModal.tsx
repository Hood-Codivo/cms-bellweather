import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductionTypeFormData } from "@/types/production";
import { ProductionTypeForm } from "./ProductionTypeForm";
import { toast } from "sonner";
import api from "@/api/axios";

interface CreateProductionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProductionTypeModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductionTypeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductionTypeFormData) => {
    setIsLoading(true);
    try {
      // Ensure unitPrice is sent as a number
      await api.post("/api/v1/production/types", {
        ...data,
        unitPrice: Number(data.unitPrice),
      });
      toast.success("Production type created successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create production type"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Production Type</DialogTitle>
        </DialogHeader>
        <ProductionTypeForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          showUnitPriceInput // <-- Add this prop to show the unit price input
        />
      </DialogContent>
    </Dialog>
  );
};
