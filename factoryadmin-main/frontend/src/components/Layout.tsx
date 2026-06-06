import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    LogOut, 
    Menu, 
    X,
    Cpu,
    Factory,
    ClipboardCheck,
    ChevronLeft,
    ShieldCheck,
    FileText,
    TrendingUp,
    Truck,
    Wallet,
    Calendar,
    ChevronDown,
    UserPlus,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const NavItem: React.FC<{ 
    item: { name: string; path: string; icon: React.ElementType }; 
    isActive: boolean;
    isCollapsed: boolean;
}> = ({ item, isActive, isCollapsed }) => {
    return (
        <Link
            to={item.path}
            className={cn(
                "relative flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 group",
                isActive
                    ? "bg-[#e85c24] text-white shadow-lg shadow-[#e85c24]/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
            {!isCollapsed && (
                <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap"
                >
                    {item.name}
                </motion.span>
            )}
            {isActive && !isCollapsed && (
                <motion.div 
                    layoutId="activeNav"
                    className="absolute right-2 w-1.5 h-5 bg-white/30 rounded-full"
                />
            )}
        </Link>
    );
};

const Layout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Accounts', path: '/accounts', icon: Wallet },
        { name: 'Attendance', path: '/attendance', icon: Calendar },
        { name: 'User Management', path: '/users', icon: Users },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Machines', path: '/machines', icon: Cpu },
        { name: 'Production', path: '/production', icon: Factory },
        { name: 'Quality Control', path: '/qc', icon: ClipboardCheck },
        { name: 'Sales Approvals', path: '/sales-approvals', icon: FileText },
        { name: 'Sales History', path: '/sales-history', icon: TrendingUp },
        { name: 'Dispatch', path: '/dispatch', icon: Truck },
        { name: 'Purchase Requests', path: '/purchase-requests', icon: ClipboardCheck },
        { name: 'Purchase Approvals', path: '/purchase-approvals', icon: ShieldCheck },
        { name: 'Purchase History', path: '/purchase-history', icon: Package },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <div className="flex h-screen transition-colors duration-500">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside 
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-[#f8fafc] border-r border-slate-200 transition-all duration-500 ease-in-out lg:relative lg:translate-x-0",
                    isCollapsed ? "w-24" : "w-72",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className={cn("flex items-center px-6 mb-4", isCollapsed ? "justify-center" : "justify-between", "h-20 lg:h-24")}>
                        <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-xl shadow-lg" />
                            </div>
                            {!isCollapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-lg lg:text-xl font-black text-[#333333] tracking-tighter leading-none">ADHMANGALAM</span>
                                    <span className="text-[9px] lg:text-[10px] font-black text-[#e85c24] uppercase tracking-[0.3em] leading-none mt-1">Admin v2.0</span>
                                </motion.div>
                            )}
                        </Link>
                        <button 
                            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1 lg:space-y-2 overflow-y-auto custom-scrollbar">
                        <div className={cn("px-4 mb-2 lg:mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]", isCollapsed && "text-center")}>
                            {isCollapsed ? '•••' : 'Main Navigation'}
                        </div>
                        {navItems.map((item) => (
                            <div key={item.path} onClick={() => setIsMobileOpen(false)}>
                                <NavItem 
                                    item={item} 
                                    isActive={location.pathname === item.path}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 mt-auto border-t border-slate-50">
                        <div className={cn("flex items-center gap-3 p-3 bg-slate-50 rounded-[1.5rem] mb-4", isCollapsed && "justify-center")}>
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#e85c24] font-black shadow-sm">
                                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-wider">
                                        {user?.username || 'Administrator'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        System {user?.role || 'Root'}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-widest",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && <span>End Session</span>}
                        </button>
                    </div>
                </div>

                {/* Collapse Toggle (Desktop) */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-10 hidden lg:flex w-8 h-8 bg-white border border-slate-100 rounded-full items-center justify-center shadow-sm text-slate-400 hover:text-[#e85c24] transition-colors z-50"
                >
                    <ChevronLeft size={16} className={cn("transition-transform duration-500", isCollapsed && "rotate-180")} />
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Header */}
                <header className="h-20 lg:h-24 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-3 lg:gap-6">
                        <button
                            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-2xl lg:hidden transition-colors border border-slate-100"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        
                        {/* Mobile Logo for Header */}
                        <div className="lg:hidden flex items-center gap-2">
                            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                            <span className="text-sm font-black text-[#333333] tracking-tighter">ADHMANGALAM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="h-8 w-[1px] bg-slate-100 mx-1 lg:mx-2 hidden sm:block" />

                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 lg:gap-3 pl-1 lg:pl-2 hover:bg-slate-50 p-1 lg:p-1.5 rounded-2xl transition-all active:scale-95 group"
                            >
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] lg:text-xs font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                        {user?.username || 'ADMIN'}
                                    </p>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[8px] lg:text-[10px] font-black text-[#e85c24] uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                                <div className="w-9 h-9 lg:w-12 lg:h-12 bg-orange-50 border-2 border-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-soft overflow-hidden relative group-hover:border-orange-200 transition-colors">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=e85c24&color=fff&bold=true`} 
                                        alt="User" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop for closing */}
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setIsProfileOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Admin Account</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#e85c24] rounded-xl flex items-center justify-center text-white font-black">
                                                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                                                            {user?.username || 'Administrator'}
                                                        </p>
                                                        <p className="text-[10px] text-[#e85c24] font-black uppercase tracking-widest">
                                                            System {user?.role || 'Root'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <Link 
                                                    to="/admin-profile"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#e85c24] group-hover:bg-[#e85c24] group-hover:text-white transition-colors">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    Admin Profile
                                                </Link>
                                                <Link 
                                                    to="/users"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                        <UserPlus size={18} />
                                                    </div>
                                                    Create Admin
                                                </Link>
                                            </div>
                                            <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                                        <LogOut size={18} />
                                                    </div>
                                                    End Session
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="pb-20 lg:pb-0" // Add bottom padding on mobile for FAB or navigation if needed
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
