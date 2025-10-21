import React, { useState } from "react";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { RawMaterial, RawMaterialFormData } from "@/types/production";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import { toast } from "sonner";

const unitOptions = [
  "pieces",
  "kg",
  "g",
  "bags",
  "m³",
  "liters",
  "boxes",
  "rolls",
  "mm length",
  "meters",
];

export default function RawMaterialManagement() {
  const {
    rawMaterials,
    isLoading,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
  } = useRawMaterials();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RawMaterialFormData & { id?: string }>({
    name: "",
    unit: "",
    quantity: 0,
    reorderLevel: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    costPerUnit: 0,
    supplier: "",
    location: "",
    notes: "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (form.id) {
        await updateRawMaterial(form.id, form);
        toast.success("Raw material updated successfully");
      } else {
        await addRawMaterial(form);
        toast.success("Raw material added successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save raw material"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteRawMaterial(id);
      toast.success(`${name} deleted successfully`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete raw material"
      );
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      unit: "",
      quantity: 0,
      reorderLevel: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      costPerUnit: 0,
      supplier: "",
      location: "",
      notes: "",
    });
  };

  const openEditDialog = (material: RawMaterial) => {
    setForm({
      id: material.id,
      name: material.name,
      unit: material.unit,
      quantity: material.quantity,
      reorderLevel: material.reorderLevel,
      minStockLevel: material.minStockLevel,
      maxStockLevel: material.maxStockLevel,
      costPerUnit: material.costPerUnit,
      supplier: material.supplier,
      location: material.location,
      notes: material.notes || "",
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Raw Materials</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit" : "New"} Raw Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter material name"
                  />
                </div>
                <div>
                  <Label>Unit *</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Reorder Level *</Label>
                  <Input
                    type="number"
                    required
                    value={form.reorderLevel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        reorderLevel: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Cost per Unit (₦) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={form.costPerUnit}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        costPerUnit: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Min Stock Level *</Label>
                  <Input
                    type="number"
                    required
                    value={form.minStockLevel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minStockLevel: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Max Stock Level *</Label>
                  <Input
                    type="number"
                    required
                    value={form.maxStockLevel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxStockLevel: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Input
                    required
                    value={form.supplier}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplier: e.target.value }))
                    }
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Input
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : form.id ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>₦{material.costPerUnit.toFixed(2)}</TableCell>
                  <TableCell>{material.supplier}</TableCell>
                  <TableCell>{material.location}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(material.id, material.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rawMaterials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No raw materials found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
