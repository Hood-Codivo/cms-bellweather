import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ProductionLogFormDataV2 } from "@/types/production";
import { toast } from "sonner";
import api from "@/api/axios";
import { ProductionLogFormV2 } from "./ProductionLogForm";

interface CreateProductionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductionLogModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductionLogModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductionLogFormDataV2) => {
    setIsLoading(true);
    try {
      await api.post("/api/v1/production/logs", data);
      toast.success("Production log created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating production log:", error);
      toast.error("Failed to create production log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Production Log</DialogTitle>
        </DialogHeader>
        <ProductionLogFormV2
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
