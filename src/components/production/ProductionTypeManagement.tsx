import React, { useState, useEffect } from "react";
import { useProductionTypes } from "@/hooks/useProductionTypes";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { ProductionType } from "@/types/production";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader, Package, Calculator } from "lucide-react";
import { CreateProductionTypeModal } from "./CreateProductionTypeModal";
import { EditProductionTypeModal } from "./EditProductionTypeModal";
import { toast } from "sonner";

interface MaterialDetails {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  [key: string]: any;
}

export const ProductionTypeManagement = () => {
  const { productionTypes, isLoading, deleteProductionType } =
    useProductionTypes();

  const { rawMaterials, getMaterialById } = useRawMaterials();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [materialDetails, setMaterialDetails] = useState<
    Record<string, MaterialDetails>
  >({});
  const [selectedProductionType, setSelectedProductionType] =
    useState<ProductionType | null>(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  // Fetch material details for all production types
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      setIsLoadingMaterials(true);
      const materialIds = new Set<string>();

      // Collect all unique material IDs from production types
      productionTypes.forEach((productionType) => {
        productionType.rawMaterialsRequired.forEach((material) => {
          materialIds.add(material.materialId);
        });
      });

      // Fetch material details for each unique ID
      const details: Record<string, MaterialDetails> = {};
      for (const materialId of materialIds) {
        if (!materialDetails[materialId]) {
          const material = await getMaterialById(materialId);
          if (material) {
            details[materialId] = material;
          }
        }
      }

      setMaterialDetails(details);
      setIsLoadingMaterials(false);
    };

    if (productionTypes.length > 0) {
      fetchMaterialDetails();
    }
  }, [productionTypes, getMaterialById]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteProductionType(id);
      toast.success(`${name} deleted successfully`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete production type"
      );
    }
  };

  const calculateTotalCost = (productionType: ProductionType) => {
    return productionType.rawMaterialsRequired.reduce((total, material) => {
      const materialDetail = materialDetails[material.materialId];
      if (materialDetail && material.quantity) {
        return total + materialDetail.costPerUnit * material.quantity;
      }
      return total;
    }, 0);
  };

  const getMaterialName = (materialId: string) => {
    const material = materialDetails[materialId];
    return material ? material.name : "Unknown Material";
  };

  const getMaterialUnit = (materialId: string) => {
    const material = materialDetails[materialId];
    return material ? material.unit : "";
  };

  if (isLoading || isLoadingMaterials) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Type Management
          </h1>
          <p className="text-muted-foreground">
            Define production types and their raw material requirements
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Production Type
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production Types
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active production types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦
              {productionTypes.length > 0
                ? (
                    productionTypes.reduce(
                      (sum, pt) => sum + calculateTotalCost(pt),
                      0
                    ) / productionTypes.length
                  ).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per production type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Units Per Batch
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionTypes.reduce(
                (sum, pt) => sum + (pt.unitsProduced || 1),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined production capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials Used
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(
                  productionTypes.flatMap((pt) =>
                    pt.rawMaterialsRequired.map((rm) => rm.materialId)
                  )
                ).size
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Unique raw materials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Production Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Units Per Batch</TableHead>
                <TableHead>Materials Required</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionTypes.map((productionType) => (
                <TableRow key={productionType.id}>
                  <TableCell className="font-medium">
                    {productionType.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {productionType.unitsProduced || 1} units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {productionType.rawMaterialsRequired.map(
                        (material, index) => (
                          <div key={index} className="text-sm">
                            <Badge variant="outline" className="mr-2">
                              {getMaterialName(material.materialId)} (
                              {material.quantity}{" "}
                              {getMaterialUnit(material.materialId)})
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        ₦
                        {(
                          calculateTotalCost(productionType) /
                          (productionType.unitsProduced || 1)
                        ).toFixed(2)}{" "}
                        per unit
                      </div>
                      <div className="font-medium">
                        ₦{calculateTotalCost(productionType).toFixed(2)} per
                        batch
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(productionType.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProductionType(productionType);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDelete(productionType.id, productionType.name)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {productionTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No production types found. Create your first production type to
              get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreateProductionTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // The hook will automatically refresh the data
        }}
      />

      {/* Edit Modal */}
      <EditProductionTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductionType(null);
        }}
        productionType={selectedProductionType}
        onSuccess={() => {
          // The hook will automatically refresh the data
        }}
      />
    </div>
  );
};

export default ProductionTypeManagement;
