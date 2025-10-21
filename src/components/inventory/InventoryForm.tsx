import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useCallback } from "react"; // Add these imports
import { InventoryFormData } from "@/types/inventory";
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

const inventorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  reorderLevel: z.number().min(0, "Reorder level must be non-negative"),
  minStockLevel: z.number().min(0, "Min stock must be non-negative"),
  maxStockLevel: z.number().min(0, "Max stock must be non-negative"),
  costPerUnit: z.number().min(0, "Cost must be non-negative"),
  supplier: z
    .string()
    .min(1, "Supplier is required")
    .max(100, "Supplier name must be less than 100 characters"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

interface InventoryFormProps {
  initialData?: Partial<InventoryFormData>;
  categories: string[];
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categoryOptions = [
  "Cement",
  "Aggregates",
  "Steel",
  "Timber/Wood",
  "Electrical Materials",
  "Equipment & Tools",
  "Consumables",
];

const commonUnits = [
  "kg",
  "g",
  "pieces",
  "sheets",
  "meters",
  "liters",
  "boxes",
  "rolls",
  "Bags",
  "Tons/Metric ton",
  "Cubic meters m³",
  "Millimeter mm",
  "Square meters m²",
  "Cubic feet ft³",
  "Liters",
];

export const InventoryForm = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: InventoryFormProps) => {
  // Add state to prevent double submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      unit: initialData?.unit || "",
      quantity: initialData?.quantity || 0,
      reorderLevel: initialData?.reorderLevel || 0,
      minStockLevel: initialData?.minStockLevel || 0,
      maxStockLevel: initialData?.maxStockLevel || 0,
      costPerUnit: initialData?.costPerUnit || 0,
      supplier: initialData?.supplier || "",
      location: initialData?.location || "",
      notes: initialData?.notes || "",
    },
  });

  // Use useCallback to prevent recreation on every render
  const handleSubmit = useCallback(
    async (data: InventoryFormData) => {
      // Prevent double submissions
      if (isLoading || isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, isLoading, isSubmitting]
  );

  const allCategories = [
    ...new Set([...categoryOptions, ...categories]),
  ].sort();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Stock Level *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Stock Level *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costPerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit (₦) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier *</FormLabel>
              <FormControl>
                <Input placeholder="Enter supplier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Optional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? "Saving..." : "Save Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
