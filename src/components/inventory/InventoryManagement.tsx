import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  AlertTriangle,
  DollarSign,
  Loader,
  LineChart,
} from "lucide-react";
import { InventoryTable } from "./InventoryTable";
import { InventoryFilters } from "./InventoryFilters";
import { AddInventoryModal } from "./AddInventoryModal";
import { EditInventoryModal } from "./EditInventoryModal";
import { DeleteInventoryDialog } from "./DeleteInventoryDialog";
import { useToast } from "@/hooks/use-toast";
import InventoryRecords from "./InventoryRecords";

export const InventoryManagement = () => {
  const {
    items,
    allItems,
    filter,
    setFilter,
    categories,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    isLoading,
  } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { toast } = useToast();

  // Statistics
  const totalItems = allItems.length;
  const lowStockItems = allItems.filter(
    (item) => item.quantity <= item.reorderLevel
  );
  const totalValue = allItems.reduce((sum, item) => sum + item.costPerUnit, 0);

  const handleAddItem = (data: InventoryFormData) => {
    addItem(data);
    toast({
      title: "Item Added",
      description: `${data.name} has been added to inventory.`,
    });
    console.log(data);
    setIsAddModalOpen(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (data: InventoryFormData) => {
    if (selectedItem) {
      try {
        await updateItem(selectedItem.id, data);
        toast({
          title: "Item Updated",
          description: `${data.name} has been updated successfully.`,
        });
        setSelectedItem(null);
      } catch (error: any) {
        toast({
          title: "Update Failed",
          description:
            error.response?.data?.message || "Failed to update inventory item",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    const item = getItemById(id);
    if (item) {
      setSelectedItem(item);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteItem(selectedItem.id);
        toast({
          title: "Item Deleted",
          description: `${selectedItem.name} has been removed from inventory.`,
          variant: "destructive",
        });
      } catch (error: any) {
        toast({
          title: "Delete Failed",
          description:
            error.response?.data?.message || "Failed to delete inventory item",
          variant: "destructive",
        });
      }
    }
    setSelectedItem(null);
    setIsDeleteDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return isLoading ? (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader className="h-10 w-10 animate-spin text-primary" />
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your inventory items, track stock levels, and monitor
            inventory value
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="records">
            <LineChart className="mr-2 h-4 w-4" />
            Inventory Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Items
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  Items in inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  Items need attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventory value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription className="text-red-700">
                  {lowStockItems.length} item
                  {lowStockItems.length !== 1 ? "s" : ""} need reordering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <Badge key={item.id} variant="destructive">
                      {item.name} ({item.quantity} left)
                    </Badge>
                  ))}
                  {lowStockItems.length > 5 && (
                    <Badge variant="outline">
                      +{lowStockItems.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    Manage your inventory items and stock levels
                  </CardDescription>
                </div>
                <InventoryFilters
                  filter={filter}
                  onFilterChange={setFilter}
                  categories={categories}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <InventoryTable
                  items={items}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <InventoryRecords />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
        categories={categories}
      />

      <EditInventoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleUpdateItem}
        item={selectedItem}
        categories={categories}
      />

      <DeleteInventoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmDelete}
        item={selectedItem}
      />
    </div>
  );
};
