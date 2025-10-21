export interface Invoice {
  id: string;
  salesRecordId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerAddress: string;
  items: {
    productType: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

export interface Waybill {
  id: string;
  salesRecordId: string;
  waybillNumber: string;
  customerName: string;
  deliveryAddress: string;
  items: {
    productType: string;
    quantity: number;
    weight?: number;
  }[];
  driverName: string;
  vehicleNumber: string;
  issueDate: string;
  expectedDeliveryDate: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
}
