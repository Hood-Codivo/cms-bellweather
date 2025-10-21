import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Combobox } from "@/components/ui/combobox";
import {
  SalesRecordDetailed,
  Customer,
  ProductType,
  Marketer,
} from "@/types/business";

// 1️⃣ Define a schema WITHOUT unitPrice — it's calculated by the system
const salesFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  marketerId: z.string().min(1, "Marketer is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().optional(),
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  notes: z.string().optional(),
});
type SalesFormData = z.infer<typeof salesFormSchema>;

interface SalesFormProps {
  onSubmit: (data: Omit<SalesFormData, never>) => void;
  onCancel: () => void;
  initialData?: SalesRecordDetailed | null;
  customers: Customer[];
  productTypes: ProductType[];
  marketers: Marketer[];
  isSubmitting?: boolean;
  calculated?: { unitPrice?: number; total?: number; commission?: number };
}

export function SalesForm({
  onSubmit,
  onCancel,
  initialData,
  customers,
  productTypes,
  marketers,
  isSubmitting = false,
  calculated,
}: SalesFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      date: initialData?.saleDate
        ? new Date(initialData.saleDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      productType: initialData?.productionTypeId || "",
      quantity: initialData?.quantity || 1,
      marketerId: initialData?.salesPersonId || "",
      customerName: initialData?.customer?.name || "",
      customerEmail: initialData?.customer?.email || "",
      customerPhone: initialData?.customer?.phone || "",
      deliveryLocation: initialData?.deliveryLocation || "",
      notes: initialData?.notes || "",
    },
  });

  // Sync combobox selection → form fields
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("customerName", selectedCustomer.name);
      form.setValue("customerEmail", selectedCustomer.email);
      form.setValue("customerPhone", selectedCustomer.phone || "");
    }
  }, [selectedCustomer, form]);

  // Clear selection if user types a new email
  useEffect(() => {
    const email = form.watch("customerEmail");
    if (email && !customers.some((c) => c.email === email)) {
      setSelectedCustomer(null);
    }
  }, [form.watch("customerEmail"), customers]);

  // Pull out current quantity & productType to compute summary
  const [quantity, productType] = form.watch(["quantity", "productType"]);
  const selectedProduct = productTypes.find((p) => p.id === productType);

  // unitPrice comes from `calculated` or from the productType itself
  const unitPrice = calculated?.unitPrice ?? selectedProduct?.unitPrice ?? 0;
  const total = calculated?.total ?? quantity * unitPrice;
  const commission = calculated?.commission;

  const handleSubmit = (data: SalesFormData) => {
    // Strip out everything except what the API wants
    onSubmit({
      date: data.date,
      productType: data.productType,
      quantity: data.quantity,
      marketerId: data.marketerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      deliveryLocation: data.deliveryLocation,
      notes: data.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Type */}
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productTypes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ₦{(p.unitPrice || 0).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Marketer */}
          <FormField
            control={form.control}
            name="marketerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marketer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marketer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {marketers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Email (combobox) */}
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Email</FormLabel>
                <Combobox
                  options={customers.map((c) => ({
                    label: `${c.name} (${c.email})`,
                    value: c.email,
                  }))}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    const match = customers.find((c) => c.email === val);
                    setSelectedCustomer(match || null);
                  }}
                  placeholder="Select or enter email"
                  allowCustom
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Name */}
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Customer name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Phone */}
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Phone (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Location */}
          <FormField
            control={form.control}
            name="deliveryLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Where to deliver" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Any extra info…" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary Panel */}
        <div className="border rounded-lg p-4 bg-muted/10">
          <h4 className="font-semibold mb-2">Order Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Quantity: {quantity.toLocaleString()}</div>
            <div>
              Unit Price: ₦
              {unitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="font-semibold col-span-2">
              Total: ₦
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            {commission != null && (
              <div className="col-span-2 text-xs text-muted-foreground">
                Commission: ₦
                {commission.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : initialData
              ? "Update Sale"
              : "Create Sale"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
