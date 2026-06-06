import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, 
    Download, 
    Calendar, 
    BarChart3, 
    TrendingUp, 
    Users, 
    Cpu,
    RefreshCw,
    ClipboardList,
    Clock,
    ChevronRight,
    ShoppingBag,
    Package
} from 'lucide-react';
import client from '../api/client';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ReportStats {
    totalProduction: number;
    activeMachines: number;
    totalMachines: number;
    pendingApprovals: number;
    totalSales: number;
    productionByMachine: { machine_name: string; output: number }[];
}

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string;
    delay?: number;
}> = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass p-6 rounded-3xl shadow-soft hover:shadow-strong transition-all duration-300 group overflow-hidden relative"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500 ${color}`} />
        
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl shadow-lg shadow-[#e85c24]/10 ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </motion.div>
);

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    // Filter dates
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Machine selection for hourly report
    const [machines, setMachines] = useState<{id: string, machine_name: string}[]>([]);
    const [selectedMachine, setSelectedMachine] = useState<string>('');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await client.get('reports/stats', {
                params: { from: startDate, to: endDate }
            });
            setStats(response.data);
            
            const mRes = await client.get('machines');
            setMachines(mRes.data);
        } catch (err: unknown) {
            console.error('Failed to fetch report stats:', err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleDownload = async (type: string) => {
        try {
            setIsDownloading(type);
            let url = '';
            let params: Record<string, string> = {};

            if (type === 'monthly_summary') {
                url = 'reports/download/monthly-summary';
                params = { from: startDate, to: endDate };
            } else if (type === 'operator_list') {
                url = 'reports/download/operator-list';
            } else if (type === 'production_hourly') {
                if (!selectedMachine) {
                    alert('Please select a machine first');
                    setIsDownloading(null);
                    return;
                }
                url = 'reports/download/production-hourly';
                params = { date: endDate, machine_id: selectedMachine };
            }

            const response = await client.get(url, {
                params,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${type}_${endDate}.pdf`;
            link.click();
        } catch (err: unknown) {
            console.error('Download error:', err);
            alert('Failed to download report');
        } finally {
            setIsDownloading(null);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <div className="w-12 h-12 border-4 border-[#e85c24]/20 border-t-[#e85c24] rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium animate-pulse">Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-xs font-black uppercase tracking-[0.2em] mb-2">
                        <FileText size={14} /> Reports & Analytics
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Reports</h1>
                    <p className="text-slate-500 font-medium">Generate, download and visualize factory performance data.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-soft border border-slate-100">
                        <Calendar size={16} className="text-[#e85c24]" />
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                            />
                            <span className="text-slate-300 font-bold text-xs">to</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={fetchStats}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-soft border border-slate-100 transition-all active:scale-95"
                    >
                        <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                    title="Total Production" 
                    value={stats?.totalProduction || 0} 
                    icon={TrendingUp} 
                    color="bg-emerald-500" 
                    delay={0.1} 
                />
                <StatCard 
                    title="Active Machines" 
                    value={`${stats?.activeMachines || 0}/${stats?.totalMachines || 0}`} 
                    icon={Cpu} 
                    color="bg-[#e85c24]" 
                    delay={0.2} 
                />
                <StatCard 
                    title="Pending Reports" 
                    value={stats?.pendingApprovals || 0} 
                    icon={ClipboardList} 
                    color="bg-amber-500" 
                    delay={0.3} 
                />
                <StatCard 
                    title="Total Sales" 
                    value={`₹${(stats?.totalSales || 0).toLocaleString()}`} 
                    icon={BarChart3} 
                    color="bg-sky-500" 
                    delay={0.4} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Production by Machine Chart */}
                <div className="glass p-8 rounded-[2rem] shadow-soft border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Machine Performance</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Production output per machine</p>
                        </div>
                        <BarChart3 size={20} className="text-[#e85c24]" />
                    </div>
                    
                    <div className="h-64 flex items-end justify-between gap-4 px-2 pb-12">
                        {stats?.productionByMachine.map((item, i) => {
                            const maxOutput = Math.max(...(stats.productionByMachine.map(p => p.output) || [100]));
                            const height = maxOutput > 0 ? (item.output / maxOutput) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 group relative">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 5)}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="w-full bg-gradient-to-t from-[#e85c24] to-[#fb923c] rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            {item.output} Units
                                        </div>
                                    </motion.div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-full">
                                        <div 
                                            className="text-[9px] font-black text-slate-400 text-left origin-top-left rotate-45 whitespace-nowrap uppercase tracking-tighter truncate max-w-[80px]" 
                                            title={item.machine_name}
                                        >
                                            {item.machine_name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Insights & Quick Links */}
                <div className="glass p-8 rounded-[2rem] shadow-soft border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Insights</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Jump to detailed report screens</p>
                        </div>
                        <ClipboardList size={20} className="text-[#e85c24]" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: 'Production Logs', desc: 'Shift-wise output reports', icon: Cpu, path: '/production', color: 'bg-indigo-50 text-indigo-600' },
                            { title: 'Sales Analytics', desc: 'Revenue and invoice history', icon: ShoppingBag, path: '/sales-history', color: 'bg-emerald-50 text-emerald-600' },
                            { title: 'Inventory Audit', desc: 'Material and stock levels', icon: Package, path: '/inventory', color: 'bg-amber-50 text-amber-600' },
                            { title: 'Attendance Log', desc: 'Staff shifts and presence', icon: Calendar, path: '/attendance', color: 'bg-rose-50 text-rose-600' },
                        ].map((item, i) => (
                            <button 
                                key={i}
                                onClick={() => navigate(item.path)}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-strong transition-all border border-transparent hover:border-slate-100 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-[#e85c24] group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Report Downloads Section */}
                <div className="glass p-8 rounded-[2rem] shadow-soft border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Quick Downloads</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Export system data to PDF</p>
                        </div>
                        <Download size={20} className="text-[#e85c24]" />
                    </div>

                    <div className="space-y-4">
                        {/* Monthly Summary */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-[#e85c24]/5 transition-colors border border-transparent hover:border-[#e85c24]/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#e85c24] shadow-sm group-hover:scale-110 transition-transform">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Monthly Summary</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Comprehensive production overview</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDownload('monthly_summary')}
                                disabled={!!isDownloading}
                                className="p-2 text-slate-400 hover:text-[#e85c24] transition-colors"
                            >
                                {isDownloading === 'monthly_summary' ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                            </button>
                        </div>

                        {/* Operator List */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-[#e85c24]/5 transition-colors border border-transparent hover:border-[#e85c24]/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#e85c24] shadow-sm group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Operator List</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Current staff and roles</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDownload('operator_list')}
                                disabled={!!isDownloading}
                                className="p-2 text-slate-400 hover:text-[#e85c24] transition-colors"
                            >
                                {isDownloading === 'operator_list' ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                            </button>
                        </div>

                        {/* Hourly Production */}
                        <div className="p-4 bg-slate-50 rounded-2xl group hover:bg-[#e85c24]/5 transition-colors border border-transparent hover:border-[#e85c24]/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#e85c24] shadow-sm group-hover:scale-110 transition-transform">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Hourly Production</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Detailed machine-wise hourly logs</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDownload('production_hourly')}
                                    disabled={!!isDownloading || !selectedMachine}
                                    className="p-2 text-slate-400 hover:text-[#e85c24] transition-colors disabled:opacity-30"
                                >
                                    {isDownloading === 'production_hourly' ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                                </button>
                            </div>
                            <select 
                                value={selectedMachine}
                                onChange={(e) => setSelectedMachine(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 focus:ring-2 focus:ring-[#e85c24]/20 outline-none uppercase tracking-widest"
                            >
                                <option value="">Select Machine</option>
                                {machines.map(m => (
                                    <option key={m.id} value={m.id}>{m.machine_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
