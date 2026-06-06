import React, { useEffect, useState, useCallback } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft,
    Building2,
    Download,
    Calendar,
    FileText,
    Search,
    Users,
    Truck,
    LayoutDashboard,
    Edit2,
    Check,
    X
} from 'lucide-react';
import client, { API_URL } from '../api/client';
import { motion } from 'framer-motion';

interface Transaction {
    id: number;
    type: 'Sales' | 'Purchase';
    entity: string;
    amount: number;
    date: string;
    category: 'Income' | 'Expense';
    pdf_path?: string;
}

interface Summary {
    totalSales: number;
    totalPurchase: number;
    balance: number;
    bankBalances?: { bank_name: string; balance: number; account_number: string }[];
}

interface CustomerVendorSummary {
    id: number;
    name: string;
    total_receivable?: number;
    total_payable?: number;
    total_paid: number;
    total_balance: number;
    previous_balance: number;
}

const Accounts: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'vendors'>('overview');
    const [summary, setSummary] = useState<Summary>({ totalSales: 0, totalPurchase: 0, balance: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customerVendors, setCustomerVendors] = useState<CustomerVendorSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const fetchAccountsData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const response = await client.get('accounts/summary', {
                    params: {
                        from: dateRange.from,
                        to: dateRange.to
                    }
                });
                setSummary(response.data.summary);
                setTransactions(response.data.recentTransactions);
            } else {
                const endpoint = activeTab === 'customers' ? 'accounts/customers/summary' : 'accounts/vendors/summary';
                const response = await client.get(endpoint);
                setCustomerVendors(response.data);
            }
        } catch (err) {
            console.error('Error fetching accounts data:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, dateRange]);

    useEffect(() => {
        fetchAccountsData();
    }, [fetchAccountsData]);

    const handleUpdatePreviousBalance = async (id: number) => {
        try {
            // Main backend endpoints for updating previous balance
            const endpoint = activeTab === 'customers' ? `accounts/customers/${id}/previous-balance` : `accounts/vendors/${id}/previous-balance`;
            await client.put(endpoint, {
                previous_balance: parseFloat(editValue) || 0
            });
            setEditingId(null);
            fetchAccountsData();
        } catch (err) {
            console.error('Error updating balance:', err);
            alert('Failed to update balance');
        }
    };

    const handleDownload = (transaction: Transaction) => {
        let url = '';
        if (transaction.type === 'Sales') {
            url = `${API_URL}/sales/invoices/${transaction.id}/pdf`;
        } else if (transaction.type === 'Purchase') {
            url = `${API_URL}/purchase/orders/${transaction.id}/pdf`;
        }
        if (url) window.open(url, '_blank');
    };

    const filteredTransactions = transactions.filter(t => 
        t.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCV = customerVendors.filter(cv => 
        cv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 pb-10 lg:pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <Wallet size={14} className="lg:w-3.5 lg:h-3.5" /> Financial Management
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">Accounts & Reports</h1>
                    <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-widest">Monitor your cash flow and download financial reports</p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl lg:rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <LayoutDashboard size={14} /> Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('customers')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users size={14} /> Customers
                    </button>
                    <button 
                        onClick={() => setActiveTab('vendors')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'vendors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Truck size={14} /> Vendors
                    </button>
                </div>
            </header>

            {activeTab === 'overview' ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingUp size={60} className="text-emerald-500 lg:w-20 lg:h-20" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-2 lg:p-3 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl w-fit mb-3 lg:mb-4">
                                    <ArrowUpRight size={20} className="lg:w-6 lg:h-6" />
                                </div>
                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales (Income)</p>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900">₹{summary.totalSales.toLocaleString()}</h2>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingDown size={60} className="text-rose-500 lg:w-20 lg:h-20" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-2 lg:p-3 bg-rose-50 text-rose-600 rounded-xl lg:rounded-2xl w-fit mb-3 lg:mb-4">
                                    <ArrowDownLeft size={20} className="lg:w-6 lg:h-6" />
                                </div>
                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Purchases (Expense)</p>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900">₹{summary.totalPurchase.toLocaleString()}</h2>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-900 p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-xl relative overflow-hidden group sm:col-span-2 md:col-span-1"
                        >
                            <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet size={60} className="text-white lg:w-20 lg:h-20" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-2 lg:p-3 bg-white/10 text-white rounded-xl lg:rounded-2xl w-fit mb-3 lg:mb-4">
                                    <Wallet size={20} className="lg:w-6 lg:h-6" />
                                </div>
                                <p className="text-[8px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Net Balance</p>
                                <h2 className="text-2xl lg:text-3xl font-black text-white">₹{summary.balance.toLocaleString()}</h2>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bank Balances Section */}
                    {summary.bankBalances && summary.bankBalances.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                <Building2 size={12} /> Bank Wise Breakdown
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {summary.bankBalances.map((bank, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft"
                                    >
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{bank.bank_name}</p>
                                        <p className="text-[9px] font-bold text-slate-500 mb-2">{bank.account_number}</p>
                                        <h3 className="text-lg font-black text-slate-900">₹{bank.balance.toLocaleString()}</h3>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filters & Transactions */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-xl lg:rounded-2xl border border-slate-100 shadow-soft">
                                <div className="flex items-center gap-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-100 pb-2 sm:pb-0">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Range</span>
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                    <input 
                                        type="date" 
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                        className="flex-1 px-3 py-1.5 lg:py-2 bg-slate-50 border-none rounded-lg text-[10px] lg:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#e85c24]/20 transition-all outline-none"
                                    />
                                    <span className="text-[8px] lg:text-[10px] font-black text-slate-300 uppercase">To</span>
                                    <input 
                                        type="date" 
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                        className="flex-1 px-3 py-1.5 lg:py-2 bg-slate-50 border-none rounded-lg text-[10px] lg:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#e85c24]/20 transition-all outline-none"
                                    />
                                </div>
                                { (dateRange.from || dateRange.to) && (
                                    <button 
                                        onClick={() => setDateRange({ from: '', to: '' })}
                                        className="px-4 py-1.5 lg:py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                            <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                            <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={5} className="px-6 lg:px-8 py-4 lg:py-6 h-20"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <FileText size={32} className="mx-auto text-slate-200 mb-4" />
                                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No transactions found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((t, idx) => (
                                                <motion.tr 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    key={`${t.type}-${t.id}`}
                                                    className="group hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-6 lg:px-8 py-4 lg:py-6">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${
                                                            t.category === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                            {t.category === 'Income' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                                            {t.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 lg:px-8 py-4 lg:py-6">
                                                        <span className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight">{t.entity}</span>
                                                    </td>
                                                    <td className="px-6 lg:px-8 py-4 lg:py-6">
                                                        <div className="flex items-center gap-1.5 text-slate-500">
                                                            <Calendar size={12} className="lg:w-3.5 lg:h-3.5" />
                                                            <span className="text-[10px] lg:text-xs font-bold">{new Date(t.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 lg:px-8 py-4 lg:py-6">
                                                        <span className="text-xs lg:text-sm font-black text-slate-900">₹{t.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 lg:px-8 py-4 lg:py-6 text-right">
                                                        <button 
                                                            onClick={() => handleDownload(t)}
                                                            className="p-2 text-slate-400 hover:text-[#e85c24] hover:bg-[#e85c24]/10 rounded-xl transition-all"
                                                            title="Download PDF"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-2xl text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {activeTab === 'customers' ? 'Total Receivable' : 'Total Payable'}
                                        </th>
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</th>
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous Balance</th>
                                        <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-6 lg:px-8 py-4 lg:py-6 h-16"><div className="h-8 bg-slate-100 rounded-lg w-full"></div></td>
                                            </tr>
                                        ))
                                    ) : filteredCV.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No records found</td>
                                        </tr>
                                    ) : (
                                        filteredCV.map((cv) => (
                                            <tr key={cv.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 lg:px-8 py-4 lg:py-6 font-black text-slate-900 uppercase tracking-tight text-xs lg:text-sm">
                                                    {cv.name}
                                                </td>
                                                <td className="px-6 lg:px-8 py-4 lg:py-6 font-bold text-slate-600 text-xs lg:text-sm">
                                                    ₹{(cv.total_receivable || cv.total_payable || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 lg:px-8 py-4 lg:py-6 font-bold text-emerald-600 text-xs lg:text-sm">
                                                    ₹{cv.total_paid.toLocaleString()}
                                                </td>
                                                <td className="px-6 lg:px-8 py-4 lg:py-6 font-black text-rose-600 text-xs lg:text-sm">
                                                    ₹{cv.total_balance.toLocaleString()}
                                                </td>
                                                <td className="px-6 lg:px-8 py-4 lg:py-6">
                                                    {editingId === cv.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                                                autoFocus
                                                            />
                                                            <button 
                                                                onClick={() => handleUpdatePreviousBalance(cv.id)}
                                                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-slate-600 text-xs lg:text-sm">₹{cv.previous_balance.toLocaleString()}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 lg:px-8 py-4 lg:py-6 text-right">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingId(cv.id);
                                                            setEditValue(cv.previous_balance.toString());
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-[#e85c24] hover:bg-[#e85c24]/10 rounded-xl transition-all"
                                                        title="Edit Previous Balance"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
