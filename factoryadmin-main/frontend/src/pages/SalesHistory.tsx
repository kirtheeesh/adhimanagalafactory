import React, { useEffect, useState } from 'react';
import { 
    FileText, 
    CheckCircle, 
    Search,
    Download,
    TrendingUp,
    Trash2,
    Trash
} from 'lucide-react';
import client, { API_URL } from '../api/client';
import { motion } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

interface SalesHistoryItem {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_name_manual: string;
    total_amount: string;
    status: string;
    approval_status: string;
    created_at: string;
    approved_by: string;
}

const SalesHistory: React.FC = () => {
    const [history, setHistory] = useState<SalesHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.get('sales/invoices');
            setHistory(response.data);
        } catch (err: unknown) {
            console.error('Error fetching sales history:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load sales history.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDownloadPDF = (id: string) => {
        const url = `${API_URL}/sales/invoices/${id}/pdf`;
        window.open(url, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to move this historical invoice to trash? Related accounts entries will be cleaned up.')) return;
        try {
            await client.delete(`sales/invoices/${id}`);
            fetchHistory();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            alert('Failed to delete invoice');
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = (item.customer_name || item.customer_name_manual || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               item.id.toString().includes(searchTerm);
        
        const isApproved = item.approval_status === 'approved';
        return matchesSearch && isApproved;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700 relative">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <TrendingUp size={14} className="lg:w-3.5 lg:h-3.5" /> Revenue Records
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Sales History</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">Review and download all approved sales invoices and batch records.</p>
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
                </div>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by customer, invoice or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                    />
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 lg:px-8 py-4 lg:py-6 h-20 bg-slate-50/50" />
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <FileText className="mx-auto text-rose-500 mb-4" size={32} />
                                        <p className="text-slate-500 font-bold">{error}</p>
                                    </td>
                                </tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <FileText size={32} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No sales history found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((item, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 lg:px-8 py-4 lg:py-6">
                                            <div className="flex items-center gap-3 lg:gap-4">
                                                <div className="p-2 lg:p-3 bg-[#e85c24]/10 rounded-lg lg:rounded-2xl text-[#e85c24]">
                                                    <FileText size={16} className="lg:w-[18px] lg:h-[18px]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight leading-none">INV #{item.invoice_number}</p>
                                                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 text-center">
                                            <span className="text-xs lg:text-sm font-black text-emerald-600 leading-none whitespace-nowrap">₹{parseFloat(item.total_amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6">
                                            <span className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest leading-tight block max-w-[150px] truncate">{item.customer_name || item.customer_name_manual}</span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle size={8} className="lg:w-2.5 lg:h-2.5" />
                                                Approved
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownloadPDF(item.id)}
                                                    className="p-2.5 lg:p-3 text-slate-400 hover:bg-white hover:text-[#e85c24] hover:shadow-soft rounded-xl transition-all active:scale-90"
                                                    title="Download PDF"
                                                >
                                                    <Download size={14} className="lg:w-4 lg:h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 lg:p-3 text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-soft rounded-xl transition-all active:scale-90"
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 size={14} className="lg:w-4 lg:h-4" />
                                                </button>
                                            </div>
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
                section="sales-history"
                onSuccess={fetchHistory}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section="sales-history"
                onRestore={fetchHistory}
            />
        </div>
    );
};

export default SalesHistory;
