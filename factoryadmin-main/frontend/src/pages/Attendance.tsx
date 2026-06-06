import React, { useEffect, useState, useCallback } from 'react';
import { 
    Calendar, 
    Search, 
    Download, 
    Clock,
    User,
    FileText,
    Users
} from 'lucide-react';
import client, { API_URL } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Employee {
    staff_id: string;
    name: string;
    gender: string;
    assigned_shift: string;
    is_checked_in: boolean;
    total_minutes: number;
    od_minutes: number;
    last_check_in: string | null;
    status: string;
    attendance_shift: string | null;
}

const Attendance: React.FC = () => {
    const [selectedShift, setSelectedShift] = useState<'Day' | 'Night'>('Day');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get(`attendance/all-employees/${selectedShift}`);
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedShift]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleDownloadReport = () => {
        const url = `${API_URL}/attendance/report?from=${fromDate}&to=${toDate}`;
        // Since it's a file download and we need to pass the Bearer token if we use axios,
        // but here we are using window.open which doesn't send headers.
        // The backend 'report' route also has authenticateAdmin.
        // We might need to handle this differently or make the report route public if it's just for downloads,
        // but for security it's better to keep it protected.
        // A common way is to use a temporary token or just use fetch and create a blob.

        const token = localStorage.getItem('admin_token');
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `attendance_report_${fromDate}_to_${toDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(err => console.error('Error downloading report:', err));

        setShowReportModal(false);
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-emerald-500';
            case 'half day': return 'bg-amber-500';
            default: return 'bg-rose-500';
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Users className="text-[#e85c24]" size={32} />
                        Attendance Monitoring
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        View real-time staff attendance and generate reports
                    </p>
                </div>
                
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#e85c24] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d44d1a] transition-all shadow-lg shadow-[#e85c24]/20 active:scale-95"
                >
                    <FileText size={18} />
                    Download Reports
                </button>
            </div>

            {/* Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#e85c24]/10 focus:border-[#e85c24] transition-all"
                        />
                    </div>

                    {/* Shift Selector */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        {['Day', 'Night'].map((shift) => (
                            <button
                                key={shift}
                                onClick={() => setSelectedShift(shift as 'Day' | 'Night')}
                                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    selectedShift === shift 
                                    ? 'bg-white text-[#e85c24] shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {shift} Shift
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table/Cards Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shift/Gender</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Work Duration</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">OD Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No employees found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => {
                                    let displayMins = emp.total_minutes || 0;
                                    if (emp.is_checked_in && emp.last_check_in) {
                                        const last = new Date(emp.last_check_in).getTime();
                                        const diff = now.getTime() - last;
                                        const runningMins = Math.max(0, Math.floor(diff / 60000));
                                        displayMins += runningMins;
                                    }

                                    const isFemale = emp.gender?.toLowerCase() === 'female';
                                    const presentThreshold = isFemale ? 480 : 600;
                                    const halfDayThreshold = isFemale ? 300 : 360;
                                    
                                    let currentStatus = 'Absent';
                                    if (displayMins >= presentThreshold) currentStatus = 'Present';
                                    else if (displayMins >= halfDayThreshold) currentStatus = 'Half Day';

                                    const dutyTargetMins = isFemale ? 600 : 720;
                                    const displayOD = Math.max(0, (displayMins - dutyTargetMins) / 60);

                                    return (
                                        <tr key={emp.staff_id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-[#e85c24] font-black group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {emp.staff_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className="text-slate-400" />
                                                        {emp.assigned_shift} Shift
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <User size={12} />
                                                        {emp.gender}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${emp.is_checked_in ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
                                                        getStatusColor(currentStatus)
                                                    )}>
                                                        {currentStatus}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-slate-700">{formatTime(displayMins)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Duty</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-black ${displayOD > 0 ? 'text-[#e85c24]' : 'text-slate-400'}`}>
                                                    {displayOD.toFixed(1)} Hrs
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReportModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Generate Report</h3>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Select date range</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#e85c24]">
                                        <Calendar size={24} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">From Date</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#e85c24]/10 focus:border-[#e85c24] transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">To Date</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#e85c24]/10 focus:border-[#e85c24] transition-all"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowReportModal(false)}
                                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDownloadReport}
                                            className="flex-1 px-6 py-4 bg-[#e85c24] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#d44d1a] transition-all shadow-lg shadow-[#e85c24]/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Download size={18} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Attendance;
