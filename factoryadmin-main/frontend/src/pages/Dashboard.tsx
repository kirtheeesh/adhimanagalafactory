import React, { useEffect, useState, useCallback } from 'react';
import { 
    Users, 
    Package, 
    Cpu, 
    TrendingUp, 
    AlertTriangle,
    ClipboardCheck,
    Activity,
    Calendar,
    RefreshCw
} from 'lucide-react';
import client from '../api/client';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardStats {
    users: { role: string; count: string }[];
    machines: { status: string; count: string }[];
    totalMachines: string;
    production: string;
    qc: string;
    attendance: { status: string; count: string }[];
    headAttendance: { role: string; count: string }[];
    sales?: { count: string; total: string; pending_count: string };
    productionTrend?: { day: string; output: string }[];
    materialAnalytics?: {
        name: string;
        total_production: string | number;
        monthly_production: string | number;
        total_sales: string | number;
        monthly_sales: string | number;
        total_sales_amount: string | number;
        monthly_sales_amount: string | number;
        total_purchase: string | number;
        monthly_purchase: string | number;
        total_purchase_amount: string | number;
        monthly_purchase_amount: string | number;
    }[];
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
        className="glass p-4 lg:p-6 rounded-3xl shadow-soft hover:shadow-strong transition-all duration-300 group overflow-hidden relative"
    >
        <div className={`absolute -right-4 -top-4 w-20 h-20 lg:w-24 lg:h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500 ${color}`} />
        
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg shadow-[#e85c24]/10 ${color}`}>
                <Icon size={20} className="text-white lg:w-6 lg:h-6" />
            </div>
        </div>
    </motion.div>
);

// Helper to get date string in YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Date filtering states
    const [startDate, setStartDate] = useState<string>(formatDate(new Date(new Date().setDate(new Date().getDate() - 7))));
    const [endDate, setEndDate] = useState<string>(formatDate(new Date()));

    const fetchStats = useCallback(async (polling = false) => {
        try {
            if (!polling) setLoading(true);
            setIsPolling(polling);
            setError(null);
            const response = await client.get('dashboard/stats', {
                params: {
                    from: startDate,
                    to: endDate
                }
            });
            setStats(response.data);
        } catch (err: unknown) {
            console.error('Error fetching stats:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            if (!polling) setError(errorMessage);
        } finally {
            if (!polling) setLoading(false);
            setIsPolling(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(true), 15000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <div className="w-12 h-12 border-4 border-[#e85c24]/20 border-t-[#e85c24] rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium animate-pulse">Loading analytics...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] px-4">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 max-w-md w-full text-center">
                    <AlertTriangle className="mx-auto text-rose-500 mb-4" size={48} />
                    <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button onClick={() => fetchStats()} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold">Retry</button>
                </div>
            </div>
        );
    }

    const totalUsers = stats.users.reduce((acc, curr) => acc + parseInt(curr.count || '0'), 0);
    const totalPresent = stats.attendance.find(a => a.status?.toLowerCase() === 'present')?.count || '0';
    const runningMachines = stats.machines.find(m => m.status?.toLowerCase() === 'running')?.count || '0';

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 pb-4 lg:pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <Activity size={12} className={cn("lg:w-3.5 lg:h-3.5", isPolling ? "animate-pulse" : "")} /> Live System Feed
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Factory Dashboard</h1>
                    <p className="text-xs lg:text-base text-slate-500 font-medium">Real-time monitoring of production and resources.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                    <div className="flex items-center gap-2 bg-white px-3 lg:px-4 py-2 rounded-xl lg:rounded-2xl shadow-soft border border-slate-100">
                        <Calendar size={14} className="text-[#e85c24] lg:w-4 lg:h-4" />
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-[10px] lg:text-xs font-bold text-slate-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                            />
                            <span className="text-slate-300 font-bold text-[10px] lg:text-xs">to</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-[10px] lg:text-xs font-bold text-slate-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => fetchStats()}
                        disabled={loading}
                        className="flex items-center justify-center p-2.5 lg:p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl lg:rounded-2xl shadow-soft border border-slate-100 transition-all active:scale-95 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={cn("lg:w-4.5 lg:h-4.5", loading ? "animate-spin" : "")} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8">
                <StatCard title="Total Users" value={totalUsers} icon={Users} color="bg-[#333333]" delay={0.1} />
                <StatCard title="Staff Present" value={totalPresent} icon={Users} color="bg-[#e85c24]" delay={0.2} />
                <StatCard title="Active Machines" value={`${runningMachines}/${stats.totalMachines}`} icon={Cpu} color="bg-[#e85c24]" delay={0.3} />
                <StatCard title="Production (Units)" value={stats.production} icon={TrendingUp} color="bg-emerald-600" delay={0.4} />
                <StatCard title="Quality Checks" value={stats.qc} icon={ClipboardCheck} color="bg-sky-600" delay={0.5} />
            </div>

            <div className="glass p-5 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-soft border border-slate-100">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Production Analytics</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-[#e85c24]" />
                        <span className="text-[10px] lg:text-xs font-bold text-slate-500">Output History</span>
                    </div>
                </div>
                
                <div className="h-48 lg:h-64 flex items-end justify-between gap-2 lg:gap-4 px-1 lg:px-2">
                    {(stats.productionTrend && stats.productionTrend.length > 0 ? stats.productionTrend : []).map((item, i) => {
                        const maxOutput = Math.max(...(stats.productionTrend?.map(p => parseInt(p.output)) || [100]));
                        const height = maxOutput > 0 ? (parseInt(item.output) / maxOutput) * 100 : 0;
                        return (
                            <div key={i} className="flex-1 group relative">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(height, 5)}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="w-full bg-gradient-to-t from-[#e85c24] to-[#fb923c] rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer relative"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        {item.output} Units
                                    </div>
                                </motion.div>
                                <div className="mt-2 text-[10px] font-black text-slate-400 text-center">{item.day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Material & Product Analytics Table */}
            <div className="glass rounded-[1.5rem] lg:rounded-[2rem] shadow-soft border border-slate-100 overflow-hidden">
                <div className="p-5 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Material & Product Intelligence</h3>
                        <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-departmental material flow & sales performance</p>
                    </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-orange-50/30">Total Prod</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-orange-50/50">Monthly Prod</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-emerald-50/30">Total Sales</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-emerald-50/50">Monthly Sales</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-amber-50/30">Total Purchase</th>
                                <th className="px-5 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-amber-50/50">Monthly Purchase</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.materialAnalytics && stats.materialAnalytics.length > 0 ? (
                                stats.materialAnalytics.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 lg:px-8 py-3 lg:py-4">
                                            <span className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-orange-50/5">
                                            <span className="text-xs lg:text-sm font-bold text-orange-600">{item.total_production}</span>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-orange-50/10">
                                            <span className="text-xs lg:text-sm font-black text-orange-700">{item.monthly_production}</span>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-emerald-50/5">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-bold text-emerald-600">{item.total_sales}</span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-emerald-600/60">₹{Number(item.total_sales_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-emerald-50/10">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-black text-emerald-700">{item.monthly_sales}</span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-emerald-700/60">₹{Number(item.monthly_sales_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-amber-50/5">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-bold text-amber-600">{item.total_purchase}</span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-amber-600/60">₹{Number(item.total_purchase_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 lg:px-8 py-3 lg:py-4 text-center bg-amber-50/10">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-black text-amber-700">{item.monthly_purchase}</span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-amber-700/60">₹{Number(item.monthly_purchase_amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="text-slate-200" size={40} />
                                            <p className="text-sm font-bold text-slate-400">No material analytics found for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
