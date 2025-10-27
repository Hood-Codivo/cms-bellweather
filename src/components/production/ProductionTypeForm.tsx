import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ProductionTypeFormData,
  MaterialQuantity,
  RawMaterial,
} from "@/types/production";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calculator, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

const productionTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Production type name is required")
    .max(100, "Name must be less than 100 characters"),
  rawMaterialsRequired: z
    .array(
      z.object({
        materialId: z.string().min(1, "Material is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      })
    )
    .min(1, "At least one raw material is required"),
  unitsProduced: z
    .number()
    .min(1, "Units produced must be at least 1")
    .max(10000, "Units produced cannot exceed 10,000"),
  unitPrice: z
    .number({ invalid_type_error: "Unit price is required" })
    .min(0, "Unit price must be at least 0"),
});

interface ProductionTypeFormProps {
  initialData?: Partial<ProductionTypeFormData>;
  onSubmit: (data: ProductionTypeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showUnitPriceInput?: boolean;
}

export const ProductionTypeForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showUnitPriceInput = false,
}: ProductionTypeFormProps) => {
  const { items: inventoryItems, isLoading: isInventoryLoading } =
    useInventory();
  const [selectedMaterials, setSelectedMaterials] = useState<
    MaterialQuantity[]
  >(initialData?.rawMaterialsRequired || [{ materialId: "", quantity: 1 }]);

  // Cache for fetched material details
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>(
    {}
  );

  // Fetch material details by ID and cache them
  const fetchMaterialDetail = async (materialId: string) => {
    if (!materialId || materialDetails[materialId]) return;
    try {
      const response = await api.get(`/api/v1/inventory/${materialId}`);
      setMaterialDetails((prev) => ({ ...prev, [materialId]: response.data }));
    } catch (error) {
      // Optionally handle error
    }
  };

  // When a material is selected, fetch its details
  useEffect(() => {
    selectedMaterials.forEach((mat) => {
      if (mat.materialId) fetchMaterialDetail(mat.materialId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterials]);

  const form = useForm<ProductionTypeFormData>({
    resolver: zodResolver(productionTypeSchema),
    defaultValues: {
      name: initialData?.name || "",
      rawMaterialsRequired: selectedMaterials,
      unitsProduced: initialData?.unitsProduced || 1,
      unitPrice: initialData?.unitPrice || 0,
    },
  });

  // Calculate total cost per unit using fetched material details
  const calculateTotalCost = () => {
    return selectedMaterials.reduce((total, material) => {
      const detail = materialDetails[material.materialId];
      if (detail && material.quantity) {
        return total + (detail.costPerUnit || 0) * material.quantity;
      }
      return total;
    }, 0);
  };

  const addMaterial = () => {
    const newMaterials = [
      ...selectedMaterials,
      { materialId: "", quantity: 1 },
    ];
    setSelectedMaterials(newMaterials);
    form.setValue("rawMaterialsRequired", newMaterials);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = selectedMaterials.filter((_, i) => i !== index);
    setSelectedMaterials(newMaterials);
    form.setValue("rawMaterialsRequired", newMaterials);
  };

  const updateMaterial = (
    index: number,
    field: keyof MaterialQuantity,
    value: string | number
  ) => {
    const newMaterials = [...selectedMaterials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setSelectedMaterials(newMaterials);
    form.setValue("rawMaterialsRequired", newMaterials);
  };

  const handleSubmit = (data: ProductionTypeFormData) => {
    // Validate that all materials have been selected
    const validMaterials = selectedMaterials.filter(
      (m) => m.materialId && m.quantity > 0
    );

    if (validMaterials.length === 0) {
      toast.error("Please select at least one raw material");
      return;
    }

    const formData = {
      ...data,
      rawMaterialsRequired: validMaterials,
    };

    onSubmit(formData);
  };

  const totalCost = calculateTotalCost();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Production Type Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Type Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter production type name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitsProduced"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units Produced Per Batch *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="Enter number of units produced per batch"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Price Input */}
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (₦) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter unit price for 1 unit"
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Raw Materials Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Raw Materials Required Per Unit
              <Badge variant="secondary" className="ml-auto">
                Total Cost: ₦{totalCost.toFixed(2)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMaterials.map((material, index) => {
              const detail = materialDetails[material.materialId];
              const materialCost = detail
                ? (detail.costPerUnit || 0) * material.quantity
                : 0;

              return (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Material {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(index)}
                      disabled={selectedMaterials.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Raw Material *</Label>
                      <Select
                        value={material.materialId}
                        onValueChange={(value) =>
                          updateMaterial(index, "materialId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select raw material" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity Required *</Label>
                      <Input
                        type="number"
                        value={material.quantity}
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {detail && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          Material Cost: ₦
                          {typeof detail.costPerUnit === "number" &&
                          !isNaN(detail.costPerUnit)
                            ? detail.costPerUnit.toFixed(2)
                            : "-"}{" "}
                          per {detail.unit}
                        </span>
                        <span className="font-medium">
                          Total: ₦
                          {typeof materialCost === "number" &&
                          !isNaN(materialCost)
                            ? materialCost.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {detail.name} | Available: {detail.quantity}{" "}
                        {detail.unit}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={addMaterial}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Raw Material
            </Button>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        {totalCost > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Cost per Unit:</span>
                  <span className="font-bold text-lg">
                    ₦{totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  This is the estimated cost to produce one batch of this
                  production type
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Production Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
