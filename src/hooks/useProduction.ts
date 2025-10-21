
import { useState, useCallback, useMemo } from 'react';
import { ProductionLog, ProductionType, RawMaterial } from '@/types/business';

// Mock data for raw materials
const mockRawMaterials: RawMaterial[] = [
  { id: '1', name: 'Steel Sheet', unit: 'kg', costPerUnit: 2.5, stockQuantity: 1000 },
  { id: '2', name: 'Aluminum Bar', unit: 'kg', costPerUnit: 3.2, stockQuantity: 500 },
  { id: '3', name: 'Copper Wire', unit: 'm', costPerUnit: 1.8, stockQuantity: 2000 },
  { id: '4', name: 'Plastic Pellets', unit: 'kg', costPerUnit: 1.2, stockQuantity: 800 },
  { id: '5', name: 'Rubber Sheet', unit: 'kg', costPerUnit: 2.8, stockQuantity: 300 },
];

// Mock data for production types
const mockProductionTypes: ProductionType[] = [
  {
    id: '1',
    name: 'Metal Component A',
    baseMaterial: 'Steel',
    outputUnit: 'pieces',
    rawMaterialsRequired: [
      { materialId: '1', materialName: 'Steel Sheet', quantityPerUnit: 2.5 },
      { materialId: '3', materialName: 'Copper Wire', quantityPerUnit: 0.5 },
    ],
  },
  {
    id: '2',
    name: 'Aluminum Bracket',
    baseMaterial: 'Aluminum',
    outputUnit: 'pieces',
    rawMaterialsRequired: [
      { materialId: '2', materialName: 'Aluminum Bar', quantityPerUnit: 1.8 },
    ],
  },
  {
    id: '3',
    name: 'Plastic Housing',
    baseMaterial: 'Plastic',
    outputUnit: 'pieces',
    rawMaterialsRequired: [
      { materialId: '4', materialName: 'Plastic Pellets', quantityPerUnit: 0.3 },
      { materialId: '5', materialName: 'Rubber Sheet', quantityPerUnit: 0.1 },
    ],
  },
];

// Mock initial production logs
const initialProductionLogs: ProductionLog[] = [
  {
    id: '1',
    date: '2024-01-15',
    productionType: mockProductionTypes[0],
    baseMaterial: 'Steel',
    quantity: 100,
    unitsProduced: 98,
    machine: 'CNC-001',
    operator: 'John Smith',
    shift: 'morning',
    rawMaterialsUsed: [
      { materialId: '1', materialName: 'Steel Sheet', quantityUsed: 250, unit: 'kg', cost: 625 },
      { materialId: '3', materialName: 'Copper Wire', quantityUsed: 50, unit: 'm', cost: 90 },
    ],
    totalCost: 715,
    status: 'completed',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z',
  },
  {
    id: '2',
    date: '2024-01-16',
    productionType: mockProductionTypes[1],
    baseMaterial: 'Aluminum',
    quantity: 50,
    unitsProduced: 50,
    machine: 'MILL-002',
    operator: 'Sarah Johnson',
    shift: 'afternoon',
    rawMaterialsUsed: [
      { materialId: '2', materialName: 'Aluminum Bar', quantityUsed: 90, unit: 'kg', cost: 288 },
    ],
    totalCost: 288,
    status: 'completed',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T22:15:00Z',
  },
];

