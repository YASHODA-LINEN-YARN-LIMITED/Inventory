import React, { useState } from 'react';
import { X, Camera, Scan, CheckCircle2, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
}

export function BarcodeScannerModal({ isOpen, onClose, onScan, title = "Scan Barcode or QR Code" }: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = (sampleCode: string) => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onScan(sampleCode);
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Simulated Camera Viewfinder */}
          <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border-2 border-indigo-500/50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-4 border-2 border-dashed border-indigo-400/70 rounded-lg animate-pulse pointer-events-none" />
            <div className="absolute h-0.5 w-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] top-1/2 -translate-y-1/2 animate-bounce pointer-events-none" />
            
            {isSimulating ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400 z-10 bg-zinc-900/90 px-4 py-2 rounded-lg">
                <CheckCircle2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">Reading Code...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400 z-10 text-center">
                <Camera className="w-8 h-8 text-indigo-400" />
                <span className="text-xs font-medium">Position Barcode / QR Code within the viewfinder</span>
              </div>
            )}
          </div>

          {/* Quick Simulation Samples */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Sample Barcodes</div>
            <div className="flex flex-wrap gap-2">
              {['YASH-GE-2026-001', 'PO-2026-8841', 'SKU-COT-LINEN-50', 'AIPL-GATE-902'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSimulateScan(sample)}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-xs font-mono rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              placeholder="Or enter barcode number manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Scan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
