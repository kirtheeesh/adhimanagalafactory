import React, { useEffect, useState, useCallback } from 'react';
import { 
    Package, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Boxes,
    Layers,
    Tag,
    AlertTriangle,
    Cpu,
    Trash,
    Info,
    Calendar,
    ChevronRight,
    TrendingUp,
    Activity
} from 'lucide-react';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteAllDataModal from '../components/DeleteAllDataModal';
import TrashModal from '../components/TrashModal';

// Simple Icon fallback for Mold
const BoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

interface SemiFinishedMapping {
    semi_finished_product_id: number;
    product_name?: string;
    semi_product_type?: string;
    quantity_per_piece: number;
}

interface ProductUsage {
    product_id: number;
    product_name: string;
    quantity_per_piece: number;
    total_taken: number;
}

interface InventoryItem {
    id: number;
    product_name?: string;
    material_name?: string;
    color_name?: string;
    mold_name?: string;
    item_name?: string;
    machine_name?: string;
    status?: string;
    cycle_timing?: number;
    cavity?: number;
    description?: string;
    opening_stock?: number;
    closing_stock?: number;
    stock_qty_kgs?: number;
    stock_qty_pcs?: number;
    unit?: string;
    minimum_stock_level?: number;
    cavity_options?: string;
    cavity_count?: number;
    cavity_weights?: number[] | Record<string, number>;
    total_weight?: number;
    pieces_per_box?: number;
    box_count?: number;
    unit_weight_gm?: number;
    semi_finished_products?: SemiFinishedMapping[];
    used_by_products?: ProductUsage[];
    taken_for_product?: number;
    balance_count?: number;
    // Daily tracking
    today_produced?: number;
    today_sold?: number;
    today_opening?: number;
    semi_product_type?: string;
    category?: string;
    batches?: any[];
    // Computed fields for UI
    display_name: string;
    display_quantity: number | string;
    display_unit: string;
}

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('machine');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [semiFinishedProducts, setSemiFinishedProducts] = useState<InventoryItem[]>([]);
    
    // Form states
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});
    

    const tabs = [
        { id: 'machine', label: 'Machines', icon: Cpu },
        { id: 'mold', label: 'Molds', icon: BoxIcon },
        { id: 'material', label: 'Raw Materials', icon: Layers },
        { id: 'color', label: 'Colors', icon: Tag },
        { id: 'packing', label: 'Packing', icon: Boxes },
        { id: 'semi_finished', label: 'Semi Finished Products', icon: Layers },
        { id: 'product', label: 'Production Stock', icon: Package },
        { id: 'finished_product', label: 'Finished products', icon: Boxes },
    ];

    const calculateProductStock = useCallback((mappings: SemiFinishedMapping[], semiFinishedList: InventoryItem[]) => {
        if (!mappings || mappings.length === 0) return { stock: 0, consumedComponents: {} };
        
        // Store which component IDs provide stock for that category
        const categoryDetails: Record<string, { available: number, components: {id: number, stock: number, qpp: number}[] }> = {};
        let validComponents = 0;
        let hasLidOrContainer = false;

        mappings.forEach(m => {
            if (m.semi_finished_product_id !== 0) {
                const sf = semiFinishedList.find(p => p.id === m.semi_finished_product_id);
                if (sf) {
                    const type = (sf.semi_product_type || '').toLowerCase();
                    if (type === 'lid' || type === 'container') {
                        hasLidOrContainer = true;
                    }

                    const category = sf.semi_product_type || `sf_${sf.id}`;
                    const available = Math.floor((Number(sf.balance_count) || 0) / (m.quantity_per_piece || 1));
                    
                    if (!categoryDetails[category]) {
                        categoryDetails[category] = { available: 0, components: [] };
                    }
                    categoryDetails[category].available += available;
                    categoryDetails[category].components.push({
                        id: sf.id,
                        stock: Number(sf.balance_count) || 0,
                        qpp: m.quantity_per_piece || 1
                    });
                    validComponents++;
                }
            }
        });

        if (hasLidOrContainer) {
            if (!categoryDetails['lid']) categoryDetails['lid'] = { available: 0, components: [] };
            if (!categoryDetails['container']) categoryDetails['container'] = { available: 0, components: [] };
        }

        if (validComponents === 0) return { stock: 0, consumedComponents: {} };

        const stocks = Object.values(categoryDetails).map(d => d.available);
        const finalStock = Math.min(...stocks);

        // Calculate actual pieces consumed from each semi-finished product
        const consumedComponents: Record<number, number> = {};
        if (finalStock > 0) {
            Object.values(categoryDetails).forEach(detail => {
                let remainingToAllocate = finalStock;
                // Simple first-fit allocation for the UI preview
                detail.components.forEach(comp => {
                    if (remainingToAllocate <= 0) return;
                    const canTake = Math.floor(comp.stock / comp.qpp);
                    const taking = Math.min(canTake, remainingToAllocate);
                    if (taking > 0) {
                        consumedComponents[comp.id] = taking * comp.qpp;
                        remainingToAllocate -= taking;
                    }
                });
            });
        }

        return { stock: finalStock, consumedComponents };
    }, []);

    const fetchSemiFinishedProducts = useCallback(async () => {
        try {
            const response = await client.get('inventory', {
                params: { type: 'semi_finished' }
            });
            const mapped = response.data.map((item: InventoryItem) => ({
                ...item,
                display_name: item.product_name || item.material_name || '',
                display_quantity: item.balance_count || 0,
                display_unit: item.unit || 'PCS'
            }));
            setSemiFinishedProducts(mapped);
        } catch (err) {
            console.error('Error fetching semi-finished products:', err);
        }
    }, []);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let semiFinishedData: InventoryItem[] = [];
            if (activeTab === 'product') {
                const sfResponse = await client.get('inventory', {
                    params: { type: 'semi_finished' }
                });
                semiFinishedData = sfResponse.data.map((item: InventoryItem) => ({
                    ...item,
                    display_name: item.product_name || item.material_name || '',
                    display_quantity: item.balance_count || 0,
                    display_unit: item.unit || 'PCS'
                }));
                setSemiFinishedProducts(semiFinishedData);
            }

            const response = await client.get('inventory', {
                params: { type: activeTab }
            });
            
            let responseData = response.data;

            if (activeTab === 'finished_product') {
                const grouped: Record<string, InventoryItem> = {};
                responseData.forEach((item: any) => {
                    const name = (item.product_name || '').trim().toUpperCase() || `Asset #${item.id.toString().padStart(5, '0')}`;
                    if (!grouped[name]) {
                        grouped[name] = {
                            ...item,
                            product_name: name,
                            closing_stock: 0,
                            stock_boxes: 0,
                            today_produced: 0,
                            today_sold: 0,
                            batches: []
                        };
                    }
                    const cStock = Number(item.closing_stock) || 0;
                    const sBoxes = Number(item.stock_boxes) || 0;
                    
                    grouped[name].closing_stock = (grouped[name].closing_stock || 0) + cStock;
                    grouped[name].stock_boxes = (grouped[name].stock_boxes || 0) + sBoxes;
                    grouped[name].today_produced = (grouped[name].today_produced || 0) + (Number(item.today_produced) || 0);
                    grouped[name].today_sold = (grouped[name].today_sold || 0) + (Number(item.today_sold) || 0);
                    
                    if (cStock > 0 || sBoxes > 0) {
                        grouped[name].batches?.push({
                            batch_number: item.batch_number || 'N/A',
                            stock_qty: cStock,
                            stock_boxes: sBoxes,
                            created_at: item.created_at
                        });
                    }
                });
                responseData = Object.values(grouped);
            }

            // For sequential allocation, maintain a mutable copy of SF stocks
            const mutableSFData = [...semiFinishedData];

            // Map backend data to display format
            const mapped: InventoryItem[] = responseData.map((item: InventoryItem) => {
                let display_name = '';
                let display_quantity: number | string = 0;
                let display_unit = '';
                let final_closing_stock = Number(item.closing_stock) || 0;

                if (activeTab === 'product' || activeTab === 'semi_finished' || activeTab === 'finished_product') {
                    display_name = item.product_name || item.material_name || '';
                    if (activeTab === 'product') {
                        // Use the persisted stock/box_count from the backend (recalculated on every
                        // approval/edit). It reflects cumulative pieces already converted, not just
                        // what's currently left in the SF balance — which trends to 0 once consumed.
                        final_closing_stock = Number(item.closing_stock) || 0;
                        display_quantity = Number(item.box_count) || 0;
                        display_unit = 'Boxes';
                    } else if (activeTab === 'finished_product') {
                        display_quantity = item.stock_boxes || 0;
                        display_unit = 'Boxes';
                    } else {
                        display_quantity = item.balance_count || 0;
                        display_unit = item.unit || 'PCS';
                    }
                } else if (activeTab === 'material') {
                    display_name = item.material_name || '';
                    display_quantity = item.closing_stock || 0;
                    display_unit = item.unit || 'KG';
                } else if (activeTab === 'color') {
                    display_name = item.color_name || item.material_name || '';
                    display_quantity = item.stock_qty_kgs || 0;
                    display_unit = item.unit || 'KG';
                } else if (activeTab === 'mold') {
                    display_name = item.mold_name || item.material_name || '';
                    display_quantity = item.cavity_count || 1; 
                    display_unit = item.unit || 'PCS';
                } else if (activeTab === 'packing') {
                    display_name = item.item_name || item.material_name || '';
                    display_quantity = item.stock_qty_pcs || 0;
                    display_unit = item.unit || 'PCS';
                } else if (activeTab === 'machine') {
                    display_name = item.machine_name || item.material_name || '';
                    display_quantity = item.cavity || 1;
                    display_unit = 'Cavity';
                }

                if (!display_name) {
                    display_name = `Asset #${item.id.toString().padStart(5, '0')}`;
                }

                // Calculate today's opening stock
                let today_opening = final_closing_stock;
                if (activeTab === 'product' || activeTab === 'finished_product') {
                    today_opening = final_closing_stock - (Number(item.today_produced) || 0) + (Number(item.today_sold) || 0);
                } else if (activeTab === 'semi_finished') {
                    today_opening = (Number(item.closing_stock) || 0) - (Number(item.today_produced) || 0);
                }

                return { ...item, closing_stock: final_closing_stock, display_name, display_quantity, display_unit, today_opening, semi_product_type: item.semi_product_type };
            });

            setItems(mapped);
        } catch (err: unknown) {
            console.error('Error fetching inventory:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory assets.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [activeTab, calculateProductStock]);

    useEffect(() => {
        fetchInventory();
        if (activeTab === 'product') {
            fetchSemiFinishedProducts();
        }
    }, [activeTab, fetchInventory, fetchSemiFinishedProducts]); // Only re-run when activeTab changes

    const handleOpenModal = (item: InventoryItem | null = null) => {
        if (activeTab === 'product') {
            fetchSemiFinishedProducts();
        }
        if (item) {
            setEditingItem(item);
            // Ensure cavity_weights is an array if it's a mold
            const initialData = { ...item };

            // Enrich with semi-product details if it's a product
            if (activeTab === 'product' && initialData.semi_finished_products) {
                initialData.semi_finished_products = initialData.semi_finished_products.map(sf => {
                    const sfDetail = semiFinishedProducts.find(p => p.id === sf.semi_finished_product_id);
                    return {
                        ...sf,
                        semi_product_type: sf.semi_product_type || sfDetail?.semi_product_type
                    };
                });
            }

            if (activeTab === 'product' && (!initialData.semi_finished_products || initialData.semi_finished_products.length === 0)) {
                initialData.semi_finished_products = [
                    { semi_finished_product_id: 0, quantity_per_piece: 1 }
                ];
            }
            if (activeTab === 'mold' && item.cavity_weights) {
                if (!Array.isArray(item.cavity_weights)) {
                    // Convert from Record if needed, though backend should return what we store
                    initialData.cavity_weights = Object.values(item.cavity_weights);
                }
            } else if (activeTab === 'mold') {
                initialData.cavity_weights = [];
                initialData.cavity_count = item.cavity_count || 1;
            }
            setFormData(initialData);
        } else {
            setEditingItem(null);
            let emptyData: Partial<InventoryItem> = {};
            if (activeTab === 'mold') {
                emptyData = { cavity_count: 1, cavity_weights: [0] };
            } else if (activeTab === 'product') {
                emptyData = { 
                    semi_finished_products: [
                        { semi_finished_product_id: 0, quantity_per_piece: 1 }
                    ] 
                };
            }
            setFormData(emptyData);
        }
        setIsModalOpen(true);
    };

    const handleOpenDetail = (item: InventoryItem) => {
        // Enrich item with latest semi-product details if it's a product
        if (activeTab === 'product' && item.semi_finished_products) {
            item.semi_finished_products = item.semi_finished_products.map(sf => {
                const sfDetail = semiFinishedProducts.find(p => p.id === sf.semi_finished_product_id);
                return {
                    ...sf,
                    semi_product_type: sf.semi_product_type || sfDetail?.semi_product_type
                };
            });
        }
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const handleCavityCountChange = (value: string) => {
        const count = value === '' ? undefined : parseInt(value);
        const newCount = count === undefined || isNaN(count) ? 0 : Math.max(0, count);
        
        const currentWeights = Array.isArray(formData.cavity_weights) ? [...formData.cavity_weights] : [];
        const newWeights = Array(newCount).fill(0).map((_, i) => currentWeights[i] || 0);
        
        setFormData({
            ...formData,
            cavity_count: count,
            cavity_weights: newWeights
        });
    };

    const handleWeightChange = (index: number, value: string) => {
        const weight = value === '' ? undefined : parseFloat(value);
        const currentWeights = Array.isArray(formData.cavity_weights) ? [...formData.cavity_weights] : [];
        currentWeights[index] = weight === undefined || isNaN(weight) ? 0 : weight;
        setFormData({
            ...formData,
            cavity_weights: currentWeights
        });
    };

    const addSemiFinishedMapping = () => {
        const currentMappings = formData.semi_finished_products || [];
        const newMappings = [
            ...currentMappings,
            { semi_finished_product_id: 0, quantity_per_piece: 1 }
        ];
        setFormData({
            ...formData,
            semi_finished_products: newMappings,
            closing_stock: calculateProductStock(newMappings, semiFinishedProducts).stock
        });
    };

    const removeSemiFinishedMapping = (index: number) => {
        const currentMappings = formData.semi_finished_products || [];
        const newMappings = currentMappings.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            semi_finished_products: newMappings,
            closing_stock: calculateProductStock(newMappings, semiFinishedProducts).stock
        });
    };

    const updateSemiFinishedMapping = (index: number, field: keyof SemiFinishedMapping, value: string | number) => {
        const currentMappings = formData.semi_finished_products || [];
        const newMappings = [...currentMappings];
        const sf = value !== 0 && field === 'semi_finished_product_id' ? semiFinishedProducts.find(p => p.id === value) : null;
        newMappings[index] = { 
            ...newMappings[index], 
            [field]: value,
            ...(field === 'semi_finished_product_id' && sf ? { 
                product_name: sf.product_name, 
                semi_product_type: sf.semi_product_type 
            } : {})
        };
        
        const calculation = calculateProductStock(newMappings, semiFinishedProducts);
        const newFormData: Partial<InventoryItem> = {
            ...formData,
            semi_finished_products: newMappings,
            closing_stock: calculation.stock
        };

        // Auto-sync box count for products
        if (activeTab === 'product') {
            const ppb = Number(newFormData.pieces_per_box) || Number(formData.pieces_per_box) || 1;
            newFormData.box_count = Math.floor(calculation.stock / ppb);
        }

        // If we just selected a semi-finished product, default quantity_per_piece and pieces_per_box to 1 if not set
        if (field === 'semi_finished_product_id' && value !== 0) {
            newMappings[index].quantity_per_piece = 1;
            if (!newFormData.pieces_per_box) {
                newFormData.pieces_per_box = 1;
            }
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for mold
        if (activeTab === 'mold') {
            if (!formData.mold_name) {
                alert('Mold name is required');
                return;
            }
            if (!formData.cavity_count || formData.cavity_count < 1) {
                alert('Cavity count must be at least 1');
                return;
            }
            if (Array.isArray(formData.cavity_weights)) {
                if (formData.cavity_weights.length !== formData.cavity_count) {
                    alert('Number of weights must match cavity count');
                    return;
                }
                if (formData.cavity_weights.some(w => isNaN(w) || w <= 0)) {
                    alert('All cavity weights must be valid positive numbers');
                    return;
                }
            }
        }
        
        // Validation for product mapping
        if (activeTab === 'product') {
            if (!Array.isArray(formData.semi_finished_products) || formData.semi_finished_products.length < 1) {
                alert('A product must consist of at least 1 semi-finished product');
                return;
            }
            const ids = formData.semi_finished_products.map(m => m.semi_finished_product_id);
            if (new Set(ids).size !== ids.length) {
                alert('Duplicate semi-finished products are not allowed');
                return;
            }
            if (ids.includes(0)) {
                alert('Please select valid semi-finished products for all components');
                return;
            }
        }

        try {
            const dataToSave = { ...formData };
            // Clean up computed fields before sending to backend
            delete dataToSave.display_name;
            delete dataToSave.display_quantity;
            delete dataToSave.display_unit;

            if (editingItem) {
                await client.put(`inventory/${activeTab}/${editingItem.id}`, dataToSave);
            } else {
                await client.post(`inventory/${activeTab}`, dataToSave);
            }
            setIsModalOpen(false);
            fetchInventory();
        } catch (err) {
            console.error('Error saving inventory item:', err);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmMsg = `Are you sure you want to move this ${activeTab} to trash?`;

        if (window.confirm(confirmMsg)) {
            try {
                await client.delete(`inventory/${activeTab}/${id}`);
                fetchInventory();
            } catch (err) {
                console.error('Error deleting item:', err);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#e85c24] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">
                        <Package size={14} className="lg:w-3.5 lg:h-3.5" /> Global Warehouse
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">Inventory Assets</h1>
                    <p className="text-xs lg:text-base text-slate-500 font-medium">Real-time tracking of raw materials and finished products.</p>
                </div>
                <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-4">
                    <button 
                        onClick={() => setIsTrashModalOpen(true)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-slate-100"
                    >
                        <Trash2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Trash
                    </button>
                    <button 
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-500 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-rose-100"
                    >
                        <Trash size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Clear
                    </button>
                    {/* {activeTab !== 'finished_product' && ( */}
                        <button 
                            onClick={() => handleOpenModal()}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#e85c24] hover:bg-[#d44d1a] text-white px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 shadow-[#e85c24]/20"
                        >
                            <Plus size={16} className="lg:w-[18px] lg:h-[18px]" />
                            Register Asset
                        </button>
                    {/* )} */}
                </div>
            </header>

            {/* Category Tabs */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-[1.5rem] lg:rounded-[2rem] w-max border border-slate-200/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-[1.5rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? "bg-white text-[#e85c24] shadow-sm" 
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <tab.icon size={14} className="lg:w-4 lg:h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e85c24] transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label || 'assets'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white border border-slate-100 rounded-xl lg:rounded-[1.5rem] text-sm font-bold text-slate-900 shadow-soft focus:ring-4 focus:ring-[#e85c24]/5 outline-none transition-all"
                />
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[200px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : error ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="p-8 bg-rose-50 rounded-3xl border border-rose-100 max-w-md mx-auto">
                                <AlertTriangle className="mx-auto text-rose-500 mb-4" size={48} />
                                <h2 className="text-xl font-black text-slate-900 mb-2">Sync Failure</h2>
                                <p className="text-slate-500 mb-6">{error}</p>
                                <button 
                                    onClick={() => fetchInventory()}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:scale-105 transition-transform"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Package size={40} />
                            </div>
                            <p className="text-slate-400 font-bold">No assets found in this category</p>
                        </div>
                    ) : (
                        items.filter((i: InventoryItem) => 
                            i.display_name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((item, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={item.id}
                                onClick={() => handleOpenDetail(item)}
                                className="glass p-5 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-soft group relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <div className="absolute top-0 right-0 p-4 lg:p-6 flex gap-2 lg:opacity-100 transition-all z-10">
                                    {activeTab !== 'finished_product' && (
                                        <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-all translate-y-0 lg:translate-y-2 group-hover:translate-y-0">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                                                className="p-2 lg:p-3 bg-white text-slate-400 hover:text-[#e85c24] rounded-xl shadow-soft transition-all active:scale-90 border border-slate-50 lg:border-none"
                                            >
                                                <Edit2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="p-2 lg:p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-soft transition-all active:scale-90 border border-slate-50 lg:border-none"
                                            >
                                                <Trash2 size={14} className="lg:w-[18px] lg:h-[18px]" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex px-3 py-1 bg-orange-50 text-[#e85c24] rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                                            {activeTab === 'finished_product' ? 'Finished products' : activeTab} {(activeTab === 'product' || activeTab === 'semi_finished') && `#${idx + 1}`}
                                        </div>
                                        {item.category && !activeTab.includes(item.category.toLowerCase()) && (
                                            <div className="inline-flex px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                                CAT: {item.category}
                                            </div>
                                        )}
                                        {(activeTab === 'machine' || (activeTab === 'semi_finished' && item.machine_name)) && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                                                <Cpu size={10} className="shrink-0" />
                                                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{item.machine_name || `Unit #${item.id}`}</span>
                                            </div>
                                        )}
                                        {(activeTab === 'product' || activeTab === 'finished_product') && item.pieces_per_box && item.pieces_per_box > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-orange-50/50 text-[#e85c24] rounded-lg border border-orange-100/50">
                                                <Boxes size={10} className="shrink-0" />
                                                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">1 Box = {item.pieces_per_box} Pcs</span>
                                            </div>
                                        )}
                                        {activeTab === 'product' && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50/50 text-blue-600 rounded-lg border border-blue-100/50">
                                                <Package size={10} className="shrink-0" />
                                                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{item.display_quantity} Boxes</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-[#e85c24] transition-colors line-clamp-1 leading-tight uppercase">{item.display_name}</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">Asset #{item.id.toString().padStart(5, '0')}</p>
                                            {activeTab === 'semi_finished' && item.semi_product_type && (
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                    {item.semi_product_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="shrink-0">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                {activeTab === 'mold' ? 'Capacity' : 'Stock Level'}
                                            </p>
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">
                                                        {item.display_quantity}
                                                    </span>
                                                    <span className="text-[10px] lg:text-sm font-black text-slate-400 uppercase">{item.display_unit}</span>
                                                </div>
                                                {activeTab === 'product' && (
                                                    <div className="mt-2 space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                                Taken: <span className="text-[#e85c24]">{Number(item.closing_stock || 0).toLocaleString()} PCS</span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                                Balance: <span className="text-emerald-600">{Number(item.closing_stock || 0).toLocaleString()}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {activeTab === 'finished_product' && item.pieces_per_box && item.pieces_per_box > 0 && (
                                                    <p className="text-[10px] lg:text-xs font-bold text-[#e85c24] mt-0.5">
                                                        {Number(item.closing_stock || 0).toLocaleString()} PCS
                                                    </p>
                                                )}
                                        {activeTab === 'semi_finished' && (
                                            <div className="mt-2 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                        Taken: <span className="text-[#e85c24]">{Number(item.taken_for_product || 0).toLocaleString()}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                        Balance: <span className="text-emerald-600">{Number(item.balance_count || 0).toLocaleString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                                {activeTab === 'material' && (
                                                    <div className="mt-0.5 space-y-0.5">
                                                        {item.display_unit.toUpperCase() === 'KG' ? (
                                                            <p className="text-[10px] lg:text-xs font-bold text-[#e85c24]">
                                                                {(Number(item.display_quantity) / 1000).toFixed(3)} TON
                                                            </p>
                                                        ) : item.display_unit.toUpperCase() === 'TON' ? (
                                                            <p className="text-[10px] lg:text-xs font-bold text-[#e85c24]">
                                                                {(Number(item.display_quantity) * 1000).toFixed(2)} KG
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {(activeTab === 'product' || activeTab === 'semi_finished' || activeTab === 'finished_product') && (
                                            <div className="flex-1 bg-slate-50/50 p-2 lg:p-3 rounded-2xl border border-slate-100">
                                                <div className="flex items-center justify-around gap-2 text-center">
                                                    <div>
                                                        <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Opening</p>
                                                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-600">{Number(item.today_opening || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] lg:text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1.5">Produced</p>
                                                        <p className="text-[9px] lg:text-[10px] font-bold text-emerald-600">+{Number(item.closing_stock || 0).toLocaleString()}</p>
                                                    </div>
                                                    {(activeTab === 'product' || activeTab === 'finished_product') && (
                                                        <div>
                                                            <p className="text-[7px] lg:text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1.5">Sold</p>
                                                            <p className="text-[9px] lg:text-[10px] font-bold text-rose-600">-{Number(item.today_sold || 0).toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'mold' && (
                                            <div className="flex gap-3 lg:gap-6 text-right">
                                                <div>
                                                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Avg Wt</p>
                                                    <p className="text-xs lg:text-sm font-black text-[#e85c24]">
                                                        {(Array.isArray(item.cavity_weights) 
                                                            ? (item.cavity_weights.reduce((a: number, b: number) => a + b, 0) / (item.cavity_weights.length || 1))
                                                            : 0
                                                        ).toFixed(1)}g
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Wt</p>
                                                    <p className="text-xs lg:text-sm font-black text-[#e85c24]">
                                                        {Number(item.total_weight || 0).toFixed(1)}g
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(activeTab === 'product' || activeTab === 'semi_finished') && (
                                        <div className="pt-4 border-t border-slate-100 space-y-3">
                                            {activeTab === 'product' && item.semi_finished_products && item.semi_finished_products.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <Layers className="w-3 h-3 text-slate-400" />
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Components required</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {(() => {
                                                            return item.semi_finished_products?.map((sf, i) => {
                                                                const sfDetail = semiFinishedProducts.find(p => p.id === sf.semi_finished_product_id);
                                                                const displayName = sf.product_name || sfDetail?.product_name || 'Unknown Component';
                                                                // Pieces actually consumed = this product's persisted stock (in pieces) × the recipe ratio,
                                                                // not the live SF balance — that trends to 0 once a component is fully converted.
                                                                const piecesTaken = (Number(item.closing_stock) || 0) * (sf.quantity_per_piece || 1);

                                                                return (
                                                                    <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50 group/item hover:border-orange-200 transition-colors">
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-[11px] font-bold text-slate-600 truncate group-hover/item:text-slate-900 leading-tight">{displayName}</span>
                                                                            {sfDetail && (
                                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                                                                    {sfDetail.semi_product_type ? `[${sfDetail.semi_product_type.toUpperCase()}] ` : ''}
                                                                                    Stock: {Number(sfDetail.balance_count || 0).toLocaleString()} PCS
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">{sf.quantity_per_piece}</span>
                                                                                <span className="text-[8px] font-black text-[#e85c24] uppercase mt-0.5">{piecesTaken.toLocaleString()} PCS</span>
                                                                            </div>
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ratio</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'semi_finished' && item.used_by_products && item.used_by_products.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <Package className="w-3 h-3 text-slate-400" />
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Used In Products</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {item.used_by_products.map((usage, i) => (
                                                            <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50 group/item hover:border-emerald-200 transition-colors">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[11px] font-bold text-slate-600 truncate group-hover/item:text-slate-900 leading-tight">{usage.product_name}</span>
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                                                        Consumes: {usage.quantity_per_piece} per pc
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col items-end shrink-0">
                                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 shadow-sm">
                                                                        {Number(usage.total_taken || 0).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase mt-0.5 tracking-tighter">Total Taken</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Asset Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setIsDetailModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
                        >
                            {/* Modal Header */}
                            <div className="p-8 lg:p-12 bg-gradient-to-br from-[#1a1c1e] via-slate-900 to-slate-800 text-white relative shrink-0">
                                <button 
                                    onClick={() => setIsDetailModalOpen(false)} 
                                    className="absolute top-8 lg:top-10 right-8 lg:right-10 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-3 rounded-2xl"
                                >
                                    <X size={24} />
                                </button>
                                
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                                        {(() => {
                                            const TabIcon = tabs.find(t => t.id === activeTab)?.icon || Package;
                                            return <TabIcon size={24} />;
                                        })()}
                                    </div>
                                    <div className="inline-flex px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                                        {activeTab} Asset
                                    </div>
                                </div>
                                
                                <h2 className="text-2xl lg:text-4xl font-black tracking-tight uppercase leading-none">
                                    {selectedItem.display_name}
                                </h2>
                                <p className="text-slate-400 text-xs lg:text-base font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                                    <Tag size={14} /> Asset #{selectedItem.id.toString().padStart(5, '0')}
                                </p>

                                {activeTab === 'semi_finished' && selectedItem.semi_product_type && (
                                    <div className="mt-4 flex">
                                        <div className="inline-flex px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest border border-blue-500/30 shadow-lg shadow-blue-500/10">
                                            Category: {selectedItem.semi_product_type}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 lg:p-14 overflow-y-auto custom-scrollbar space-y-12">
                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                    <div className="bg-slate-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                        <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Current Stock</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter group-hover:text-[#e85c24] transition-colors">
                                                {selectedItem.display_quantity}
                                            </span>
                                            <span className="text-xs lg:text-base font-black text-slate-400 uppercase tracking-widest">{selectedItem.display_unit}</span>
                                        </div>
                                    </div>

                                    {(activeTab === 'product' || activeTab === 'semi_finished') && (
                                        <div className="bg-emerald-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-emerald-100/50 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-500">
                                            <p className="text-[10px] lg:text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Today Produced</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-emerald-600 tracking-tighter">
                                                    {Number(selectedItem.today_produced || 0).toLocaleString()}
                                                </span>
                                                <span className="text-xs lg:text-base font-black text-emerald-400 uppercase tracking-widest">PCS</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'finished_product' && (
                                        <div className="bg-emerald-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-emerald-100/50 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-500">
                                            <p className="text-[10px] lg:text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Total Pieces</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-emerald-600 tracking-tighter">
                                                    {Number(selectedItem.closing_stock || 0).toLocaleString()}
                                                </span>
                                                <span className="text-xs lg:text-base font-black text-emerald-400 uppercase tracking-widest">PCS</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'finished_product' && (
                                        <div className="bg-slate-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                            <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Unit Weight</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                                                    {Number(selectedItem.unit_weight_gm || 0).toFixed(2)}
                                                </span>
                                                <span className="text-xs lg:text-base font-black text-slate-400 uppercase tracking-widest">G</span>
                                            </div>
                                        </div>
                                    )}

                                    {(activeTab === 'product' || activeTab === 'finished_product') && (
                                        <div className="bg-orange-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-orange-100/50 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-500">
                                            <p className="text-[10px] lg:text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Today Sold</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-orange-600 tracking-tighter">
                                                    {Number(selectedItem.today_sold || 0).toLocaleString()}
                                                </span>
                                                <span className="text-xs lg:text-base font-black text-orange-400 uppercase tracking-widest">PCS</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'semi_finished' && (
                                        <div className="bg-orange-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-orange-100/50 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-500">
                                            <p className="text-[10px] lg:text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Today Taken</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-orange-600 tracking-tighter">
                                                    {Number(selectedItem.taken_for_product || 0).toLocaleString()}
                                                </span>
                                                <span className="text-xs lg:text-base font-black text-orange-400 uppercase tracking-widest">PCS</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'mold' && (
                                        <>
                                            <div className="bg-slate-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                                <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Cavity Count</p>
                                                <span className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                                                    {selectedItem.cavity_count || 0}
                                                </span>
                                            </div>
                                            <div className="bg-orange-50/50 p-6 lg:p-8 rounded-[2.5rem] border border-orange-100/50 flex flex-col justify-between group/metric hover:bg-white hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-500">
                                                <p className="text-[10px] lg:text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Total Weight</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl lg:text-5xl font-black text-orange-600 tracking-tighter">
                                                        {Number(selectedItem.total_weight || 0).toFixed(1)}
                                                    </span>
                                                    <span className="text-xs lg:text-base font-black text-orange-400 uppercase tracking-widest">G</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Detailed Sections */}
                                <div className="space-y-6">
                                    {/* Description Section */}
                                    {selectedItem.description && (
                                        <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Info size={16} className="text-[#e85c24]" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Asset Description</h3>
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                {selectedItem.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Product/Semi-Finished specific components */}
                                    {activeTab === 'product' && selectedItem.semi_finished_products && selectedItem.semi_finished_products.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-2">
                                                    <Layers size={16} className="text-[#e85c24]" />
                                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recipe / Components</h3>
                                                </div>
                                                {(() => {
                                                    const grouped: Record<string, { sf: SemiFinishedMapping, detail: InventoryItem | undefined, stock: number }> = {};
                                                    selectedItem.semi_finished_products?.forEach(sf => {
                                                        const sfDetail = semiFinishedProducts.find(p => p.id === sf.semi_finished_product_id);
                                                        const category = sfDetail?.semi_product_type || `sf_${sf.semi_finished_product_id}`;
                                                        const stock = Number(sfDetail?.balance_count || 0);
                                                        if (!grouped[category] || stock > grouped[category].stock) {
                                                            grouped[category] = { sf, detail: sfDetail, stock };
                                                        }
                                                    });
                                                    const items = Object.values(grouped).filter(g => g.stock > 0 || Object.values(grouped).length === 1);
                                                    return (
                                                        <>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                                                                {items.length} Items
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {(() => {
                                                    const grouped: Record<string, { sf: SemiFinishedMapping, detail: InventoryItem | undefined, stock: number }> = {};
                                                    selectedItem.semi_finished_products?.forEach(sf => {
                                                        const sfDetail = semiFinishedProducts.find(p => p.id === sf.semi_finished_product_id);
                                                        const category = sfDetail?.semi_product_type || `sf_${sf.semi_finished_product_id}`;
                                                        const stock = Number(sfDetail?.balance_count || 0);
                                                        if (!grouped[category] || stock > grouped[category].stock) {
                                                            grouped[category] = { sf, detail: sfDetail, stock };
                                                        }
                                                    });
                                                    
                                                    return Object.values(grouped)
                                                        .filter(g => g.stock > 0 || Object.values(grouped).length === 1)
                                                        .map((group, i) => {
                                                            const sf = group.sf;
                                                            return (
                                                                <div key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors group/row">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover/row:bg-orange-500 group-hover/row:text-white transition-colors font-black">
                                                                            {i + 1}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-900">{sf.product_name}</p>
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                                                {sf.semi_product_type ? sf.semi_product_type.toUpperCase() : 'Component Asset'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="text-right">
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ratio</p>
                                                                            <p className="text-sm font-black text-slate-900">{sf.quantity_per_piece} pcs</p>
                                                                        </div>
                                                                        <ChevronRight size={16} className="text-slate-300" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'semi_finished' && selectedItem.used_by_products && selectedItem.used_by_products.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-2">
                                                <TrendingUp size={16} className="text-[#e85c24]" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Usage Distribution</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {selectedItem.used_by_products.map((usage, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group/row">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover/row:bg-emerald-500 group-hover/row:text-white transition-colors font-black">
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{usage.product_name}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Parent Product</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Consumption</p>
                                                            <p className="text-sm font-black text-emerald-600">{Number(usage.total_taken || 0).toLocaleString()} PCS</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mold Weights Section */}
                                    {activeTab === 'mold' && Array.isArray(selectedItem.cavity_weights) && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-2">
                                                <Activity size={16} className="text-[#e85c24]" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Cavity Weight Distribution</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {selectedItem.cavity_weights.map((weight, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cavity {i + 1}</p>
                                                        <p className="text-sm font-black text-slate-900">{weight}g</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'finished_product' && selectedItem.batches && selectedItem.batches.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 px-2">
                                                <Boxes size={16} className="text-[#e85c24]" />
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Batches</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedItem.batches.map((batch: any, i: number) => (
                                                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-[#10B981] font-black">
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#10B981] uppercase">Batch: {batch.batch_number}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                    {new Date(batch.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-slate-500">
                                                                    {Number(batch.stock_qty || 0).toLocaleString()} pcs | {batch.stock_boxes || 0} box
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Bottom Action */}
                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar size={14} />
                                        Last Updated: {new Date().toLocaleDateString()}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setIsDetailModalOpen(false);
                                            handleOpenModal(selectedItem);
                                        }}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#e85c24] transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                    >
                                        <Edit2 size={14} />
                                        Modify Asset
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Asset Modal */}
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
                            className="relative w-full max-w-lg bg-white rounded-3xl lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 lg:p-10 bg-[#333333] text-white relative shrink-0">
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 lg:top-8 right-6 lg:right-8 text-white/40 hover:text-white transition-colors">
                                    <X size={20} className="lg:w-6 lg:h-6" />
                                </button>
                                <h2 className="text-xl lg:text-3xl font-black tracking-tight uppercase">
                                    {editingItem ? 'Edit Asset' : 'New Asset'}
                                </h2>
                                <p className="text-slate-400 text-[10px] lg:text-sm font-medium mt-1 lg:mt-2">
                                    {activeTab.toUpperCase()} Category Registry
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-4 lg:space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-3 lg:space-y-4">
                                    {(activeTab === 'product' || activeTab === 'semi_finished') && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                                    {activeTab === 'product' ? 'Product Name' : 'Semi Finished Name'}
                                                </label>
                                                <input 
                                                    placeholder={activeTab === 'product' ? "Product Name" : "Semi Finished Name"}
                                                    value={formData.product_name || ''}
                                                    onChange={e => setFormData({...formData, product_name: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                                                />
                                            </div>

                                            {activeTab === 'semi_finished' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Category (Lid/Container)</label>
                                                    <select 
                                                        value={formData.semi_product_type || ''}
                                                        onChange={e => setFormData({...formData, semi_product_type: e.target.value})}
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer border border-slate-100"
                                                    >
                                                        <option value="">Select Category</option>
                                                        <option value="lid">Lid</option>
                                                        <option value="container">Container</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                                                <textarea 
                                                    placeholder="Enter description..."
                                                    value={formData.description || ''}
                                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all min-h-[100px] resize-none"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'product' && (
                                        <div className="col-span-full pb-4 border-b border-slate-100 space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Semi Finished Product Mapping
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={addSemiFinishedMapping}
                                                    className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Add Component
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {formData.semi_finished_products?.map((mapping, index) => {
                                                    const sf = semiFinishedProducts.find(p => p.id === mapping.semi_finished_product_id);

                                                    const taken = (Number(formData.closing_stock) || 0) * (Number(mapping.quantity_per_piece) || 1);
                                                    const balance = (Number(sf?.balance_count) || 0) - taken;

                                                    return (
                                                        <div key={index} className="bg-slate-50 p-6 rounded-3xl relative border border-slate-100 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Component {index + 1}</label>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {sf?.semi_product_type && (
                                                                        <span className="text-[9px] font-black text-white bg-orange-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                                            {sf.semi_product_type}
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSemiFinishedMapping(index)}
                                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="relative group">
                                                                <select
                                                                    value={mapping.semi_finished_product_id}
                                                                    onChange={(e) => updateSemiFinishedMapping(index, 'semi_finished_product_id', parseInt(e.target.value))}
                                                                    className="w-full px-6 py-5 bg-white rounded-2xl font-black text-slate-900 outline-none text-base focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer border border-slate-100 group-hover:border-orange-200"
                                                                >
                                                                    <option value={0}>Select Semi Finished Component</option>
                                                                    {semiFinishedProducts.map(p => {
                                                                        const isAlreadySelected = formData.semi_finished_products?.some(
                                                                            (m, i) => i !== index && m.semi_finished_product_id === p.id
                                                                        );
                                                                        
                                                                        return (
                                                                            <option 
                                                                                key={p.id} 
                                                                                value={p.id} 
                                                                                disabled={isAlreadySelected}
                                                                            >
                                                                                {p.product_name} {p.semi_product_type ? `[${p.semi_product_type.toUpperCase()}]` : ''} (Stock: {p.balance_count})
                                                                                {isAlreadySelected ? ' - Already Added' : ''}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                                                    <ChevronRight size={20} className="rotate-90" />
                                                                </div>
                                                            </div>

                                                            {(() => {
                                                                if (!sf) return null;
                                                                
                                                                // Logic to calculate sequential taken/balance for alternatives in the UI
                                                                const category = sf.semi_product_type || `sf_${sf.id}`;
                                                                const sameCategoryMappings = (formData.semi_finished_products || [])
                                                                    .map((m, i) => ({ ...m, originalIndex: i }))
                                                                    .filter(m => {
                                                                        const mappingSf = semiFinishedProducts.find(p => p.id === m.semi_finished_product_id);
                                                                        return (mappingSf?.semi_product_type || `sf_${m.semi_finished_product_id}`) === category;
                                                                    });
                                                                
                                                                // Sort to match backend logic (by stock descending)
                                                                const sortedSameCategory = [...sameCategoryMappings].sort((a, b) => {
                                                                    const sfA = semiFinishedProducts.find(p => p.id === a.semi_finished_product_id);
                                                                    const sfB = semiFinishedProducts.find(p => p.id === b.semi_finished_product_id);
                                                                    return (Number(sfB?.balance_count) || 0) - (Number(sfA?.balance_count) || 0);
                                                                });

                                                                let remainingProductToCover = Number(formData.closing_stock) || 0;
                                                                let takenForThisMapping = 0;

                                                                for (let i = 0; i < sortedSameCategory.length; i++) {
                                                                    const current = sortedSameCategory[i];
                                                                    const qpp = Number(current.quantity_per_piece) || 1;
                                                                    const currentSf = semiFinishedProducts.find(p => p.id === current.semi_finished_product_id);
                                                                    
                                                                    let takenFromThis = 0;
                                                                    if (i === sortedSameCategory.length - 1) {
                                                                        takenFromThis = remainingProductToCover;
                                                                    } else {
                                                                        const available = Math.floor((Number(currentSf?.balance_count) || 0) / qpp);
                                                                        takenFromThis = Math.min(remainingProductToCover, available);
                                                                    }

                                                                    if (current.originalIndex === index) {
                                                                        takenForThisMapping = takenFromThis * qpp;
                                                                        break;
                                                                    }
                                                                    remainingProductToCover -= takenFromThis;
                                                                }

                                                                const balance = (Number(sf.balance_count) || 0) - takenForThisMapping;

                                                                return (
                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100/50">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Taken</p>
                                                                            <p className="text-xs font-black text-orange-600">{takenForThisMapping.toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100/50">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                                                                            <p className={`text-xs font-black ${balance < 0 ? 'text-rose-500' : 'text-slate-600'}`}>{balance.toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-100/50">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ratio (Pcs)</p>
                                                                            <input 
                                                                                type="number"
                                                                                min="1"
                                                                                value={mapping.quantity_per_piece}
                                                                                onChange={(e) => updateSemiFinishedMapping(index, 'quantity_per_piece', parseInt(e.target.value) || 1)}
                                                                                className="w-full bg-transparent text-xs font-black text-slate-900 outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'product' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Box Conversion (1 Box = ? Pieces)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Pieces per Box" 
                                                value={formData.pieces_per_box ?? ''} 
                                                onChange={e => {
                                                    const ppb = e.target.value === '' ? undefined : Number(e.target.value);
                                                    const closing_stock = Number(formData.closing_stock) || 0;
                                                    setFormData({
                                                        ...formData, 
                                                        pieces_per_box: ppb,
                                                        box_count: ppb && ppb > 0 ? Math.floor(closing_stock / ppb) : formData.box_count
                                                    });
                                                }} 
                                                className="w-full px-6 py-4 bg-orange-50/50 rounded-2xl font-bold text-slate-900 border border-orange-100 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" 
                                            />
                                        </div>
                                    )}

                                    {(activeTab === 'product' || activeTab === 'semi_finished') && (
                                        <>
                                            <div className={activeTab === 'product' ? "grid grid-cols-2 gap-4" : "space-y-2"}>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                                        {activeTab === 'product' ? 'Stock Level (PCS)' : 'Stock Level'}
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Stock Level" 
                                                        value={formData.opening_stock ?? ''} 
                                                        onChange={e => setFormData({...formData, opening_stock: e.target.value === '' ? undefined : Number(e.target.value)})} 
                                                        disabled={activeTab === 'product'}
                                                        className={`w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all ${activeTab === 'product' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                                    />
                                                </div>
                                                
                                                {activeTab === 'product' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Box Count</label>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Boxes" 
                                                            value={formData.box_count ?? ''} 
                                                            disabled={activeTab === 'product'}
                                                            className={`w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all ${activeTab === 'product' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {activeTab === 'product' && (formData.semi_finished_products?.length ?? 0) > 0 && (
                                                <p className="text-[9px] font-bold text-[#e85c24] px-2 uppercase tracking-widest mt-[-10px] mb-2">
                                                    Stock auto-synced from semi-finished products
                                                </p>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</label>
                                                <select 
                                                    value={formData.unit || (activeTab === 'product' ? 'Box' : 'PCS')} 
                                                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                                >
                                                    {activeTab === 'product' ? (
                                                        <option value="Box">Box</option>
                                                    ) : (
                                                        <>
                                                            <option value="PCS">PCS</option>
                                                            <option value="KG">KG</option>
                                                            <option value="Ton">Ton</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'material' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Material Name</label>
                                                <input placeholder="Material Name" value={formData.material_name || ''} onChange={e => setFormData({...formData, material_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Stock Level</label>
                                                <input type="number" placeholder="Stock Level" value={formData.opening_stock ?? ''} onChange={e => setFormData({...formData, opening_stock: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</label>
                                                <select 
                                                    value={formData.unit || 'KG'} 
                                                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="KG">KG</option>
                                                    <option value="Ton">Ton</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'color' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Color Name</label>
                                                <input placeholder="Color Name" value={formData.color_name || ''} onChange={e => setFormData({...formData, color_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Stock Qty</label>
                                                    <input type="number" placeholder="Stock Qty" value={formData.stock_qty_kgs ?? ''} onChange={e => setFormData({...formData, stock_qty_kgs: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</label>
                                                    <select 
                                                        value={formData.unit || 'KG'} 
                                                        onChange={e => setFormData({...formData, unit: e.target.value})} 
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="KG">KG</option>
                                                        <option value="Ton">Ton</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'mold' && (
                                        <div className="space-y-4 max-h-[40vh] overflow-y-auto px-2 pb-2 scrollbar-hide">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mold Name</label>
                                                <input placeholder="Mold Name" value={formData.mold_name || ''} onChange={e => setFormData({...formData, mold_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">No. of Cavities</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="No. of Cavities" 
                                                        value={formData.cavity_count ?? ''} 
                                                        onChange={e => handleCavityCountChange(e.target.value)} 
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</label>
                                                    <select 
                                                        value={formData.unit || 'PCS'} 
                                                        onChange={e => setFormData({...formData, unit: e.target.value})} 
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="PCS">PCS</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cavity Weights (g)</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Array.isArray(formData.cavity_weights) && formData.cavity_weights.map((weight, index) => (
                                                        <div key={index} className="space-y-1">
                                                            <p className="text-[9px] font-bold text-slate-400 px-2">Cavity {index + 1}</p>
                                                            <input 
                                                                type="number" 
                                                                step="0.01" 
                                                                placeholder="Weight" 
                                                                value={weight ?? ''} 
                                                                onChange={e => handleWeightChange(index, e.target.value)} 
                                                                className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none text-sm focus:ring-4 focus:ring-orange-500/10 transition-all" 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cavity Options</label>
                                                <input placeholder="Cavity Options (Description)" value={formData.cavity_options || ''} onChange={e => setFormData({...formData, cavity_options: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'packing' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Item Name</label>
                                                <input placeholder="Item Name" value={formData.item_name || ''} onChange={e => setFormData({...formData, item_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Stock Qty</label>
                                                    <input type="number" placeholder="Stock Qty" value={formData.stock_qty_pcs ?? ''} onChange={e => setFormData({...formData, stock_qty_pcs: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</label>
                                                    <select 
                                                        value={formData.unit || 'PCS'} 
                                                        onChange={e => setFormData({...formData, unit: e.target.value})} 
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="PCS">PCS</option>
                                                        <option value="KG">KG</option>
                                                        <option value="Roll">Roll</option>
                                                        <option value="Bundle">Bundle</option>
                                                        <option value="Box">Box</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'machine' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Machine Name</label>
                                                <input placeholder="Machine Name" value={formData.machine_name || ''} onChange={e => setFormData({...formData, machine_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Status</label>
                                                    <select value={formData.status || 'idle'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer">
                                                        <option value="idle">Idle</option>
                                                        <option value="running">Running</option>
                                                        <option value="maintenance">Maintenance</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cycle Timing (s)</label>
                                                    <input type="number" placeholder="Cycle Timing" value={formData.cycle_timing ?? ''} onChange={e => setFormData({...formData, cycle_timing: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cavity Count</label>
                                                <input type="number" placeholder="Cavity" value={formData.cavity ?? ''} onChange={e => setFormData({...formData, cavity: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                        </>
                                    )}
                                    {activeTab === 'finished_product' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Product Name</label>
                                                <input placeholder="Product Name" value={formData.product_name || ''} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Stock Boxes</label>
                                                    <input type="number" placeholder="Boxes" value={formData.stock_boxes ?? ''} onChange={e => setFormData({...formData, stock_boxes: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Total Pieces</label>
                                                    <input type="number" placeholder="Pieces" value={formData.total_pieces ?? ''} onChange={e => setFormData({...formData, total_pieces: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] px-6 py-4 text-xs font-black uppercase tracking-widest text-white bg-slate-900 hover:opacity-90 rounded-2xl transition-all shadow-xl active:scale-95"
                                    >
                                        {editingItem ? 'Commit Update' : 'Initialize Asset'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteAllDataModal 
                isOpen={isDeleteAllModalOpen}
                onClose={() => setIsDeleteAllModalOpen(false)}
                section={`inventory-${activeTab}`}
                onSuccess={fetchInventory}
            />

            <TrashModal 
                isOpen={isTrashModalOpen}
                onClose={() => setIsTrashModalOpen(false)}
                section={`inventory-${activeTab}`}
                onRestore={fetchInventory}
            />
        </div>
    );
};

export default Inventory;
