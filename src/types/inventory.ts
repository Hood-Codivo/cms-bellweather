export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  costPerUnit: number;
  totalCost: any;
  supplier: string;
  location: string;
  notes?: string;
  lastUpdated: string;
}

export interface InventoryFormData {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  costPerUnit: number;
  supplier: string;
  location: string;
  notes?: string;
}

export type InventoryFilter = {
  search: string;
  category: string;
};

export interface InventoryRecord {
  inventoryItem: any;
  id: string;
  inventoryItemId: string;
  year: number;
  month: number;
  quantity: number;
  costPerUnit: string;
  totalValue: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTrendItem {
  inventoryItemId: string;
  name: string;
  category: string;
  quantity: number;
  costPerUnit: string;
  totalValue: string;
}

export interface InventoryTrendData {
  year: number;
  month: number;
  totalValue: string;
  itemCount: number;
  items: InventoryTrendItem[];
}
