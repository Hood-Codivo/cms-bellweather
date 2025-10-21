export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  costPerUnit: number;
  supplier: string;
  location: string;
  notes?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialFormData {
  name: string;
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

export interface MaterialQuantity {
  materialId: string;
  quantity: number;
  material?: RawMaterial;
}

export interface ProductionType {
  unitPrice: any;
  id: string;
  name: string;
  rawMaterialsRequired: MaterialQuantity[];
  unitsProduced: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionTypeFormData {
  unitPrice: number;
  name: string;
  rawMaterialsRequired: MaterialQuantity[];
  unitsProduced: number;
}

export interface ProductionLog {
  id: string;
  productionTypeId: string;
  productionType?: ProductionType;
  productionDate: string;
  rawMaterialsUsed: MaterialQuantity[];
  machine?: string;
  operator?: string;
  shift?: string;
  notes?: string;
  unitsProduced?: number;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionLogFormData {
  productionTypeId: string;
  productionDate: string;
  rawMaterialsUsed: MaterialQuantity[];
  machine?: string;
  operator?: string;
  shift?: string;
  notes?: string;
}

export interface ProductionLogFormInput {
  productionTypeId: string;
  productionDate: string;
  baseMaterialId: string;
  baseMaterialQuantity: number;
  machine: string;
  operator: string;
  shift: "morning" | "afternoon" | "night";
  notes?: string;
}

export interface CalculatedMaterial {
  materialId: string;
  name: string;
  unit: string;
  requiredPerUnit: number;
  unitsProduced: number;
  totalQuantity: number;
  availableQuantity: number;
  costPerUnit: number;
  totalCost: number;
}

export interface ProductionCalculation {
  baseMaterialAmount: number;
  calculatedMaterials: MaterialQuantity[];
  totalUnitsProduced: number;
}

export interface InitialMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface ProductionTypeInitialValues {
  productionType: {
    id: string;
    name: string;
    unitsProduced: number;
    unitPrice: number;
    rawMaterialsRequired: MaterialQuantity[];
  };
  initialMaterials: InitialMaterial[];
  totalCost: number;
  unitsProduced: number;
}

export interface ProductionLogFormDataV2 {
  productionTypeId: string;
  productionDate: string;
  rawMaterialsUsed?: MaterialQuantity[];
  machine: string;
  operator: string;
  shift: "morning" | "afternoon" | "night";
  notes?: string;
}
