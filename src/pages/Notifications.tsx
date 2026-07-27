import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    { id: 1, type: 'alert', title: 'Low Stock Alert', message: 'Raw Cotton Bale stock is below reorder level.', time: '10 mins ago', read: false },
    { id: 2, type: 'info', title: 'Purchase Order Approved', message: 'PO-2023-089 has been approved by management.', time: '2 hours ago', read: false },
    { id: 3, type: 'success', title: 'Goods Received', message: 'GRN generated for PO-2023-085 (Spindle Oil).', time: '5 hours ago', read: true },
    { id: 4, type: 'alert', title: 'Pending Approval', message: 'Material Requisition MR-102 requires your approval.', time: '1 day ago', read: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-600" /> Notifications
        </h1>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Mark all as read
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800">
        {notifications.map(notif => (
          <div key={notif.id} className={`p-4 sm:p-6 flex gap-4 ${notif.read ? 'opacity-70' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}`}>
            <div className="mt-1">
              {notif.type === 'alert' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {notif.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            You have no notifications.
          </div>
        )}
      </div>
    </div>
  );
}
