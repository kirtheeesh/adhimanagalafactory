import React, { useEffect, useState, useCallback } from 'react';
import { 
    Search, 
    Calendar, 
    Cpu, 
    ClipboardList,
    TrendingUp,
    Timer,
    BarChart3,
    Filter,
    Trash2,
    Trash,
    X,
    Clock,
    Box,
    Layers,
    Palette,
    Settings
} from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

interface Production {
    log_id: number;
    machine_id: number;
    machine_name?: string;
    product_name?: string;
    total_output: number;
    created_at: string;
    approval_status: string;
    shift: string;
    semi_finished_product?: string;
    material_color?: string;
    stop_reason?: string;
    wastage_lumps?: number;
    mold_type?: string;
    cavity?: number;
    cycle_timing?: number;
}

const ProductionDetailsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    production: Production | null;
}> = ({ isOpen, onClose, production }) => {
    if (!production) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#e85c24]/10 rounded-2xl flex items-center justify-center text-[#e85c24]">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        Production Details
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Log ID: #{production.log_id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white space-y-8">
                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Timestamp</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-[#e85c24]">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase">
                                                {new Date(production.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Clock size={10} className="text-slate-400" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {new Date(production.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Machine Unit</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                                            <Cpu size={14} />
                                        </div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Unit #{production.machine_id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info Sections */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Product Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Box size={12} className="text-[#e85c24]" /> Asset Details
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Product Name" value={production.product_name} />
                                            <DetailItem label="Semi Finished" value={production.semi_finished_product} icon={<Layers size={10}/>} />
                                            <DetailItem 
                                                label="Color" 
                                                value={production.material_color} 
                                                icon={<Palette size={10}/>}
                                                colorBadge={production.material_color}
                                            />
                                        </div>
                                    </div>

                                    {/* Operation Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Settings size={12} className="text-[#e85c24]" /> Technical Specs
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Mold Type" value={production.mold_type} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <DetailItem label="Cavity" value={production.cavity?.toString()} />
                                                <DetailItem label="Cycle Time" value={production.cycle_timing ? `${production.cycle_timing}s` : undefined} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Section */}
                                <div className="pt-6 border-t border-slate-50">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-900 rounded-3xl text-white">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Count</p>
                                            <p className="text-2xl font-black">{production.total_output} <span className="text-[10px] text-slate-500">PCS</span></p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{production.shift}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                                                production.approval_status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                                {production.approval_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {production.stop_reason && (
                                    <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100/50">
                                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">Stop Reason / Remarks</p>
                                        <p className="text-sm font-bold text-rose-900 leading-relaxed italic">"{production.stop_reason}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const DetailItem: React.FC<{ label: string, value?: string, icon?: React.ReactNode, colorBadge?: string }> = ({ label, value, icon, colorBadge }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
            {icon && <span className="text-slate-300">{icon}</span>}
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {colorBadge && (
                <div 
                    className="w-2.5 h-2.5 rounded-full border border-slate-200"
                    style={{ backgroundColor: colorBadge.toLowerCase() === 'natural' ? '#f8fafc' : colorBadge.toLowerCase() || '#e2e8f0' }}
                />
            )}
            <span className="text-[11px] font-black text-slate-700 uppercase">{value || 'N/A'}</span>
        </div>
    </div>
);

const Production: React.FC = () => {
    const [productions, setProductions] = useState<Production[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Calculate Metrics
    const activeMachinesCount = new Set(productions.map(p => p.machine_id)).size;
    const totalOutputPCS = productions.reduce((sum, p) => sum + (p.total_output || 0), 0);
    const avgDailyOutput = productions.length > 0 
        ? Math.round(totalOutputPCS / (new Set(productions.map(p => new Date(p.created_at).toDateString())).size || 1)) 
        : 0;

    const handleExport = () => {
        if (productions.length === 0) return;

        const headers = ['Timestamp', 'Machine ID', 'Product Asset', 'Semi Finished', 'Color', 'Shift', 'Production Count', 'Status'];
        const csvRows = [headers.join(',')];

        productions.forEach(p => {
            const row = [
                new Date(p.created_at).toLocaleDateString('en-GB'),
                `Machine #${p.machine_id}`,
                p.product_name || 'Generic Product',
                p.semi_finished_product || 'N/A',
                p.material_color || 'N/A',
                p.shift,
                p.total_output,
                p.approval_status
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `production_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchProduction = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('production', {
                params: { search: searchTerm }
            });
            setProductions(response.data);
        } catch (err: unknown) {
            console.error('Error fetching production logs:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProduction();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProduction]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <TrendingUp size={14} className="lg:w-3.5 lg:h-3.5" /> Throughput Monitoring
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Production Intelligence</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">Historical audit of operational output and efficiency metrics.</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-4">
                    <button 
                        onClick={() => setIsTrashModalOpen(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 lg:px-6 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100 whitespace-nowrap"
                    >
                        <Trash2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Trash
                    </button>
                    <button 
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-500 px-4 lg:px-6 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-rose-100 whitespace-nowrap"
                    >
                        <Trash size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Clear All
                    </button>
                    <button 
                        onClick={handleExport}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-100 px-6 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-soft active:scale-95 whitespace-nowrap"
                    >
                        <ClipboardList size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Export Log
                    </button>
                </div>
            </header>

            {/* Efficiency Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
                {[
                    { label: 'Avg Daily Output', value: avgDailyOutput.toLocaleString(), unit: 'PCS', icon: BarChart3, color: '[#e85c24]' },
                    { label: 'Active Machines', value: activeMachinesCount.toString(), unit: 'Units', icon: Cpu, color: 'emerald' },
                    { label: 'Total Output', value: totalOutputPCS.toLocaleString(), unit: 'PCS', icon: Timer, color: 'purple' },
                    { label: 'Yield Rate', value: '100', unit: '%', icon: TrendingUp, color: '[#e85c24]' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-4 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-soft group hover:translate-y-[-4px] transition-all">
                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 lg:mb-4">{stat.label}</p>
                        <div className="flex items-baseline gap-1 lg:gap-2">
                            <h3 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                            <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Advanced Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter by machine, head or serial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 md:flex-none flex justify-center p-3.5 lg:p-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.25rem] text-slate-400 hover:text-[#e85c24] transition-all shadow-soft">
                        <Calendar size={18} className="lg:w-5 lg:h-5" />
                    </button>
                    <button className="flex-1 md:flex-none flex justify-center p-3.5 lg:p-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.25rem] text-slate-400 hover:text-[#e85c24] transition-all shadow-soft">
                        <Filter size={18} className="lg:w-5 lg:h-5" />
                    </button>
                </div>
            </div>

            {/* Production Table */}
            <div className="glass rounded-2xl lg:rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden relative">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1100px] lg:min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Machine Unit</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Asset</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Semi Finished</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Color</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shift</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Production Count</th>
                                <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={8} className="px-6 lg:px-8 py-4 lg:py-6"><div className="h-10 lg:h-12 bg-slate-100 rounded-xl lg:rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : productions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                                                <ClipboardList size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No production logs registered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                productions.map((p, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={p.log_id} 
                                        onClick={() => {
                                            setSelectedProduction(p);
                                            setIsDetailsModalOpen(true);
                                        }}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="p-2 lg:p-2.5 bg-[#e85c24]/10 text-[#e85c24] rounded-lg lg:rounded-xl">
                                                    <Calendar size={12} className="lg:w-3.5 lg:h-3.5" />
                                                </div>
                                                <div className="font-black text-slate-900 text-[11px] lg:text-sm uppercase tracking-tight">
                                                    {new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <Cpu size={14} className="text-slate-400 lg:w-4 lg:h-4" />
                                                <span className="font-black text-slate-700 tracking-tight text-[11px] lg:text-sm">Unit #{p.machine_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-slate-100 rounded-full flex items-center justify-center text-[9px] lg:text-[10px] font-black text-slate-500 uppercase">
                                                    {(p.product_name || ' ').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-600 text-[11px] lg:text-sm uppercase tracking-tight">{p.product_name || 'Generic Product'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <span className="font-bold text-slate-600 text-[11px] lg:text-sm uppercase tracking-tight">{p.semi_finished_product || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: p.material_color?.toLowerCase() === 'natural' ? '#f8fafc' : p.material_color?.toLowerCase() || '#e2e8f0' }}
                                                />
                                                <span className="font-bold text-slate-600 text-[11px] lg:text-sm uppercase tracking-tight">{p.material_color || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <span className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest">{p.shift}</span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6">
                                            <div className="flex items-center gap-1.5 lg:gap-2">
                                                <span className="text-sm lg:text-lg font-black text-slate-900">{p.total_output}</span>
                                                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">PCS</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 lg:py-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-widest border ${
                                                p.approval_status === 'approved' 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                            }`}>
                                                {p.approval_status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteAllDataModal 
                isOpen={isDeleteAllModalOpen}
                onClose={() => setIsDeleteAllModalOpen(false)}
                section="production"
                onSuccess={fetchProduction}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section="production"
                onRestore={fetchProduction}
            />

            <ProductionDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                production={selectedProduction}
            />
        </div>
    );
};

export default Production;
