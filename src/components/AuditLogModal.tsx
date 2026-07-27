import React from 'react';
import { X, ShieldCheck, Clock, User, FileText, Activity } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_LOGS = [
  { id: '1', time: 'Today 09:14 AM', user: 'Gate Officer', action: 'Created Yashoda Gate Entry', detail: 'SL-1042 (Cotton Linen Yarn, 5000 KGS)' },
  { id: '2', time: 'Today 08:30 AM', user: 'Store Manager', action: 'Approved Material Issue Voucher', detail: 'Voucher #MI-2026-89 (Weaving Dept)' },
  { id: '3', time: 'Yesterday 05:45 PM', user: 'System Auto-Audit', action: 'Sync Inward to Item Master', detail: 'Synced 12 items to Live Stock Engine' },
  { id: '4', time: 'Yesterday 02:10 PM', user: 'AIPL Store Keeper', action: 'Created Contractor AIPL Entry', detail: 'SL-902 (Chemical Dyes, 120 Ltrs)' },
  { id: '5', time: 'Jul 22 11:20 AM', user: 'Admin User', action: 'Modified Reorder Level Threshold', detail: 'Yarn 40s updated to 1,000 Kgs' }
];

export function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">System Audit Trail & Activity Log</h3>
              <p className="text-[11px] text-gray-500">Security event logging and record modification history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {SAMPLE_LOGS.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{log.detail}</p>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Executed by: <span className="font-semibold text-gray-700 dark:text-gray-300">{log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs text-gray-500">
            <span>Tracking all inward, outward & configuration edits</span>
            <span className="font-mono text-emerald-600 font-bold">100% Audit Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
