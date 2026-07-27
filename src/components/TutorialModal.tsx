import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, 
  CheckCircle2, ArrowRight, BookOpen, Sparkles, HelpCircle, 
  X, ChevronRight, Layers, Package, MapPin, ShoppingCart, 
  ArrowRightLeft, CheckSquare, FileText, Database, ShieldCheck,
  Video, Eye, ExternalLink, Lightbulb, Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'video' | 'chapters' | 'quickstart' | 'faq'>('video');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const chapters = [
    {
      id: 'dashboard',
      title: '1. Executive Overview & Dashboard',
      duration: '01:45',
      route: '/',
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      description: 'Understand live store analytics, inward gate registers, department outward issues, and stock KPI cards.',
      highlights: [
        'Real-time Store Inward vs. Department Outward summary',
        'Interactive KRA Performance modal & department consumption charts',
        'Quick filters by Date Range (Today, Week, Month, Custom)',
        'Direct navigation to pending gate entries and material issue vouchers'
      ],
      script: 'Welcome to Yashoda ERP! The Dashboard provides real-time visibility into all store inward entries, stock balances, and department outward material issues.'
    },
    {
      id: 'masters',
      title: '2. Master Management & Item Catalog',
      duration: '02:10',
      route: '/masters',
      icon: Database,
      color: 'from-amber-500 to-orange-600',
      description: 'Learn how to configure Item Master records with Item Code, Category, UOM, Warehouse, Batch, and Serial Tracking.',
      highlights: [
        'Create Item Masters with strict attributes: Item Code, Name, Category, Type, UOM, Warehouse, Batch & Serial Tracking, and Status',
        'Manage Warehouses, Plant Departments, and User Access Roles',
        'CSV/Excel Bulk Import tool for fast item master setup',
        'Auto Code generator for uniform item code conventions'
      ],
      script: 'In the Master module, manage central Item Master catalog records, define units of measure, set batch/serial flags, and configure warehouses.'
    },
    {
      id: 'gate',
      title: '3. Gate Entry Register (Yashoda & AIPL Stores)',
      duration: '02:30',
      route: '/gate',
      icon: MapPin,
      color: 'from-emerald-600 to-teal-600',
      description: 'Log inward vehicle passes, measure gross/tare weights, record party invoice numbers, and print Gate Pass receipts.',
      highlights: [
        'Separate tabs for Yashoda Store and AIPL Store entries',
        'Automatic Gross Weight, Tare Weight, and Net Weight calculation',
        'Attach Supplier DC/Invoice numbers and Vehicle numbers',
        'Instant printable Thermal Gate Pass slip generation'
      ],
      script: 'The Gate Entry Register tracks incoming supplier transport vehicles at the factory gate, calculates net weight, and records inward materials.'
    },
    {
      id: 'procurement',
      title: '4. Procurement & Purchase Orders',
      duration: '02:15',
      route: '/procurement',
      icon: ShoppingCart,
      color: 'from-purple-600 to-pink-600',
      description: 'Create Purchase Requisitions, compare vendor quotes, issue Purchase Orders, and track delivery status.',
      highlights: [
        'Raise Purchase Requisitions for raw materials and spares',
        'Select registered vendors and attach unit pricing',
        'Multi-stage Purchase Order approval workflow',
        'Track pending vs. received purchase orders in real-time'
      ],
      script: 'The Procurement module streamlines material requisitions, purchase orders, vendor evaluation, and PO status tracking.'
    },
    {
      id: 'inventory',
      title: '5. Store Inventory & Gate Sync',
      duration: '02:40',
      route: '/inventory',
      icon: Package,
      color: 'from-indigo-600 to-violet-600',
      description: 'Monitor warehouse stock levels, perform physical stock adjustments, and sync inward materials directly from Gate Entries.',
      highlights: [
        'Live stock balance matrix across all warehouses & stores',
        'One-click Gate Entry Sync to update stock balances automatically',
        'Barcode / QR scanner for rapid store bin lookup',
        'Stock adjustment logs for physical inventory audits'
      ],
      script: 'Inventory lets store managers inspect live stock balances, run gate register syncs, adjust inventory, and scan item barcodes.'
    },
    {
      id: 'issue',
      title: '6. Material Issue & Department Requisitions',
      duration: '02:00',
      route: '/issue',
      icon: ArrowRightLeft,
      color: 'from-rose-500 to-red-600',
      description: 'Dispense materials to Spinning, Weaving, or Spares departments with automatic stock deductions and issue vouchers.',
      highlights: [
        'Create Material Issue Vouchers (MIV) for internal departments',
        'Automatic stock availability validation before issue',
        'Track issued quantity, unit cost, and total department expenses',
        'Filter issue history by department, date range, or voucher number'
      ],
      script: 'The Material Issue module manages outward store dispatches to departments, reducing live inventory and recording consumption.'
    },
    {
      id: 'approvals',
      title: '7. Multi-Level Approvals & Governance',
      duration: '01:30',
      route: '/approvals',
      icon: CheckSquare,
      color: 'from-cyan-600 to-blue-600',
      description: 'Review pending purchase requisitions, gate pass overrides, and material issue approvals with audit trails.',
      highlights: [
        'Centralized pending approval queue for store managers & executives',
        'One-click Approve / Reject with mandatory remark entry',
        'Timestamped approval history log for compliance audit',
        'Automated status updates across connected procurement modules'
      ],
      script: 'Approvals provide executive oversight, enforcing multi-level sign-offs before purchase orders or material issues are finalized.'
    },
    {
      id: 'reports',
      title: '8. Analytics, Reports & Data Export',
      duration: '01:50',
      route: '/reports',
      icon: FileText,
      color: 'from-emerald-500 to-green-600',
      description: 'Export store ledgers, gate entry logs, and inventory movement reports to Excel/CSV with custom date filters.',
      highlights: [
        'Store Ledger & Stock Valuation reports',
        'Gate Register Inward summary exports',
        'Department-wise material issue consumption audit',
        'Custom CSV export for external ERP integration'
      ],
      script: 'In Reports, view detailed store analytical ledgers, monitor stock valuation, and export full reports for accounting.'
    }
  ];

  // Auto progression for video timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Advance to next chapter
            if (currentChapterIndex < chapters.length - 1) {
              setCurrentChapterIndex(c => c + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + (1 * playbackSpeed);
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, currentChapterIndex, playbackSpeed]);

  if (!isOpen) return null;

  const currentChapter = chapters[currentChapterIndex];
  const IconComponent = currentChapter.icon;

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTryItLive = () => {
    onClose();
    navigate(currentChapter.route);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Yashoda ERP — Complete App Video Tutorial & Operating Guide
                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full">
                  Interactive Guide
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Master store management, gate entry weighments, item master creation, and material issue workflows
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors ${activeTab === 'video' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Play className="w-4 h-4 text-indigo-500" /> Interactive Video Player
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors ${activeTab === 'chapters' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Layers className="w-4 h-4 text-amber-500" /> All Module Chapters ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors ${activeTab === 'quickstart' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" /> Quick Operating Manual
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors ${activeTab === 'faq' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <HelpCircle className="w-4 h-4 text-blue-500" /> FAQs & Best Practices
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Simulated Screen Video Player (Left 2 Columns) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl flex flex-col justify-between p-4 group">
                  
                  {/* Video Screen Content Mockup */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentChapter.color} opacity-20 transition-all duration-700`} />

                  {/* Top Bar inside Video Screen */}
                  <div className="relative z-10 flex justify-between items-center bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-xs tracking-wide uppercase text-indigo-200">Chapter {currentChapterIndex + 1} of {chapters.length}</span>
                      <span className="text-gray-400 text-xs">|</span>
                      <span className="font-bold text-xs text-white">{currentChapter.title}</span>
                    </div>

                    <button 
                      onClick={handleTryItLive}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-transform hover:scale-105"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Module
                    </button>
                  </div>

                  {/* Center Visual Mockup & Narration */}
                  <div className="relative z-10 my-auto text-center space-y-3 px-6 py-4">
                    <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transform transition-transform group-hover:scale-110">
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>

                    <h3 className="text-xl font-extrabold text-white tracking-tight">{currentChapter.title}</h3>
                    <p className="text-xs text-gray-200 max-w-lg mx-auto leading-relaxed bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                      "{currentChapter.script}"
                    </p>

                    {/* Subtitles Overlay */}
                    {showSubtitles && (
                      <div className="inline-block bg-black/80 text-amber-300 font-mono text-xs px-3 py-1.5 rounded-md border border-amber-500/30">
                        CC: {currentChapter.description}
                      </div>
                    )}
                  </div>

                  {/* Bottom Video Player Control Bar */}
                  <div className="relative z-10 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white space-y-2">
                    
                    {/* Scrubbing Timeline Progress Bar */}
                    <div 
                      className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPct = (clickX / rect.width) * 100;
                        setProgress(newPct);
                      }}
                    >
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full transition-all duration-200 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <button 
                          onClick={() => { setProgress(0); setIsPlaying(true); }}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          title="Restart Chapter"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <span className="text-gray-400 font-mono text-[11px]">
                          {Math.floor((progress / 100) * 120)}s / {currentChapter.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Speed Toggle */}
                        <button 
                          onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-bold text-[11px] rounded transition-colors"
                        >
                          {playbackSpeed}x
                        </button>

                        {/* Subtitles Toggle */}
                        <button 
                          onClick={() => setShowSubtitles(!showSubtitles)}
                          className={`px-2 py-0.5 font-bold text-[11px] rounded transition-colors ${showSubtitles ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400'}`}
                        >
                          CC
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter Feature Highlights */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Key Operational Highlights
                    </h4>
                    <button 
                      onClick={handleTryItLive}
                      className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                    >
                      Try Feature in App →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentChapter.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-zinc-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Playlist / Chapter Selector Sidebar (Right Column) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-bold text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Tutorial Playlist</h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{currentChapterIndex + 1} / {chapters.length} Chapters</span>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {chapters.map((chap, idx) => {
                    const ChapIcon = chap.icon;
                    const isSelected = idx === currentChapterIndex;

                    return (
                      <button
                        key={chap.id}
                        onClick={() => handleChapterSelect(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 shadow-xs' 
                            : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                          <ChapIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-white'}`}>
                              {chap.title}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-1">{chap.duration}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                            {chap.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map((chap, idx) => {
                const ChapIcon = chap.icon;
                return (
                  <div key={chap.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                            <ChapIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{chap.title}</h3>
                            <span className="text-[11px] text-gray-500 font-mono">Duration: {chap.duration}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleChapterSelect(idx);
                            setActiveTab('video');
                          }}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 text-indigo-600 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-indigo-600" /> Watch
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{chap.description}</p>

                      <div className="space-y-1.5 border-t border-gray-100 dark:border-zinc-800 pt-3">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Key Features Covered:</span>
                        {chap.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        navigate(chap.route);
                      }}
                      className="w-full mt-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-zinc-700"
                    >
                      Go to {chap.title.split('.')[1]} Module <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <p className="font-bold text-sm">Welcome to Yashoda ERP Operational Workflow Manual</p>
                  <p>Follow these standard operating procedures (SOPs) for daily store operations, vehicle gate entries, inventory syncs, and department requisitions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Workflow 1 */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Item Master Catalog Creation</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate to <strong>Masters → Item Master</strong>. Click <strong>+ Add Item Master</strong> to define Item Code, Item Name, Category, Item Type, UOM, Warehouse, Batch/Serial tracking flags, and Status.
                  </p>
                  <Link to="/masters" onClick={onClose} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                    Open Masters Module →
                  </Link>
                </div>

                {/* Workflow 2 */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Inward Transport Gate Logging</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate to <strong>Gate Entry</strong>. Select Yashoda or AIPL Store tab, click <strong>+ Add Gate Entry Pass</strong>, record vehicle weighment (Gross/Tare/Net), supplier DC number, and print pass.
                  </p>
                  <Link to="/gate" onClick={onClose} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline">
                    Open Gate Register →
                  </Link>
                </div>

                {/* Workflow 3 */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Material Issue to Departments</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate to <strong>Material Issue</strong>. Click <strong>+ Issue Material</strong>, pick department (Spinning, Weaving, Spares), select items and quantity, and click Issue to update stock balances.
                  </p>
                  <Link to="/issue" onClick={onClose} className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
                    Open Material Issue →
                  </Link>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  How do I sync Gate Inward receipts into my live inventory stock?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Go to <strong>Inventory</strong> module, locate the "Sync Gate Receipts to Stock" button at the top header, and confirm the sync. All approved inward gate entries will update item quantities in live store stock automatically.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  What attributes are required when creating an Item Master?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  When adding an Item Master in <strong>Masters → Item Master</strong>, you specify: <strong>Item Code</strong>, <strong>Item Name</strong>, <strong>Item Category</strong>, <strong>Item Type</strong> (Stock / Non-Stock / Service), <strong>UOM</strong>, <strong>Warehouse</strong>, <strong>Batch Tracking</strong> (Yes/No), <strong>Serial Number Tracking</strong> (Yes/No), and <strong>Status</strong> (Active/Inactive).
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  Can I export store ledgers and gate entry logs to CSV/Excel?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Yes! In the <strong>Reports</strong> page, click the <strong>Export Item Master & Stock</strong> or <strong>Export Gate Register CSV</strong> button to download full analytical spreadsheet ledgers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Tip: You can re-open this Video Tutorial & Operating Guide anytime from the top navigation bar.</span>
          </div>

          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Close Tutorial
          </button>
        </div>

      </div>
    </div>
  );
}
