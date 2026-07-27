import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';
import { 
  Plus, Search, Edit2, Trash2, X, Package, ArrowRightLeft, Settings2, RefreshCw, 
  Truck, CheckCircle2, IndianRupee, Download, Calculator, Building2, AlertTriangle, CheckSquare, Square
} from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';
import { UnitConverterModal } from '../components/UnitConverterModal';
import { WarehouseMapModal } from '../components/WarehouseMapModal';
import { convertUnitQuantity } from '../lib/utils';

function parseNumeric(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function Inventory() {
  const { 
    items = [], 
    addItem, 
    updateItem,
    deleteItem,
    stock = [], 
    warehouses = [], 
    stockTransfers = [], 
    stockAdjustments = [], 
    addStockTransfer, 
    addStockAdjustment,
    gateEntriesYashoda = [],
    gateEntriesAIPL = [],
    addGateEntry,
    updateGateEntry,
    deleteGateEntry,
    receiveStock,
    materialIssues = [],
    materialIssueItems = []
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stock' | 'gateInward' | 'items' | 'transfers' | 'adjustments'>('stock');
  const [itemMasterSubTab, setItemMasterSubTab] = useState<'catalog' | 'gateLogs'>('catalog');
  const [stockUnitMode, setStockUnitMode] = useState<'TON' | 'KGS' | 'NATIVE'>('NATIVE');
  const [selectedCompany, setSelectedCompany] = useState<'All' | 'Yashoda' | 'AIPL'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'item' | 'itemMaster' | 'transfer' | 'adjustment'>('item');
  const [editingGateEntry, setEditingGateEntry] = useState<any>(null);
  const [editingItemMaster, setEditingItemMaster] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);

  // Process Gate Entries for Inventory Inward Stock and Item Master (exclusively Yashoda Store Table)
  const allGateEntries = useMemo(() => {
    return (gateEntriesYashoda || []).map(e => ({ 
      ...e, 
      companyType: 'Yashoda' as const,
      companyLabel: 'Yashoda Linen Yarn Ltd'
    }));
  }, [gateEntriesYashoda]);

  const activeGateEntries = useMemo(() => {
    return allGateEntries;
  }, [allGateEntries]);

  // Aggregate Gate Entries by Material Description for Inward Stock based on selected company
  const gateInwardStockSummary = useMemo(() => {
    const map: Record<string, {
      materialDescription: string;
      unit: string;
      totalQty: number;
      totalBasePrice: number;
      totalGST: number;
      totalValue: number;
      entryCount: number;
      partyNames: Set<string>;
      lastDate: string;
      companies: Set<string>;
    }> = {};

    activeGateEntries.forEach(entry => {
      const matName = (entry.materialDescription || 'Unspecified Material').trim();
      const key = matName.toLowerCase();

      if (!map[key]) {
        map[key] = {
          materialDescription: matName,
          unit: entry.unit || 'Units',
          totalQty: 0,
          totalBasePrice: 0,
          totalGST: 0,
          totalValue: 0,
          entryCount: 0,
          partyNames: new Set(),
          lastDate: entry.date || '',
          companies: new Set()
        };
      }

      const base = parseNumeric(entry.basePrice);
      const gst = parseNumeric(entry.cgst) + parseNumeric(entry.sgst) + parseNumeric(entry.igst);
      const total = parseNumeric(entry.totalPrice);
      const qty = parseNumeric(entry.quantityWeight);

      map[key].totalQty += qty;
      map[key].totalBasePrice += base;
      map[key].totalGST += gst;
      map[key].totalValue += total;
      map[key].entryCount += 1;
      if (entry.partyName) map[key].partyNames.add(entry.partyName);
      if (entry.companyLabel) map[key].companies.add(entry.companyLabel);
      if (entry.date) map[key].lastDate = entry.date;
    });

    // Round total values cleanly to prevent float precision issues
    Object.values(map).forEach(item => {
      item.totalQty = Math.round((item.totalQty + Number.EPSILON) * 100) / 100;
      item.totalBasePrice = Math.round((item.totalBasePrice + Number.EPSILON) * 100) / 100;
      item.totalGST = Math.round((item.totalGST + Number.EPSILON) * 100) / 100;
      item.totalValue = Math.round((item.totalValue + Number.EPSILON) * 100) / 100;
    });

    return Object.values(map);
  }, [activeGateEntries]);

  // Explicit Yashoda Gate Register Inward pipeline (derived exclusively from GateEntries_Yashoda collection)
  const yashodaGateInwardSummary = useMemo(() => {
    const map: Record<string, {
      materialDescription: string;
      unit: string;
      totalQty: number;
      totalBasePrice: number;
      totalGST: number;
      totalValue: number;
      entryCount: number;
      partyNames: Set<string>;
      lastDate: string;
      companies: Set<string>;
    }> = {};

    (gateEntriesYashoda || []).forEach(entry => {
      const matName = (entry.materialDescription || 'Unspecified Material').trim();
      const key = matName.toLowerCase();

      if (!map[key]) {
        map[key] = {
          materialDescription: matName,
          unit: entry.unit || 'Units',
          totalQty: 0,
          totalBasePrice: 0,
          totalGST: 0,
          totalValue: 0,
          entryCount: 0,
          partyNames: new Set(),
          lastDate: entry.date || '',
          companies: new Set(['Yashoda Linen Yarn Ltd'])
        };
      }

      const base = parseNumeric(entry.basePrice);
      const gst = parseNumeric(entry.cgst) + parseNumeric(entry.sgst) + parseNumeric(entry.igst);
      const total = parseNumeric(entry.totalPrice);
      const qty = parseNumeric(entry.quantityWeight);

      map[key].totalQty += qty;
      map[key].totalBasePrice += base;
      map[key].totalGST += gst;
      map[key].totalValue += total;
      map[key].entryCount += 1;
      if (entry.partyName) map[key].partyNames.add(entry.partyName);
      if (entry.date) map[key].lastDate = entry.date;
    });

    Object.values(map).forEach(item => {
      item.totalQty = Math.round((item.totalQty + Number.EPSILON) * 100) / 100;
      item.totalBasePrice = Math.round((item.totalBasePrice + Number.EPSILON) * 100) / 100;
      item.totalGST = Math.round((item.totalGST + Number.EPSILON) * 100) / 100;
      item.totalValue = Math.round((item.totalValue + Number.EPSILON) * 100) / 100;
    });

    return Object.values(map);
  }, [gateEntriesYashoda]);

  // Dynamic Live Stock & Valuation: Yashoda Gate Inwards (GateEntries_Yashoda) - Material Issues (Outward)
  const liveCurrentStock = useMemo(() => {
    const map: Record<string, {
      key: string;
      itemName: string;
      sku: string;
      uom: string;
      category: string;
      warehouse: string;
      inwardQty: number;
      issuedQty: number;
      currentStock: number;
      avgRate: number;
      totalInwardValue: number;
      totalValue: number;
      reorderLevel: number;
      isLow: boolean;
      sources: string[];
    }> = {};

    // 1. Process Yashoda Gate Register Inward entries from GateEntries_Yashoda
    yashodaGateInwardSummary.forEach(sum => {
      const name = (sum.materialDescription || 'General Goods').trim();
      if (!name) return;
      const key = name.toLowerCase();

      map[key] = {
        key,
        itemName: name,
        sku: 'SKU-' + key.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, ''),
        uom: sum.unit || 'TON',
        category: 'Raw Material',
        warehouse: 'Main Mill Store',
        inwardQty: sum.totalQty,
        issuedQty: 0,
        currentStock: 0,
        avgRate: sum.totalQty > 0 ? sum.totalValue / sum.totalQty : 0,
        totalInwardValue: sum.totalValue,
        totalValue: sum.totalValue,
        reorderLevel: 10,
        isLow: false,
        sources: Array.from(sum.companies)
      };
    });

    // 2. Enhance metadata (SKU/reorderLevel/category) for items in Yashoda Gate Inward receipts
    (items || []).forEach(item => {
      const key = (item.name || '').trim().toLowerCase();
      if (!key) return;

      if (map[key]) {
        if (item.sku) map[key].sku = item.sku;
        if (item.categoryId) map[key].category = item.categoryId;
        if (item.reorderLevel) map[key].reorderLevel = item.reorderLevel;
      }
    });

    // 3. Process Material Issues (Outward Quantities) to REDUCE current stock!
    (materialIssueItems || []).forEach(mi => {
      const matchedItem = items.find(i => i.id === mi.itemId);
      const key = matchedItem ? matchedItem.name.trim().toLowerCase() : String(mi.itemId).trim().toLowerCase();
      const rawQty = Number(mi.quantity) || 0;

      if (map[key]) {
        const targetUom = map[key].uom || 'Kgs';
        const issueUom = mi.unit || targetUom;
        const convertedQty = convertUnitQuantity(rawQty, issueUom, targetUom);
        map[key].issuedQty += convertedQty;
      }
    });

    // 4. Calculate Net Current Available Stock & Total Valuation with clean rounding
    Object.values(map).forEach(item => {
      item.inwardQty = Math.round((item.inwardQty + Number.EPSILON) * 100) / 100;
      item.issuedQty = Math.round((item.issuedQty + Number.EPSILON) * 100) / 100;
      item.currentStock = Math.round((Math.max(0, item.inwardQty - item.issuedQty) + Number.EPSILON) * 100) / 100;
      
      // Calculate weighted average rate per native unit from total inward valuation
      if (item.inwardQty > 0 && item.totalInwardValue > 0) {
        item.avgRate = item.totalInwardValue / item.inwardQty;
      } else {
        item.avgRate = 0;
      }

      // Valuation of currently available stock based on weighted average rate
      item.totalValue = Math.round((item.currentStock * item.avgRate + Number.EPSILON) * 100) / 100;
      item.isLow = item.currentStock <= item.reorderLevel;
    });

    return Object.values(map);
  }, [yashodaGateInwardSummary, items, materialIssueItems]);

  // Sync Gate Entries to Item Master & Current Stock
  const handleSyncGateEntriesToInventory = async () => {
    if (gateInwardStockSummary.length === 0) {
      alert('No Gate Entry records available to sync.');
      return;
    }

    const companyName = selectedCompany === 'Yashoda' ? 'Yashoda' : selectedCompany === 'AIPL' ? 'Contractor AIPL Store' : 'All Companies';

    if (!window.confirm(`Sync ${gateInwardStockSummary.length} material categories from ${companyName} Gate Register into Item Master & Current Stock?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      let createdCount = 0;
      let stockCount = 0;

      const targetWarehouseId = warehouses[0]?.id || 'wh-1';

      for (const summary of gateInwardStockSummary) {
        // Find or create item in Item Master
        let existingItem = items.find(i => (i.name || '').toLowerCase() === summary.materialDescription.toLowerCase());
        let itemId = existingItem?.id;

        if (!existingItem) {
          const sku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
          const newItem = {
            name: summary.materialDescription,
            sku,
            uom: summary.unit || 'Kgs',
            categoryId: 'Raw Material',
            reorderLevel: 10,
            type: 'Gate Inward'
          };
          await addItem(newItem);
          createdCount++;
        }

        // Add to stock
        if (summary.totalQty > 0) {
          const matched = items.find(i => (i.name || '').toLowerCase() === summary.materialDescription.toLowerCase());
          const finalItemId = matched?.id || itemId || summary.materialDescription;
          if (receiveStock) {
            await receiveStock(finalItemId, targetWarehouseId, summary.totalQty, 'GATE-INWARD-SYNC');
            stockCount++;
          }
        }
      }

      alert(`Gate Entry Sync Complete!\n• ${createdCount} new items added to Item Master.\n• ${stockCount} stock entries updated.`);
    } catch (e: any) {
      console.error(e);
      alert('Error during sync: ' + (e.message || 'Failed'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    for (const row of data) {
      if (activeTab === 'items') {
        await addItem({ 
          name: row.name || '', 
          sku: row.sku || '', 
          categoryId: row.categoryId || 'Cat-1', 
          uom: row.uom || 'Kgs', 
          reorderLevel: Number(row.reorderLevel) || 10, 
          type: row.type || 'Raw Material' 
        });
      }
    }
    alert('Bulk upload completed');
  };

  // Item Master List - Derived from Item Catalog Master & Gate Entry Inward Register
  const activeItemMasterList = useMemo(() => {
    const map: Record<string, {
      id: string;
      itemCode: string;
      itemName: string;
      itemCategory: string;
      itemType: string;
      uom: string;
      warehouse: string;
      batchTracking: string;
      serialTracking: string;
      status: string;
      isCatalogItem: boolean;
    }> = {};

    // 1. First populate directly from items database catalog
    (items || []).forEach(item => {
      const name = (item.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();

      map[key] = {
        id: item.id,
        itemCode: item.itemCode || item.sku || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
        itemName: name,
        itemCategory: item.category || item.categoryId || 'Raw Material',
        itemType: item.type || 'Stock Item',
        uom: item.uom || 'Kgs',
        warehouse: item.warehouse || 'Main Warehouse',
        batchTracking: typeof item.batchTracking === 'boolean' ? (item.batchTracking ? 'Yes' : 'No') : (item.batchTracking || 'No'),
        serialTracking: typeof item.serialTracking === 'boolean' ? (item.serialTracking ? 'Yes' : 'No') : (item.serialTracking || 'No'),
        status: item.status || 'Active',
        isCatalogItem: true
      };
    });

    // 2. Populate / augment from active Yashoda Gate Entry Inwards
    (activeGateEntries || []).forEach(entry => {
      const desc = (entry.materialDescription || '').trim();
      if (!desc) return;
      const key = desc.toLowerCase();

      if (!map[key]) {
        const skuHash = Math.abs(key.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)) % 9000 + 1000;
        const code = 'YASH-' + desc.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X') + '-' + skuHash;

        map[key] = {
          id: entry.id || 'gate-' + key,
          itemCode: code,
          itemName: desc,
          itemCategory: 'Raw Material',
          itemType: 'Stock Item',
          uom: entry.unit || 'Kgs',
          warehouse: 'Main Warehouse',
          batchTracking: 'No',
          serialTracking: 'No',
          status: 'Active',
          isCatalogItem: false
        };
      } else {
        if (entry.unit && (!map[key].uom || map[key].uom === 'Kgs')) map[key].uom = entry.unit;
      }
    });

    return Object.values(map);
  }, [activeGateEntries, items]);

  const filteredItemMasterList = useMemo(() => {
    return activeItemMasterList.filter(item =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeItemMasterList, searchTerm]);

  const filteredActiveGateItems = activeGateEntries.filter(entry =>
    (entry.materialDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.slNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.gstNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.invoiceNoValue || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGateSummary = gateInwardStockSummary.filter(summary =>
    summary.materialDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Array.from(summary.partyNames).some(p => String(p).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLiveStock = useMemo(() => {
    return liveCurrentStock.filter(st =>
      st.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [liveCurrentStock, searchTerm]);

  const formatStockItemDisplay = (st: typeof liveCurrentStock[0]) => {
    let displayUom = st.uom;
    let displayInward = st.inwardQty;
    let displayIssued = st.issuedQty;
    let displayCurrent = st.currentStock;

    const massUnits = ['KG', 'KGS', 'KILOGRAM', 'KILOGRAMS', 'TON', 'TONS', 'MT', 'TONNE', 'TONNES', 'QUINTAL', 'G', 'GRAM'];
    const cleanUom = (st.uom || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
    const isMass = massUnits.includes(cleanUom);

    if (stockUnitMode === 'TON' && isMass) {
      displayUom = 'TON';
      displayInward = convertUnitQuantity(st.inwardQty, st.uom, 'TON');
      displayIssued = convertUnitQuantity(st.issuedQty, st.uom, 'TON');
      displayCurrent = convertUnitQuantity(st.currentStock, st.uom, 'TON');
    } else if (stockUnitMode === 'KGS' && isMass) {
      displayUom = 'Kgs';
      displayInward = convertUnitQuantity(st.inwardQty, st.uom, 'KGS');
      displayIssued = convertUnitQuantity(st.issuedQty, st.uom, 'KGS');
      displayCurrent = convertUnitQuantity(st.currentStock, st.uom, 'KGS');
    } else {
      displayUom = st.uom;
    }

    let displayRate = 0;
    if (displayCurrent > 0) {
      displayRate = st.totalValue / displayCurrent;
    } else if (displayInward > 0) {
      displayRate = st.totalInwardValue / displayInward;
    } else {
      displayRate = st.avgRate;
    }

    return {
      displayUom,
      displayInward: Math.round((displayInward + Number.EPSILON) * 100) / 100,
      displayIssued: Math.round((displayIssued + Number.EPSILON) * 100) / 100,
      displayCurrent: Math.round((displayCurrent + Number.EPSILON) * 100) / 100,
      displayRate: Math.round((displayRate + Number.EPSILON) * 100) / 100,
      totalValue: st.totalValue
    };
  };

  const liveTotals = useMemo(() => {
    let inward = 0;
    let issued = 0;
    let current = 0;
    let val = 0;
    liveCurrentStock.forEach(st => {
      const formatted = formatStockItemDisplay(st);
      inward += formatted.displayInward;
      issued += formatted.displayIssued;
      current += formatted.displayCurrent;
      val += st.totalValue;
    });
    return { inward, issued, current, val };
  }, [liveCurrentStock, stockUnitMode]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  };

  const handleEditGateItem = (entry: any) => {
    setEditingGateEntry(entry);
    setModalType('item');
    setIsModalOpen(true);
  };

  const handleDeleteGateItem = async (id: string, description: string, companyType: 'Yashoda' | 'AIPL' = 'Yashoda') => {
    if (window.confirm(`Are you sure you want to delete "${description || 'this item'}" from ${companyType === 'AIPL' ? 'Contractor AIPL Store' : 'Yashoda'} Gate Register?`)) {
      if (deleteGateEntry) {
        await deleteGateEntry(id, companyType);
      }
    }
  };

  const handleExportInventoryCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `inventory_${activeTab}_${selectedCompany}_${dateStr}.csv`;

    if (activeTab === 'stock') {
      headers = ['Item Description', 'Unit', 'Total Inward Qty', 'Total Issued Qty', 'Current Stock Qty', 'Avg Unit Rate (INR)', 'Total Valuation (INR)'];
      rows = filteredLiveStock.map(st => {
        const formatted = formatStockItemDisplay(st);
        return [
          `"${st.itemName}"`,
          `"${formatted.displayUom}"`,
          `"${formatted.displayInward.toFixed(2)}"`,
          `"${formatted.displayIssued.toFixed(2)}"`,
          `"${formatted.displayCurrent.toFixed(2)}"`,
          `"${st.avgRate ? st.avgRate.toFixed(2) : '0.00'}"`,
          `"${st.totalValue ? st.totalValue.toFixed(2) : '0.00'}"`
        ];
      });
    } else if (activeTab === 'gateInward') {
      headers = ['Material Description', 'UOM', 'Gate Entry Count', 'Total Inward Qty', 'Base Price (INR)', 'GST Amount (INR)', 'Total Inward Value (INR)', 'Suppliers', 'Last Received Date'];
      rows = filteredGateSummary.map(row => [
        `"${row.materialDescription}"`,
        `"${row.unit}"`,
        `"${row.entryCount}"`,
        `"${row.totalQty.toFixed(2)}"`,
        `"${row.totalBasePrice.toFixed(2)}"`,
        `"${row.totalGST.toFixed(2)}"`,
        `"${row.totalValue.toFixed(2)}"`,
        `"${Array.from(row.partyNames).join('; ')}"`,
        `"${row.lastDate}"`
      ]);
    } else if (activeTab === 'items') {
      headers = ['Item Description', 'SKU Code', 'Category / Type', 'UOM', 'Company Source'];
      rows = filteredItemMasterList.map(item => [
        `"${item.itemDescription}"`,
        `"${item.skuCode}"`,
        `"${item.categoryType}"`,
        `"${item.uom}"`,
        `"${item.company}"`
      ]);
    } else if (activeTab === 'transfers') {
      headers = ['Transfer ID', 'Item Name', 'From Warehouse', 'To Warehouse', 'Quantity', 'Date'];
      rows = (stockTransfers || []).map(st => {
        const matchedItem = items.find(i => i.id === st.itemId);
        return [
          `"${st.id}"`,
          `"${matchedItem?.name || st.itemId}"`,
          `"${st.fromWarehouseId}"`,
          `"${st.toWarehouseId}"`,
          `"${st.quantity}"`,
          `"${st.date}"`
        ];
      });
    } else if (activeTab === 'adjustments') {
      headers = ['Adjustment ID', 'Item Name', 'Warehouse', 'Type', 'Quantity', 'Reason', 'Date'];
      rows = (stockAdjustments || []).map(sa => {
        const matchedItem = items.find(i => i.id === sa.itemId);
        return [
          `"${sa.id}"`,
          `"${matchedItem?.name || sa.itemId}"`,
          `"${sa.warehouseId}"`,
          `"${sa.type}"`,
          `"${sa.quantity}"`,
          `"${sa.reason || ''}"`,
          `"${sa.date}"`
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory & Stock Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage stock levels, Item Masters, and Gate Entry inward receipts (Exclusively Yashoda Store Table)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Yashoda Store Source Indicator Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Yashoda Store Table ({gateEntriesYashoda.length} Inward Receipts)</span>
          </div>

          <button 
            onClick={() => setIsConverterOpen(true)}
            className="bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-zinc-700 px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold shadow-xs"
            title="Open Multi-Unit Conversion Calculator"
          >
            <Calculator className="w-3.5 h-3.5" /> UOM Converter
          </button>

          <button 
            onClick={() => setIsMapOpen(true)}
            className="bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold shadow-xs"
            title="Open Interactive Visual Warehouse Bin/Rack Map"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Warehouse Map
          </button>

          <button 
            onClick={handleSyncGateEntriesToInventory}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors text-xs font-semibold shadow-sm"
            title="Import/sync quantities and values from Gate Register into Inventory Stock and Item Master"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Gate Entries to Stock
          </button>

          <button
            onClick={handleExportInventoryCSV}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors text-xs font-semibold shadow-sm"
            title="Export filtered/selected inventory data to CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export Selection CSV
          </button>

          {activeTab === 'items' && (
            <div className="flex gap-2">
              <CSVUploader onUpload={handleBulkUpload} />
              <button 
                onClick={() => { setEditingGateEntry(null); setModalType('item'); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'stock' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Current Stock
        </button>
        <button
          onClick={() => setActiveTab('gateInward')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'gateInward' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4 text-emerald-500" /> Gate Inward Stock ({gateInwardStockSummary.length})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4 text-indigo-500" /> Item Master ({activeItemMasterList.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Stock Transfers
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'adjustments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Settings2 className="w-4 h-4" /> Adjustments
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Item Master Dashboard
              </h2>
              <p className="text-xs text-gray-500">
                Central catalog of items, SKUs, reorder levels, and live stock levels across Yashoda & Contractor AIPL Store
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEditingItemMaster(null);
                  setModalType('itemMaster');
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Item Master
              </button>

              <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg flex gap-1 text-xs">
                <button
                  onClick={() => setItemMasterSubTab('catalog')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                    itemMasterSubTab === 'catalog'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Item Catalog Master ({activeItemMasterList.length})
                </button>
                <button
                  onClick={() => setItemMasterSubTab('gateLogs')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                    itemMasterSubTab === 'gateLogs'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Gate Log Register ({activeGateEntries.length})
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search item code, name, category, warehouse..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {itemMasterSubTab === 'catalog' ? (
            <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Item Code</th>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Item Category</th>
                    <th className="px-4 py-3">Item Type</th>
                    <th className="px-4 py-3">Unit of Measure (UOM)</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3 text-center">Batch Tracking</th>
                    <th className="px-4 py-3 text-center">Serial Number Tracking</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredItemMasterList.map(item => {
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {item.itemCode}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                          <span className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                            {item.itemCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                          {item.itemType}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                          {item.uom}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                          {item.warehouse}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${item.batchTracking === 'Yes' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'}`}>
                            {item.batchTracking}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${item.serialTracking === 'Yes' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'}`}>
                            {item.serialTracking}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => {
                                setEditingItemMaster(item);
                                setModalType('itemMaster');
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                              title="Edit Item Master"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={async () => {
                                if (window.confirm(`Delete item "${item.itemName}" (${item.itemCode}) from Item Master?`)) {
                                  if (deleteItem && item.isCatalogItem) {
                                    await deleteItem(item.id);
                                  }
                                  alert(`Item "${item.itemName}" removed from Item Master.`);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItemMasterList.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No items found in Item Master Catalog. Click "+ Add Item Master" to create a new item master record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">SL. No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Vehicle No.</th>
                    <th className="px-4 py-3">Party Name</th>
                    <th className="px-4 py-3">GST No.</th>
                    <th className="px-4 py-3">Material Description</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">UOM</th>
                    <th className="px-4 py-3">RATE/UOM</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3">SGST</th>
                    <th className="px-4 py-3">CGST</th>
                    <th className="px-4 py-3">IGST</th>
                    <th className="px-4 py-3">Total Price</th>
                    <th className="px-4 py-3">e-Way Bill</th>
                    <th className="px-4 py-3">Invoice No./Value</th>
                    <th className="px-4 py-3">In Time</th>
                    <th className="px-4 py-3">Out Time</th>
                    <th className="px-4 py-3">Driver Licence No.</th>
                    <th className="px-4 py-3">Contact No./Sign.</th>
                    <th className="px-4 py-3">Security Sign.</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredActiveGateItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.companyType === 'AIPL' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                        }`}>
                          {item.companyLabel || item.companyType || 'Yashoda'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.slNo || '-'}</td>
                      <td className="px-4 py-3">{item.date || '-'}</td>
                      <td className="px-4 py-3">{item.vehicleNo || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.partyName || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.gstNo || '-'}</td>
                      <td className="px-4 py-3 font-semibold truncate max-w-[200px]" title={item.materialDescription}>
                        {item.materialDescription || '-'}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{item.quantityWeight || '-'}</td>
                      <td className="px-4 py-3">{item.unit || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.rateUom || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.basePrice || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.sgst || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.cgst || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.igst || '-'}</td>
                      <td className="px-4 py-3 font-bold font-mono text-gray-900 dark:text-white">{item.totalPrice || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.ewayBill || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.invoiceNoValue || '-'}</td>
                      <td className="px-4 py-3">{item.inTime || '-'}</td>
                      <td className="px-4 py-3">{item.outTime || '-'}</td>
                      <td className="px-4 py-3 font-mono">{item.driverLicenceNo || '-'}</td>
                      <td className="px-4 py-3">{item.contactNoSign || '-'}</td>
                      <td className="px-4 py-3">{item.securitySign || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditGateItem(item)}
                            className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGateItem(item.id, item.materialDescription, item.companyType || 'Yashoda')}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredActiveGateItems.length === 0 && (
                    <tr>
                      <td colSpan={23} className="px-6 py-8 text-center text-gray-500">
                        No items found in Gate Entry Log Register for selected company.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Gate Entry Inward Stock Tab */}
      {activeTab === 'gateInward' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-500" />
                Inward Received Quantities & Values ({selectedCompany === 'Yashoda' ? 'Yashoda' : selectedCompany === 'AIPL' ? 'Contractor AIPL Store' : 'All Companies'})
              </h2>
              <p className="text-xs text-gray-500">
                Captured directly from Gate Register inward entries
              </p>
            </div>

            <div className="relative max-w-xs w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search material description..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg border-gray-200 dark:border-zinc-800">
            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-indigo-600" />
                Store Inward Summary (Connected to Item Master & Current Stock)
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredGateSummary.length} Material Categories
              </span>
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Material Description</th>
                  <th className="px-4 py-3">Company Source</th>
                  <th className="px-4 py-3 text-right">Total Inward Qty</th>
                  <th className="px-4 py-3 text-right">Total Base Price</th>
                  <th className="px-4 py-3 text-right">Total GST</th>
                  <th className="px-4 py-3 text-right">Grand Total Value</th>
                  <th className="px-4 py-3 text-center">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredGateSummary.map((sum, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {sum.materialDescription}
                      <div className="text-xs text-gray-400 font-normal">
                        Parties: {Array.from(sum.partyNames).join(', ') || 'Various'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {Array.from(sum.companies).map((comp: string, cIdx) => (
                          <span key={cIdx} className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            String(comp).includes('AIPL')
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                          }`}>
                            {String(comp)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {sum.totalQty.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {sum.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(sum.totalBasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {formatCurrency(sum.totalGST)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold font-mono text-gray-900 dark:text-white">
                      {formatCurrency(sum.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-semibold">
                        {sum.entryCount}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredGateSummary.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No Gate Register inward stock entries found for selected company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Live Inventory Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Stock Valuation</div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                {formatCurrency(liveTotals.val)}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Net valuation of available stock</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Gate Inward</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {liveTotals.inward.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {stockUnitMode === 'NATIVE' ? 'Units' : stockUnitMode}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Gate register inward additions</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Material Issued</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {liveTotals.issued.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {stockUnitMode === 'NATIVE' ? 'Units' : stockUnitMode}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Department store reductions</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Net Stock Available</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {liveTotals.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {stockUnitMode === 'NATIVE' ? 'Units' : stockUnitMode}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Inward Qty - Issued Qty</div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" /> Current Available Stock & Valuation
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                  <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">Unit Mode:</span>
                  <button
                    onClick={() => setStockUnitMode('TON')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      stockUnitMode === 'TON'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    TON (Tonnes)
                  </button>
                  <button
                    onClick={() => setStockUnitMode('KGS')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      stockUnitMode === 'KGS'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    KGS (Kg)
                  </button>
                  <button
                    onClick={() => setStockUnitMode('NATIVE')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      stockUnitMode === 'NATIVE'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Native UOM
                  </button>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search stock item..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="px-4 py-3">Material / Item Description</th>
                    <th className="px-4 py-3">Sources / Category</th>
                    <th className="px-4 py-3 text-right">Inward Received</th>
                    <th className="px-4 py-3 text-right">Issued Quantity</th>
                    <th className="px-4 py-3 text-right">Net Available Stock</th>
                    <th className="px-4 py-3 text-right">Avg Rate / Unit</th>
                    <th className="px-4 py-3 text-right">Net Stock Value</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredLiveStock.map(st => {
                    const fmt = formatStockItemDisplay(st);
                    return (
                      <tr key={st.key} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                          {st.itemName}
                          <div className="text-[10px] font-mono text-gray-400">{st.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {st.sources.map((src, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {src}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          +{fmt.displayInward.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {fmt.displayUom}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                          -{fmt.displayIssued.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {fmt.displayUom}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-sm text-gray-900 dark:text-white">
                          {fmt.displayCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {fmt.displayUom}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-300">
                          {formatCurrency(fmt.displayRate)} / {fmt.displayUom}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(fmt.totalValue)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {st.currentStock <= 0 ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-1 rounded-full">Out of Stock</span>
                          ) : st.isLow ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-full">Low Stock</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full">Healthy</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLiveStock.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No stock records found matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Stock Transfers</h2>
            <button 
              onClick={() => { setModalType('transfer'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> New Transfer
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Transfer ID</th>
                <th className="p-4">From Warehouse</th>
                <th className="p-4">To Warehouse</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockTransfers?.map(transfer => (
                <tr key={transfer.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{transfer.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">{warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || transfer.fromWarehouseId}</td>
                  <td className="p-4">{warehouses.find(w => w.id === transfer.toWarehouseId)?.name || transfer.toWarehouseId}</td>
                  <td className="p-4">{new Date(transfer.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transfer.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transfer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {transfer.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stockTransfers || stockTransfers.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No stock transfers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Stock Adjustments</h2>
            <button 
              onClick={() => { setModalType('adjustment'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> New Adjustment
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Adjustment ID</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockAdjustments?.map(adj => (
                <tr key={adj.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{adj.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">{warehouses.find(w => w.id === adj.warehouseId)?.name || adj.warehouseId}</td>
                  <td className="p-4">{adj.reason}</td>
                  <td className="p-4">{new Date(adj.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      adj.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      adj.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stockAdjustments || stockAdjustments.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No stock adjustments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ItemModal 
          type={modalType}
          initialData={modalType === 'item' ? editingGateEntry : editingItemMaster}
          onClose={() => { setIsModalOpen(false); setEditingGateEntry(null); setEditingItemMaster(null); }} 
          onSave={async (data) => {
            if (modalType === 'itemMaster') {
              if (editingItemMaster && editingItemMaster.isCatalogItem && updateItem) {
                await updateItem(editingItemMaster.id, {
                  itemCode: data.itemCode,
                  sku: data.itemCode,
                  name: data.itemName,
                  category: data.itemCategory,
                  categoryId: data.itemCategory,
                  type: data.itemType,
                  uom: data.uom,
                  warehouse: data.warehouse,
                  batchTracking: data.batchTracking,
                  serialTracking: data.serialTracking,
                  status: data.status
                });
              } else if (addItem) {
                await addItem({
                  itemCode: data.itemCode || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
                  sku: data.itemCode || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
                  name: data.itemName,
                  category: data.itemCategory,
                  categoryId: data.itemCategory,
                  type: data.itemType,
                  uom: data.uom,
                  warehouse: data.warehouse,
                  batchTracking: data.batchTracking,
                  serialTracking: data.serialTracking,
                  status: data.status,
                  reorderLevel: 10
                });
              }
            } else if (modalType === 'item') {
              if (editingGateEntry && updateGateEntry) {
                await updateGateEntry(editingGateEntry.id, data, 'Yashoda');
              } else if (addGateEntry) {
                await addGateEntry(data, 'Yashoda');
              }
              
              // Ensure item is registered in Item state if name/description provided
              const itemDesc = data.materialDescription || data.name;
              if (itemDesc) {
                const existing = items.find(i => i.name.toLowerCase() === itemDesc.toLowerCase());
                if (!existing && addItem) {
                  addItem({
                    itemCode: `YASH-${Math.floor(1000 + Math.random() * 9000)}`,
                    sku: `YASH-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: itemDesc,
                    category: 'Raw Material',
                    categoryId: 'Raw Material',
                    uom: data.unit || 'Kgs',
                    type: 'Stock Item',
                    warehouse: 'Main Warehouse',
                    batchTracking: 'No',
                    serialTracking: 'No',
                    status: 'Active',
                    reorderLevel: 10
                  });
                }
              }
            } else if (modalType === 'transfer') {
              addStockTransfer({
                fromWarehouseId: data.fromWarehouse,
                toWarehouseId: data.toWarehouse,
                itemId: data.itemId,
                quantity: data.quantity,
                date: new Date().toISOString(),
                status: 'Pending'
              });
            } else if (modalType === 'adjustment') {
              addStockAdjustment({
                warehouseId: data.warehouseId,
                itemId: data.itemId,
                quantity: data.quantity,
                reason: data.reason,
                date: new Date().toISOString(),
                status: 'Pending'
              });
            }
            setIsModalOpen(false);
            setEditingGateEntry(null);
            setEditingItemMaster(null);
          }} 
        />
      )}

      {/* Multi-Unit Conversion Matrix Modal */}
      <UnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
      />

      {/* Visual Warehouse Map Modal */}
      <WarehouseMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </div>
  );
}

function ItemModal({ type, initialData, onClose, onSave }: { type: 'item' | 'itemMaster' | 'transfer' | 'adjustment', initialData?: any, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(
    type === 'itemMaster' ? {
      itemCode: initialData?.itemCode || initialData?.skuCode || (`YASH-${Math.floor(1000 + Math.random() * 9000)}`),
      itemName: initialData?.itemName || initialData?.itemDescription || initialData?.name || '',
      itemCategory: initialData?.itemCategory || initialData?.categoryType || initialData?.category || 'Raw Material',
      itemType: initialData?.itemType || initialData?.type || 'Stock Item',
      uom: initialData?.uom || 'Kg',
      warehouse: initialData?.warehouse || 'Main Warehouse',
      batchTracking: initialData?.batchTracking || 'No',
      serialTracking: initialData?.serialTracking || 'No',
      status: initialData?.status || 'Active'
    } :
    type === 'item' ? {
      slNo: initialData?.slNo || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      vehicleNo: initialData?.vehicleNo || '',
      partyName: initialData?.partyName || '',
      gstNo: initialData?.gstNo || '',
      materialDescription: initialData?.materialDescription || '',
      quantityWeight: initialData?.quantityWeight || '',
      unit: initialData?.unit || 'Kgs',
      rateUom: initialData?.rateUom || '',
      basePrice: initialData?.basePrice || '',
      sgst: initialData?.sgst || '',
      cgst: initialData?.cgst || '',
      igst: initialData?.igst || '',
      totalPrice: initialData?.totalPrice || '',
      ewayBill: initialData?.ewayBill || '',
      invoiceNoValue: initialData?.invoiceNoValue || '',
      inTime: initialData?.inTime || '',
      outTime: initialData?.outTime || '',
      driverLicenceNo: initialData?.driverLicenceNo || '',
      contactNoSign: initialData?.contactNoSign || '',
      securitySign: initialData?.securitySign || ''
    } :
    type === 'transfer' ? { fromWarehouse: '', toWarehouse: '', itemId: '', quantity: 0, reason: '' } :
    { warehouseId: '', itemId: '', quantity: 0, reason: '' }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold">
              {type === 'itemMaster' ? (initialData ? 'Edit Item Master Record' : 'Add Item Master Record') :
               type === 'item' ? (initialData ? 'Edit Yashoda Item' : 'Add Yashoda Item (Gate Register Data)') : 
               type === 'transfer' ? 'New Stock Transfer' : 'New Stock Adjustment'}
            </h2>
            {type === 'itemMaster' && (
              <p className="text-xs text-gray-500">Configure catalog specs, tracking rules, UOM, and active status</p>
            )}
            {type === 'item' && (
              <p className="text-xs text-gray-500">All fields match Yashoda Gate Entry Register</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {type === 'itemMaster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Item Code <span className="text-gray-400 font-normal">(Unique Item Code - Auto/Manual)</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={(formData as any).itemCode} 
                    onChange={e => setFormData({...formData, itemCode: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-mono font-bold text-indigo-600 dark:text-indigo-400 outline-none" 
                    placeholder="e.g. YASH-3242"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, itemCode: `YASH-${Math.floor(1000 + Math.random() * 9000)}`})}
                    className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    Auto Code
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={(formData as any).itemName} 
                  onChange={e => setFormData({...formData, itemName: e.target.value})} 
                  className="w-full p-2.5 border border-indigo-200 dark:border-indigo-800 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/20 font-bold text-gray-900 dark:text-white outline-none" 
                  placeholder="Enter name of the item"
                  required 
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Item Category
                </label>
                <select 
                  value={(formData as any).itemCategory} 
                  onChange={e => setFormData({...formData, itemCategory: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="Raw Material">Raw Material</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Spare">Spare</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Tool">Tool</option>
                  <option value="Packing Material">Packing Material</option>
                  <option value="Finished Good">Finished Good</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Item Type
                </label>
                <select 
                  value={(formData as any).itemType} 
                  onChange={e => setFormData({...formData, itemType: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="Stock Item">Stock Item</option>
                  <option value="Non-Stock Item">Non-Stock Item</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Unit of Measure (UOM)
                </label>
                <select 
                  value={(formData as any).uom} 
                  onChange={e => setFormData({...formData, uom: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="Kg">Kg</option>
                  <option value="Nos">Nos</option>
                  <option value="Ltr">Ltr</option>
                  <option value="Mtr">Mtr</option>
                  <option value="Roll">Roll</option>
                  <option value="Bag">Bag</option>
                  <option value="Box">Box</option>
                  <option value="Set">Set</option>
                  <option value="Pair">Pair</option>
                  <option value="Drum">Drum</option>
                  <option value="TON">TON</option>
                  <option value="Quintal">Quintal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Warehouse / Store Location
                </label>
                <select 
                  value={(formData as any).warehouse} 
                  onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Raw Material Store">Raw Material Store</option>
                  <option value="Spares Warehouse">Spares Warehouse</option>
                  <option value="Chemical Store">Chemical Store</option>
                  <option value="Tools Store">Tools Store</option>
                  <option value="Packing Store">Packing Store</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Batch Tracking
                </label>
                <select 
                  value={(formData as any).batchTracking} 
                  onChange={e => setFormData({...formData, batchTracking: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Serial Number Tracking
                </label>
                <select 
                  value={(formData as any).serialTracking} 
                  onChange={e => setFormData({...formData, serialTracking: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 font-medium outline-none"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="flex gap-4 items-center mt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Active" 
                      checked={(formData as any).status === 'Active'} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="accent-emerald-600"
                    />
                    <span className="text-emerald-700 dark:text-emerald-400">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Inactive" 
                      checked={(formData as any).status === 'Inactive'} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="accent-rose-600"
                    />
                    <span className="text-rose-700 dark:text-rose-400">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          {type === 'transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Item ID</label>
                <input type="text" value={(formData as any).itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" value={(formData as any).quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
          {type === 'adjustment' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Item ID</label>
                <input type="text" value={(formData as any).itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Adjustment</label>
                <input type="number" value={(formData as any).quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
              </div>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors text-sm">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm">Save Item</button>
        </div>
      </div>
    </div>
  );
}

