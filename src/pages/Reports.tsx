import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Filter, BarChart2, Truck, TrendingUp, 
  Package, ShoppingCart, Layers, AlertTriangle, CheckCircle2, 
  Calendar, RefreshCw, Sparkles, Building2, User, ArrowUpRight,
  Eye, Printer, Search, X, ChevronRight, CheckCircle, Clock,
  Building, Phone, Mail, Award, CheckSquare, History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditLogModal } from '../components/AuditLogModal';
import { KraPerformanceModal } from '../components/KraPerformanceModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#3B82F6'];

export default function Reports() {
  const { 
    gateEntriesYashoda = [], 
    gateEntriesAIPL = [], 
    items = [], 
    stock = [], 
    warehouses = [], 
    prs = [], 
    pos = [], 
    grns = [], 
    materialIssues = [], 
    materialIssueItems = [],
    departments = [],
    suppliers = []
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'gate' | 'inventory' | 'procurement' | 'consumption' | 'export'>('gate');
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'Yashoda' | 'AIPL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isKraModalOpen, setIsKraModalOpen] = useState(false);

  // Independent Date Range & Search Filters for Yashoda and AIPL tables
  const [yashodaStartDate, setYashodaStartDate] = useState('');
  const [yashodaEndDate, setYashodaEndDate] = useState('');
  const [yashodaSearch, setYashodaSearch] = useState('');

  const [aiplStartDate, setAiplStartDate] = useState('');
  const [aiplEndDate, setAiplEndDate] = useState('');
  const [aiplSearch, setAiplSearch] = useState('');

  const parseVal = (v: any) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const clean = String(v).replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  // Combined Gate Entries
  const allGateEntries = useMemo(() => {
    const yashoda = (gateEntriesYashoda || []).map(e => ({ ...e, companyType: 'Yashoda' as const }));
    const aipl = (gateEntriesAIPL || []).map(e => ({ ...e, companyType: 'AIPL' as const }));
    let list = [...yashoda, ...aipl];

    if (companyFilter !== 'ALL') {
      list = list.filter(e => e.companyType === companyFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7days' ? 7 : 30;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      list = list.filter(e => {
        if (!e.date) return true;
        const d = new Date(e.date);
        return isNaN(d.getTime()) || d >= cutoff;
      });
    }

    return list;
  }, [gateEntriesYashoda, gateEntriesAIPL, companyFilter, dateFilter]);

  // High-Level Financial Metrics (Total Base Price, Total GST, Grand Total)
  const gateMetrics = useMemo(() => {
    let baseSum = 0;
    let sgstSum = 0;
    let cgstSum = 0;
    let igstSum = 0;
    let grandSum = 0;

    allGateEntries.forEach(entry => {
      const base = parseVal(entry.basePrice);
      const sgst = parseVal(entry.sgst);
      const cgst = parseVal(entry.cgst);
      const igst = parseVal(entry.igst);
      let total = parseVal(entry.totalPrice);

      if (!total && (base || sgst || cgst || igst)) {
        total = base + sgst + cgst + igst;
      }

      baseSum += base;
      sgstSum += sgst;
      cgstSum += cgst;
      igstSum += igst;
      grandSum += total;
    });

    const gstSum = sgstSum + cgstSum + igstSum;

    return {
      basePrice: Math.round((baseSum + Number.EPSILON) * 100) / 100,
      gstAmount: Math.round((gstSum + Number.EPSILON) * 100) / 100,
      sgst: Math.round((sgstSum + Number.EPSILON) * 100) / 100,
      cgst: Math.round((cgstSum + Number.EPSILON) * 100) / 100,
      igst: Math.round((igstSum + Number.EPSILON) * 100) / 100,
      grandTotal: Math.round((grandSum + Number.EPSILON) * 100) / 100
    };
  }, [allGateEntries]);

  // Mini Recharts Visualizations Data for High-Level Metric Cards
  const gstBreakdownData = useMemo(() => [
    { name: 'CGST', value: gateMetrics.cgst },
    { name: 'SGST', value: gateMetrics.sgst },
    { name: 'IGST', value: gateMetrics.igst }
  ].filter(d => d.value > 0), [gateMetrics]);

  const basePriceTrendData = useMemo(() => {
    const map: Record<string, { date: string; base: number }> = {};
    allGateEntries.forEach(entry => {
      if (!entry.date) return;
      const dateStr = entry.date.split(' ')[0] || entry.date;
      if (!map[dateStr]) map[dateStr] = { date: dateStr, base: 0 };
      map[dateStr].base += parseVal(entry.basePrice);
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  }, [allGateEntries]);

  const grandTotalTrendData = useMemo(() => {
    const map: Record<string, { date: string; total: number }> = {};
    allGateEntries.forEach(entry => {
      if (!entry.date) return;
      const dateStr = entry.date.split(' ')[0] || entry.date;
      if (!map[dateStr]) map[dateStr] = { date: dateStr, total: 0 };
      map[dateStr].total += parseVal(entry.totalPrice) || (parseVal(entry.basePrice) + parseVal(entry.sgst) + parseVal(entry.cgst) + parseVal(entry.igst));
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  }, [allGateEntries]);

  // Helper for parsing dates cleanly
  const parseToYYYYMMDD = (dStr: string) => {
    if (!dStr) return '';
    if (dStr.includes('T')) dStr = dStr.split('T')[0];
    const parts = dStr.trim().split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dStr;
  };

  // Independently Filtered Yashoda Entries for Yashoda Table
  const filteredYashodaEntries = useMemo(() => {
    return (gateEntriesYashoda || []).filter(entry => {
      const q = yashodaSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (entry?.partyName || '').toLowerCase().includes(q) ||
        (entry?.materialDescription || '').toLowerCase().includes(q) ||
        (entry?.vehicleNo || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const parsedDate = parseToYYYYMMDD(entry.date);
      if (yashodaStartDate && parsedDate && parsedDate < yashodaStartDate) return false;
      if (yashodaEndDate && parsedDate && parsedDate > yashodaEndDate) return false;

      return true;
    });
  }, [gateEntriesYashoda, yashodaSearch, yashodaStartDate, yashodaEndDate]);

  // Independently Filtered AIPL Entries for Contractor AIPL Table
  const filteredAiplEntries = useMemo(() => {
    return (gateEntriesAIPL || []).filter(entry => {
      const q = aiplSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (entry?.partyName || '').toLowerCase().includes(q) ||
        (entry?.materialDescription || '').toLowerCase().includes(q) ||
        (entry?.vehicleNo || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const parsedDate = parseToYYYYMMDD(entry.date);
      if (aiplStartDate && parsedDate && parsedDate < aiplStartDate) return false;
      if (aiplEndDate && parsedDate && parsedDate > aiplEndDate) return false;

      return true;
    });
  }, [gateEntriesAIPL, aiplSearch, aiplStartDate, aiplEndDate]);

  // Analytics: Gate Entries by Date Trend
  const gateEntriesByDate = useMemo(() => {
    const map: Record<string, { date: string; Yashoda: number; AIPL: number; Total: number }> = {};
    allGateEntries.forEach(entry => {
      if (!entry || !entry.date) return;
      const dateStr = entry.date.split(' ')[0] || entry.date;
      if (!map[dateStr]) {
        map[dateStr] = { date: dateStr, Yashoda: 0, AIPL: 0, Total: 0 };
      }
      if (entry.companyType === 'Yashoda') map[dateStr].Yashoda += 1;
      else map[dateStr].AIPL += 1;
      map[dateStr].Total += 1;
    });

    return Object.values(map)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);
  }, [allGateEntries]);

  // Analytics: Gate Entries Top Parties
  const topPartiesData = useMemo(() => {
    const map: Record<string, { name: string; entries: number; totalVal: number }> = {};
    allGateEntries.forEach(entry => {
      const name = (entry.partyName || 'Unknown Party').trim();
      if (!map[name]) {
        map[name] = { name: name.length > 18 ? name.substring(0, 18) + '...' : name, entries: 0, totalVal: 0 };
      }
      map[name].entries += 1;
      const priceStr = String(entry.totalPrice || '').replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr) || 0;
      map[name].totalVal += price;
    });

    return Object.values(map)
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 8);
  }, [allGateEntries]);

  // Analytics: Material Categories Distribution
  const materialDistData = useMemo(() => {
    const map: Record<string, number> = {};
    allGateEntries.forEach(entry => {
      const mat = (entry.materialDescription || 'General Goods').trim();
      map[mat] = (map[mat] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [allGateEntries]);

  // Total Inward Value Estimation
  const totalInwardValue = useMemo(() => {
    return allGateEntries.reduce((sum, e) => {
      const valStr = String(e.totalPrice || '').replace(/[^0-9.]/g, '');
      return sum + (parseFloat(valStr) || 0);
    }, 0);
  }, [allGateEntries]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Real-time Analytics & Intelligence
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Reports & Analytics Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Comprehensive multi-company intelligence for Yashoda Linen Yarn Ltd & Contractor AIPL
          </p>
        </div>

        {/* Global Date & Company Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setCompanyFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'ALL' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              All Companies
            </button>
            <button
              onClick={() => setCompanyFilter('Yashoda')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'Yashoda' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Yashoda
            </button>
            <button
              onClick={() => setCompanyFilter('AIPL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${companyFilter === 'AIPL' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400'}`}
            >
              AIPL
            </button>
          </div>

          <select
            value={dateFilter}
            onChange={(e: any) => setDateFilter(e.target.value)}
            className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 border-0 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">All Time History</option>
            <option value="30days">Last 30 Days</option>
            <option value="7days">Last 7 Days</option>
          </select>

          <button
            onClick={() => setIsKraModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-zinc-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold"
          >
            <Award className="w-4 h-4 text-indigo-600" /> 30 KRAs & SLA Matrix
          </button>

          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold"
          >
            <History className="w-4 h-4 text-amber-500" /> System Audit Trail
          </button>

          <button
            onClick={() => setActiveCategory('export')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Center
          </button>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveCategory('gate')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'gate' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Truck className="w-4 h-4" /> Gate Entry Reports
        </button>
        <button
          onClick={() => setActiveCategory('inventory')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'inventory' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Inventory Reports
        </button>
        <button
          onClick={() => setActiveCategory('procurement')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'procurement' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Procurement Reports
        </button>
        <button
          onClick={() => setActiveCategory('consumption')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'consumption' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Layers className="w-4 h-4" /> Consumption Reports
        </button>
        <button
          onClick={() => setActiveCategory('export')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap ${activeCategory === 'export' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Download className="w-4 h-4 text-emerald-500" /> Export Data
        </button>
      </div>

      {/* GATE ENTRY REPORTS SECTION */}
      {activeCategory === 'gate' && (
        <div className="space-y-6">
          {/* High-Level Recharts Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Base Price Card with Recharts Trend */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Base Price</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    ₹{gateMetrics.basePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="h-16 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={basePriceTrendData}>
                    <Bar dataKey="base" fill="#6366F1" radius={[3, 3, 0, 0]} />
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Base Price']} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total GST Card with Recharts Pie Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total GST</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    ₹{gateMetrics.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    SGST: ₹{gateMetrics.sgst.toLocaleString()} | CGST: ₹{gateMetrics.cgst.toLocaleString()} | IGST: ₹{gateMetrics.igst.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="h-16 pt-1 flex items-center justify-center">
                {gstBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gstBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={28}
                        dataKey="value"
                      >
                        {gstBreakdownData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Tax']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-[11px] text-gray-400">No Tax breakdown</div>
                )}
              </div>
            </div>

            {/* Grand Total Card with Recharts Area Trend */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Grand Total</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{gateMetrics.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <ArrowUpRight className="w-3 h-3" /> Base + Applicable Taxes
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="h-16 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={grandTotalTrendData}>
                    <defs>
                      <linearGradient id="grandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="total" stroke="#10B981" fill="url(#grandGrad)" />
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Grand Total']} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gate Entry Trend Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">Gate Entries Daily Volume Trend</h2>
                  <p className="text-xs text-gray-500">Inward frequency over recent dates</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gateEntriesByDate}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAipl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Yashoda" stroke="#6366F1" fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="AIPL" stroke="#F59E0B" fillOpacity={1} fill="url(#colorAipl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Parties Horizontal Bar Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">Top Suppliers / Parties by Inward Count</h2>
                  <p className="text-xs text-gray-500">Most frequent inward vendors</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPartiesData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="entries" name="Gate Entries" fill="#10B981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* INDEPENDENT DATA TABLES WITH INDEPENDENT DATE RANGE FILTERING */}
          <div className="space-y-6">
            {/* Table 1: Yashoda Linen Yarn Ltd Data Table */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-950/50 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-base text-gray-900 dark:text-white">Yashoda Linen Yarn Ltd - Data Table</h2>
                  </div>
                  <p className="text-xs text-gray-500">Exclusively filtered Yashoda gate inward entries ({filteredYashodaEntries.length} records)</p>
                </div>

                {/* Independent Date Range & Search Controls for Yashoda */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 font-medium">From:</span>
                    <input 
                      type="date" 
                      value={yashodaStartDate} 
                      onChange={e => setYashodaStartDate(e.target.value)} 
                      className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 font-medium">To:</span>
                    <input 
                      type="date" 
                      value={yashodaEndDate} 
                      onChange={e => setYashodaEndDate(e.target.value)} 
                      className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search Yashoda..." 
                    value={yashodaSearch} 
                    onChange={e => setYashodaSearch(e.target.value)}
                    className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs focus:outline-none text-gray-800 dark:text-gray-200 w-36"
                  />
                  {(yashodaStartDate || yashodaEndDate || yashodaSearch) && (
                    <button 
                      onClick={() => { setYashodaStartDate(''); setYashodaEndDate(''); setYashodaSearch(''); }}
                      className="text-xs text-red-500 hover:underline px-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-xs">
                  <thead className="bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 font-semibold">
                    <tr>
                      <th className="p-3">SL No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Party Name</th>
                      <th className="p-3">Material Description</th>
                      <th className="p-3">Qty / Weight</th>
                      <th className="p-3">Base Price</th>
                      <th className="p-3">GST</th>
                      <th className="p-3">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredYashodaEntries.slice(0, 15).map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-indigo-50/30 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-mono font-medium">{entry.slNo || '-'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{entry.date}</td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">{entry.partyName}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{entry.materialDescription}</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{entry.quantityWeight} {entry.unit}</td>
                        <td className="p-3 font-mono">₹{parseVal(entry.basePrice).toLocaleString()}</td>
                        <td className="p-3 font-mono text-amber-600 dark:text-amber-400">₹{(parseVal(entry.sgst) + parseVal(entry.cgst) + parseVal(entry.igst)).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{parseVal(entry.totalPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                    {filteredYashodaEntries.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">No Yashoda entries match the active date range / filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Contractor AIPL Data Table */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-950/50 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    <h2 className="font-bold text-base text-gray-900 dark:text-white">Contractor AIPL Store - Data Table</h2>
                  </div>
                  <p className="text-xs text-gray-500">Exclusively filtered Contractor AIPL entries ({filteredAiplEntries.length} records)</p>
                </div>

                {/* Independent Date Range & Search Controls for Contractor AIPL */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 font-medium">From:</span>
                    <input 
                      type="date" 
                      value={aiplStartDate} 
                      onChange={e => setAiplStartDate(e.target.value)} 
                      className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 font-medium">To:</span>
                    <input 
                      type="date" 
                      value={aiplEndDate} 
                      onChange={e => setAiplEndDate(e.target.value)} 
                      className="bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search AIPL..." 
                    value={aiplSearch} 
                    onChange={e => setAiplSearch(e.target.value)}
                    className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs focus:outline-none text-gray-800 dark:text-gray-200 w-36"
                  />
                  {(aiplStartDate || aiplEndDate || aiplSearch) && (
                    <button 
                      onClick={() => { setAiplStartDate(''); setAiplEndDate(''); setAiplSearch(''); }}
                      className="text-xs text-red-500 hover:underline px-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-xs">
                  <thead className="bg-amber-50/50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold">
                    <tr>
                      <th className="p-3">SL No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Party Name</th>
                      <th className="p-3">Material Description</th>
                      <th className="p-3">Qty / Weight</th>
                      <th className="p-3">Base Price</th>
                      <th className="p-3">GST</th>
                      <th className="p-3">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredAiplEntries.slice(0, 15).map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-amber-50/30 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-mono font-medium">{entry.slNo || '-'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{entry.date}</td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">{entry.partyName}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{entry.materialDescription}</td>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{entry.quantityWeight} {entry.unit}</td>
                        <td className="p-3 font-mono">₹{parseVal(entry.basePrice).toLocaleString()}</td>
                        <td className="p-3 font-mono text-amber-600 dark:text-amber-400">₹{(parseVal(entry.sgst) + parseVal(entry.cgst) + parseVal(entry.igst)).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{parseVal(entry.totalPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                    {filteredAiplEntries.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">No Contractor AIPL entries match the active date range / filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORTS SECTION */}
      {activeCategory === 'inventory' && (
        <InventoryReportView items={items} stock={stock} warehouses={warehouses} />
      )}

      {/* PROCUREMENT REPORTS SECTION */}
      {activeCategory === 'procurement' && (
        <ProcurementReportView prs={prs} pos={pos} grns={grns} suppliers={suppliers} />
      )}

      {/* CONSUMPTION REPORTS SECTION */}
      {activeCategory === 'consumption' && (
        <ConsumptionReportView 
          materialIssueItems={materialIssueItems} 
          materialIssues={materialIssues} 
          departments={departments}
          items={items}
        />
      )}

      {/* EXPORT DATA SECTION */}
      {activeCategory === 'export' && (
        <ExportDataCenter 
          gateEntriesYashoda={gateEntriesYashoda}
          gateEntriesAIPL={gateEntriesAIPL}
          items={items}
          stock={stock}
          prs={prs}
          pos={pos}
          materialIssues={materialIssues}
          materialIssueItems={materialIssueItems}
        />
      )}

      {/* Audit Log & Activity Tracker Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* 30 KRAs Performance SLA Modal */}
      <KraPerformanceModal
        isOpen={isKraModalOpen}
        onClose={() => setIsKraModalOpen(false)}
      />
    </div>
  );
}

/* ================= INVENTORY REPORTS VIEW ================= */
function InventoryReportView({ items, stock, warehouses }: { items: any[]; stock: any[]; warehouses: any[] }) {
  const stockByWarehouse = useMemo(() => {
    const map: Record<string, number> = {};
    (stock || []).forEach(s => {
      const wh = warehouses.find(w => w.id === s.warehouseId);
      const name = wh ? wh.name : 'Unassigned Warehouse';
      map[name] = (map[name] || 0) + (Number(s.quantity) || 0);
    });
    return Object.entries(map).map(([name, qty]) => ({ name, qty }));
  }, [stock, warehouses]);

  const stockHealthStatus = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let outOfStock = 0;

    (items || []).forEach(item => {
      const itemStock = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      if (itemStock <= 0) outOfStock++;
      else if (itemStock <= (item.reorderLevel || 10)) low++;
      else healthy++;
    });

    return [
      { name: 'Healthy Stock', value: healthy, color: '#10B981' },
      { name: 'Low Stock Alert', value: low, color: '#F59E0B' },
      { name: 'Out of Stock', value: outOfStock, color: '#EF4444' }
    ];
  }, [items, stock]);

  const topStockItems = useMemo(() => {
    return (items || []).map(item => {
      const itemQty = (stock || []).filter(s => s.itemId === item.id).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      return { name: item.name, quantity: itemQty, uom: item.uom || 'Kgs' };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 7);
  }, [items, stock]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Item Master Total</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{items.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Configured raw materials & goods</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Warehouse Stock</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stock.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Physical stock quantity</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {stockHealthStatus.find(s => s.name === 'Low Stock Alert')?.value || 0}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">Requires reorder action</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Active Warehouses</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{warehouses.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Configured storage locations</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Stock Quantity by Warehouse</h2>
          <p className="text-xs text-gray-500 mb-6">Distribution across physical locations</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="qty" name="Stock Qty" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Stock Health Breakdown</h2>
          <p className="text-xs text-gray-500 mb-4">Stock level vs reorder thresholds</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockHealthStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockHealthStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Inventory Items */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Top Available Inventory Items</h2>
        <p className="text-xs text-gray-500 mb-6">Highest stock volume items</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStockItems} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
              <Bar dataKey="quantity" name="Stock Qty" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= PROCUREMENT REPORTS VIEW ================= */
function ProcurementReportView({ prs, pos, grns, suppliers }: { prs: any[]; pos: any[]; grns: any[]; suppliers: any[] }) {
  const [activeReport, setActiveReport] = useState<'purchaseRegister' | 'supplierAnalysis' | 'pendingGRNs'>('purchaseRegister');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // 1. Purchase Register Data
  const filteredPOs = useMemo(() => {
    return (pos || []).filter(po => {
      const matchesSearch = 
        String(po.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.supplierName || po.supplierId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.itemDescription || po.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const poStatus = po.status || 'Approved';
      const matchesStatus = statusFilter === 'ALL' || poStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [pos, searchTerm, statusFilter]);

  const poStats = useMemo(() => {
    let totalVal = 0;
    let approvedVal = 0;
    let pendingVal = 0;
    let approvedCount = 0;

    (pos || []).forEach(p => {
      const amt = Number(p.totalAmount) || 0;
      totalVal += amt;
      if (p.status === 'Approved' || p.status === 'Completed' || !p.status) {
        approvedVal += amt;
        approvedCount++;
      } else if (p.status === 'Pending') {
        pendingVal += amt;
      }
    });

    return { totalVal, approvedVal, pendingVal, approvedCount, totalCount: (pos || []).length };
  }, [pos]);

  // 2. Supplier Analysis Data
  const supplierAnalysisData = useMemo(() => {
    return (suppliers || []).map(sup => {
      const supPOs = (pos || []).filter(p => p.supplierId === sup.id || p.supplierName === sup.name);
      const totalSpend = supPOs.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
      const completedGRNs = (grns || []).filter(g => supPOs.some(p => p.id === g.poId)).length;
      const pendingGRNs = Math.max(0, supPOs.length - completedGRNs);

      return {
        ...sup,
        poCount: supPOs.length,
        totalSpend,
        completedGRNs,
        pendingGRNs,
        pos: supPOs,
        statusLabel: totalSpend > 100000 ? 'Preferred Vendor' : totalSpend > 0 ? 'Active Supplier' : 'Inactive'
      };
    }).filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, pos, grns, searchTerm]);

  // Supplier Spend Chart
  const supplierSpendChartData = useMemo(() => {
    return supplierAnalysisData
      .map(s => ({ name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name, spend: s.totalSpend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 6);
  }, [supplierAnalysisData]);

  // 3. Pending GRNs Data
  const pendingGRNsData = useMemo(() => {
    return (pos || []).map(po => {
      const relatedGRNs = (grns || []).filter(g => g.poId === po.id);
      const receivedQty = relatedGRNs.reduce((sum, g) => sum + (Number(g.receivedQuantity) || 0), 0);
      const orderedQty = Number(po.quantity) || 100;
      const pendingQty = Math.max(0, orderedQty - receivedQty);
      const isPending = pendingQty > 0 || relatedGRNs.length === 0;

      return {
        ...po,
        orderedQty,
        receivedQty,
        pendingQty,
        isPending,
        pendingValue: Math.round((pendingQty / (orderedQty || 1)) * (Number(po.totalAmount) || 0))
      };
    }).filter(p => p.isPending).filter(p => 
      String(p.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.supplierName || p.supplierId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pos, grns, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Cards Header: Available Reports (Matching Screenshot 2) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" /> Available Procurement Reports
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700">
            <Filter className="w-3.5 h-3.5" /> Filter Options
          </div>
        </div>

        {/* 3 Main Report Cards as seen in user screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => { setActiveReport('purchaseRegister'); setSearchTerm(''); }}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
              activeReport === 'purchaseRegister'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${activeReport === 'purchaseRegister' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Purchase Register
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Summary of all POs generated in a period.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-semibold text-indigo-600">
              <span>{pos.length} Purchase Orders</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setActiveReport('supplierAnalysis'); setSearchTerm(''); }}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
              activeReport === 'supplierAnalysis'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${activeReport === 'supplierAnalysis' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Supplier Analysis
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Supplier performance and purchase history.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-semibold text-indigo-600">
              <span>{suppliers.length} Vendors Tracked</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => { setActiveReport('pendingGRNs'); setSearchTerm(''); }}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
              activeReport === 'pendingGRNs'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${activeReport === 'pendingGRNs' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600'}`}>
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Pending GRNs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Purchase orders pending goods receipt.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-semibold text-indigo-600">
              <span>{pendingGRNsData.length} Orders Awaiting GRN</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* SUB-REPORT 1: PURCHASE REGISTER REPORT */}
      {activeReport === 'purchaseRegister' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Generated POs</div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">{poStats.totalCount}</div>
              <div className="text-[10px] text-gray-400 mt-1">Total purchase orders issued</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Purchase Value</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(poStats.totalVal)}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Gross committed value</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Approved PO Value</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(poStats.approvedVal)}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">{poStats.approvedCount} Approved POs</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending Approval Value</div>
              <div className="text-xl font-black text-amber-500 mt-1">
                {formatCurrency(poStats.pendingVal)}
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">Awaiting sign-off</div>
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Purchase Register Summary
                </h3>
                <p className="text-xs text-gray-500">Period summary of purchase orders generated across suppliers</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search PO #, supplier, item..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs font-medium outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">PO Date</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Total PO Value</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredPOs.map((po, idx) => {
                    const sup = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {po.poNumber || po.id}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {po.date ? new Date(po.date).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {sup?.name || po.supplierName || po.supplierId || 'Main Supplier'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {po.itemDescription || 'Raw Cotton / Linen Goods'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {po.quantity || '100'} {po.unit || 'Kgs'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(Number(po.totalAmount) || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            po.status === 'Approved' || !po.status ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                            po.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' :
                            'bg-red-50 text-red-600 dark:bg-red-950/40'
                          }`}>
                            {po.status || 'Approved'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Voucher
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPOs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No purchase orders match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-REPORT 2: SUPPLIER ANALYSIS REPORT */}
      {activeReport === 'supplierAnalysis' && (
        <div className="space-y-6">
          {/* Supplier Spend Visual Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Top Supplier Purchase Spend Distribution</h3>
            <p className="text-xs text-gray-500 mb-6">Financial volume allocated per supplier vendor</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierSpendChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                  <Bar dataKey="spend" name="Total Spend (₹)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Analysis Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Supplier Performance & History Matrix
                </h3>
                <p className="text-xs text-gray-500">Purchase order count, total financial spend, and receipt fulfillment rate</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search supplier name, contact..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3 text-center">POs Issued</th>
                    <th className="px-4 py-3 text-right">Total Purchase Spend</th>
                    <th className="px-4 py-3 text-center">GRNs Completed</th>
                    <th className="px-4 py-3 text-center">GRNs Pending</th>
                    <th className="px-4 py-3 text-center">Vendor Tier</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {supplierAnalysisData.map((sup, idx) => (
                    <tr key={sup.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {sup.name}
                        <div className="text-[10px] text-gray-400 font-normal">{sup.email || sup.phone || 'No direct contact'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {sup.contactName || 'Primary Representative'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {sup.poCount}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(sup.totalSpend)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-600">
                        {sup.completedGRNs}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-amber-600">
                        {sup.pendingGRNs}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {sup.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedSupplier(sup)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" /> View History
                        </button>
                      </td>
                    </tr>
                  ))}
                  {supplierAnalysisData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No suppliers match search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-REPORT 3: PENDING GRNS REPORT */}
      {activeReport === 'pendingGRNs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending Orders Awaiting GRN</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingGRNsData.length}</div>
              <div className="text-[10px] text-gray-400 mt-1">Purchase orders with outstanding receipts</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Pending Value</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(pendingGRNsData.reduce((sum, p) => sum + p.pendingValue, 0))}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Value of goods yet to be delivered</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Overdue / Urgent Deliveries</div>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {pendingGRNsData.length}
              </div>
              <div className="text-[10px] text-red-500 font-medium mt-1">Requires follow-up with vendor</div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" /> Pending Goods Receipt Notes (GRN) Register
                </h3>
                <p className="text-xs text-gray-500">Track purchase orders pending physical warehouse receipt and verification</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search PO #, supplier..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">PO Date</th>
                    <th className="px-4 py-3 text-right">Ordered Qty</th>
                    <th className="px-4 py-3 text-right">Received GRN Qty</th>
                    <th className="px-4 py-3 text-right">Pending Receipt Qty</th>
                    <th className="px-4 py-3 text-right">Pending Value</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {pendingGRNsData.map((po, idx) => {
                    const sup = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {po.poNumber || po.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {sup?.name || po.supplierName || po.supplierId || 'Supplier'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {po.date ? new Date(po.date).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {po.orderedQty} {po.unit || 'Kgs'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-600">
                          {po.receivedQty} {po.unit || 'Kgs'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">
                          {po.pendingQty} {po.unit || 'Kgs'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(po.pendingValue)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40">
                            Pending GRN
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pendingGRNsData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No pending GRN orders found. All POs fully received!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PO SLIP VOUCHER MODAL */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  PURCHASE ORDER VOUCHER
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">PO #{selectedPO.poNumber || selectedPO.id}</h2>
              </div>
              <button onClick={() => setSelectedPO(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
              <div>
                <div className="text-gray-400 font-semibold">Supplier Name</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">{selectedPO.supplierName || selectedPO.supplierId || 'Main Vendor'}</div>
              </div>
              <div>
                <div className="text-gray-400 font-semibold">PO Issue Date</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">{selectedPO.date ? new Date(selectedPO.date).toLocaleDateString('en-IN') : 'N/A'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Item Details</h4>
              <div className="border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-800 font-semibold text-gray-500">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100 dark:border-zinc-800">
                      <td className="p-3 font-semibold">{selectedPO.itemDescription || 'Raw Yarn Goods'}</td>
                      <td className="p-3 text-right font-mono">{selectedPO.quantity || 100} {selectedPO.unit || 'Kgs'}</td>
                      <td className="p-3 text-right font-bold font-mono">{formatCurrency(Number(selectedPO.totalAmount) || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print PO Document
              </button>
              <button onClick={() => setSelectedPO(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER DETAIL MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  VENDOR PERFORMANCE PROFILE
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{selectedSupplier.name}</h2>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
              <div>
                <div className="text-gray-400 font-semibold">Contact Person</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">{selectedSupplier.contactName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-400 font-semibold">Total Lifetime Spend</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 font-mono">{formatCurrency(selectedSupplier.totalSpend)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Purchase Order History ({selectedSupplier.pos.length})</h4>
              <div className="border rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-800 font-semibold text-gray-500">
                    <tr>
                      <th className="p-3">PO #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSupplier.pos.map((p: any, i: number) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-zinc-800">
                        <td className="p-3 font-mono font-bold text-indigo-600">{p.poNumber || p.id}</td>
                        <td className="p-3">{p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatCurrency(Number(p.totalAmount) || 0)}</td>
                      </tr>
                    ))}
                    {selectedSupplier.pos.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">No POs recorded for this vendor.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button onClick={() => setSelectedSupplier(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= CONSUMPTION REPORTS VIEW ================= */
function ConsumptionReportView({ materialIssueItems, materialIssues, departments, items }: { materialIssueItems: any[]; materialIssues: any[]; departments: any[]; items: any[] }) {
  const consumptionByDept = useMemo(() => {
    const data: Record<string, number> = {};
    (materialIssueItems || []).forEach(item => {
      const issue = (materialIssues || []).find(mi => mi.id === item.issueId);
      if (!issue) return;
      const dept = (departments || []).find(d => d.id === issue.departmentId);
      const deptName = dept ? dept.name : (issue.departmentId || 'General Production');
      data[deptName] = (data[deptName] || 0) + (Number(item.quantity) || 0);
    });
    return Object.entries(data).map(([name, quantity]) => ({ name, quantity }));
  }, [materialIssueItems, materialIssues, departments]);

  const topConsumedItems = useMemo(() => {
    const data: Record<string, number> = {};
    (materialIssueItems || []).forEach(item => {
      const matched = (items || []).find(i => i.id === item.itemId);
      const itemName = matched ? matched.name : (item.itemId || 'Raw Material');
      data[itemName] = (data[itemName] || 0) + (Number(item.quantity) || 0);
    });
    return Object.entries(data).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 6);
  }, [materialIssueItems, items]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Material Issue Vouchers</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{materialIssues.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Approved issue requests</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Quantity Consumed</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {materialIssueItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Issued to production departments</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Consuming Departments</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{consumptionByDept.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Active departmental centers</div>
        </div>
      </div>

      {/* Consumption Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Material Consumption by Department</h2>
          <p className="text-xs text-gray-500 mb-6">Quantity issued per department</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionByDept}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="quantity" name="Quantity Consumed" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white mb-1">Top Consumed Raw Materials</h2>
          <p className="text-xs text-gray-500 mb-6">Most issued materials</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumedItems} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="quantity" name="Quantity Issued" fill="#6366F1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= EXPORT DATA CENTER VIEW ================= */
function ExportDataCenter({ gateEntriesYashoda, gateEntriesAIPL, items, stock, prs, pos, materialIssues, materialIssueItems }: any) {
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGateYashoda = () => {
    const headers = ['SL No', 'Date', 'Vehicle No', 'Party Name', 'GST No', 'Material Description', 'Quantity', 'UOM', 'Rate/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'eWay Bill', 'Invoice No/Value', 'In Time', 'Out Time', 'Driver Licence', 'Contact/Sign', 'Security Sign'];
    const rows = (gateEntriesYashoda || []).map((e: any) => [
      e.slNo || '', e.date || '', e.vehicleNo || '', e.partyName || '', e.gstNo || '', e.materialDescription || '', e.quantityWeight || '', e.unit || '', e.rateUom || '', e.basePrice || '', e.sgst || '', e.cgst || '', e.igst || '', e.totalPrice || '', e.ewayBill || '', e.invoiceNoValue || '', e.inTime || '', e.outTime || '', e.driverLicenceNo || '', e.contactNoSign || '', e.securitySign || ''
    ]);
    downloadCSV('Yashoda_Gate_Entry_Register.csv', headers, rows);
  };

  const handleExportGateAIPL = () => {
    const headers = ['SL', 'Date', 'Vehicle No', 'Party Name', 'GST No', 'Material Description', 'Quantity', 'UOM', 'Rate/UOM', 'Base Price', 'SGST', 'CGST', 'IGST', 'Total Price', 'eWay Bill', 'Invoice No/Value', 'In Time', 'Out Time', 'Driver Licence', 'Contact/Sign', 'Security Sign'];
    const rows = (gateEntriesAIPL || []).map((e: any) => [
      e.slNo || '', e.date || '', e.vehicleNo || '', e.partyName || '', e.gstNo || '', e.materialDescription || '', e.quantityWeight || '', e.unit || '', e.rateUom || '', e.basePrice || '', e.sgst || '', e.cgst || '', e.igst || '', e.totalPrice || '', e.ewayBill || '', e.invoiceNoValue || '', e.inTime || '', e.outTime || '', e.driverLicenceNo || '', e.contactNoSign || '', e.securitySign || ''
    ]);
    downloadCSV('AIPL_Gate_Entry_Register.csv', headers, rows);
  };

  const handleExportItemsStock = () => {
    const headers = ['Item ID', 'SKU', 'Item Name', 'Category', 'UOM', 'Type', 'Reorder Level', 'Total Stock Qty'];
    const rows = (items || []).map((i: any) => {
      const itemQty = (stock || []).filter((s: any) => s.itemId === i.id).reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
      return [i.id || '', i.sku || '', i.name || '', i.categoryId || '', i.uom || '', i.type || '', i.reorderLevel || 0, itemQty];
    });
    downloadCSV('Item_Master_And_Stock_Report.csv', headers, rows);
  };

  const handleExportProcurement = () => {
    const headers = ['PO ID', 'PO Number', 'Supplier ID', 'Issue Date', 'Delivery Date', 'Total Amount', 'Status'];
    const rows = (pos || []).map((p: any) => [
      p.id || '', p.poNumber || '', p.supplierId || '', p.issueDate || '', p.deliveryDate || '', p.totalAmount || 0, p.status || ''
    ]);
    downloadCSV('Purchase_Orders_Report.csv', headers, rows);
  };

  const handleExportConsumption = () => {
    const headers = ['Issue ID', 'Department ID', 'Issue Date', 'Issued By', 'Item ID', 'Quantity'];
    const rows = (materialIssueItems || []).map((mi: any) => {
      const parent = (materialIssues || []).find((m: any) => m.id === mi.issueId);
      return [mi.issueId || '', parent?.departmentId || '', parent?.issueDate || '', parent?.issuedBy || '', mi.itemId || '', mi.quantity || 0];
    });
    downloadCSV('Material_Consumption_Report.csv', headers, rows);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" /> Export Data & CSV Downloader
        </h2>
        <p className="text-xs text-gray-500">
          Download complete raw dataset spreadsheets in standard CSV format for offline reporting and audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Truck className="w-4 h-4" /> Yashoda Gate Register
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export all Yashoda Linen Yarn Ltd gate entry inward records with vehicle numbers, rate, GST, e-Way bills.
            </p>
          </div>
          <button onClick={handleExportGateYashoda} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Yashoda Gate Entries ({gateEntriesYashoda.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Truck className="w-4 h-4" /> Contractor AIPL Gate Register
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export all Contractor AIPL gate entry records with vehicle numbers, rate, GST, e-Way bills.
            </p>
          </div>
          <button onClick={handleExportGateAIPL} className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export AIPL Gate Entries ({gateEntriesAIPL.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Package className="w-4 h-4" /> Item Master & Stock Balances
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export current items catalog, categories, reorder levels, and aggregated warehouse stock quantities.
            </p>
          </div>
          <button onClick={handleExportItemsStock} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Item Master & Stock ({items.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <ShoppingCart className="w-4 h-4" /> Purchase Orders & Procurement
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export purchase orders, supplier IDs, requisition values, and approval status logs.
            </p>
          </div>
          <button onClick={handleExportProcurement} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Purchase Orders ({pos.length})
          </button>
        </div>

        <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-purple-500 transition-all flex flex-col justify-between space-y-4 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Layers className="w-4 h-4" /> Material Consumption Records
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Export department material issue vouchers, issued quantities, dates, and issuer signatures.
            </p>
          </div>
          <button onClick={handleExportConsumption} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Consumption Data ({materialIssues.length})
          </button>
        </div>
      </div>
    </div>
  );
}

