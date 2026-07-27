import React from 'react';
import { X, Printer, MapPin, Building2, ShieldCheck, Clock, FileText } from 'lucide-react';
import { GateEntry } from '../types';

interface PrintGatePassModalProps {
  entry: GateEntry | null;
  companyType?: 'Yashoda' | 'AIPL';
  isOpen: boolean;
  onClose: () => void;
}

export function PrintGatePassModal({ entry, companyType = 'Yashoda', isOpen, onClose }: PrintGatePassModalProps) {
  if (!isOpen || !entry) return null;

  const handlePrint = () => {
    window.print();
  };

  const isYashoda = companyType === 'Yashoda' || entry.companyType === 'Yashoda';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-8">
        {/* Modal Toolbar (hidden during print) */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Printable Gate Pass Voucher</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Voucher
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 bg-white text-gray-900 space-y-6 font-sans print:p-0 print:m-0">
          {/* Header & Letterhead */}
          <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-black tracking-tight text-indigo-950 uppercase">
                  {isYashoda ? 'YASHODA LINEN YARN LTD' : 'CONTRACTOR AIPL STORE REGISTER'}
                </h1>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Mill Floor Gate & Security Control Division • Main Industrial Complex
              </p>
              <p className="text-[11px] text-gray-500">Inward Material Vehicle Gate Pass Voucher</p>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-xs font-mono font-bold text-gray-500">GATE PASS NO.</div>
              <div className="text-lg font-black font-mono text-indigo-600">GP-{entry.slNo || '001'}</div>
              <div className="text-xs text-gray-500">Date: {entry.date}</div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="font-mono text-xs font-bold text-gray-700 tracking-widest bg-white px-3 py-1.5 rounded border border-gray-300">
                |||||||||||||||||||||||||||||||||||||
              </div>
              <span className="text-[11px] font-mono text-gray-500">REF: {entry.slNo}-{entry.vehicleNo?.replace(/\s+/g, '')}</span>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded bg-indigo-100 text-indigo-800 uppercase">
              {isYashoda ? 'Yashoda Inward' : 'AIPL Store'}
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
              <span className="text-gray-400 font-semibold uppercase text-[10px]">Supplier / Party Name</span>
              <div className="font-bold text-sm text-gray-900">{entry.partyName || '-'}</div>
              <div className="text-gray-500 text-[11px]">GSTIN: {entry.gstNo || 'Unregistered / N/A'}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
              <span className="text-gray-400 font-semibold uppercase text-[10px]">Vehicle & License Details</span>
              <div className="font-bold text-sm text-gray-900 uppercase">{entry.vehicleNo || '-'}</div>
              <div className="text-gray-500 text-[11px]">Driver DL: {entry.driverLicenceNo || 'N/A'}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
              <span className="text-gray-400 font-semibold uppercase text-[10px]">Material Description</span>
              <div className="font-bold text-sm text-gray-900">{entry.materialDescription || '-'}</div>
              <div className="text-indigo-600 font-bold">Qty: {entry.quantityWeight} {entry.unit}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
              <span className="text-gray-400 font-semibold uppercase text-[10px]">Invoice & eWay Bill</span>
              <div className="font-bold text-sm text-gray-900">Inv: {entry.invoiceNoValue || 'N/A'}</div>
              <div className="text-gray-500 text-[11px]">eWay Bill: {entry.ewayBill || 'N/A'}</div>
            </div>
          </div>

          {/* Timing & Financial Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 flex justify-between">
              <span>Gate Timestamp & Valuation Breakdown</span>
              <span>In: {entry.inTime || 'N/A'} | Out: {entry.outTime || 'Pending'}</span>
            </div>
            <div className="p-4 grid grid-cols-4 gap-2 text-center bg-white">
              <div>
                <span className="text-gray-400 text-[10px]">Base Price</span>
                <div className="font-bold font-mono">₹{entry.basePrice || '0.00'}</div>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">SGST</span>
                <div className="font-bold font-mono">₹{entry.sgst || '0.00'}</div>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">CGST / IGST</span>
                <div className="font-bold font-mono">₹{Number(entry.cgst || 0) + Number(entry.igst || 0)}</div>
              </div>
              <div className="border-l border-gray-200 pl-2">
                <span className="text-gray-400 text-[10px]">Grand Total</span>
                <div className="font-black font-mono text-emerald-600 text-sm">₹{entry.totalPrice || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-gray-200 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="space-y-8">
              <div className="border-b border-gray-300 pb-1 text-gray-500">{entry.contactNoSign || 'Driver Signature'}</div>
              <span className="font-bold text-gray-700">Driver / Transporter</span>
            </div>
            <div className="space-y-8">
              <div className="border-b border-gray-300 pb-1 text-gray-500">{entry.securitySign || 'Verified'}</div>
              <span className="font-bold text-gray-700">Gate Security In-charge</span>
            </div>
            <div className="space-y-8">
              <div className="border-b border-gray-300 pb-1 text-gray-500">Store Stamp & Sign</div>
              <span className="font-bold text-gray-700">Mill Store Officer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
