import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ProductionLogFormDataV2,
  ProductionTypeInitialValues,
  MaterialQuantity,
  ProductionType,
} from "@/types/production";
import { useProductionTypes } from "@/hooks/useProductionTypes";
import { useInventory } from "@/hooks/useInventory";
import { useProductionTypeInitialValues } from "@/api/production";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const productionLogSchema = z.object({
  productionTypeId: z.string().min(1, "Production type is required"),
  productionDate: z.string().min(1, "Production date is required"),
  baseMaterialQuantity: z.number().min(0.01, "Quantity must be greater than 0"),
  machine: z.string().min(1, "Machine is required"),
  operator: z.string().min(1, "Operator is required"),
  shift: z.enum(["morning", "afternoon", "night"]),
  notes: z.string().optional(),
});

interface ProductionLogFormV2Props {
  initialData?: Partial<ProductionLogFormDataV2>;
  onSubmit: (data: ProductionLogFormDataV2) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductionLogFormV2 = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductionLogFormV2Props) => {
  const { productionTypes, isLoading: isProductionTypesLoading } =
    useProductionTypes();
  const { items: inventoryItems, isLoading: isInventoryLoading } =
    useInventory();

  const [selectedProductionType, setSelectedProductionType] =
    useState<ProductionType | null>(null);
  const [initialValues, setInitialValues] =
    useState<ProductionTypeInitialValues | null>(null);
  const [scaledMaterials, setScaledMaterials] = useState<MaterialQuantity[]>(
    []
  );
  const [scaledUnitsProduced, setScaledUnitsProduced] = useState<number>(0);
  const [scaledTotalCost, setScaledTotalCost] = useState<number>(0);
  const [isUsingDefaultValues, setIsUsingDefaultValues] =
    useState<boolean>(true);

  const form = useForm({
    resolver: zodResolver(productionLogSchema),
    defaultValues: {
      productionTypeId: initialData?.productionTypeId || "",
      productionDate:
        initialData?.productionDate || new Date().toISOString().split("T")[0],
      baseMaterialQuantity: 1,
      machine: initialData?.machine || "",
      operator: initialData?.operator || "",
      shift: initialData?.shift || "morning",
      notes: initialData?.notes || "",
    },
  });

  const watchedProductionTypeId = form.watch("productionTypeId");
  const watchedBaseMaterialQuantity = form.watch("baseMaterialQuantity");

  // Fetch initial values when production type is selected
  const { data: initialValuesData, isLoading: isInitialValuesLoading } =
    useProductionTypeInitialValues(watchedProductionTypeId);

  // Update selected production type when production type changes
  useEffect(() => {
    if (watchedProductionTypeId) {
      const productionType = productionTypes.find(
        (pt) => pt.id === watchedProductionTypeId
      );
      setSelectedProductionType(productionType || null);
      setInitialValues(null);
      setScaledMaterials([]);
      setScaledUnitsProduced(0);
      setScaledTotalCost(0);
      setIsUsingDefaultValues(true);
      form.setValue("baseMaterialQuantity", 1);
    }
  }, [watchedProductionTypeId, productionTypes, form]);

  // Set initial values when fetched
  useEffect(() => {
    if (initialValuesData) {
      setInitialValues(initialValuesData);
      setScaledMaterials(
        initialValuesData.initialMaterials.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
        }))
      );
      setScaledUnitsProduced(initialValuesData.unitsProduced);
      setScaledTotalCost(initialValuesData.totalCost);
    }
  }, [initialValuesData]);

  // Calculate scaled values when base material quantity changes
  useEffect(() => {
    if (
      !initialValues ||
      !watchedBaseMaterialQuantity ||
      watchedBaseMaterialQuantity <= 0
    ) {
      setScaledMaterials([]);
      setScaledUnitsProduced(0);
      setScaledTotalCost(0);
      setIsUsingDefaultValues(true);
      return;
    }

    const baseMaterial = initialValues.initialMaterials[0];
    const scalingRatio = watchedBaseMaterialQuantity / baseMaterial.quantity;

    const scaledMaterials = initialValues.initialMaterials.map(
      (material: any) => {
        const scaledQuantity = Math.floor(scalingRatio * material.quantity);
        const scaledCost = (material.cost / material.quantity) * scaledQuantity;

        return {
          materialId: material.materialId,
          quantity: scaledQuantity,
          cost: scaledCost,
        };
      }
    );

    const totalCost = scaledMaterials.reduce((sum, m) => sum + m.cost, 0);
    const unitsProduced = Math.floor(
      scalingRatio * initialValues.unitsProduced
    );

    setScaledMaterials(scaledMaterials);
    setScaledUnitsProduced(unitsProduced);
    setScaledTotalCost(totalCost);
    setIsUsingDefaultValues(Math.abs(scalingRatio - 1) < 0.01); // Check if close to 1.0
  }, [watchedBaseMaterialQuantity, initialValues]);

  const handleSubmit = (data: any) => {
    if (scaledUnitsProduced <= 0) {
      toast.error("Cannot create production log with 0 units produced");
      return;
    }

    const productionLogData: ProductionLogFormDataV2 = {
      productionTypeId: data.productionTypeId,
      productionDate: new Date(data.productionDate).toISOString(),
      machine: data.machine,
      operator: data.operator,
      shift: data.shift,
      notes: data.notes,
    };

    // Only include rawMaterialsUsed if user adjusted the base material
    if (watchedBaseMaterialQuantity > 0 && initialValues) {
      const baseMaterial = initialValues.initialMaterials[0];
      productionLogData.rawMaterialsUsed = [
        {
          materialId: baseMaterial.materialId,
          quantity: watchedBaseMaterialQuantity,
        },
      ];
    }

    onSubmit(productionLogData);
  };

  if (isProductionTypesLoading || isInventoryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Production Type Selection */}
          <FormField
            control={form.control}
            name="productionTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Production Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select production type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} (produces {type.unitsProduced} units)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Initial Values Display */}
          {/* Removed preview card for Standard Production */}

          {/* Production Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="machine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter machine name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter operator name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Base Material Adjustment */}
          {initialValues && (
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Scale Production (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-orange-700">
                  Adjust the base material quantity to scale production up or
                  down. All other materials will scale proportionally.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Base Material Quantity: {watchedBaseMaterialQuantity}{" "}
                      {initialValues.initialMaterials[0]?.unit}
                    </Label>
                    <div className="mt-2">
                      <Slider
                        value={[watchedBaseMaterialQuantity]}
                        onValueChange={(value) =>
                          form.setValue("baseMaterialQuantity", value[0])
                        }
                        min={0.1}
                        max={
                          initialValues.initialMaterials[0]?.quantity * 5 || 10
                        }
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0.1x</span>
                        <span>1x (Default)</span>
                        <span>5x</span>
                      </div>
                    </div>
                  </div>

                  {!isUsingDefaultValues && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Production has been scaled. Raw materials used will be
                        included in the request.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || scaledUnitsProduced <= 0}
            >
              {isLoading ? "Creating..." : "Create Production Log"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
