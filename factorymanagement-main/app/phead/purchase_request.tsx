import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable,
    RefreshControl, ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import PHeadFooter from '@shared/components/PHeadFooter';

import * as Linking from 'expo-linking';

interface Material {
    id: number;
    material_name: string;
    closing_stock: number;
    unit: string;
}

interface Vendor {
    id: number;
    name: string;
    materials?: Array<{
        material_id: number;
        category: string;
        material_name: string;
        price_per_kg: number;
    }>;
}

interface PurchaseRequest {
    id: number;
    material_name: string;
    category?: string;
    unit?: string;
    current_stock: number;
    requested_quantity: number;
    requested_by: string;
    vendor_price: number;
    vendor_name: string;
    status: string;
    created_at: string;
    total_price?: number;
}

export default function PurchaseRequestScreen() {
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [colors, setColors] = useState<Material[]>([]);
    const [molds, setMolds] = useState<Material[]>([]);
    const [packing, setPacking] = useState<Material[]>([]);
    const [others, setOthers] = useState<Material[]>([]);
    const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Category state
    const [selectedCategory, setSelectedCategory] = useState<string>('Materials');
    
    // Form States
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [requiredQuantity, setRequiredQuantity] = useState('');
    const [vendorPrice, setVendorPrice] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // "Others" category new entries
    const [isNewMaterial, setIsNewMaterial] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [isNewVendor, setIsNewVendor] = useState(false);
    const [newVendorName, setNewVendorName] = useState('');
    const [newVendorPrice, setNewVendorPrice] = useState('');

    const fetchData = async () => {
        try {
            const [materialsRes, colorsRes, moldsRes, packingRes, othersRes, lowStockRes, requestsRes, vendorsRes, storedUser] = await Promise.all([
                fetchWithTimeout(`${SERVER_URL}/inventory/materials`),
                fetchWithTimeout(`${SERVER_URL}/inventory/colors`),
                fetchWithTimeout(`${SERVER_URL}/inventory/molds`),
                fetchWithTimeout(`${SERVER_URL}/inventory/packing`),
                fetchWithTimeout(`${SERVER_URL}/inventory/others`),
                fetchWithTimeout(`${SERVER_URL}/inventory/low-stock`),
                fetchWithTimeout(`${SERVER_URL}/purchase/requests`),
                fetchWithTimeout(`${SERVER_URL}/vendors`),
                AsyncStorage.getItem('username')
            ]);
            
            const materialsJson = await materialsRes.json();
            const colorsJson = await colorsRes.json();
            const moldsJson = await moldsRes.json();
            const packingJson = await packingRes.json();
            const othersJson = await othersRes.json();
            const lowStockJson = await lowStockRes.json();
            const requestsJson = await requestsRes.json();
            const vendorsJson = await vendorsRes.json();
            
            setMaterials(Array.isArray(materialsJson) ? materialsJson : []);
            setColors(Array.isArray(colorsJson) ? colorsJson.map((c: any) => ({
                id: c.id,
                material_name: c.color_name,
                closing_stock: c.stock_qty_kgs,
                unit: 'kg'
            })) : []);
            setMolds(Array.isArray(moldsJson) ? moldsJson.map((m: any) => ({
                id: m.id,
                material_name: m.mold_name,
                closing_stock: m.stock_qty || 0,
                unit: 'pcs'
            })) : []);
            setPacking(Array.isArray(packingJson) ? packingJson.map((p: any) => ({
                id: p.id,
                material_name: p.item_name,
                closing_stock: p.stock_qty_pcs,
                unit: 'pcs'
            })) : []);
            setOthers(Array.isArray(othersJson) ? othersJson.map((o: any) => ({
                id: o.id,
                material_name: o.item_name,
                closing_stock: o.stock_qty,
                unit: 'kg'
            })) : []);
            setLowStockMaterials(Array.isArray(lowStockJson) ? lowStockJson : []);
            setPurchaseRequests(Array.isArray(requestsJson) ? requestsJson : []);
            setVendors(Array.isArray(vendorsJson) ? vendorsJson : []);
            setUsername(storedUser || 'Unknown');
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const qty = parseFloat(requiredQuantity) || 0;
        const price = isNewVendor ? (parseFloat(newVendorPrice) || 0) : (parseFloat(vendorPrice) || 0);
        setTotalPrice(qty * price);
    }, [requiredQuantity, vendorPrice, newVendorPrice, isNewVendor]);

    const handleMaterialChange = (materialId: string) => {
        setSelectedMaterialId(materialId);
        setSelectedVendorId('');
        setVendorPrice('');
        setVendorName('');
        
        if (materialId === 'NEW_ITEM') {
            setIsNewMaterial(true);
            setNewMaterialName('');
            setIsNewVendor(true); // Always new vendor for new material?
            return;
        } else {
            setIsNewMaterial(false);
        }
    };

    const handleVendorChange = (vendorId: string) => {
        setSelectedVendorId(vendorId);
        if (vendorId === 'NEW_VENDOR') {
            setIsNewVendor(true);
            setVendorName('');
            setVendorPrice('');
            return;
        } else {
            setIsNewVendor(false);
        }

        const vendor = vendors.find(v => v.id.toString() === vendorId);
        if (vendor) {
            setVendorName(vendor.name);
            // Find price for the selected material among vendor's materials
            const matPrice = vendor.materials?.find(m => 
                m.material_id.toString() === selectedMaterialId && m.category === selectedCategory
            );
            if (matPrice) {
                setVendorPrice(matPrice.price_per_kg.toString());
            } else {
                setVendorPrice('0');
            }
        } else {
            setVendorName('');
            setVendorPrice('');
        }
    };

    const getActiveMaterials = () => {
        if (selectedCategory === 'Colors') return colors;
        if (selectedCategory === 'Molds') return molds;
        if (selectedCategory === 'Packing') return packing;
        if (selectedCategory === 'Others') return others;
        return materials;
    };

    const handleCreateRequest = async () => {
        if ((!selectedMaterialId && !isNewMaterial) || !requiredQuantity || (!selectedVendorId && !isNewVendor)) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }

        const activeList = getActiveMaterials();
        const selectedMat = activeList.find(m => m.id.toString() === selectedMaterialId);
        
        if (!selectedMat && !isNewMaterial) return;

        setSubmitting(true);
        try {
            const payload = {
                material_id: isNewMaterial ? null : selectedMat?.id,
                material_name: isNewMaterial ? newMaterialName : selectedMat?.material_name,
                is_new_material: isNewMaterial,
                category: selectedCategory,
                unit: isNewMaterial ? 'kg' : (selectedMat?.unit || 'kg'),
                current_stock: isNewMaterial ? 0 : (selectedMat?.closing_stock || 0),
                requested_quantity: parseFloat(requiredQuantity),
                requested_by: username,
                vendor_id: isNewVendor ? null : parseInt(selectedVendorId),
                vendor_name: isNewVendor ? newVendorName : vendorName,
                is_new_vendor: isNewVendor,
                vendor_price: isNewVendor ? parseFloat(newVendorPrice) : parseFloat(vendorPrice),
                total_price: totalPrice
            };

            const response = await fetchWithTimeout(`${SERVER_URL}/purchase/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Alert.alert("Success", "Purchase request sent to Admin.");
                setModalVisible(false);
                setSelectedMaterialId('');
                setIsNewMaterial(false);
                setNewMaterialName('');
                setSelectedVendorId('');
                setIsNewVendor(false);
                setNewVendorName('');
                setNewVendorPrice('');
                setRequiredQuantity('');
                setVendorPrice('');
                setVendorName('');
                setTotalPrice(0);
                fetchData();
            } else {
                const err = await response.json();
                Alert.alert("Error", err.error || "Failed to create request");
            }
        } catch (error) {
            Alert.alert("Error", "Check network connection.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadInvoice = async (id: number) => {
        const url = `${SERVER_URL}/purchase/requests/${id}/invoice`;
        Linking.openURL(url);
    };

    const renderRequestItem = ({ item }: { item: PurchaseRequest }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View>
                    <Text style={styles.materialName}>{item.material_name}</Text>
                    <Text style={{ color: '#64748B', fontSize: 10 }}>{item.category || 'Materials'}</Text>
                </View>
                <View style={[styles.statusBadge, 
                    item.status === 'APPROVED_BY_ADMIN' ? styles.statusApproved : styles.statusPending
                ]}>
                    <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>
            <View style={styles.requestBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Stock:</Text>
                    <Text style={styles.infoValue}>{item.current_stock} {item.unit || 'kg'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Requested:</Text>
                    <Text style={[styles.infoValue, { color: '#E11D48', fontWeight: 'bold' }]}>{item.requested_quantity} {item.unit || 'kg'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Vendor:</Text>
                    <Text style={styles.infoValue}>{item.vendor_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Price:</Text>
                    <Text style={styles.infoValue}>₹{item.vendor_price} /{item.unit || 'kg'}</Text>
                </View>
                {item.total_price && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Price:</Text>
                        <Text style={[styles.infoValue, { color: '#10B981' }]}>₹{item.total_price}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>By:</Text>
                    <Text style={styles.infoValue}>{item.requested_by}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    {item.status === 'APPROVED_BY_ADMIN' && (
                        <TouchableOpacity 
                            style={styles.downloadBtn}
                            onPress={() => handleDownloadInvoice(item.id)}
                        >
                            <Ionicons name="download-outline" size={14} color="#10B981" />
                            <Text style={styles.downloadBtnText}>Invoice</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const selectedMaterial = getActiveMaterials().find(m => m.id.toString() === selectedMaterialId);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/phead')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#E11D48" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Purchase Request</Text>
                    <Text style={styles.subtitle}>Material Procurement</Text>
                </View>
            </View>

            <View style={styles.actionArea}>
                <TouchableOpacity 
                    style={styles.createBtn}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text style={styles.createBtnText}>Create Purchase Request</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#E11D48" /></View>
            ) : (
                <View style={{ flex: 1 }}>
                    {lowStockMaterials.length > 0 && (
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.sectionTitle}>Low Stock Materials</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                                {lowStockMaterials.map(mat => (
                                    <TouchableOpacity 
                                        key={mat.id} 
                                        style={styles.lowStockCard}
                                        onPress={() => {
                                            handleMaterialChange(mat.id.toString());
                                            setModalVisible(true);
                                        }}
                                    >
                                        <View style={styles.lowStockHeader}>
                                            <Ionicons name="warning" size={14} color="#E11D48" />
                                            <Text style={styles.lowStockTitle} numberOfLines={1}>{mat.material_name}</Text>
                                        </View>
                                        <Text style={styles.lowStockQty}>{mat.closing_stock} {mat.unit || 'kg'}</Text>
                                        <Text style={styles.lowStockHint}>Click to Request</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Recent Requests</Text>
                    <FlatList
                        data={purchaseRequests}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderRequestItem}
                        contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={() => { setRefreshing(true); fetchData(); }} 
                                tintColor="#E11D48" 
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={60} color="#1E293B" />
                                <Text style={styles.emptyText}>No recent purchase requests.</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Create Request Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Purchase Request</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} contentContainerStyle={{ paddingBottom: 100 }}>
                            <Text style={styles.label}>Select Category</Text>
                            <View style={styles.categoryTabs}>
                                {['Materials', 'Colors', 'Molds', 'Packing', 'Others'].map((cat) => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                                        onPress={() => {
                                            setSelectedCategory(cat);
                                            setSelectedMaterialId('');
                                            setVendorPrice('');
                                            setVendorName('');
                                        }}
                                    >
                                        <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Select {selectedCategory.endsWith('s') ? selectedCategory.slice(0, -1) : selectedCategory}</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedMaterialId}
                                    onValueChange={(itemValue) => handleMaterialChange(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#E11D48"
                                >
                                    <Picker.Item label={`Select ${selectedCategory.endsWith('s') ? selectedCategory.slice(0, -1) : selectedCategory}...`} value="" color="#000000" />
                                    {getActiveMaterials().map(mat => (
                                        <Picker.Item key={mat.id} label={`${mat.material_name} – ${mat.closing_stock} ${mat.unit || 'kg'}`} value={mat.id.toString()} color="#000000" />
                                    ))}
                                    {selectedCategory === 'Others' && (
                                        <Picker.Item label="+ Add New Item..." value="NEW_ITEM" color="#000000" />
                                    )}
                                </Picker>
                            </View>

                            {isNewMaterial && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.label}>New Item Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter item name..."
                                        placeholderTextColor="#94A3B8"
                                        value={newMaterialName}
                                        onChangeText={setNewMaterialName}
                                    />
                                </View>
                            )}

                            {selectedMaterial && (
                                <View style={styles.currentStockBox}>
                                    <Text style={styles.stockLabel}>Current Inventory:</Text>
                                    <Text style={styles.stockValue}>{selectedMaterial.closing_stock} {selectedMaterial.unit || 'KG'}</Text>
                                </View>
                            )}

                            <Text style={styles.label}>Vendor Name</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedVendorId}
                                    onValueChange={(itemValue) => handleVendorChange(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#E11D48"
                                >
                                    <Picker.Item label="Select a vendor..." value="" color="#000000" />
                                    {vendors.map(v => (
                                        <Picker.Item key={v.id} label={v.name} value={v.id.toString()} color="#000000" />
                                    ))}
                                    {selectedCategory === 'Others' && (
                                        <Picker.Item label="+ Add New Vendor..." value="NEW_VENDOR" color="#000000" />
                                    )}
                                </Picker>
                            </View>

                            {isNewVendor && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.label}>New Vendor Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter vendor name..."
                                        placeholderTextColor="#94A3B8"
                                        value={newVendorName}
                                        onChangeText={setNewVendorName}
                                    />
                                    <Text style={styles.label}>Price per unit (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        value={newVendorPrice}
                                        onChangeText={setNewVendorPrice}
                                    />
                                </View>
                            )}

                            <Text style={styles.label}>Quantity (in {selectedMaterial?.unit || 'kg'})</Text>
                            <View style={styles.inputWithLabel}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="0"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    value={requiredQuantity}
                                    onChangeText={setRequiredQuantity}
                                />
                                <Text style={styles.inputUnit}>{selectedMaterial?.unit || 'kg'}</Text>
                            </View>

                            <View style={styles.priceContainer}>
                                <View style={styles.priceItem}>
                                    <Text style={styles.label}>Vendor Price (per {selectedMaterial?.unit || 'kg'})</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={vendorPrice}
                                        onChangeText={setVendorPrice}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                                <View style={styles.priceItem}>
                                    <Text style={styles.label}>Total Price</Text>
                                    <Text style={[styles.priceValue, { color: '#10B981' }]}>₹{totalPrice.toFixed(2)}</Text>
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleCreateRequest}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="send" size={18} color="white" />
                                        <Text style={styles.submitBtnText}>Send Request</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#1E293B', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: '#0F172A', borderRadius: 12 },
    title: { color: 'white', fontSize: 24, fontWeight: '900' },
    subtitle: { color: '#64748B', fontSize: 13, fontWeight: 'bold' },
    actionArea: { padding: 20 },
    createBtn: { backgroundColor: '#E11D48', flexDirection: 'row', padding: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    createBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    sectionTitle: { color: '#64748B', fontSize: 14, fontWeight: '900', paddingHorizontal: 20, marginBottom: 10, letterSpacing: 1 },
    lowStockCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 12, marginRight: 10, width: 140, borderWidth: 1, borderColor: '#334155' },
    lowStockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    lowStockTitle: { color: 'white', fontSize: 13, fontWeight: 'bold', flex: 1, marginLeft: 5 },
    lowStockQty: { color: '#E11D48', fontSize: 16, fontWeight: '900' },
    lowStockHint: { color: '#475569', fontSize: 10, marginTop: 4, fontStyle: 'italic' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    requestCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    materialName: { color: 'white', fontSize: 18, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusPending: { backgroundColor: '#451a03', borderColor: '#d97706', borderWidth: 1 },
    statusApproved: { backgroundColor: '#064e3b', borderColor: '#10b981', borderWidth: 1 },
    statusText: { color: 'white', fontSize: 10, fontWeight: '900' },
    requestBody: { },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    infoLabel: { color: '#94A3B8', fontSize: 12 },
    infoValue: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    dateText: { color: '#475569', fontSize: 10 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#064e3b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#10b981' },
    downloadBtnText: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#475569', marginTop: 15, fontWeight: 'bold' },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    modalForm: { flexGrow: 0 },
    categoryTabs: { flexDirection: 'row', marginBottom: 15 },
    categoryTab: { flex: 1, paddingVertical: 10, backgroundColor: '#1E293B', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginRight: 10 },
    categoryTabActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
    categoryTabText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    categoryTabTextActive: { color: 'white' },
    label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
    pickerContainer: { backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
    picker: { color: 'white', height: 50 },
    currentStockBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#E11D48' },
    stockLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
    stockValue: { color: 'white', fontSize: 14, fontWeight: '900' },
    inputWithLabel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginTop: 5 },
    input: { backgroundColor: 'transparent', borderRadius: 12, padding: 15, color: 'white', fontSize: 16 },
    inputUnit: { color: '#64748B', paddingRight: 15, fontWeight: 'bold' },
    priceContainer: { flexDirection: 'row', marginTop: 20 },
    priceItem: { flex: 1, backgroundColor: '#1E293B', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginRight: 10 },
    priceValue: { color: 'white', fontSize: 16, fontWeight: '900', marginTop: 4 },
    priceInput: { color: 'white', fontSize: 16, fontWeight: '900', marginTop: 4, padding: 0 },
    submitBtn: { backgroundColor: '#E11D48', flexDirection: 'row', padding: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});
