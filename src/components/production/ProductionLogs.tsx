import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Factory,
  Calendar,
  User,
  Package,
  Loader,
  Edit,
  Trash2,
} from "lucide-react";
import {
  ProductionLog,
  ProductionType,
  MaterialQuantity,
  ProductionLogFormData,
} from "@/types/production";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useProductionLogs } from "@/hooks/useProductionLogs";
import { useProductionTypes } from "@/hooks/useProductionTypes";
import { toast } from "sonner";
import api from "@/api/axios";

interface ProductionFormData {
  date: string;
  productionTypeId: string;
  baseMaterialQuantity: number;
  machineId: string;
  operatorName: string;
  shift: "morning" | "afternoon" | "night";
  notes: string;
}

const ProductionLogs = () => {
  const {
    productionLogs,
    isLoading,
    createProductionLog,
    updateProductionLog,
    deleteProductionLog,
  } = useProductionLogs();
  const { productionTypes } = useProductionTypes();
  const { rawMaterials } = useRawMaterials();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductionFormData>({
    date: new Date().toISOString().split("T")[0],
    productionTypeId: "",
    baseMaterialQuantity: 0,
    machineId: "",
    operatorName: "",
    shift: "morning",
    notes: "",
  });
  const [calculatedUnits, setCalculatedUnits] = useState<number>(0);
  const [calculatedMaterials, setCalculatedMaterials] = useState<
    MaterialQuantity[]
  >([]);
  const [materialCache, setMaterialCache] = useState<
    Record<string, { name: string; unit: string }>
  >({});
  const [editingLog, setEditingLog] = useState<ProductionLog | null>(null);
  const fetchAttempted = useRef<Set<string>>(new Set());

  // Helper to fetch material from inventory API if not found locally
  const fetchMaterialFromInventory = async (materialId: string) => {
    if (
      !materialId ||
      materialCache[materialId] ||
      fetchAttempted.current.has(materialId)
    )
      return;
    fetchAttempted.current.add(materialId);
    try {
      const response = await api.get(`/api/v1/inventory/${materialId}`);
      const { name, unit } = response.data;
      setMaterialCache((prev) => ({ ...prev, [materialId]: { name, unit } }));
    } catch (error) {
      setMaterialCache((prev) => ({
        ...prev,
        [materialId]: { name: "Unknown Material", unit: "" },
      }));
    }
  };

  // Calculate total product produced by product type
  const productTotals: { type: string; total: number }[] = Object.entries(
    productionLogs.reduce((acc, log) => {
      const productionType = productionTypes.find(
        (pt) => pt.id === log.productionTypeId
      );
      const name = productionType?.name || "Unknown";
      acc[name] = (acc[name] || 0) + (log.unitsProduced || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, total]) => ({ type, total }));

  const selectedProductionType = productionTypes.find(
    (pt) => pt.id === formData.productionTypeId
  );

  useEffect(() => {
    if (selectedProductionType && formData.baseMaterialQuantity > 0) {
      // Find the first material as base material for calculation
      const baseMaterial = selectedProductionType.rawMaterialsRequired[0];
      if (baseMaterial) {
        const units = Math.floor(
          formData.baseMaterialQuantity / baseMaterial.quantity
        );
        setCalculatedUnits(units);

        const materials: MaterialQuantity[] =
          selectedProductionType.rawMaterialsRequired.map((mat) => {
            return {
              materialId: mat.materialId,
              quantity: mat.quantity * units,
            };
          });
        setCalculatedMaterials(materials);
      }
    } else {
      setCalculatedUnits(0);
      setCalculatedMaterials([]);
    }
  }, [
    formData.productionTypeId,
    formData.baseMaterialQuantity,
    selectedProductionType,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductionType) return;

    setIsSubmitting(true);
    try {
      const productionLogData: ProductionLogFormData = {
        productionTypeId: selectedProductionType.id,
        productionDate: new Date(formData.date).toISOString(),
        rawMaterialsUsed: calculatedMaterials,
        machine: formData.machineId,
        operator: formData.operatorName,
        shift: formData.shift,
        notes: formData.notes,
      };

      if (editingLog) {
        await updateProductionLog(editingLog.id, productionLogData);
        toast.success("Production log updated successfully");
      } else {
        await createProductionLog(productionLogData);
        toast.success("Production log created successfully");
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        productionTypeId: "",
        baseMaterialQuantity: 0,
        machineId: "",
        operatorName: "",
        shift: "morning",
        notes: "",
      });
      setShowForm(false);
      setEditingLog(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingLog ? "update" : "create"} production log`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductionTypeName = (productionTypeId: string) => {
    const productionType = productionTypes.find(
      (pt) => pt.id === productionTypeId
    );
    return productionType?.name || "Unknown Type";
  };

  const getMaterialName = (materialId: string) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    if (material) return material.name;
    if (materialCache[materialId]) return materialCache[materialId].name;
    // Trigger fetch if not attempted
    if (!fetchAttempted.current.has(materialId)) {
      fetchMaterialFromInventory(materialId);
      return "Loading...";
    }
    return "Unknown Material";
  };

  const getMaterialUnit = (materialId: string) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    if (material) return material.unit;
    if (materialCache[materialId]) return materialCache[materialId].unit;
    // Trigger fetch if not attempted
    if (!fetchAttempted.current.has(materialId)) {
      fetchMaterialFromInventory(materialId);
      return "";
    }
    return "";
  };

  const handleEdit = (log: ProductionLog) => {
    setEditingLog(log);
    // Populate form with log data
    const baseMaterial = log.rawMaterialsUsed[0];
    const baseQuantity = baseMaterial ? baseMaterial.quantity : 0;
    setFormData({
      date: new Date(log.productionDate).toISOString().split("T")[0],
      productionTypeId: log.productionTypeId,
      baseMaterialQuantity: baseQuantity,
      machineId: log.machine || "",
      operatorName: log.operator || "",
      shift: (log.shift as "morning" | "afternoon" | "night") || "morning",
      notes: log.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductionLog(id);
      toast.success("Production log deleted successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete production log"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Improved Total Product Produced by Product Type */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Package className="h-6 w-6 text-blue-600" />
          <div className="text-lg font-bold text-blue-800">
            Total Product Produced (by Product Type)
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productTotals.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No production records yet.
            </div>
          ) : (
            productTotals.map(({ type, total }) => (
              <div
                key={type}
                className="bg-white border border-blue-200 rounded-lg shadow-sm p-4 flex flex-col items-center"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-700 text-base truncate max-w-[120px]">
                    {type}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-blue-900">
                  {total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">units produced</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Production Logs
        </h1>
        <Button
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          onClick={() => {
            setEditingLog(null);
            setShowForm(!showForm);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Production Log
        </Button>
      </div>

      {/* Add Production Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              {editingLog ? "Edit Production Entry" : "New Production Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productionType" className="text-sm">
                    Production Type
                  </Label>
                  <Select
                    value={formData.productionTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productionTypeId: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select production type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProductionType &&
                  selectedProductionType.rawMaterialsRequired.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="baseMaterial" className="text-sm">
                        Base Material Quantity
                      </Label>
                      <Input
                        id="baseMaterial"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.baseMaterialQuantity || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baseMaterialQuantity: Number(e.target.value),
                          })
                        }
                        placeholder="Enter quantity"
                        className="text-sm"
                        required
                      />
                    </div>
                  )}
                <div className="space-y-2">
                  <Label htmlFor="machine" className="text-sm">
                    Machine
                  </Label>
                  <Select
                    value={formData.machineId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, machineId: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Machine-A">Machine A</SelectItem>
                      <SelectItem value="Machine-B">Machine B</SelectItem>
                      <SelectItem value="Machine-C">Machine C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator" className="text-sm">
                    Operator
                  </Label>
                  <Input
                    id="operator"
                    value={formData.operatorName}
                    onChange={(e) =>
                      setFormData({ ...formData, operatorName: e.target.value })
                    }
                    placeholder="Operator name"
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-sm">
                    Shift
                  </Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value: "morning" | "afternoon" | "night") =>
                      setFormData({ ...formData, shift: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Optional notes about this production run"
                  className="text-sm"
                />
              </div>

              {/* Production Calculation Preview */}
              {calculatedUnits > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Production Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Raw Materials Used:
                      </h4>
                      <div className="space-y-1">
                        {calculatedMaterials.map((material, index) => (
                          <div
                            key={index}
                            className="text-xs flex justify-between"
                          >
                            <span>{getMaterialName(material.materialId)}</span>
                            <span className="font-medium">
                              {material.quantity.toFixed(2)}{" "}
                              {getMaterialUnit(material.materialId)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {calculatedUnits}
                      </div>
                      <div className="text-sm text-gray-600">
                        Units of {selectedProductionType?.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-sm"
                  disabled={
                    isSubmitting ||
                    !formData.productionTypeId ||
                    formData.baseMaterialQuantity <= 0
                  }
                >
                  {isSubmitting
                    ? editingLog
                      ? "Updating..."
                      : "Creating..."
                    : editingLog
                    ? "Update Production Log"
                    : "Save Production Log"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Production Logs List */}
      <div className="space-y-4">
        {productionLogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No production logs found. Create your first production log to
                get started.
              </div>
            </CardContent>
          </Card>
        ) : (
          productionLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-green-100 p-2 md:p-3 rounded-lg flex-shrink-0">
                      <Factory className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base md:text-lg">
                        {getProductionTypeName(log.productionTypeId)}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        <span className="font-medium">{log.unitsProduced}</span>{" "}
                        units produced
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        {log.rawMaterialsUsed.length > 0 && (
                          <>
                            Using {log.rawMaterialsUsed[0].quantity}{" "}
                            {getMaterialUnit(
                              log.rawMaterialsUsed[0].materialId
                            )}{" "}
                            of{" "}
                            {getMaterialName(
                              log.rawMaterialsUsed[0].materialId
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(log.productionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Factory className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{log.machine || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{log.operator || "-"}</span>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      {log.shift && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs capitalize whitespace-nowrap">
                          {log.shift} shift
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Raw Materials Used Details */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">
                    Raw Materials Used:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {log.rawMaterialsUsed.map((material, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 p-2 rounded"
                      >
                        <div className="font-medium">
                          {getMaterialName(material.materialId)}
                        </div>
                        <div className="text-gray-600">
                          {material.quantity.toFixed(2)}{" "}
                          {getMaterialUnit(material.materialId)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {log.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Notes:</h4>
                    <p className="text-sm text-gray-600">{log.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(log)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Production Log
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this production log?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(log.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductionLogs;
