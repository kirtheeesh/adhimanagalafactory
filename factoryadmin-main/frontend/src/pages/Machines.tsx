import React, { useEffect, useState } from 'react';
import { 
    Cpu, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Activity,
    Settings,
    Power,
    Zap,
    Clock,
    Wrench,
    Box,
    Layers,
    Palette,
    Timer,
    AlertCircle,
    CheckCircle2,
    User
} from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Machine {
    id: number;
    machine_name: string;
    status: string;
    total_output: number;
    product_name: string;
    shift: string;
    cycle_timing: number;
    cavity: number;
    semi_finished_product?: string;
    material_type_1?: string;
    material_qty_1?: number;
    material_type_2?: string;
    material_qty_2?: number;
    material_type_3?: string;
    material_qty_3?: number;
    material_type_4?: string;
    material_qty_4?: number;
    material_color?: string;
    color_qty?: number;
    last_report_at?: string;
    last_report_count?: number;
    operator_name?: string;
}

const MachineDetailsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    machine: Machine | null;
}> = ({ isOpen, onClose, machine }) => {
    if (!machine) return null;

    const materials = [
        { type: machine.material_type_1, qty: machine.material_qty_1 },
        { type: machine.material_type_2, qty: machine.material_qty_2 },
        { type: machine.material_type_3, qty: machine.material_qty_3 },
        { type: machine.material_type_4, qty: machine.material_qty_4 },
        { type: machine.material_color, qty: machine.color_qty },
    ].filter(m => m.type && m.type !== 'None');

    const isReportRecorded = machine.last_report_at && 
        (new Date().getTime() - new Date(machine.last_report_at).getTime()) < 3600000;

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
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Cpu size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        Machine Details
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit ID: #{machine.id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${machine.status.toLowerCase() === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{machine.status}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Hourly Report</p>
                                    <div className="flex items-center gap-2">
                                        {isReportRecorded ? (
                                            <>
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                <p className="text-xs font-black text-emerald-600 uppercase">Recorded</p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={16} className="text-rose-500" />
                                                <p className="text-xs font-black text-rose-600 uppercase">Not Recorded</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Asset Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Box size={12} className="text-primary" /> Current Production
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Product" value={machine.product_name} />
                                            <DetailItem label="Semi Finished" value={machine.semi_finished_product} icon={<Layers size={10}/>} />
                                            <DetailItem 
                                                label="Color" 
                                                value={machine.material_color} 
                                                icon={<Palette size={10}/>}
                                                colorBadge={machine.material_color}
                                            />
                                        </div>
                                    </div>

                                    {/* Technical Specs */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Settings size={12} className="text-primary" /> Technical Specs
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Cycle Time" value={`${machine.cycle_timing}s`} icon={<Timer size={10}/>} />
                                            <DetailItem label="Cavity" value={machine.cavity.toString()} />
                                            <DetailItem label="Shift" value={machine.shift} icon={<Clock size={10}/>} />
                                            <DetailItem label="Operator" value={machine.operator_name} icon={<User size={10}/>} />
                                        </div>
                                    </div>
                                </div>

                                {/* Material Usage Section */}
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap size={12} className="text-primary" /> Material Consumption
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {materials.map((m, i) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">{m.type}</span>
                                                <span className="text-sm font-black text-slate-900">{m.qty} <span className="text-[10px] text-slate-400">KG</span></span>
                                            </div>
                                        ))}
                                        {materials.length === 0 && (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">No materials assigned</p>
                                        )}
                                    </div>
                                </div>

                                {/* Real-time Stats */}
                                <div className="pt-6 border-t border-slate-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Production</p>
                                            <p className="text-3xl font-black">{machine.total_output || 0} <span className="text-[10px] text-slate-500 uppercase">PCS</span></p>
                                        </div>
                                        <div className="p-6 bg-primary rounded-[2rem] text-white">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Last Update</p>
                                            <p className="text-sm font-black uppercase">
                                                {machine.last_report_at ? new Date(machine.last_report_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                            <p className="text-[10px] font-bold text-white/40 uppercase mt-1">
                                                {machine.last_report_at ? new Date(machine.last_report_at).toLocaleDateString('en-GB') : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
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

const Machines: React.FC = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    
    const [name, setName] = useState('');
    const [status, setStatus] = useState('OPERATIONAL');
    const [cycleTiming, setCycleTiming] = useState(0);
    const [cavity, setCavity] = useState(1);

    const statuses = ['running', 'paused', 'idle', 'MAINTENANCE', 'REPAIR'];

    const fetchMachines = async () => {
        setLoading(true);
        try {
            const response = await client.get('machines');
            setMachines(response.data);
        } catch (err) {
            console.error('Error fetching machines:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
        const interval = setInterval(fetchMachines, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenModal = (machine: Machine | null = null) => {
        if (machine) {
            setEditingMachine(machine);
            setName(machine.machine_name);
            setStatus(machine.status);
            setCycleTiming(machine.cycle_timing || 0);
            setCavity(machine.cavity || 1);
        } else {
            setEditingMachine(null);
            setName('');
            setStatus('idle');
            setCycleTiming(0);
            setCavity(1);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMachine) {
                await client.put(`machines/${editingMachine.id}`, { 
                    machine_name: name, 
                    status,
                    cycle_timing: cycleTiming,
                    cavity
                });
            } else {
                await client.post('machines', { 
                    machine_name: name, 
                    status,
                    cycle_timing: cycleTiming,
                    cavity
                });
            }
            setIsModalOpen(false);
            fetchMachines();
        } catch (err) {
            console.error('Error saving machine:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Decommission this machine?')) {
            try {
                await client.delete(`machines/${id}`);
                fetchMachines();
            } catch (err) {
                console.error('Error deleting machine:', err);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'running': return 'text-emerald-500 bg-emerald-50';
            case 'paused': return 'text-amber-500 bg-amber-50';
            case 'idle': return 'text-slate-500 bg-slate-50';
            case 'repair': return 'text-rose-500 bg-rose-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <Activity size={14} className="lg:w-3.5 lg:h-3.5" /> Production Line
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Machine Fleet</h1>
                    <p className="text-xs lg:text-base text-slate-500 font-medium">Real-time status monitoring and lifecycle management.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/25 active:scale-95"
                >
                    <Plus size={16} className="lg:w-[18px] lg:h-[18px]" />
                    Commission Unit
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-[300px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : machines.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Cpu size={40} />
                            </div>
                            <p className="text-slate-400 font-bold">No machinery units deployed</p>
                        </div>
                    ) : (
                        machines.map((machine, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={machine.id}
                                onClick={() => {
                                    setSelectedMachine(machine);
                                    setIsDetailsModalOpen(true);
                                }}
                                className="glass rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-soft group overflow-hidden cursor-pointer hover:border-primary/20 transition-all duration-500"
                            >
                                <div className="p-6 lg:p-8 space-y-4 lg:space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${getStatusColor(machine.status)} group-hover:scale-110 transition-transform duration-500`}>
                                            <Cpu size={24} className="lg:w-7 lg:h-7" />
                                        </div>
                                        <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-0 lg:translate-x-2 group-hover:translate-x-0">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(machine);
                                                }}
                                                className="p-2 lg:p-2.5 bg-white text-slate-400 hover:text-primary rounded-lg lg:rounded-xl shadow-soft border border-slate-100 transition-all active:scale-90"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(machine.id);
                                                }}
                                                className="p-2 lg:p-2.5 bg-white text-slate-400 hover:text-rose-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100 transition-all active:scale-90"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${machine.status.toLowerCase() === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{machine.status}</span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{machine.machine_name}</h3>
                                        <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Product: {machine.product_name || 'None'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 lg:gap-4 pt-1 lg:pt-2">
                                        <div className="p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl">
                                            <div className="flex items-center gap-2 text-slate-400 mb-1 leading-none">
                                                <Zap size={12} />
                                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Output</span>
                                            </div>
                                            <p className="text-xs lg:text-sm font-black text-slate-700">{machine.total_output || 0} PCS</p>
                                        </div>
                                        <div className="p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl">
                                            <div className="flex items-center gap-2 text-slate-400 mb-1 leading-none">
                                                <Clock size={12} />
                                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Shift</span>
                                            </div>
                                            <p className="text-xs lg:text-sm font-black text-slate-700">{machine.shift || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 lg:px-8 py-4 lg:py-5 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Settings size={12} className="lg:w-3.5 lg:h-3.5" />
                                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Cycle: {machine.cycle_timing}s | Cavity: {machine.cavity}</span>
                                    </div>
                                    <button className="text-[8px] lg:text-[10px] font-black text-primary uppercase tracking-widest hover:underline whitespace-nowrap">
                                        Diagnostics
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Machine Details Modal */}
            <MachineDetailsModal 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                machine={selectedMachine} 
            />

            {/* Machine Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 bg-primary text-white relative">
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Wrench size={28} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight uppercase">
                                    {editingMachine ? 'Reconfigure Unit' : 'Initialize Unit'}
                                </h2>
                                <p className="text-white/80 text-sm font-medium mt-2">
                                    Set machine identifiers and operational baseline.
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Machine Designation</label>
                                        <div className="relative">
                                            <Settings className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                required
                                                placeholder="e.g. Automated Spinner MK-IV"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Operational State</label>
                                        <div className="relative">
                                            <Power className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                            <select 
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none appearance-none cursor-pointer"
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Cycle Time (s)</label>
                                            <input 
                                                type="number" 
                                                value={cycleTiming}
                                                onChange={(e) => setCycleTiming(parseInt(e.target.value))}
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Cavity Count</label>
                                            <input 
                                                type="number" 
                                                value={cavity}
                                                onChange={(e) => setCavity(parseInt(e.target.value))}
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-primary hover:opacity-90 rounded-2xl transition-all shadow-lg shadow-primary/25 active:scale-95"
                                    >
                                        {editingMachine ? 'Apply Protocols' : 'Initialize Fleet Unit'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Machines;
