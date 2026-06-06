import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList, StatusBar, StyleSheet, Text, 
    TouchableOpacity, View, ActivityIndicator, RefreshControl, 
    ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import PackingFooter from '@shared/components/PackingFooter';

interface InventoryItem {
    id: number;
    display_name: string;
    stock_qty: number;
    unit?: string;
    opening_stock?: number;
    used_stock?: number;
    minimum_stock_level?: number;
    stock_boxes?: number;
    box_count?: number;
    pieces_per_box?: number;
    unit_weight_gm?: number;
    [key: string]: any;
}

type Category = 'Base Products' | 'Finished Goods';

export default function PackingInventoryScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Category>('Base Products');
    const [data, setData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const endpointMap: Record<Category, string> = {
        'Base Products': '/packing/inventory/product-stock',
        'Finished Goods': '/packing/inventory/finished-stock'
    };

    const fetchInventory = async (category: Category) => {
        setLoading(true);
        try {
            const response = await fetchWithTimeout(`${SERVER_URL}${endpointMap[category]}`, {}, 8000);
            if (response.ok) {
                const json = await response.json();
                let processedData = Array.isArray(json) ? json : [];
                
                if (category === 'Finished Goods') {
                    // Group by display_name
                    const grouped: Record<string, InventoryItem> = {};
                    processedData.forEach((item: any) => {
                        const name = item.display_name;
                        if (!grouped[name]) {
                            grouped[name] = {
                                ...item,
                                stock_qty: 0,
                                stock_boxes: 0,
                                batches: []
                            };
                        }
                        grouped[name].stock_qty += Number(item.stock_qty || 0);
                        grouped[name].stock_boxes += Number(item.stock_boxes || 0);
                        grouped[name].batches.push({
                            batch_number: item.batch_number || 'N/A',
                            total_pieces: item.stock_qty,
                            stock_boxes: item.stock_boxes
                        });
                    });
                    processedData = Object.values(grouped);
                }

                setData(processedData);
            } else {
                Alert.alert("Error", "Failed to fetch inventory data.");
            }
        } catch (error) {
            console.error("Fetch Inventory Error:", error);
            Alert.alert("Error", "Check server connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { 
        fetchInventory(activeTab); 
    }, [activeTab]);

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const isLow = item.minimum_stock_level !== undefined && 
                     (Number(item.stock_qty) <= Number(item.minimum_stock_level));

        if (activeTab === 'Finished Goods') {
            return (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.display_name}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isLow ? '#450a0a' : '#064e3b' }]}>
                            <View style={[styles.dot, { backgroundColor: isLow ? '#ef4444' : '#10b981' }]} />
                            <Text style={[styles.statusText, { color: isLow ? '#f87171' : '#34d399' }]}>
                                {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>TOTAL BOXES</Text>
                                <Text style={[styles.infoValue, { color: '#10B981' }]}>{item.stock_boxes ?? '0'}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>UNIT WEIGHT</Text>
                                <Text style={styles.infoValue}>{item.unit_weight_gm ?? '0'}g</Text>
                            </View>
                        </View>
                        <View style={[styles.balancePlate, isLow && styles.lowStockPlate]}>
                            <Text style={styles.balanceLabel}>TOTAL PIECES</Text>
                            <View style={styles.balanceRow}>
                                <Text style={[styles.balanceNumber, isLow && { color: '#ef4444' }]}>
                                    {item.stock_qty ?? 0}
                                </Text>
                                <Text style={styles.balanceUnit}>{item.unit || 'PCS'}</Text>
                            </View>
                        </View>
                    </View>

                    {item.batches && item.batches.length > 0 && (
                        <View style={styles.batchContainer}>
                            <Text style={styles.batchHeader}>Active Batches</Text>
                            {item.batches.map((batch: any, idx: number) => (
                                <View key={idx} style={styles.batchRow}>
                                    <Text style={styles.batchId}>Batch No: {batch.batch_number}</Text>
                                    <Text style={styles.batchInfo}>{batch.total_pieces} pcs | {batch.stock_boxes} box</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            );
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.display_name}</Text>
                        <Text style={styles.itemId}>REF: #{item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isLow ? '#450a0a' : '#064e3b' }]}>
                        <View style={[styles.dot, { backgroundColor: isLow ? '#ef4444' : '#10b981' }]} />
                        <Text style={[styles.statusText, { color: isLow ? '#f87171' : '#34d399' }]}>
                            {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>OPENING</Text>
                            <Text style={styles.infoValue}>{item.opening_stock ?? '0'}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>USED</Text>
                            <Text style={styles.infoValue}>{item.used_stock ?? '0'}</Text>
                        </View>
                    </View>
                    <View style={[styles.balancePlate, isLow && styles.lowStockPlate]}>
                        <Text style={styles.balanceLabel}>BOX COUNT</Text>
                        <View style={styles.balanceRow}>
                            <Text style={[styles.balanceNumber, isLow && { color: '#ef4444' }]}>
                                {item.box_count ?? 0}
                            </Text>
                            <Text style={styles.balanceUnit}>BOX</Text>
                        </View>
                        <Text style={styles.smallStockText}>{item.stock_qty ?? 0} PCS</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.headerArea}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#10B981" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Packing Inventory</Text>
                        <Text style={styles.subtitle}>{activeTab} Status</Text>
                    </View>
                    <TouchableOpacity onPress={() => fetchInventory(activeTab)} style={styles.refreshBtn}>
                        <Ionicons name="refresh" size={24} color="#10B981" />
                    </TouchableOpacity>
                </View>

                <View style={styles.navContainer}>
                    <View style={styles.navRow}>
                        {['Base Products', 'Finished Goods'].map((cat) => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.navItem, activeTab === cat && styles.navItemActive]}
                                onPress={() => setActiveTab(cat as Category)}
                            >
                                <Text style={[styles.navText, activeTab === cat && styles.navTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => item.id?.toString() || `inv-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInventory(activeTab); }} tintColor="#10B981" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No inventory found.</Text>
                        </View>
                    }
                />
            )}

            <PackingFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerArea: { backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    title: { color: 'white', fontSize: 22, fontWeight: '900' },
    subtitle: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
    refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navContainer: { paddingBottom: 15, paddingHorizontal: 20 },
    navRow: { flexDirection: 'row' },
    navItem: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#0F172A', alignItems: 'center', marginRight: 10 },
    navItemActive: { backgroundColor: '#10B981' },
    navText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
    navTextActive: { color: '#fff' },
    listContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 },
    card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    itemName: { color: 'white', fontSize: 16, fontWeight: '900', flex: 1, marginRight: 10 },
    itemId: { color: '#10B981', fontSize: 10, fontWeight: '900' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 8, fontWeight: '900' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    infoGrid: { flexDirection: 'row', flex: 1 },
    infoBox: { marginRight: 20 },
    infoLabel: { color: '#64748B', fontSize: 8, fontWeight: '900', marginBottom: 4 },
    infoValue: { color: '#F1F5F9', fontSize: 14, fontWeight: '900' },
    balancePlate: { backgroundColor: '#0F172A', padding: 10, borderRadius: 12, alignItems: 'flex-end', minWidth: 100 },
    lowStockPlate: { borderColor: '#ef4444', borderWidth: 1 },
    balanceLabel: { color: '#64748B', fontSize: 8, fontWeight: '900', marginBottom: 2 },
    balanceRow: { flexDirection: 'row', alignItems: 'baseline' },
    balanceNumber: { color: '#10B981', fontSize: 18, fontWeight: '900', marginRight: 4 },
    balanceUnit: { color: '#64748B', fontSize: 10, fontWeight: '700' },
    smallStockText: { color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 2 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#64748B', fontSize: 14, fontWeight: 'bold' },
    batchContainer: { 
        marginTop: 15, 
        paddingTop: 15, 
        borderTopWidth: 1, 
        borderTopColor: '#334155',
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 12
    },
    batchHeader: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
    batchRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 6,
        paddingBottom: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#1E293B'
    },
    batchId: { color: '#CBD5E1', fontSize: 11, fontWeight: '700' },
    batchInfo: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
});