export function useProduction() {
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(initialProductionLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [productionTypeFilter, setProductionTypeFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Calculate raw materials used for a production log
  const calculateRawMaterials = useCallback((productionType: ProductionType, quantity: number) => {
    return productionType.rawMaterialsRequired.map(req => {
      const material = mockRawMaterials.find(m => m.id === req.materialId);
      const quantityUsed = req.quantityPerUnit * quantity;
      const cost = material ? quantityUsed * material.costPerUnit : 0;
      
      return {
        materialId: req.materialId,
        materialName: req.materialName,
        quantityUsed,
        unit: material?.unit || 'units',
        cost,
      };
    });
  }, []);

  // Calculate total cost
  const calculateTotalCost = useCallback((rawMaterialsUsed: ProductionLog['rawMaterialsUsed']) => {
    return rawMaterialsUsed.reduce((total, material) => total + material.cost, 0);
  }, []);

  // Add production log
  const addProductionLog = useCallback((logData: Omit<ProductionLog, 'id' | 'rawMaterialsUsed' | 'totalCost' | 'createdAt' | 'updatedAt'>) => {
    const rawMaterialsUsed = calculateRawMaterials(logData.productionType, logData.quantity);
    const totalCost = calculateTotalCost(rawMaterialsUsed);
    
    const newLog: ProductionLog = {
      ...logData,
      id: Date.now().toString(),
      rawMaterialsUsed,
      totalCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProductionLogs(prev => [newLog, ...prev]);
    console.log('Added production log:', newLog);
  }, [calculateRawMaterials, calculateTotalCost]);

  // Update production log
  const updateProductionLog = useCallback((id: string, updates: Partial<ProductionLog>) => {
    setProductionLogs(prev => prev.map(log => {
      if (log.id === id) {
        const updatedLog = { ...log, ...updates };
        
        // Recalculate raw materials if production type or quantity changed
        if (updates.productionType || updates.quantity !== undefined) {
          const rawMaterialsUsed = calculateRawMaterials(
            updates.productionType || log.productionType,
            updates.quantity !== undefined ? updates.quantity : log.quantity
          );
          const totalCost = calculateTotalCost(rawMaterialsUsed);
          
          updatedLog.rawMaterialsUsed = rawMaterialsUsed;
          updatedLog.totalCost = totalCost;
        }
        
        updatedLog.updatedAt = new Date().toISOString();
        console.log('Updated production log:', updatedLog);
        return updatedLog;
      }
      return log;
    }));
  }, [calculateRawMaterials, calculateTotalCost]);

  // Delete production log
  const deleteProductionLog = useCallback((id: string) => {
    setProductionLogs(prev => {
      const filtered = prev.filter(log => log.id !== id);
      console.log('Deleted production log with id:', id);
      return filtered;
    });
  }, []);

  // Filtered production logs
  const filteredLogs = useMemo(() => {
    return productionLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.productionType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.machine.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = dateFilter === '' || log.date === dateFilter;
      const matchesProductionType = productionTypeFilter === '' || log.productionType.id === productionTypeFilter;
      const matchesOperator = operatorFilter === '' || log.operator.toLowerCase().includes(operatorFilter.toLowerCase());
      const matchesStatus = statusFilter === '' || log.status === statusFilter;

      return matchesSearch && matchesDate && matchesProductionType && matchesOperator && matchesStatus;
    });
  }, [productionLogs, searchTerm, dateFilter, productionTypeFilter, operatorFilter, statusFilter]);

  // Statistics
  const statistics = useMemo(() => {
    const totalLogs = productionLogs.length;
    const completedLogs = productionLogs.filter(log => log.status === 'completed').length;
    const inProgressLogs = productionLogs.filter(log => log.status === 'in-progress').length;
    const totalCost = productionLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const totalUnitsProduced = productionLogs.reduce((sum, log) => sum + log.unitsProduced, 0);
    const averageEfficiency = productionLogs.length > 0 
      ? productionLogs.reduce((sum, log) => sum + (log.unitsProduced / log.quantity * 100), 0) / productionLogs.length
      : 0;

    return {
      totalLogs,
      completedLogs,
      inProgressLogs,
      totalCost,
      totalUnitsProduced,
      averageEfficiency,
    };
  }, [productionLogs]);

  return {
    productionLogs: filteredLogs,
    allProductionLogs: productionLogs,
    productionTypes: mockProductionTypes,
    rawMaterials: mockRawMaterials,
    statistics,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    productionTypeFilter,
    setProductionTypeFilter,
    operatorFilter,
    setOperatorFilter,
    statusFilter,
    setStatusFilter,
    addProductionLog,
    updateProductionLog,
    deleteProductionLog,
    calculateRawMaterials,
    calculateTotalCost,
  };
}
