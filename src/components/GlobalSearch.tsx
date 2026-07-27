import React, { useState } from 'react';
import { Search, MapPin, Package, ShoppingCart, Users, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function GlobalSearch() {
  const { gateEntriesYashoda = [], gateEntriesAIPL = [], items = [], pos = [], suppliers = [] } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const cleanQuery = query.toLowerCase().trim();

  const matchedGate = cleanQuery ? [...gateEntriesYashoda, ...gateEntriesAIPL].filter(e =>
    (e.partyName || '').toLowerCase().includes(cleanQuery) ||
    (e.materialDescription || '').toLowerCase().includes(cleanQuery) ||
    (e.vehicleNo || '').toLowerCase().includes(cleanQuery) ||
    (e.slNo || '').includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedItems = cleanQuery ? items.filter(i =>
    (i.name || '').toLowerCase().includes(cleanQuery) ||
    (i.sku || '').toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedPOs = cleanQuery ? pos.filter(p =>
    (p.poNumber || '').toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const matchedSuppliers = cleanQuery ? suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const hasResults = matchedGate.length > 0 || matchedItems.length > 0 || matchedPOs.length > 0 || matchedSuppliers.length > 0;

  return (
    <div className="relative flex-1 max-w-md mx-2 hidden md:block">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Global search (Gate, Stock, POs, Suppliers)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && cleanQuery && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto p-3 space-y-3">
          {!hasResults && (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching ERP records found for "{query}".
            </div>
          )}

          {/* Gate Entries */}
          {matchedGate.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" /> Gate Entries
              </div>
              {matchedGate.map((e) => (
                <Link
                  key={e.id || e.slNo}
                  to="/gate"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-between items-center px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">{e.materialDescription}</div>
                    <div className="text-[10px] text-gray-500">{e.partyName} • {e.vehicleNo}</div>
                  </div>
                  <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-2 py-0.5 rounded-md font-bold">
                    SL #{e.slNo}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Stock Items */}
          {matchedItems.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <Package className="w-3 h-3 text-emerald-500" /> Inventory Catalog Items
              </div>
              {matchedItems.map((i) => (
                <Link
                  key={i.id}
                  to="/inventory"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-between items-center px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">{i.name}</div>
                    <div className="text-[10px] text-gray-500">SKU: {i.sku} • UOM: {i.uom}</div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-md font-bold">
                    Item Master
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Purchase Orders */}
          {matchedPOs.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-amber-500" /> Purchase Orders
              </div>
              {matchedPOs.map((p) => (
                <Link
                  key={p.id}
                  to="/procurement"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-between items-center px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">{p.poNumber}</div>
                    <div className="text-[10px] text-gray-500">Amount: ₹{p.amount?.toLocaleString()}</div>
                  </div>
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 px-2 py-0.5 rounded-md font-bold">
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
