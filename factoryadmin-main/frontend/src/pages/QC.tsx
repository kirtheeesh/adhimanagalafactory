import React, { useEffect, useState, useCallback } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Search, 
    ShieldCheck, 
    ShieldAlert, 
    Package,
    AlertCircle,
    Activity,
    FileText,
    TrendingUp,
    Filter,
    Trash2,
    Trash
} from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

interface QCRecord {
    id: number;
    inventory_name: string;
    qc_name: string;
    status: string;
    remarks: string;
    date: string;
}

const QC: React.FC = () => {
    const [records, setRecords] = useState<QCRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    const totalRecords = records.length;
    const passedRecords = records.filter(r => r.status === 'PASSED').length;
    const failedRecords = totalRecords - passedRecords;
    const passRate = totalRecords > 0 ? Math.round((passedRecords / totalRecords) * 100) : 0;

    const fetchQC = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('qc', {
                params: { search: searchTerm }
            });
            setRecords(response.data);
        } catch (err: unknown) {
            console.error('Error fetching QC records:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQC();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchQC]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <ShieldCheck size={14} className="lg:w-3.5 lg:h-3.5" /> Quality Assurance
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Inspection Registry</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">Monitoring material standards and compliance certifications.</p>
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
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/25 active:scale-95 whitespace-nowrap">
                        <FileText size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Report
                    </button>
                </div>
            </header>

            {/* QC Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6">
                {[
                    { label: 'Pass Rate', value: `${passRate}%`, unit: 'Compliance', icon: CheckCircle, color: 'primary' },
                    { label: 'Total Reviews', value: totalRecords.toString(), unit: 'Batches', icon: Activity, color: 'primary' },
                    { label: 'Critical Failures', value: failedRecords.toString(), unit: 'Recent', icon: ShieldAlert, color: 'rose', mobileSpan: 'col-span-2 md:col-span-1' },
                ].map((stat, i) => (
                    <div key={i} className={`glass p-4 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-soft group ${stat.mobileSpan || ''}`}>
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center bg-${stat.color === 'primary' ? 'primary' : stat.color + '-50'} ${stat.color === 'primary' ? 'bg-opacity-10 text-primary' : 'text-' + stat.color + '-600'}`}>
                                <stat.icon size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <TrendingUp size={14} className="text-slate-300 lg:w-4 lg:h-4" />
                        </div>
                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        <div className="flex items-baseline gap-1.5 lg:gap-2 mt-1">
                            <h3 className="text-xl lg:text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
                            <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase leading-none">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by material, inspector or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all shadow-soft">
                    <Filter size={18} className="lg:w-[18px] lg:h-[18px]" /> Advanced
                </button>
            </div>

            {/* QC Records Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-[220px] lg:h-[250px] bg-slate-100 rounded-2xl lg:rounded-[2.5rem] animate-pulse" />)
                    ) : records.length === 0 ? (
                        <div className="col-span-full py-10 lg:py-20 text-center">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <ShieldCheck size={32} className="lg:w-10 lg:h-10" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No inspection records found</p>
                        </div>
                    ) : (
                        records.map((record, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={record.id}
                                className="glass p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft group hover:border-primary/30 transition-all overflow-hidden relative"
                            >
                                <div className="space-y-4 lg:space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                            record.status === 'PASSED' 
                                                ? 'bg-primary text-white' 
                                                : 'bg-rose-500 text-white'
                                        }`}>
                                            {record.status === 'PASSED' ? <CheckCircle size={10} className="lg:w-3 lg:h-3" /> : <XCircle size={10} className="lg:w-3 lg:h-3" />}
                                            {record.status}
                                        </div>
                                        <span className="text-[9px] lg:text-[10px] font-mono font-black text-slate-300">REF#{record.id.toString().padStart(6, '0')}</span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1 leading-none">
                                            <Package size={12} className="text-slate-400 lg:w-3.5 lg:h-3.5" />
                                            <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Inspected</span>
                                        </div>
                                        <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors uppercase">{record.inventory_name}</h3>
                                    </div>

                                    <div className="p-3 lg:p-4 bg-slate-50/80 rounded-xl lg:rounded-2xl border border-slate-50">
                                        <div className="flex items-center gap-2 mb-2 leading-none">
                                            <AlertCircle size={12} className="text-slate-400 lg:w-3.5 lg:h-3.5" />
                                            <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspector Remarks</span>
                                        </div>
                                        <p className="text-[11px] lg:text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed italic">
                                            "{record.remarks || 'No specific remarks provided for this batch.'}"
                                        </p>
                                    </div>

                                    <div className="pt-4 lg:pt-6 border-t border-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white rounded-lg flex items-center justify-center text-[9px] lg:text-[10px] font-black text-primary border border-slate-100 uppercase">
                                                {record.qc_name ? record.qc_name.charAt(0) : 'Q'}
                                            </div>
                                            <div>
                                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified By</p>
                                                <p className="text-[11px] lg:text-xs font-black text-slate-700 leading-none mt-1">{record.qc_name || 'QA Staff'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-[11px] lg:text-xs font-black text-slate-700 leading-none mt-1">
                                                {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <DeleteAllDataModal 
                isOpen={isDeleteAllModalOpen}
                onClose={() => setIsDeleteAllModalOpen(false)}
                section="qc"
                onSuccess={fetchQC}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section="qc"
                onRestore={fetchQC}
            />
        </div>
    );
};

export default QC;
