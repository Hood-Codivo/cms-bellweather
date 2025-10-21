import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductionTypeForm } from "./ProductionTypeForm";
import { toast } from "sonner";
import { ProductionTypeFormData, ProductionType } from "@/types/production";
import { useProductionTypes } from "@/hooks/useProductionTypes";

interface EditProductionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionType: ProductionType | null;
  onSuccess?: () => void;
}

export const EditProductionTypeModal = ({
  isOpen,
  onClose,
  productionType,
  onSuccess,
}: EditProductionTypeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProductionType } = useProductionTypes();

  const handleSubmit = async (data: ProductionTypeFormData) => {
    if (!productionType) return;
    setIsLoading(true);

    try {
      // Merge the existing productionType with the submitted form data so
      // the user doesn't need to re-enter unchanged fields.
      const payload = {
        ...productionType,
        ...data,
        // ensure numeric conversion when provided
        unitPrice:
          data.unitPrice !== undefined && data.unitPrice !== null
            ? Number(data.unitPrice)
            : productionType.unitPrice,
      } as any;

      // Remove fields that the backend might reject (read-only meta fields)
      // Keep the payload minimal and only include mutable fields.
      const { id, createdAt, updatedAt, ...cleanPayload } = payload;

      // Use the hook's update function (it already refreshes the list)
      await updateProductionType(
        productionType.id,
        cleanPayload as ProductionTypeFormData
      );

      toast.success("Production type updated successfully");

      // Let parent components know and close modal
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update production type"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Production Type</DialogTitle>
        </DialogHeader>

        <ProductionTypeForm
          initialData={productionType}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          showUnitPriceInput
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProductionTypeModal;
