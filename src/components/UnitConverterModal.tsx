import React, { useState } from 'react';
import { X, ArrowRightLeft, Calculator, Sparkles } from 'lucide-react';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONVERSION_RATES: Record<string, number> = {
  KGS: 1,
  GRAMS: 0.001,
  TONS: 1000,
  QUINTALS: 100,
  BALES: 170, // 1 Standard Cotton Bale ~ 170 Kgs
  LBS: 0.453592,
  METRES: 1,
  YARDS: 0.9144,
  FEET: 0.3048,
  LITRES: 1
};

export function UnitConverterModal({ isOpen, onClose }: UnitConverterModalProps) {
  const [val, setVal] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('TONS');
  const [toUnit, setToUnit] = useState<string>('KGS');

  if (!isOpen) return null;

  const calculateResult = () => {
    const fromFactor = CONVERSION_RATES[fromUnit] || 1;
    const toFactor = CONVERSION_RATES[toUnit] || 1;
    const inBaseKgs = val * fromFactor;
    const result = inBaseKgs / toFactor;
    return Math.round((result + Number.EPSILON) * 1000) / 1000;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Multi-Unit Conversion Matrix</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">From Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              >
                {Object.keys(CONVERSION_RATES).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">To Unit</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              >
                {Object.keys(CONVERSION_RATES).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center space-y-1">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Calculated Conversion
            </div>
            <div className="text-3xl font-black text-indigo-950 dark:text-indigo-200 font-mono">
              {val} {fromUnit} = {calculateResult()} {toUnit}
            </div>
            <p className="text-[11px] text-gray-500">Standard mill floor ratio matrix</p>
          </div>

          {/* Preset Conversions Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Conversion Ratios</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between">
                <span className="text-gray-500">1 TON</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">1,000 KGs</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between">
                <span className="text-gray-500">1 QUINTAL</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">100 KGs</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between">
                <span className="text-gray-500">1 COTTON BALE</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">170 KGs</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between">
                <span className="text-gray-500">1 KG</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">1,000 GRAMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
