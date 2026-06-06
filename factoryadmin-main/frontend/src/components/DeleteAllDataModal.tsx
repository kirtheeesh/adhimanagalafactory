import React, { useState } from 'react';
import { ShieldAlert, X, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';

interface DeleteAllDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: string;
    onSuccess: () => void;
}

const DeleteAllDataModal: React.FC<DeleteAllDataModalProps> = ({ isOpen, onClose, section, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await client.post(`/trash/delete-all/${section}`, { password });
            onSuccess();
            onClose();
            setPassword('');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete data. Check password.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const actionText = 'move to trash';

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
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                    <ShieldAlert size={28} />
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Destructive Action</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    You are about to <span className="text-rose-500 font-bold uppercase">{actionText}</span> for all <span className="text-rose-500 font-bold uppercase">{section.replace('-', ' ')}</span> data. 
                                    Please enter your admin password to confirm.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#e85c24]/10 outline-none transition-all"
                                        />
                                    </div>
                                    {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{error}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Deletion'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteAllDataModal;
