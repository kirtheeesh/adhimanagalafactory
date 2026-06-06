import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, X, Loader2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';

interface TrashModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: string;
    onRestore: () => void;
}

interface TrashItem {
    id?: number | string;
    log_id?: number | string;
    product_name?: string;
    material_name?: string;
    color_name?: string;
    mold_name?: string;
    item_name?: string;
    machine_name?: string;
    customer_name?: string;
    name?: string;
}

const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose, section, onRestore }) => {
    const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | string | null>(null);
    const [restoringAll, setRestoringAll] = useState(false);

    const fetchTrash = useCallback(async () => {
        setLoading(true);
        try {
            const res = await client.get(`/trash/${section}`);
            setTrashItems(res.data);
        } catch (err) {
            console.error('Error fetching trash:', err);
        } finally {
            setLoading(false);
        }
    }, [section]);

    useEffect(() => {
        if (isOpen) fetchTrash();
    }, [isOpen, fetchTrash]);

    const handleRestore = async (id: number | string) => {
        setActionLoading(id);
        try {
            await client.post(`/trash/restore/${section}/${id}`);
            fetchTrash();
            onRestore();
        } catch (err) {
            console.error('Error restoring:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestoreAll = async () => {
        if (!window.confirm('Are you sure you want to restore all items in this section?')) return;
        setRestoringAll(true);
        try {
            await client.post(`/trash/restore-all/${section}`);
            fetchTrash();
            onRestore();
        } catch (err) {
            console.error('Error restoring all:', err);
        } finally {
            setRestoringAll(false);
        }
    };

    const handlePermanentDelete = async (id: number | string) => {
        if (!window.confirm('Are you sure you want to permanently delete this? This action cannot be undone.')) return;
        
        setActionLoading(id);
        try {
            await client.delete(`/trash/permanent/${section}/${id}`);
            fetchTrash();
        } catch (err) {
            console.error('Error deleting permanently:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const getItemName = (item: TrashItem) => {
        return (item.product_name || item.material_name || item.color_name || item.mold_name || item.item_name || item.machine_name || item.customer_name || item.name || `ID: ${item.id || item.log_id}`) as string;
    };

    const getItemId = (item: TrashItem) => (item.id || item.log_id) as number | string;

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
                        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                    <Trash2 size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {section.replace('-', ' ')} Trash
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deleted items repository</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!loading && trashItems.length > 0 && (
                                    <button
                                        onClick={handleRestoreAll}
                                        disabled={restoringAll}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {restoringAll ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                                        Restore All
                                    </button>
                                )}
                                <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-[#e85c24]" size={40} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Repository...</p>
                                </div>
                            ) : trashItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                        <Info size={40} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-900 uppercase">Trash is empty</h4>
                                        <p className="text-xs font-medium text-slate-400 max-w-[200px] leading-relaxed">No deleted records found for this section.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {trashItems.map((item) => (
                                        <motion.div
                                            key={getItemId(item)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-slate-200 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-sm">
                                                    <Trash2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{getItemName(item)}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {getItemId(item)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRestore(getItemId(item))}
                                                    disabled={actionLoading === getItemId(item)}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100"
                                                >
                                                    {actionLoading === getItemId(item) ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(getItemId(item))}
                                                    disabled={actionLoading === getItemId(item)}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100"
                                                >
                                                    <X size={14} />
                                                    Erase
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-3">
                            <AlertCircle size={16} className="text-rose-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                Warning: Permanent deletion is final and cannot be recovered.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TrashModal;
