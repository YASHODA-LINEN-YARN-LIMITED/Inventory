import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse, Department, Item } from '../types';
import { Plus, MapPin, Building, Store, X, FolderTree, Users, Pencil, Trash2, Package, Search, Filter, Layers, CheckCircle2, XCircle, Tag, Wand2 } from 'lucide-react';
import { CSVUploader } from '../components/CSVUploader';

export default function Masters() {
  const { 
    users = [], addUser, updateUser, 
    warehouses = [], addWarehouse, updateWarehouse, deleteWarehouse, 
    departments = [], addDepartment, updateDepartment, deleteDepartment, 
    items = [], addItem, updateItem, deleteItem, 
    stock = [] 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'items' | 'departments' | 'warehouses' | 'companies'>('items');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'item' | 'warehouse' | 'department' | 'user'>('item');
  const [editItem, setEditItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Normalized Item Master list
  const activeItemsList = useMemo(() => {
    return (items || []).map(item => {
      const itemCode = item.itemCode || item.sku || ('YASH-' + Math.floor(1000 + Math.random() * 9000));
      const itemName = item.itemName || item.name || '';
      const itemCategory = item.itemCategory || item.category || item.categoryId || 'Raw Material';
      const itemType = item.itemType || item.type || 'Stock Item';
      const uom = item.uom || 'Kg';
      const warehouse = item.warehouse || (warehouses[0]?.name || 'Main Warehouse');
      const batchTracking = typeof item.batchTracking === 'boolean' ? (item.batchTracking ? 'Yes' : 'No') : (item.batchTracking || 'No');
      const serialTracking = typeof item.serialTracking === 'boolean' ? (item.serialTracking ? 'Yes' : 'No') : (item.serialTracking || 'No');
      const status = item.status || 'Active';

      return {
        id: item.id,
        itemCode,
        itemName,
        itemCategory,
        itemType,
        uom,
        warehouse,
        batchTracking,
        serialTracking,
        status,
        raw: item
      };
    });
  }, [items, warehouses]);

  // Filtered Item Master list
  const filteredItems = useMemo(() => {
    return activeItemsList.filter(item => {
      const matchSearch = searchTerm === '' || 
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = categoryFilter === 'all' || item.itemCategory === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [activeItemsList, searchTerm, categoryFilter]);

  // Available categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    activeItemsList.forEach(i => set.add(i.itemCategory));
    return Array.from(set);
  }, [activeItemsList]);

  // Item Master Summary Statistics
  const itemStats = useMemo(() => {
    const total = activeItemsList.length;
    const active = activeItemsList.filter(i => i.status === 'Active').length;
    const inactive = activeItemsList.filter(i => i.status === 'Inactive').length;
    const stockItems = activeItemsList.filter(i => i.itemType === 'Stock Item').length;
    return { total, active, inactive, stockItems };
  }, [activeItemsList]);

  const handleBulkUpload = async (data: any[]) => {
    let successCount = 0;
    for (const row of data) {
      if (activeTab === 'items') {
        const itemCode = row.itemCode || row.code || row.sku || ('YASH-' + Math.floor(1000 + Math.random() * 9000));
        const itemName = row.itemName || row.name || '';
        if (itemName) {
          await addItem({
            itemCode,
            sku: itemCode,
            itemName,
            name: itemName,
            itemCategory: row.itemCategory || row.category || 'Raw Material',
            category: row.itemCategory || row.category || 'Raw Material',
            itemType: row.itemType || row.type || 'Stock Item',
            type: row.itemType || row.type || 'Stock Item',
            uom: row.uom || row.unit || 'Kg',
            warehouse: row.warehouse || (warehouses[0]?.name || 'Main Warehouse'),
            batchTracking: row.batchTracking === 'Yes' || row.batchTracking === true ? 'Yes' : 'No',
            serialTracking: row.serialTracking === 'Yes' || row.serialTracking === true ? 'Yes' : 'No',
            status: row.status || 'Active'
          });
          successCount++;
        }
      } else if (activeTab === 'departments') {
        if (row.name) {
          await addDepartment({ name: row.name, head: row.head || '', plantId: row.plantId || 'Plant-1' });
          successCount++;
        }
      } else if (activeTab === 'warehouses') {
        if (row.name) {
          await addWarehouse({ name: row.name, type: row.type || 'Warehouse' });
          successCount++;
        }
      }
    }
    alert(`Bulk upload completed! ${successCount} record(s) processed.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Configurations</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage central Item Masters, Department structures, Warehouses, and Users
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CSVUploader onUpload={handleBulkUpload} />
          <button 
            onClick={() => { 
              setEditItem(null);
              if (activeTab === 'items') setModalType('item');
              else if (activeTab === 'warehouses') setModalType('warehouse');
              else if (activeTab === 'departments') setModalType('department');
              else setModalType('user');
              setIsModalOpen(true); 
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 
            Add {activeTab === 'items' ? 'Item Master' : activeTab === 'warehouses' ? 'Warehouse' : activeTab === 'departments' ? 'Department' : 'User'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4 text-indigo-500" /> Item Master ({activeItemsList.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'departments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FolderTree className="w-4 h-4 text-amber-500" /> Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'warehouses' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Building className="w-4 h-4 text-blue-500" /> Warehouses ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'companies' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Users className="w-4 h-4 text-emerald-500" /> Users ({users.length})
        </button>
      </div>

      {/* ITEM MASTER TAB CONTENT */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Item Master Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Item Masters</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{itemStats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Active Catalog Items</p>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">{itemStats.active}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Stock Managed Items</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">{itemStats.stockItems}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Item Categories</p>
                <p className="text-xl font-bold text-purple-600 mt-0.5">{categoriesList.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Tag className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search Item Code, Name, Category, Warehouse..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none text-xs text-gray-700 dark:text-gray-300 font-medium"
              >
                <option value="all">All Categories ({activeItemsList.length})</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setEditItem(null);
                  setModalType('item');
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" /> New Item Master
              </button>
            </div>
          </div>

          {/* Item Master Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
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
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {item.itemCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                        {item.itemType}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                        {item.uom}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
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
                              setEditItem(item.raw);
                              setModalType('item');
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Edit Item Master"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm(`Delete item "${item.itemName}" (${item.itemCode}) from Item Master?`)) {
                                if (deleteItem) {
                                  await deleteItem(item.id);
                                }
                                alert(`Item "${item.itemName}" removed from Item Master.`);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                            title="Delete Item Master"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No Item Master records found. Click "+ Add Item Master" to create a new item record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WAREHOUSES TAB */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(warehouses || []).map(wh => {
            const whStock = (stock || []).filter(i => i.warehouseId === wh.id);
            const totalItems = new Set(whStock.map(i => i.itemId)).size;
            const totalQuantity = whStock.reduce((sum, i) => sum + i.quantity, 0);
            const Icon = wh.type.toLowerCase() === 'store' ? Store : Building;

            return (
              <div key={wh.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{wh.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">
                        {wh.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditItem(wh); setModalType('warehouse'); setIsModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit Warehouse"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Delete this warehouse?')) deleteWarehouse(wh.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Warehouse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-zinc-800 pt-4 mt-auto">
                  <div>
                    <div className="text-xs text-gray-500">Unique Items</div>
                    <div className="font-bold text-lg">{totalItems}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Stock</div>
                    <div className="font-bold text-lg">{totalQuantity}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{dept.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Head: {dept.head}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditItem(dept); setModalType('department'); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Edit Department"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if(window.confirm('Delete this department?')) deleteDepartment(dept.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
             No departments configured.
           </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'companies' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Users</h2>
            <button 
              onClick={() => { setModalType('user'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users && users.length > 0 ? users : [{ id: '1', name: 'Admin User', email: 'admin@yashoda.com', role: 'Administrator', status: 'Active' }]).map(u => (
                <tr key={u.id}>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <span className={`${u.status === 'Active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded-full text-xs font-medium`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setEditItem(u); setModalType('user'); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MASTER MODAL */}
      {isModalOpen && (
        <MasterModal 
          type={modalType}
          initialData={editItem}
          warehousesList={warehouses.map(w => w.name)}
          onClose={() => { setIsModalOpen(false); setEditItem(null); }}
          onSave={async (data) => {
            if (modalType === 'item') {
              if (editItem) {
                await updateItem(editItem.id, {
                  itemCode: data.itemCode,
                  sku: data.itemCode,
                  itemName: data.itemName,
                  name: data.itemName,
                  itemCategory: data.itemCategory,
                  category: data.itemCategory,
                  itemType: data.itemType,
                  type: data.itemType,
                  uom: data.uom,
                  warehouse: data.warehouse,
                  batchTracking: data.batchTracking,
                  serialTracking: data.serialTracking,
                  status: data.status
                });
              } else {
                await addItem({
                  itemCode: data.itemCode || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
                  sku: data.itemCode || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
                  itemName: data.itemName,
                  name: data.itemName,
                  itemCategory: data.itemCategory,
                  category: data.itemCategory,
                  itemType: data.itemType,
                  type: data.itemType,
                  uom: data.uom,
                  warehouse: data.warehouse,
                  batchTracking: data.batchTracking,
                  serialTracking: data.serialTracking,
                  status: data.status,
                  reorderLevel: 10
                });
              }
            } else if (modalType === 'warehouse') {
              if (editItem) await updateWarehouse(editItem.id, data);
              else await addWarehouse(data);
            } else if (modalType === 'department') {
              if (editItem) await updateDepartment(editItem.id, data);
              else await addDepartment(data);
            } else if (modalType === 'user') {
              if (editItem) await updateUser(editItem.id, data);
              else await addUser(data);
            }
            setIsModalOpen(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}

function MasterModal({ 
  type, 
  onClose, 
  onSave, 
  initialData,
  warehousesList = []
}: { 
  type: string, 
  onClose: () => void, 
  onSave: (data: any) => void, 
  initialData?: any,
  warehousesList?: string[]
}) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      if (type === 'item') {
        return {
          itemCode: initialData.itemCode || initialData.sku || ('YASH-' + Math.floor(1000 + Math.random() * 9000)),
          itemName: initialData.itemName || initialData.name || '',
          itemCategory: initialData.itemCategory || initialData.category || 'Raw Material',
          itemType: initialData.itemType || initialData.type || 'Stock Item',
          uom: initialData.uom || 'Kg',
          warehouse: initialData.warehouse || (warehousesList[0] || 'Main Warehouse'),
          batchTracking: typeof initialData.batchTracking === 'boolean' ? (initialData.batchTracking ? 'Yes' : 'No') : (initialData.batchTracking || 'No'),
          serialTracking: typeof initialData.serialTracking === 'boolean' ? (initialData.serialTracking ? 'Yes' : 'No') : (initialData.serialTracking || 'No'),
          status: initialData.status || 'Active'
        };
      }
      return initialData;
    }

    if (type === 'item') {
      return {
        itemCode: 'YASH-' + Math.floor(1000 + Math.random() * 9000),
        itemName: '',
        itemCategory: 'Raw Material',
        itemType: 'Stock Item',
        uom: 'Kg',
        warehouse: warehousesList[0] || 'Main Warehouse',
        batchTracking: 'No',
        serialTracking: 'No',
        status: 'Active'
      };
    }

    if (type === 'warehouse') return { name: '', type: 'Warehouse' };
    if (type === 'department') return { name: '', head: '', plantId: 'Plant-1' };
    return { name: '', email: '', role: 'User', status: 'Active', password: '' };
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            {initialData ? `Edit ${type === 'item' ? 'Item Master' : type === 'warehouse' ? 'Warehouse' : type === 'department' ? 'Department' : 'User'}` :
            type === 'item' ? 'New Item Master' : 
            type === 'warehouse' ? 'New Warehouse' : 
            type === 'department' ? 'New Department' : 'New User'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {type === 'item' && (
            <>
              {/* Item Code */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Item Code</label>
                  <button 
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, itemCode: 'YASH-' + Math.floor(1000 + Math.random() * 9000) }))}
                    className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" /> Auto Code
                  </button>
                </div>
                <input 
                  type="text" 
                  value={(formData as any).itemCode} 
                  onChange={e => setFormData({...formData, itemCode: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400" 
                  placeholder="e.g. YASH-1001"
                  required 
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={(formData as any).itemName} 
                  onChange={e => setFormData({...formData, itemName: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs font-semibold text-gray-900 dark:text-white" 
                  placeholder="e.g. Cotton Yarn 40s Count"
                  required 
                />
              </div>

              {/* Item Category & Item Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Item Category</label>
                  <select 
                    value={(formData as any).itemCategory} 
                    onChange={e => setFormData({...formData, itemCategory: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Spares & Parts">Spares & Parts</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Tools">Tools</option>
                    <option value="Packing Material">Packing Material</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Item Type</label>
                  <select 
                    value={(formData as any).itemType} 
                    onChange={e => setFormData({...formData, itemType: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <option value="Stock Item">Stock Item</option>
                    <option value="Non-Stock Item">Non-Stock Item</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              {/* UOM & Warehouse Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Unit of Measure (UOM)</label>
                  <select 
                    value={(formData as any).uom} 
                    onChange={e => setFormData({...formData, uom: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs text-gray-800 dark:text-gray-200 font-medium"
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
                    <option value="Ton">Ton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
                  <select 
                    value={(formData as any).warehouse} 
                    onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Raw Material Store">Raw Material Store</option>
                    <option value="Spares Warehouse">Spares Warehouse</option>
                    <option value="Chemical Store">Chemical Store</option>
                    <option value="General Store">General Store</option>
                    {warehousesList.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Tracking & Serial Number Tracking Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Batch Tracking</label>
                  <select 
                    value={(formData as any).batchTracking} 
                    onChange={e => setFormData({...formData, batchTracking: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Serial Number Tracking</label>
                  <select 
                    value={(formData as any).serialTracking} 
                    onChange={e => setFormData({...formData, serialTracking: e.target.value})} 
                    className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  value={(formData as any).status} 
                  onChange={e => setFormData({...formData, status: e.target.value})} 
                  className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          {type === 'warehouse' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Warehouse Name</label>
                <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={(formData as any).type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs">
                  <option value="Warehouse">Warehouse</option>
                  <option value="Store">Store</option>
                </select>
              </div>
            </>
          )}

          {type === 'department' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
                <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Department Head</label>
                <input type="text" value={(formData as any).head} onChange={e => setFormData({...formData, head: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
              </div>
            </>
          )}

          {type === 'user' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={(formData as any).name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={(formData as any).email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
              </div>
              {!initialData && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input type="password" value={(formData as any).password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs" required />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={(formData as any).role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 outline-none text-xs">
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-800/30 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => onSave(formData)} 
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            Save {type === 'item' ? 'Item Master' : 'Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
