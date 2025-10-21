import React, { useState } from "react";
import { useProductionLogs } from "@/hooks/useProductionLogs";
import { useProductionTypes } from "@/hooks/useProductionTypes";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { ProductionLog } from "@/types/production";
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
import {
  Plus,
  Edit,
  Trash2,
  Loader,
  Factory,
  Calendar,
  Calculator,
} from "lucide-react";
import { CreateProductionLogModal } from "./CreateProductionLogModal";
import { toast } from "sonner";

export const ProductionLogManagement = () => {
  const { productionLogs, isLoading, deleteProductionLog } =
    useProductionLogs();

  const { productionTypes } = useProductionTypes();
  const { rawMaterials } = useRawMaterials();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = async (id: string, productionTypeName: string) => {
    try {
      await deleteProductionLog(id);
      toast.success(
        `Production log for ${productionTypeName} deleted successfully`
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete production log"
      );
    }
  };

  const getProductionTypeName = (productionTypeId: string) => {
    const productionType = productionTypes.find(
      (pt) => pt.id === productionTypeId
    );
    return productionType ? productionType.name : "Unknown Type";
  };

  const getMaterialName = (materialId: string) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    return material ? material.name : "Unknown Material";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate statistics
  const totalProductionLogs = productionLogs.length;
  const totalUnitsProduced = productionLogs.reduce(
    (sum, log) => sum + (log.unitsProduced || 0),
    0
  );
  const totalCost = productionLogs.reduce(
    (sum, log) => sum + (log.totalCost || 0),
    0
  );
  const averageCostPerUnit =
    totalUnitsProduced > 0 ? totalCost / totalUnitsProduced : 0;

  if (isLoading) {
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
            Production Log Management
          </h1>
          <p className="text-muted-foreground">
            Track production runs and material consumption
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Production Log
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production Logs
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductionLogs}</div>
            <p className="text-xs text-muted-foreground">
              Production runs recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Units Produced
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnitsProduced}</div>
            <p className="text-xs text-muted-foreground">
              Units across all runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production Cost
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cost of production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Cost per Unit
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageCostPerUnit)}
            </div>
            <p className="text-xs text-muted-foreground">Per unit average</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Production Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Units Produced</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {getProductionTypeName(log.productionTypeId)}
                  </TableCell>
                  <TableCell>{formatDate(log.productionDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.unitsProduced || 0} units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(log.totalCost || 0)}
                    </span>
                  </TableCell>
                  <TableCell>{log.machine || "-"}</TableCell>
                  <TableCell>{log.operator || "-"}</TableCell>
                  <TableCell>
                    {log.shift ? (
                      <Badge variant="secondary" className="capitalize">
                        {log.shift}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            log.id,
                            getProductionTypeName(log.productionTypeId)
                          )
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
          {productionLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No production logs found. Create your first production log to get
              started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreateProductionLogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // The hook will automatically refresh the data
        }}
      />
    </div>
  );
};
