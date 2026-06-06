import React, { useEffect, useState, useCallback } from 'react';
import { 
    Users as UsersIcon, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Check,
    Shield,
    UserCircle,
    Filter,
    ShieldCheck,
    Mail,
    Lock,
    UserPlus,
    ShieldAlert,
    Boxes,
    Cpu,
    Trash,
    Eye,
    Phone,
    MapPin,
    Hash,
    Building2,
    Tag
} from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

interface User {
    id: number;
    username: string;
    role: string;
    password_plain?: string;
}

interface Customer {
    id: number;
    name: string;
    category: string;
    address?: string;
    phone_number?: string;
    alternate_phone_number?: string;
    email?: string;
    gst?: string;
}

interface Product {
    id: number;
    product_name: string;
}

interface Staff {
    id: number;
    staff_id: string;
    name: string;
    gender: string;
    role: string;
    category: string;
    joining_date?: string;
    created_at: string;
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const configs: Record<string, { color: string; icon: React.ElementType }> = {
        'ADMIN': { color: 'bg-[#333333]', icon: ShieldCheck },
        'PHEAD': { color: 'bg-[#e85c24]', icon: Shield },
        'PRODUCTION HEAD': { color: 'bg-[#e85c24]', icon: Shield },
        'QUALITY': { color: 'bg-orange-500', icon: Check },
        'SALES': { color: 'bg-orange-400', icon: UserCircle },
        'PACKING': { color: 'bg-amber-500', icon: Boxes },
        'OPERATOR': { color: 'bg-sky-500', icon: Cpu },
        'ACCOUNTS': { color: 'bg-blue-600', icon: Mail },
        'STAFF': { color: 'bg-slate-500', icon: UserCircle },
    };

    const config = configs[role] || configs['STAFF'];
    const Icon = config.icon;

    const displayRole = role === 'PHEAD' ? 'PRODUCTION HEAD' : role.replace('_', ' ');

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
            config.color
        )}>
            <Icon size={12} />
            {displayRole}
        </span>
    );
};

function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}

interface Vendor {
    id: number;
    name: string;
    address?: string;
    phone_number?: string;
    alternate_phone_number?: string;
    email?: string;
    gst?: string;
    created_by: string;
    created_at: string;
    materials: {
        material_id: number;
        material_name: string;
        price_per_kg: number;
    }[];
}

