import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, Factory, Calculator, ClipboardList } from "lucide-react";
import RawMaterialManagement from "./RawMaterialManagement";
import ProductionTypeManagement from "./ProductionTypeManagement";
import ProductionLogs from "./ProductionLogs";

const EnhancedProductionManagement = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Factory className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Production Management
          </h1>
          <p className="text-gray-600">
            Comprehensive production planning and material management
          </p>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Raw Materials
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Production Types
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Production Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <RawMaterialManagement />
        </TabsContent>

        <TabsContent value="types">
          <ProductionTypeManagement />
        </TabsContent>

        <TabsContent value="logs">
          <ProductionLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProductionManagement;
