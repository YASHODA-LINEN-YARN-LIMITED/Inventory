export type Role = 'Admin' | 'Manager' | 'Staff' | 'Department Head';

export interface Department {
  id: string;
  name: string;
  head: string;
  plantId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  itemType: 'Stock Item' | 'Non-Stock Item' | 'Service' | string;
  uom: string; // Kg, Nos, Ltr, Mtr, Roll, Bag, Box, Set, Pair, Drum
  warehouse: string;
  batchTracking: 'Yes' | 'No' | boolean | string;
  serialTracking: 'Yes' | 'No' | boolean | string;
  status: 'Active' | 'Inactive' | string;

  // Legacy aliases for backward compatibility
  sku?: string;
  name?: string;
  category?: string;
  categoryId?: string;
  type?: string;
  reorderLevel?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
}

export interface Stock {
  id: string;
  itemId: string;
  warehouseId: string;
  quantity: number;
  batchNo?: string;
}

export interface MaterialIssue {
  id: string;
  departmentId: string;
  date: string;
  issuedBy: string;
  receivedBy: string;
  status: 'Pending' | 'Approved' | 'Issued';
}

export interface MaterialIssueItem {
  id: string;
  issueId: string;
  itemId: string;
  quantity: number;
  unit?: string;
}

export interface GateEntry {
  companyType?: 'AIPL' | 'Yashoda';
  id: string;
  slNo: string;
  date: string;
  vehicleNo: string;
  partyName: string;
  gstNo?: string;
  materialDescription: string;
  quantityWeight: string;
  unit: string;
  rateUom?: string;
  basePrice?: string;
  sgst?: string;
  cgst?: string;
  igst?: string;
  totalPrice?: string;
  ewayBill?: string;
  invoiceNoValue: string;
  inTime: string;
  outTime: string;
  driverLicenceNo: string;
  contactNoSign: string;
  securitySign: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  departmentId: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  date: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Completed';
}

export interface GRN {
  id: string;
  grnNumber: string;
  poId: string;
  date: string;
  receivedBy: string;
  status: 'Received' | 'Inspected' | 'Rejected';
}

export interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  itemId: string;
  quantity: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export interface StockAdjustment {
  id: string;
  warehouseId: string;
  itemId: string;
  quantity: number;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

import { User } from 'firebase/auth';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AppState {
  users: AppUser[];
  scriptUrl?: string;
  departments: Department[];
  suppliers: Supplier[];
  items: Item[];
  warehouses: Warehouse[];
  stock: Stock[];
  materialIssues: MaterialIssue[];
  materialIssueItems: MaterialIssueItem[];
  gateEntriesYashoda: GateEntry[];
  gateEntriesAIPL: GateEntry[];
  prs: PurchaseRequisition[];
  pos: PurchaseOrder[];
  grns: GRN[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  isSyncing: boolean;
  user?: User | null;
}
