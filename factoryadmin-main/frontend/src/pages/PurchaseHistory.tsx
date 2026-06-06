import React, { useEffect, useState } from 'react';
import { 
    Package, 
    CheckCircle, 
    Search,
    AlertTriangle,
    Download,
    Trash2,
    Trash
} from 'lucide-react';
import client, { API_URL } from '../api/client';
import { motion } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

interface PurchaseOrder {
    id: number;
    material_name: string;
    purchased_quantity: string;
    vendor_name: string;
    price: string;
    created_by: string;
    status: string;
    created_at: string;
    admin_approval_date: string;
}

const PurchaseHistory: React.FC = () => {
    const [history, setHistory] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.get('purchase/history');
            setHistory(response.data);
        } catch (err: unknown) {
            console.error('Error fetching purchase history:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load purchase history.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDownloadPDF = (id: number) => {
        const url = `${API_URL}/purchase/orders/${id}/pdf`;
        window.open(url, '_blank');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to move this historical record to trash? Related accounts entries will be cleaned up.')) return;
        try {
            await client.delete(`purchase/orders/${id}`);
            fetchHistory();
        } catch (err) {
            console.error('Error deleting record:', err);
            alert('Failed to delete record');
        }
    };

    const filteredHistory = history.filter(order => {
        return order.material_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               order.id.toString().includes(searchTerm);
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700 relative p-4 lg:p-0">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-2">
                        <Package size={14} /> Historical Procurement
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Purchase History</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">View and audit all completed and approved material purchases.</p>
                </div>
                <div className="flex flex-wrap gap-3 lg:gap-4">
                    <button 
                        onClick={() => setIsTrashModalOpen(true)}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100"
                    >
                        <Trash2 size={16} />
                        Trash
                    </button>
                    <button 
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-500 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-rose-100"
                    >
                        <Trash size={16} />
                        Delete All
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by material, vendor or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                </div>
            </div>

            {/* History Table/Grid */}
            <div className="bg-white rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 lg:px-8 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6 h-20 bg-slate-50/50" />
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
                                        <p className="text-slate-500 font-bold">{error}</p>
                                    </td>
                                </tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Package size={32} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold">No purchase history found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((order, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 lg:px-8 py-5 lg:py-6">
                                            <div className="flex items-center gap-3 lg:gap-4">
                                                <div className="p-2 lg:p-3 bg-primary/10 rounded-xl lg:rounded-2xl text-primary">
                                                    <Package size={16} className="lg:w-[18px] lg:h-[18px]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tight">{order.material_name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">#{order.id.toString().padStart(5, '0')} • {new Date(order.admin_approval_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 lg:py-6 text-center">
                                            <span className="text-xs lg:text-sm font-black text-slate-700">{order.purchased_quantity}</span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 lg:py-6 text-center">
                                            <span className="text-xs lg:text-sm font-black text-primary">₹{parseFloat(order.price).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 lg:py-6">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.vendor_name}</span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 lg:py-6">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle size={10} />
                                                Completed
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 lg:py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownloadPDF(order.id)}
                                                    className="p-2.5 lg:p-3 text-slate-400 hover:bg-white hover:text-primary hover:shadow-soft rounded-xl transition-all active:scale-90"
                                                    title="Download Invoice"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(order.id)}
                                                    className="p-2.5 lg:p-3 text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-soft rounded-xl transition-all active:scale-90"
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 size={16} />
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
                section="purchase-order"
                onSuccess={fetchHistory}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section="purchase-order"
                onRestore={fetchHistory}
            />
        </div>
    );
};

export default PurchaseHistory;
