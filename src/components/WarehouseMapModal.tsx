import React, { useState } from 'react';
import { X, MapPin, Package, Layers, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';

interface WarehouseMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: any[];
}

export function WarehouseMapModal({ isOpen, onClose, items = [] }: WarehouseMapModalProps) {
  const [selectedRack, setSelectedRack] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  if (!isOpen) return null;

  const racks = ['A', 'B', 'C', 'D'] as const;
  const bins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getBinData = (rack: string, binNum: number) => {
    const binCode = `RACK-${rack}-BIN-${binNum}`;
    const matchedItem = items[ (binNum - 1) % (items.length || 1) ];
    const isOccupied = binNum % 2 === 0 || binNum % 3 === 0;
    return {
      binCode,
      isOccupied,
      itemName: matchedItem ? matchedItem.itemName || matchedItem.name : 'Raw Linen Yarn 40s',
      qty: isOccupied ? (binNum * 125) : 0,
      uom: matchedItem ? matchedItem.uom : 'Kgs',
      status: isOccupied ? (binNum % 5 === 0 ? 'Reorder' : 'Optimal') : 'Empty'
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Main Mill Store - Interactive Bin/Rack Map</h3>
              <p className="text-[11px] text-gray-500">Visual occupancy layout for Yashoda Linen Mill Warehouse</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rack Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase mr-2">Select Rack Section:</span>
            {racks.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setSelectedRack(r); setSelectedBin(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRack === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Rack {r}
              </button>
            ))}
          </div>

          {/* Interactive Bins Visualizer Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300">Rack {selectedRack} Storage Cells (12 Bins)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Low Stock</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-zinc-700" /> Available</span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {bins.map((binNum) => {
                const info = getBinData(selectedRack, binNum);
                const isSelected = selectedBin === info.binCode;
                return (
                  <button
                    key={binNum}
                    type="button"
                    onClick={() => setSelectedBin(info.binCode)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : info.status === 'Empty'
                        ? 'border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 text-gray-400'
                        : info.status === 'Reorder'
                        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                        : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold uppercase">{selectedRack}-{binNum.toString().padStart(2, '0')}</span>
                      {info.status === 'Reorder' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      {info.status === 'Optimal' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="text-[11px] font-semibold truncate">{info.status === 'Empty' ? 'Empty Cell' : info.itemName}</div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1">
                      {info.status === 'Empty' ? '0 KGS' : `${info.qty} ${info.uom}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Bin Details */}
          {selectedBin && (
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Active Location: {selectedBin}</div>
                  <div className="text-gray-500 text-[11px]">Primary Location: Main Mill Central Store • Aisle {selectedRack}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBin(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
