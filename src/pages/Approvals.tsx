import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, XSquare, Clock, Filter } from 'lucide-react';

export default function Approvals() {
  const { prs = [], stockTransfers = [], stockAdjustments = [] } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingApprovals = [
    ...(prs || []).filter(pr => pr.status === 'Pending').map(pr => ({
      id: pr.id,
      docNo: pr.prNo,
      type: 'Purchase Requisition',
      department: pr.departmentId,
      date: pr.date,
      status: pr.status
    })),
    ...(stockTransfers || []).filter(st => st.status === 'Pending').map(st => ({
      id: st.id,
      docNo: st.id.slice(0, 8).toUpperCase(),
      type: 'Stock Transfer',
      department: 'Warehouse',
      date: st.date,
      status: st.status
    })),
    ...(stockAdjustments || []).filter(sa => sa.status === 'Pending').map(sa => ({
      id: sa.id,
      docNo: sa.id.slice(0, 8).toUpperCase(),
      type: 'Stock Adjustment',
      department: 'Warehouse',
      date: sa.date,
      status: sa.status
    }))
  ];

  const historyApprovals = [
    ...(prs || []).filter(pr => pr.status !== 'Pending').map(pr => ({
      id: pr.id,
      docNo: pr.prNo,
      type: 'Purchase Requisition',
      department: pr.departmentId,
      date: pr.date,
      status: pr.status
    })),
    ...(stockTransfers || []).filter(st => st.status !== 'Pending').map(st => ({
      id: st.id,
      docNo: st.id.slice(0, 8).toUpperCase(),
      type: 'Stock Transfer',
      department: 'Warehouse',
      date: st.date,
      status: st.status
    })),
    ...(stockAdjustments || []).filter(sa => sa.status !== 'Pending').map(sa => ({
      id: sa.id,
      docNo: sa.id.slice(0, 8).toUpperCase(),
      type: 'Stock Adjustment',
      department: 'Warehouse',
      date: sa.date,
      status: sa.status
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Approvals Workflow</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Clock className="w-4 h-4" /> Pending Approvals ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <CheckSquare className="w-4 h-4" /> Approval History ({historyApprovals.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Pending Requests</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4">Doc No.</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {pendingApprovals.map((req, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{req.docNo}</td>
                    <td className="px-6 py-4">{req.type}</td>
                    <td className="px-6 py-4">{req.department}</td>
                    <td className="px-6 py-4">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => alert('Approve feature under construction! Data sync required.')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded">
                          <CheckSquare className="w-5 h-5" />
                        </button>
                        <button onClick={() => alert('Reject feature under construction! Data sync required.')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded">
                          <XSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingApprovals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No pending approvals.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Approval History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4">Doc No.</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {historyApprovals.map((req, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{req.docNo}</td>
                    <td className="px-6 py-4">{req.type}</td>
                    <td className="px-6 py-4">{req.department}</td>
                    <td className="px-6 py-4">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {historyApprovals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No approval history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