const Users: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'vendors' | 'staffs'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isFixedPricesViewOpen, setIsFixedPricesViewOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [viewingPrices, setViewingPrices] = useState<{ product_name: string; price_with_gst: number; price_without_gst: number }[]>([]);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
    const [selectedCustomerForPricing, setSelectedCustomerForPricing] = useState<Customer | null>(null);
    const [pricingInputs, setPricingInputs] = useState<Record<number, { with_gst: string; without_gst: string }>>({});
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STAFF');
    
    const [customerName, setCustomerName] = useState('');
    const [customerCategory, setCustomerCategory] = useState('wholesale');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAltPhone, setCustomerAltPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerGst, setCustomerGst] = useState('');

    const [vendorName, setVendorName] = useState('');
    const [vendorAddress, setVendorAddress] = useState('');
    const [vendorPhone, setVendorPhone] = useState('');
    const [vendorAltPhone, setVendorAltPhone] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [vendorGst, setVendorGst] = useState('');

    const [staffName, setStaffName] = useState('');
    const [staffGender, setStaffGender] = useState('Male');
    const [staffRole, setStaffRole] = useState('OPERATOR');
    const [staffCategory, setStaffCategory] = useState('unskilled att');
    const [staffJoiningDate, setStaffJoiningDate] = useState('');
    const [rolesList, setRolesList] = useState(['OPERATOR', 'PRODUCT HEAD', 'ACCOUNTS', 'SALES', 'QUALITY']);
    const [isAddingNewRole, setIsAddingNewRole] = useState(false);
    const [newRoleInput, setNewRoleInput] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

    const handleOpenPricingModal = async (customer: Customer) => {
        try {
            setSelectedCustomerForPricing(customer);
            // Pre-fetch existing prices for this customer
            const pricesRes = await client.get(`sales/customers/${customer.id}/prices`);
            const existingPrices: Record<number, { with_gst: string; without_gst: string }> = {};
            pricesRes.data.forEach((p: { product_id: number; price_with_gst: number; price_without_gst: number }) => {
                existingPrices[p.product_id] = {
                    with_gst: p.price_with_gst?.toString() || '',
                    without_gst: p.price_without_gst?.toString() || ''
                };
            });
            setPricingInputs(existingPrices);
            setIsPricingModalOpen(true);
        } catch (err) {
            console.error('Error opening pricing modal:', err);
            setError('Failed to load customer prices');
        }
    };

    const togglePasswordVisibility = (userId: number) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleViewCustomer = async (customer: Customer) => {
        setViewingCustomer(customer);
        try {
            const res = await client.get(`sales/customers/${customer.id}/prices`);
            setViewingPrices(res.data);
        } catch (err) {
            console.error('Error fetching customer prices:', err);
            setViewingPrices([]);
        }
    };

    const roles = ['ADMIN', 'OPERATOR', 'SALES', 'PACKING', 'ACCOUNTS', 'PRODUCTION HEAD', 'QUALITY'];

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('users', {
                params: { search: searchTerm, role: roleFilter }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('sales/customers');
            setCustomers(response.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('vendors');
            setVendors(response.data);
        } catch (err) {
            console.error('Error fetching vendors:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaffs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('staffs', {
                params: { search: searchTerm }
            });
            const fetchedStaffs = response.data;
            setStaffs(fetchedStaffs);
            
            // Extract unique roles and merge with default ones
            const uniqueRoles = Array.from(new Set([
                'OPERATOR', 'PRODUCT HEAD', 'ACCOUNTS', 'SALES', 'QUALITY',
                ...fetchedStaffs.map((s: Staff) => s.role.toUpperCase())
            ]));
            setRolesList(uniqueRoles);
            
        } catch (err) {
            console.error('Error fetching staffs:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await client.get('inventory', { params: { type: 'product' } });
            setAllProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'customers') {
                fetchCustomers();
                fetchProducts();
            } else if (activeTab === 'vendors') {
                fetchVendors();
            } else if (activeTab === 'staffs') {
                fetchStaffs();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, fetchUsers, fetchCustomers, fetchVendors, fetchProducts, fetchStaffs]);

    const handleOpenVendorModal = (vendor: Vendor | null = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setVendorName(vendor.name);
            setVendorAddress(vendor.address || '');
            setVendorPhone(vendor.phone_number || '');
            setVendorAltPhone(vendor.alternate_phone_number || '');
            setVendorEmail(vendor.email || '');
            setVendorGst(vendor.gst || '');
        } else {
            setEditingVendor(null);
            setVendorName('');
            setVendorAddress('');
            setVendorPhone('');
            setVendorAltPhone('');
            setVendorEmail('');
            setVendorGst('');
        }
        setError(null);
        setIsVendorModalOpen(true);
    };

    const handleVendorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const payload = {
                name: vendorName,
                address: vendorAddress,
                phone_number: vendorPhone,
                alternate_phone_number: vendorAltPhone,
                email: vendorEmail,
                gst: vendorGst,
                created_by: 'Admin'
            };
            
            if (editingVendor) {
                await client.put(`vendors/${editingVendor.id}`, payload);
            } else {
                await client.post('vendors', payload);
            }
            
            setIsVendorModalOpen(false);
            fetchVendors();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save vendor';
            setError(errorMessage);
        }
    };

    const handleVendorDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this vendor?')) {
            try { 
                await client.delete(`vendors/${id}`); 
                fetchVendors(); 
            } catch (err) { 
                console.error('Error deleting vendor:', err); 
            }
        }
    };

    const handleOpenStaffModal = (staff: Staff | null = null) => {
        if (staff) {
            setEditingStaff(staff);
            setStaffName(staff.name);
            setStaffGender(staff.gender);
            setStaffRole(staff.role);
            setStaffCategory(staff.category || 'unskilled att');
            setStaffJoiningDate(staff.joining_date ? staff.joining_date.split('T')[0] : '');
        } else {
            setEditingStaff(null);
            setStaffName('');
            setStaffGender('Male');
            setStaffRole('OPERATOR');
            setStaffCategory('unskilled att');
            setStaffJoiningDate('');
        }
        setError(null);
        setIsStaffModalOpen(true);
    };

    const handleStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const payload = {
                name: staffName,
                gender: staffGender,
                role: staffRole,
                category: staffCategory,
                joining_date: staffJoiningDate || null
            };
            if (editingStaff) {
                await client.put(`staffs/${editingStaff.id}`, payload);
            } else {
                await client.post('staffs', payload);
            }
            setIsStaffModalOpen(false);
            fetchStaffs();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save staff';
            setError(errorMessage);
        }
    };

    const handleStaffDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this staff member?')) {
            try {
                await client.delete(`staffs/${id}`);
                fetchStaffs();
            } catch (err) {
                console.error('Error deleting staff:', err);
            }
        }
    };

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setUsername(user.username);
            setRole(user.role);
            setPassword('');
        } else {
            setEditingUser(null);
            setUsername('');
            setRole('STAFF');
            setPassword('');
        }
        setError(null);
        setIsModalOpen(true);
    };

    const handleOpenCustomerModal = (customer: Customer | null = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setCustomerName(customer.name);
            setCustomerCategory(customer.category || 'wholesale');
            setCustomerAddress(customer.address || '');
            setCustomerPhone(customer.phone_number || '');
            setCustomerAltPhone(customer.alternate_phone_number || '');
            setCustomerEmail(customer.email || '');
            setCustomerGst(customer.gst || '');
        } else {
            setEditingCustomer(null);
            setCustomerName('');
            setCustomerCategory('wholesale');
            setCustomerAddress('');
            setCustomerPhone('');
            setCustomerAltPhone('');
            setCustomerEmail('');
            setCustomerGst('');
        }
        setError(null);
        setIsCustomerModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingUser) {
                await client.put(`users/${editingUser.id}`, { username, role, password: password || undefined });
            } else {
                if (!password) { setError('Password is required for new users'); return; }
                await client.post('users', { username, password, role });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save user';
            setError(errorMessage);
        }
    };

    const handleCustomerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const payload = { 
                name: customerName, 
                category: customerCategory,
                address: customerAddress,
                phone_number: customerPhone,
                alternate_phone_number: customerAltPhone,
                email: customerEmail,
                gst: customerGst
            };
            let customer: Customer;
            if (editingCustomer) {
                const response = await client.put(`sales/customers/${editingCustomer.id}`, payload);
                customer = response.data;
            } else {
                const response = await client.post('sales/customers', payload);
                customer = response.data;
            }
            
            // Success - Now open pricing modal
            setIsCustomerModalOpen(false);
            fetchCustomers();
            
            // Set up pricing for this customer
            handleOpenPricingModal(customer);
            
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save customer';
            setError(errorMessage);
        }
    };

    const handlePricingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerForPricing) return;
        
        try {
            const prices = Object.entries(pricingInputs)
                .map(([productId, inputs]) => {
                    const prodId = parseInt(productId);
                    const product = allProducts.find(p => p.id === prodId);
                    return {
                        product_id: prodId,
                        product_name: product?.product_name || 'Unknown Product',
                        price_with_gst: inputs.with_gst ? parseFloat(inputs.with_gst) : null,
                        price_without_gst: inputs.without_gst ? parseFloat(inputs.without_gst) : null
                    };
                });
            
            await client.post(`sales/customers/${selectedCustomerForPricing.id}/prices`, { prices });
            setIsPricingModalOpen(false);
            setSelectedCustomerForPricing(null);
            setPricingInputs({});
            fetchCustomers();
        } catch (err) {
            console.error('Error saving customer prices:', err);
            setError('Failed to save product prices');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try { await client.delete(`users/${id}`); fetchUsers(); } catch (err) { console.error('Error deleting user:', err); }
        }
    };

    const handleCustomerDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this customer?')) {
            try { await client.delete(`sales/customers/${id}`); fetchCustomers(); } catch (err) { console.error('Error deleting customer:', err); }
        }
    };

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        {activeTab === 'users' ? <UsersIcon size={14} className="lg:w-3.5 lg:h-3.5" /> : 
                         activeTab === 'staffs' ? <UsersIcon size={14} className="lg:w-3.5 lg:h-3.5" /> :
                         <UserCircle size={14} className="lg:w-3.5 lg:h-3.5" />} 
                        {activeTab === 'users' ? 'Identity Management' : 
                         activeTab === 'staffs' ? 'Staff Directory' :
                         'Customer Relations'}
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {activeTab === 'users' ? 'Staff Credentials' : 
                         activeTab === 'staffs' ? 'Staff Directory' :
                         'Sales Customers'}
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {activeTab !== 'users' && activeTab !== 'staffs' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsTrashModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 px-3 lg:px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100 whitespace-nowrap"
                            >
                                <Trash2 size={12} className="lg:w-3.5 lg:h-3.5" />
                                Trash
                            </button>
                            <button 
                                onClick={() => setIsDeleteAllModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 lg:px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-rose-100 whitespace-nowrap"
                            >
                                <Trash size={12} className="lg:w-3.5 lg:h-3.5" />
                                Clear All
                            </button>
                        </div>
                    )}
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-hide shrink-0">
                        <button onClick={() => setActiveTab('users')} className={cn("px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeTab === 'users' ? "bg-white text-[#e85c24] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Staff Credentials</button>
                        <button onClick={() => setActiveTab('staffs')} className={cn("px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeTab === 'staffs' ? "bg-white text-[#e85c24] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Labours</button>
                        <button onClick={() => setActiveTab('customers')} className={cn("px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeTab === 'customers' ? "bg-white text-[#e85c24] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Customers</button>
                        <button onClick={() => setActiveTab('vendors')} className={cn("px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeTab === 'vendors' ? "bg-white text-[#e85c24] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Vendors</button>
                    </div>
                    {activeTab === 'users' ? (
                        <button onClick={() => handleOpenModal()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e85c24] hover:bg-[#d44d1a] text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-[#e85c24]/20 whitespace-nowrap"><UserPlus size={16} className="lg:w-[18px] lg:h-[18px]" /> Provision User</button>
                    ) : activeTab === 'staffs' ? (
                        <button onClick={() => handleOpenStaffModal()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e85c24] hover:bg-[#d44d1a] text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-[#e85c24]/20 whitespace-nowrap"><Plus size={16} className="lg:w-[18px] lg:h-[18px]" /> Add Labour</button>
                    ) : activeTab === 'customers' ? (
                        <button onClick={() => handleOpenCustomerModal()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e85c24] hover:bg-[#d44d1a] text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-[#e85c24]/20 whitespace-nowrap"><Plus size={16} className="lg:w-[18px] lg:h-[18px]" /> Add Customer</button>
                    ) : (
                        <button onClick={() => handleOpenVendorModal()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e85c24] hover:bg-[#d44d1a] text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-[#e85c24]/20 whitespace-nowrap"><Plus size={16} className="lg:w-[18px] lg:h-[18px]" /> Create Vendor</button>
                    )}
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'users' ? "Search by name or ID..." : "Search relations..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[11px] lg:text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                    />
                </div>
                {activeTab === 'users' && (
                    <div className="relative w-full md:min-w-[200px] group">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24]" size={18} />
                        <select 
                            value={roleFilter} 
                            onChange={(e) => setRoleFilter(e.target.value)} 
                            className="w-full pl-14 pr-10 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-[11px] lg:text-sm font-bold shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="">All Roles</option>
                            {roles.map(r => (
                                <option key={r} value={r}>
                                    {r === 'PHEAD' ? 'PRODUCTION HEAD' : r.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="glass rounded-2xl lg:rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden relative">
                <div className="overflow-x-auto custom-scrollbar">
                    {activeTab === 'users' ? (
                        <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Profile</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permission Level</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Credentials</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System ID</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? [1, 2, 3].map(i => (<tr key={i} className="animate-pulse"><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-10 lg:h-12 w-40 lg:w-48 bg-slate-100 rounded-xl lg:rounded-2xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-6 lg:h-8 w-20 lg:w-24 bg-slate-100 rounded-lg lg:rounded-xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-5 lg:h-6 w-12 lg:w-16 bg-slate-100 rounded-lg"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6 text-right"><div className="h-8 lg:h-10 w-8 lg:w-10 bg-slate-100 rounded-lg lg:rounded-xl ml-auto"></div></td></tr>)) : users.length === 0 ? (<tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No personnel found</td></tr>) : (
                                    users.map((user, idx) => (
                                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="px-5 lg:px-8 py-4 lg:py-6"><div className="flex items-center gap-3 lg:gap-4"><div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center text-[#e85c24] font-black shadow-sm border border-slate-100">{user.username.charAt(0).toUpperCase()}</div><div><p className="text-sm lg:text-base font-black text-slate-900 tracking-tight leading-tight">{user.username}</p><p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Active Member</p></div></div></td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6"><RoleBadge role={user.role} /></td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div 
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors w-fit"
                                                    onClick={() => togglePasswordVisibility(user.id)}
                                                >
                                                    <Lock size={12} className={visiblePasswords[user.id] ? "text-primary" : "text-slate-300"} />
                                                    <span className="text-[10px] lg:text-xs font-black text-slate-600 tracking-wider font-mono">
                                                        {visiblePasswords[user.id] 
                                                            ? (user.password_plain || 'Not Stored') 
                                                            : '********'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 font-mono text-[10px] lg:text-xs font-black text-slate-400">#{user.id.toString().padStart(4, '0')}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 text-right"><div className="flex items-center justify-end gap-2 lg:gap-3 lg:opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => handleOpenModal(user)} className="p-2 lg:p-3 bg-white text-slate-400 hover:text-[#e85c24] rounded-lg lg:rounded-xl shadow-soft border border-slate-100"><Edit2 size={14} className="lg:w-4 lg:h-4" /></button><button onClick={() => handleDelete(user.id)} className="p-2 lg:p-3 bg-white text-slate-400 hover:text-rose-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"><Trash2 size={14} className="lg:w-4 lg:h-4" /></button></div></td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeTab === 'staffs' ? (
                        <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff Profile</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff ID</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gender</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? [1, 2, 3].map(i => (<tr key={i} className="animate-pulse"><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-10 lg:h-12 w-40 lg:w-48 bg-slate-100 rounded-xl lg:rounded-2xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-6 lg:h-8 w-20 lg:w-24 bg-slate-100 rounded-lg lg:rounded-xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-5 lg:h-6 w-12 lg:w-16 bg-slate-100 rounded-lg"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6 text-right"><div className="h-8 lg:h-10 w-8 lg:w-10 bg-slate-100 rounded-lg lg:rounded-xl ml-auto"></div></td></tr>)) : staffs.length === 0 ? (<tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No staff members found</td></tr>) : (
                                    staffs.map((staff, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: idx * 0.05 }} 
                                            key={staff.id} 
                                            className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
                                            onClick={() => setViewingStaff(staff)}
                                        >
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center text-[#e85c24] font-black shadow-sm border border-slate-100">
                                                        {staff.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight leading-tight">{staff.name}</p>
                                                        <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Staff Member</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 font-mono text-[10px] lg:text-xs font-black text-slate-900">{staff.staff_id}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 text-[10px] lg:text-xs font-bold text-slate-600 uppercase tracking-widest">{staff.gender}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6"><RoleBadge role={staff.role} /></td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 lg:gap-3 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenStaffModal(staff); }} 
                                                        className="p-2 lg:p-3 bg-white text-slate-400 hover:text-[#e85c24] rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
                                                    >
                                                        <Edit2 size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleStaffDelete(staff.id); }} 
                                                        className="p-2 lg:p-3 bg-white text-slate-400 hover:text-rose-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
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
                    ) : activeTab === 'customers' ? (
                        <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                            <thead>
                                <tr className="bg-slate-50/50 ">
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Name</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 ">
                                {loading ? [1, 2, 3].map(i => (<tr key={i} className="animate-pulse"><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-10 lg:h-12 w-40 lg:w-48 bg-slate-100  rounded-xl lg:rounded-2xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-6 lg:h-8 w-20 lg:w-24 bg-slate-100  rounded-lg lg:rounded-xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-5 lg:h-6 w-12 lg:w-16 bg-slate-100  rounded-lg"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6 text-right"><div className="h-8 lg:h-10 w-8 lg:w-10 bg-slate-100  rounded-lg lg:rounded-xl ml-auto"></div></td></tr>)) : filteredCustomers.length === 0 ? (<tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No customers registered</td></tr>) : (
                                    filteredCustomers.map((customer, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: idx * 0.05 }} 
                                            key={customer.id} 
                                            className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
                                            onClick={() => handleViewCustomer(customer)}
                                        >
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                        <Building2 size={16} />
                                                    </div>
                                                    <span className="font-black text-slate-900 tracking-tight text-sm lg:text-base">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6"><span className="px-2 lg:px-3 py-1 bg-orange-100 text-orange-600 text-[9px] lg:text-[10px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap">{customer.category}</span></td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 font-mono text-[10px] lg:text-xs font-black text-slate-400">#C{customer.id.toString().padStart(4, '0')}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 lg:gap-3 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }} 
                                                        className="p-2 lg:p-3 bg-white text-orange-400 hover:text-orange-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenPricingModal(customer); }} 
                                                        className="p-2 lg:p-3 bg-white text-orange-400 hover:text-orange-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
                                                        title="Fix Product Prices"
                                                    >
                                                        <Tag size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenCustomerModal(customer); }} 
                                                        className="p-2 lg:p-3 bg-white text-slate-400 hover:text-emerald-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleCustomerDelete(customer.id); }} 
                                                        className="p-2 lg:p-3 bg-white text-slate-400 hover:text-rose-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100"
                                                        title="Delete"
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
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-full">
                            <thead>
                                <tr className="bg-slate-50/50 ">
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendor Name</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material(s) & Price</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created Date</th>
                                    <th className="px-5 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? [1, 2, 3].map(i => (<tr key={i} className="animate-pulse"><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-10 lg:h-12 w-40 lg:w-48 bg-slate-100 rounded-xl lg:rounded-2xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-6 lg:h-8 w-24 lg:w-32 bg-slate-100 rounded-lg lg:rounded-xl"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6"><div className="h-5 lg:h-6 w-16 lg:w-20 bg-slate-100 rounded-lg"></div></td><td className="px-5 lg:px-8 py-4 lg:py-6 text-right"><div className="h-8 lg:h-10 w-8 lg:w-10 bg-slate-100 rounded-lg lg:rounded-xl ml-auto"></div></td></tr>)) : vendors.length === 0 ? (<tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No vendors registered</td></tr>) : (
                                    vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())).map((vendor, idx) => (
                                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={vendor.id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 font-black text-slate-900 tracking-tight text-sm lg:text-base">{vendor.name}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {vendor.materials && vendor.materials.length > 0 ? vendor.materials.map((m, midx) => (
                                                        <span key={midx} className="px-2 lg:px-3 py-1 bg-orange-100 text-[#e85c24] text-[9px] lg:text-[10px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap">{m.material_name}: ₹{m.price_per_kg}/kg</span>
                                                    )) : <span className="text-slate-400 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">No Materials Linked</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 font-mono text-[10px] lg:text-xs font-black text-slate-400">{new Date(vendor.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 lg:gap-3 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleOpenVendorModal(vendor)} className="p-2 lg:p-3 bg-white text-slate-400 hover:text-orange-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100">
                                                        <Edit2 size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                    <button onClick={() => handleVendorDelete(vendor.id)} className="p-2 lg:p-3 bg-white text-slate-400 hover:text-rose-600 rounded-lg lg:rounded-xl shadow-soft border border-slate-100">
                                                        <Trash2 size={14} className="lg:w-4 lg:h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isStaffModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsStaffModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleStaffSubmit}>
                                <div className="p-10 bg-gradient-to-br from-[#e85c24] to-[#d44d1a] text-white relative">
                                    <button type="button" onClick={() => setIsStaffModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6"><UsersIcon size={32} /></div>
                                    <h2 className="text-3xl font-black tracking-tight">{editingStaff ? 'Update Labour' : 'New Labour'}</h2>
                                </div>
                                <div className="p-10 space-y-6">
                                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">{error}</div>}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative"><UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={staffName} onChange={(e) => setStaffName(e.target.value)} required placeholder="Enter full name" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <button key={g} type="button" onClick={() => setStaffGender(g)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", staffGender === g ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>{g}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designated Role</label>
                                            <div className="relative">
                                                <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                {isAddingNewRole ? (
                                                    <div className="flex gap-2">
                                                        <input 
                                                            value={newRoleInput} 
                                                            onChange={(e) => setNewRoleInput(e.target.value.toUpperCase())}
                                                            placeholder="NEW ROLE NAME"
                                                            className="flex-1 pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (newRoleInput && !rolesList.includes(newRoleInput)) {
                                                                        setRolesList([...rolesList, newRoleInput]);
                                                                        setStaffRole(newRoleInput);
                                                                    }
                                                                    setIsAddingNewRole(false);
                                                                    setNewRoleInput('');
                                                                }
                                                            }}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                if (newRoleInput && !rolesList.includes(newRoleInput)) {
                                                                    setRolesList([...rolesList, newRoleInput]);
                                                                    setStaffRole(newRoleInput);
                                                                }
                                                                setIsAddingNewRole(false);
                                                                setNewRoleInput('');
                                                            }}
                                                            className="px-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                                        >
                                                            Add
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setIsAddingNewRole(false);
                                                                setNewRoleInput('');
                                                            }}
                                                            className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none cursor-pointer uppercase tracking-widest">
                                                            {rolesList.map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setIsAddingNewRole(true)}
                                                            className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#e85c24] hover:bg-slate-100 rounded-lg transition-all"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                            <div className="relative">
                                                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <select 
                                                    value={staffCategory} 
                                                    onChange={(e) => setStaffCategory(e.target.value)} 
                                                    className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                                >
                                                    <option value="unskilled att">Skilled Att</option>
                                                    <option value="skilled att">Unskilled Att</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"> {editingStaff ? 'Save Changes' : 'Register Labour'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingStaff && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingStaff(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <div className="relative p-8 lg:p-10 bg-gradient-to-br from-[#e85c24] to-[#d44d1a] text-white">
                                <button onClick={() => setViewingStaff(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><X size={20} /></button>
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-md rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
                                        <UsersIcon size={32} className="lg:w-10 lg:h-10" />
                                    </div>
                                    <div className="space-y-1 pt-2">
                                        <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">{viewingStaff.role}</div>
                                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{viewingStaff.name}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 lg:p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff ID</p>
                                        <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{viewingStaff.staff_id}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{viewingStaff.gender}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operation Role</p>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{viewingStaff.role}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                            {viewingStaff.category === 'unskilled att' ? 'Skilled Att' : 'Unskilled Att'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => { handleOpenStaffModal(viewingStaff); setViewingStaff(null); }} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"><Edit2 size={14} /> Modify Details</button>
                                    <button onClick={() => { handleStaffDelete(viewingStaff.id); setViewingStaff(null); }} className="flex-1 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"><Trash2 size={14} /> Remove Member</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleSubmit}>
                                <div className="p-10 bg-gradient-to-br from-[#e85c24] to-[#d44d1a] text-white relative">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6"><Shield size={32} /></div>
                                    <h2 className="text-3xl font-black tracking-tight">{editingUser ? 'Update Profile' : 'New Identity'}</h2>
                                </div>
                                <div className="p-10 space-y-6">
                                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">{error}</div>}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                                            <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="staff_id@factory.com" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Password</label>
                                            <div className="relative"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingUser ? "Leave blank to keep current" : "Secure entry phrase"} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Role</label>
                                            <div className="relative">
                                                <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none cursor-pointer">
                                                    {roles.map(r => (
                                                        <option key={r} value={r}>
                                                            {r === 'PHEAD' ? 'PRODUCTION HEAD' : r.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"> {editingUser ? 'Commit Changes' : 'Authorize User'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFixedPricesViewOpen && viewingCustomer && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFixedPricesViewOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            {/* Header Section */}
                            <div className="p-8 lg:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
                                <button onClick={() => setIsFixedPricesViewOpen(false)} className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                                
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Tag size={36} className="text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Fixed Product Rates</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-400 border border-white/5">
                                                Active Rate List
                                            </span>
                                            <span className="text-slate-400 font-bold text-sm">
                                                Client: {viewingCustomer.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rates Table Section */}
                            <div className="p-8 lg:p-12 space-y-8">
                                <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-200/50">
                                                    <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-r border-slate-200/50">Product Implementation</th>
                                                    <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center border-r border-slate-200/50">With GST (Fixed)</th>
                                                    <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center">Without GST (Fixed)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200/50">
                                                {viewingPrices.map((price, idx) => (
                                                    <tr key={idx} className="hover:bg-white transition-all group">
                                                        <td className="px-8 py-6 border-r border-slate-200/50">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors shadow-sm">
                                                                    <Boxes size={20} />
                                                                </div>
                                                                <span className="text-base lg:text-lg font-black text-slate-800 tracking-tight">{price.product_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center border-r border-slate-200/50">
                                                            <span className="text-xl lg:text-2xl font-black text-orange-600 tracking-tight">₹{Number(price.price_with_gst).toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">₹{Number(price.price_without_gst).toFixed(2)}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                        These rates are currently applied to all new invoices for this client
                                    </p>
                                    <button 
                                        onClick={() => setIsFixedPricesViewOpen(false)}
                                        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                                    >
                                        Close Rate Card
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingCustomer && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingCustomer(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                            {/* Header with Background Pattern */}
                            <div className="relative p-8 lg:p-10 bg-gradient-to-br from-orange-500 to-[#e85c24] text-white">
                                <button onClick={() => setViewingCustomer(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                                
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-md rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
                                        <Building2 size={32} className="lg:w-10 lg:h-10" />
                                    </div>
                                    <div className="space-y-1 pt-2">
                                        <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {viewingCustomer.category}
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">{viewingCustomer.name}</h2>
                                        <p className="text-white/70 font-mono text-xs font-bold">Customer ID: #C{viewingCustomer.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="p-8 lg:p-10 bg-white space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Contact Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                                                <Phone size={18} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Primary Contact</p>
                                                <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight">{viewingCustomer.phone_number}</p>
                                                {viewingCustomer.alternate_phone_number && (
                                                    <p className="text-xs font-bold text-slate-400 mt-1">Alt: {viewingCustomer.alternate_phone_number}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                                                <Mail size={18} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Email Address</p>
                                                <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight break-all">{viewingCustomer.email || 'No email provided'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                                                <Hash size={18} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">GST Registration</p>
                                                <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight">{viewingCustomer.gst || 'Not Registered'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Office Address</p>
                                                <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight leading-relaxed">{viewingCustomer.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Show Fixed Prices Button */}
                                {viewingPrices.length > 0 && (
                                    <button 
                                        onClick={() => setIsFixedPricesViewOpen(true)}
                                        className="w-full py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] border border-orange-100 hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Tag size={16} />
                                        Show Fixed Product Prices ({viewingPrices.length})
                                    </button>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => { setViewingCustomer(null); handleOpenPricingModal(viewingCustomer); }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
                                    >
                                        <Tag size={14} />
                                        Fix Pricing
                                    </button>
                                    <button 
                                        onClick={() => { setViewingCustomer(null); handleOpenCustomerModal(viewingCustomer); }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                                    >
                                        <Edit2 size={14} />
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCustomerModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsCustomerModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleCustomerSubmit}>
                                <div className="p-10 bg-gradient-to-br from-[#e85c24] to-[#d44d1a] text-white relative">
                                    <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6"><UserCircle size={32} /></div>
                                    <h2 className="text-3xl font-black tracking-tight">{editingCustomer ? 'Update Client' : 'Add Client'}</h2>
                                </div>
                                <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Individual Name</label>
                                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="ABC Enterprises" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distribution Category</label>
                                            <select value={customerCategory} onChange={(e) => setCustomerCategory(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none cursor-pointer">
                                                <option value="wholesale">Wholesale</option>
                                                <option value="retail">Retail</option>
                                                <option value="with GST">with GST</option>
                                                <option value="without GST">without GST</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                            <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required placeholder="Customer Address" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all min-h-[100px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required placeholder="9876543210" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alt. Phone (Optional)</label>
                                                <input value={customerAltPhone} onChange={(e) => setCustomerAltPhone(e.target.value)} placeholder="9876543210" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                                            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@example.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number (Optional)</label>
                                            <input value={customerGst} onChange={(e) => setCustomerGst(e.target.value)} placeholder="22AAAAA0000A1Z5" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">{editingCustomer ? 'Commit Update' : 'Register Customer'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPricingModalOpen && selectedCustomerForPricing && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsPricingModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handlePricingSubmit}>
                                <div className="p-10 bg-gradient-to-br from-orange-500 to-[#e85c24] text-white relative">
                                    <button type="button" onClick={() => setIsPricingModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6"><Boxes size={32} /></div>
                                    <h2 className="text-3xl font-black tracking-tight">Customer Specific Pricing</h2>
                                    <p className="text-orange-100 font-bold mt-1 uppercase tracking-widest text-[10px]">Set product rates for {selectedCustomerForPricing.name}</p>
                                </div>
                                <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        {allProducts.map(product => (
                                            <div key={product.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                                                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                        <Boxes size={16} />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight">{product.product_name}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* With GST Column */}
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (With GST)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                            <input 
                                                                type="number" 
                                                                step="0.01"
                                                                value={pricingInputs[product.id]?.with_gst || ''} 
                                                                onChange={(e) => setPricingInputs(prev => ({ 
                                                                    ...prev, 
                                                                    [product.id]: { 
                                                                        ...(prev[product.id] || { without_gst: '' }), 
                                                                        with_gst: e.target.value 
                                                                    } 
                                                                }))}
                                                                placeholder="0.00" 
                                                                className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Without GST Column */}
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Without GST)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                            <input 
                                                                type="number" 
                                                                step="0.01"
                                                                value={pricingInputs[product.id]?.without_gst || ''} 
                                                                onChange={(e) => setPricingInputs(prev => ({ 
                                                                    ...prev, 
                                                                    [product.id]: { 
                                                                        ...(prev[product.id] || { with_gst: '' }), 
                                                                        without_gst: e.target.value 
                                                                    } 
                                                                }))}
                                                                placeholder="0.00" 
                                                                className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-50 border-t border-slate-100">
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">Save Customer Rates</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isVendorModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsVendorModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleVendorSubmit}>
                                <div className="p-10 bg-gradient-to-br from-[#e85c24] to-[#d44d1a] text-white relative">
                                    <button type="button" onClick={() => setIsVendorModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white"><X size={24} /></button>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6"><UsersIcon size={32} /></div>
                                    <h2 className="text-3xl font-black tracking-tight">{editingVendor ? 'Update Vendor' : 'Create Vendor'}</h2>
                                </div>
                                <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                                    {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">{error}</div>}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label>
                                            <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} required placeholder="Vendor Name" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                            <textarea value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)} required placeholder="Vendor Address" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all min-h-[100px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <input value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} required placeholder="9876543210" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alt. Phone (Optional)</label>
                                                <input value={vendorAltPhone} onChange={(e) => setVendorAltPhone(e.target.value)} placeholder="9876543210" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                                            <input type="email" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} placeholder="vendor@example.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number (Optional)</label>
                                            <input value={vendorGst} onChange={(e) => setVendorGst(e.target.value)} placeholder="22AAAAA0000A1Z5" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-[#e85c24] hover:bg-[#d44d1a] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all shadow-[#e85c24]/20">{editingVendor ? 'Update Vendor' : 'Register Vendor'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteAllDataModal 
                isOpen={isDeleteAllModalOpen}
                onClose={() => setIsDeleteAllModalOpen(false)}
                section={activeTab === 'customers' ? 'customer' : 'vendor'}
                onSuccess={activeTab === 'customers' ? fetchCustomers : fetchVendors}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section={activeTab === 'customers' ? 'customer' : 'vendor'}
                onRestore={activeTab === 'customers' ? fetchCustomers : fetchVendors}
            />
        </div>
    );
};

export default Users;
