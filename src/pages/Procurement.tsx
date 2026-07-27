import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Users, Mail, Phone, MapPin, X, FileText, ShoppingCart, CheckSquare } from 'lucide-react';

export default function Procurement() {
  const { suppliers = [], addSupplier, prs = [], pos = [], grns = [], addPR, addPO, addGRN, departments = [] } = useApp();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'pr' | 'po' | 'grn'>('suppliers');
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Procurement Module</h1>
        {activeTab === 'suppliers' && (
          <button 
            onClick={() => setIsSupplierModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Supplier
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'suppliers' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Users className="w-4 h-4" /> Suppliers
        </button>
        <button
          onClick={() => setActiveTab('pr')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pr' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <FileText className="w-4 h-4" /> Purchase Requisitions
        </button>
        <button
          onClick={() => setActiveTab('po')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'po' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('grn')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'grn' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <CheckSquare className="w-4 h-4" /> GRN
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{sup.name}</h3>
                  <p className="text-sm text-gray-500">{sup.contactName}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm flex-1">
                {sup.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                    <a href={`mailto:${sup.email}`} className="hover:text-indigo-600 truncate">{sup.email}</a>
                  </div>
                )}
                {sup.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                    <a href={`tel:${sup.phone}`} className="hover:text-indigo-600">{sup.phone}</a>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {suppliers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
              No suppliers added yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'pr' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Purchase Requisitions</h2>
            <button onClick={() => setIsPRModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New PR
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">PR Number</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {prs && prs.map(pr => (
                <tr key={pr.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{pr.prNumber}</td>
                  <td className="p-4">{departments.find(d => d.id === pr.departmentId)?.name || pr.departmentId}</td>
                  <td className="p-4">{pr.date}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">{pr.status}</span></td>
                </tr>
              ))}
              {(!prs || prs.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No Purchase Requisitions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'po' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Purchase Orders</h2>
            <button onClick={() => setIsPOModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New PO
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {pos && pos.map(po => (
                <tr key={po.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{po.poNumber}</td>
                  <td className="p-4">{suppliers.find(s => s.id === po.supplierId)?.name || po.supplierId}</td>
                  <td className="p-4">{po.date}</td>
                  <td className="p-4">${po.amount}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">{po.status}</span></td>
                </tr>
              ))}
              {(!pos || pos.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No Purchase Orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'grn' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg">Goods Receipt Notes (GRN)</h2>
            <button onClick={() => setIsGRNModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New GRN
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500">
              <tr>
                <th className="p-4">GRN Number</th>
                <th className="p-4">PO Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Received By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {grns && grns.map(grn => (
                <tr key={grn.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <td className="p-4">{grn.grnNumber}</td>
                  <td className="p-4">{grn.poId}</td>
                  <td className="p-4">{grn.date}</td>
                  <td className="p-4">{grn.receivedBy}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{grn.status}</span></td>
                </tr>
              ))}
              {(!grns || grns.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No Goods Receipt Notes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isSupplierModalOpen && (
        <SupplierModal 
          onClose={() => setIsSupplierModalOpen(false)} 
          onSave={(data) => { addSupplier(data); setIsSupplierModalOpen(false); }} 
        />
      )}
      {isPRModalOpen && (
        <PRModal 
          departments={departments}
          onClose={() => setIsPRModalOpen(false)} 
          onSave={(data) => { addPR(data); setIsPRModalOpen(false); }} 
        />
      )}
      {isPOModalOpen && (
        <POModal 
          suppliers={suppliers}
          onClose={() => setIsPOModalOpen(false)} 
          onSave={(data) => { addPO(data); setIsPOModalOpen(false); }} 
        />
      )}
      {isGRNModalOpen && (
        <GRNModal 
          pos={pos || []}
          onClose={() => setIsGRNModalOpen(false)} 
          onSave={(data) => { addGRN(data); setIsGRNModalOpen(false); }} 
        />
      )}
    </div>
  );
}

function SupplierModal({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ name: '', contactName: '', email: '', phone: '', address: '' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">New Supplier</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none h-24" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Save Supplier</button>
        </div>
      </div>
    </div>
  );
}

function PRModal({ departments, onClose, onSave }: { departments: any[], onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ prNumber: `PR-${Date.now().toString().slice(-6)}`, departmentId: '', date: new Date().toISOString().split('T')[0], status: 'Pending' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">New Purchase Requisition</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PR Number</label>
            <input type="text" value={formData.prNumber} readOnly className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Create PR</button>
        </div>
      </div>
    </div>
  );
}

function POModal({ suppliers, onClose, onSave }: { suppliers: any[], onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ poNumber: `PO-${Date.now().toString().slice(-6)}`, supplierId: '', date: new Date().toISOString().split('T')[0], amount: 0, status: 'Draft' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">New Purchase Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PO Number</label>
            <input type="text" value={formData.poNumber} readOnly className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Create PO</button>
        </div>
      </div>
    </div>
  );
}

function GRNModal({ pos, onClose, onSave }: { pos: any[], onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ grnNumber: `GRN-${Date.now().toString().slice(-6)}`, poId: '', date: new Date().toISOString().split('T')[0], receivedBy: '', status: 'Received' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold">New GRN</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">GRN Number</label>
            <input type="text" value={formData.grnNumber} readOnly className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PO Reference</label>
            <select value={formData.poId} onChange={e => setFormData({...formData, poId: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none">
              <option value="">Select PO</option>
              {pos.map(po => <option key={po.id} value={po.poNumber}>{po.poNumber}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Received By</label>
              <input type="text" value={formData.receivedBy} onChange={e => setFormData({...formData, receivedBy: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Create GRN</button>
        </div>
      </div>
    </div>
  );
}
