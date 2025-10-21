import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { InventoryForm } from "./InventoryForm";
import { toast } from "sonner";
import api from "@/api/axios";

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
  item: InventoryItem | null;
  categories: string[];
  onSuccess?: () => void;
}

export const EditInventoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  categories,
  onSuccess,
}: EditInventoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InventoryFormData) => {
    if (!item) return;

    setIsLoading(true);
    try {
      // Call the backend API to update the inventory item
      await api.put(`/api/v1/inventory/${item.id}`, data);

      // Call the local onSubmit to update the UI state
      onSubmit(data);

      toast.success("Inventory item updated successfully");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      toast.error(
        error.response?.data?.message || "Failed to update inventory item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryForm
          initialData={item}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
