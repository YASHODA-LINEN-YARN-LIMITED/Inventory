import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, IndianRupee, ArrowRightLeft, TrendingUp, ArrowRight, Calendar, Filter, Building2, Receipt, ShieldCheck, Truck, Activity, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { KraPerformanceModal } from '../components/KraPerformanceModal';

function parseNumeric(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseEntryDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export default function Dashboard() {
  const { stock = [], items = [], materialIssues = [], materialIssueItems = [], departments = [], gateEntriesYashoda = [], gateEntriesAIPL = [] } = useApp();

  // Filters
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'Yashoda' | 'AIPL'>('all');
  const [isKraModalOpen, setIsKraModalOpen] = useState(false);

  // Combine gate entries
  const allGateEntries = useMemo(() => {
    const yashoda = (gateEntriesYashoda || []).map(e => ({ ...e, companyType: 'Yashoda' as const }));
    const aipl = (gateEntriesAIPL || []).map(e => ({ ...e, companyType: 'AIPL' as const }));
    return [...yashoda, ...aipl];
  }, [gateEntriesYashoda, gateEntriesAIPL]);

  // Filter gate entries by date and company
  const filteredGateEntries = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return allGateEntries.filter(entry => {
      // Company filter
      if (companyFilter !== 'all' && entry.companyType !== companyFilter) {
        return false;
      }

      // Date filter
      if (!entry.date) return dateFilter === 'all';
      const eDate = parseEntryDate(entry.date);
      if (!eDate) return dateFilter === 'all';

      if (dateFilter === 'today') {
        const eStr = eDate.toISOString().split('T')[0];
        return eStr === todayStr;
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return eDate >= oneWeekAgo && eDate <= now;
      } else if (dateFilter === 'month') {
        return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (eDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (eDate > e) return false;
        }
        return true;
      }

      return true;
    });
  }, [allGateEntries, dateFilter, startDate, endDate, companyFilter]);

  // Financial sums from filtered Gate Entries
  const gateTotals = useMemo(() => {
    let basePriceSum = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;
    let totalPriceSum = 0;
    let totalQty = 0;

    filteredGateEntries.forEach(entry => {
      basePriceSum += parseNumeric(entry.basePrice);
      cgstSum += parseNumeric(entry.cgst);
      sgstSum += parseNumeric(entry.sgst);
      igstSum += parseNumeric(entry.igst);
      totalPriceSum += parseNumeric(entry.totalPrice);
      totalQty += parseNumeric(entry.quantityWeight);
    });

    const gstSum = cgstSum + sgstSum + igstSum;

    return {
      basePriceSum,
      cgstSum,
      sgstSum,
      igstSum,
      gstSum,
      totalPriceSum,
      totalQty,
      count: filteredGateEntries.length
    };
  }, [filteredGateEntries]);

  // Separate totals for Yashoda vs Contractor AIPL
  const yashodaTotals = useMemo(() => {
    const list = filteredGateEntries.filter(e => e.companyType === 'Yashoda');
    return {
      count: list.length,
      base: list.reduce((s, e) => s + parseNumeric(e.basePrice), 0),
      gst: list.reduce((s, e) => s + parseNumeric(e.cgst) + parseNumeric(e.sgst) + parseNumeric(e.igst), 0),
      total: list.reduce((s, e) => s + parseNumeric(e.totalPrice), 0),
      qty: list.reduce((s, e) => s + parseNumeric(e.quantityWeight), 0),
    };
  }, [filteredGateEntries]);

  const aiplTotals = useMemo(() => {
    const list = filteredGateEntries.filter(e => e.companyType === 'AIPL');
    return {
      count: list.length,
      base: list.reduce((s, e) => s + parseNumeric(e.basePrice), 0),
      gst: list.reduce((s, e) => s + parseNumeric(e.cgst) + parseNumeric(e.sgst) + parseNumeric(e.igst), 0),
      total: list.reduce((s, e) => s + parseNumeric(e.totalPrice), 0),
      qty: list.reduce((s, e) => s + parseNumeric(e.quantityWeight), 0),
    };
  }, [filteredGateEntries]);

  // Overall Inventory Stock
  const currentStock = (stock || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Chart data: Gate Entry Total Price by Date
  const chartDataByDate = useMemo(() => {
    const map: Record<string, { date: string, basePrice: number, totalPrice: number, gst: number, entries: number }> = {};

    filteredGateEntries.forEach(entry => {
      const d = parseEntryDate(entry.date);
      const dateKey = d ? d.toISOString().split('T')[0] : (entry.date ? entry.date.split(' ')[0] : 'Unknown');
      
      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, basePrice: 0, totalPrice: 0, gst: 0, entries: 0 };
      }
      map[dateKey].basePrice += parseNumeric(entry.basePrice);
      map[dateKey].gst += parseNumeric(entry.cgst) + parseNumeric(entry.sgst) + parseNumeric(entry.igst);
      map[dateKey].totalPrice += parseNumeric(entry.totalPrice);
      map[dateKey].entries += 1;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredGateEntries]);

  // Department Material Issues & Outward Consumption Statistics
  const materialIssueStats = useMemo(() => {
    const totalIssuesCount = (materialIssues || []).length;
    let totalQtyIssued = 0;
    let totalItemsIssuedCount = (materialIssueItems || []).length;

    // Map department IDs/names
    const deptMap: Record<string, { id: string; name: string; count: number; totalQty: number }> = {};

    (departments || []).forEach(d => {
      deptMap[d.id] = { id: d.id, name: d.name, count: 0, totalQty: 0 };
    });

    (materialIssues || []).forEach(issue => {
      const dId = issue.departmentId || 'General';
      const deptObj = (departments || []).find(d => d.id === dId || d.name === dId);
      const deptName = deptObj ? deptObj.name : dId;

      if (!deptMap[dId]) {
        deptMap[dId] = { id: dId, name: deptName, count: 0, totalQty: 0 };
      }
      deptMap[dId].count += 1;

      // Find items from materialIssueItems
      const relatedItems = (materialIssueItems || []).filter(item => item.issueId === issue.id);
      relatedItems.forEach(item => {
        const q = parseNumeric(item.quantity);
        totalQtyIssued += q;
        deptMap[dId].totalQty += q;
      });

      // Also support inline items array on issue if present
      if (Array.isArray((issue as any).items)) {
        (issue as any).items.forEach((it: any) => {
          if (!relatedItems.some(r => r.itemId === it.itemId)) {
            const q = parseNumeric(it.quantity);
            totalQtyIssued += q;
            deptMap[dId].totalQty += q;
            totalItemsIssuedCount += 1;
          }
        });
      }
    });

    const activeDepts = Object.values(deptMap).filter(d => d.count > 0 || d.totalQty > 0);

    return {
      totalIssuesCount,
      totalItemsIssuedCount,
      totalQtyIssued,
      activeDepts,
      recentIssues: (materialIssues || []).slice(-6).reverse()
    };
  }, [materialIssues, materialIssueItems, departments]);

  const departmentIssueChartData = useMemo(() => {
    return materialIssueStats.activeDepts
      .map(d => ({ name: d.name.length > 18 ? d.name.substring(0, 18) + '...' : d.name, quantity: d.totalQty, count: d.count }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [materialIssueStats]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date/Company Filters */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Executive Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time Inward Gate Entry sums, Base Rates, GST breakdowns, & Stock Metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Company selector */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700">
              <Building2 className="w-4 h-4 text-gray-400 ml-1" />
              <select 
                value={companyFilter} 
                onChange={e => setCompanyFilter(e.target.value as any)}
                className="bg-transparent text-sm font-medium outline-none pr-2"
              >
                <option value="all">All Companies (Yashoda & AIPL)</option>
                <option value="Yashoda">Yashoda Linen Yarn Ltd</option>
                <option value="AIPL">Contractor AIPL</option>
              </select>
            </div>

            {/* KRA SLA Metrics Button */}
            <button
              onClick={() => setIsKraModalOpen(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Activity className="w-4 h-4 text-indigo-200" /> 30 KRAs & SLA Matrix
            </button>

            {/* Filter Link */}
            <Link to="/gate" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 hover:bg-indigo-100 transition-colors">
              <Truck className="w-4 h-4" /> Go to Gate Register →
            </Link>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Filter:
            </span>
            {(['all', 'today', 'week', 'month', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDateFilter(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  dateFilter === mode 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                }`}
              >
                {mode === 'all' ? 'All Time' : mode === 'week' ? 'This Week' : mode === 'month' ? 'This Month' : mode}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
              <span>From:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 outline-none"
              />
              <span>To:</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Financial Gate Register Sum Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Gate Entry Financial Summaries ({companyFilter === 'all' ? 'Yashoda + Contractor AIPL' : companyFilter})
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Showing {gateTotals.count} entries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard 
            title="Total Base Rate (Base Price)" 
            value={formatCurrency(gateTotals.basePriceSum)} 
            subtitle={`Across ${gateTotals.count} Gate Entries`}
            color="border-l-4 border-l-blue-500"
            badge="Base Rate"
          />
          <FinancialCard 
            title="Total GST (CGST + SGST + IGST)" 
            value={formatCurrency(gateTotals.gstSum)} 
            subtitle={`CGST: ${formatCurrency(gateTotals.cgstSum)} | SGST/IGST: ${formatCurrency(gateTotals.sgstSum + gateTotals.igstSum)}`}
            color="border-l-4 border-l-amber-500"
            badge="Tax Total"
          />
          <FinancialCard 
            title="Grand Total Price / Amount" 
            value={formatCurrency(gateTotals.totalPriceSum)} 
            subtitle="Net Invoice & Gate Entry Value"
            color="border-l-4 border-l-emerald-600"
            badge="Grand Total"
            isPrimary
          />
          <FinancialCard 
            title="Total Inward Quantity" 
            value={`${gateTotals.totalQty.toLocaleString()} units`} 
            subtitle={`Current Inventory Stock: ${currentStock.toLocaleString()}`}
            color="border-l-4 border-l-purple-500"
            badge="Inward Qty"
          />
        </div>
      </div>

      {/* Detailed Tax Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total CGST</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(gateTotals.cgstSum)}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg font-bold text-xs">
            CGST
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total SGST</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(gateTotals.sgstSum)}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg font-bold text-xs">
            SGST
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total IGST</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(gateTotals.igstSum)}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg font-bold text-xs">
            IGST
          </div>
        </div>
      </div>

      {/* Yashoda vs Contractor AIPL Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yashoda Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-xl shadow-md border border-indigo-800 space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-800/80 pb-3">
            <div>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Company</span>
              <h3 className="text-xl font-bold text-white">Yashoda Linen Yarn Limited</h3>
            </div>
            <span className="bg-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium text-indigo-100">
              {yashodaTotals.count} Entries
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-indigo-300">Total Base Rate</p>
              <p className="text-lg font-bold">{formatCurrency(yashodaTotals.base)}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-300">Total GST Sum</p>
              <p className="text-lg font-bold">{formatCurrency(yashodaTotals.gst)}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-300">Grand Total Price</p>
              <p className="text-xl font-extrabold text-emerald-300">{formatCurrency(yashodaTotals.total)}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-300">Total Inward Qty</p>
              <p className="text-lg font-bold">{yashodaTotals.qty.toLocaleString()} units</p>
            </div>
          </div>
        </div>

        {/* Contractor AIPL Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 rounded-xl shadow-md border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Contractor</span>
              <h3 className="text-xl font-bold text-white">Contractor AIPL</h3>
            </div>
            <span className="bg-amber-600/30 text-amber-300 border border-amber-600/50 text-xs px-2.5 py-1 rounded-full font-medium">
              {aiplTotals.count} Entries
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-400">Total Base Rate</p>
              <p className="text-lg font-bold">{formatCurrency(aiplTotals.base)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total GST Sum</p>
              <p className="text-lg font-bold">{formatCurrency(aiplTotals.gst)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Grand Total Price</p>
              <p className="text-xl font-extrabold text-amber-300">{formatCurrency(aiplTotals.total)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total Inward Qty</p>
              <p className="text-lg font-bold">{aiplTotals.qty.toLocaleString()} units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date-wise Chart of Gate Entry Values */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Date-Wise Inward Gate Entry Values (Base Rate vs Total Price)</h2>
            <p className="text-xs text-gray-500">Visual trend of invoice amounts over selected dates</p>
          </div>
          <Link to="/inventory" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View Current Stock & Master →
          </Link>
        </div>

        <div className="h-72">
          {chartDataByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataByDate} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'totalPrice' ? 'Grand Total' : 'Base Rate']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="basePrice" fill="#3b82f6" name="Base Rate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalPrice" fill="#10b981" name="Total Price" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No Gate Entry transactions found for the selected date range.
            </div>
          )}
        </div>
      </div>

      {/* Department Material Issues & Outward Consumption Analytics */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              Department Material Issue & Consumption Overview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live outward stock issues, department requisitions, and consumption distribution
            </p>
          </div>
          <Link 
            to="/material-issue" 
            className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors self-start md:self-auto"
          >
            Go to Material Issue Module →
          </Link>
        </div>

        {/* 4 Summary Cards for Material Issues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard 
            title="Total Issue Vouchers" 
            value={`${materialIssueStats.totalIssuesCount} Vouchers`} 
            subtitle="Approved Department Requisitions"
            color="border-l-4 border-l-amber-500"
            badge="Issue Vouchers"
          />
          <FinancialCard 
            title="Total Quantity Issued" 
            value={`${materialIssueStats.totalQtyIssued.toLocaleString('en-IN')} units`} 
            subtitle="Outward Issued from Yashoda Store"
            color="border-l-4 border-l-indigo-500"
            badge="Outward Qty"
            isPrimary
          />
          <FinancialCard 
            title="Line Items Issued" 
            value={`${materialIssueStats.totalItemsIssuedCount} Items`} 
            subtitle="Individual Store Items Dispensed"
            color="border-l-4 border-l-blue-500"
            badge="Line Items"
          />
          <FinancialCard 
            title="Active Consuming Depts" 
            value={`${materialIssueStats.activeDepts.length} Departments`} 
            subtitle="Spinning, Weaving, Spares, etc."
            color="border-l-4 border-l-emerald-500"
            badge="Depts"
          />
        </div>

        {/* Chart & Recent Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Department Issue Distribution Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Material Consumption by Department
                </h3>
                <p className="text-xs text-gray-500">Outward quantity issued per production center</p>
              </div>
            </div>

            <div className="h-64 pt-2">
              {departmentIssueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentIssueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip 
                      formatter={(val: any) => [`${Number(val).toLocaleString('en-IN')} units`, 'Issued Qty']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Issued Qty" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  No material issue records found.
                </div>
              )}
            </div>
          </div>

          {/* Recent Department Material Issue Vouchers Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Recent Material Issue Requests & Vouchers
                </h3>
                <Link to="/material-issue" className="text-[11px] text-indigo-600 font-bold hover:underline">
                  View All ({materialIssueStats.totalIssuesCount}) →
                </Link>
              </div>

              <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-gray-500 font-semibold uppercase text-[10px]">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Voucher #</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {materialIssueStats.recentIssues.map((issue: any, idx: number) => {
                      const deptName = departments.find(d => d.id === issue.departmentId || d.name === issue.departmentId)?.name || issue.departmentId || 'Department';
                      return (
                        <tr key={issue.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                            {issue.date || 'Today'}
                          </td>
                          <td className="px-3 py-2.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            MIV-{issue.id.substring(0, 6).toUpperCase()}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">
                            {deptName}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Issued
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {materialIssueStats.recentIssues.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-xs">
                          No material issue vouchers created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KraPerformanceModal */}
      <KraPerformanceModal
        isOpen={isKraModalOpen}
        onClose={() => setIsKraModalOpen(false)}
      />
    </div>
  );
}

function FinancialCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  badge,
  isPrimary 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  color: string; 
  badge?: string;
  isPrimary?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 ${color} flex flex-col justify-between space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPrimary ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300'}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className={`text-2xl font-extrabold ${isPrimary ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

