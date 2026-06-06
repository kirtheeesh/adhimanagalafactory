import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, Platform, RefreshControl,
    StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import PHeadFooter from '@shared/components/PHeadFooter';

interface PurchaseInvoice {
    id: number;
    material_name: string;
    requested_quantity: number;
    vendor_name: string;
    vendor_price: number;
    total_price: number;
    requested_by: string;
    status: string;
    created_at: string;
}

export default function PurchaseHistoryScreen() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/purchase/requests`);
            const data = await res.json();
            // Filter only approved/completed requests for history
            const historyData = Array.isArray(data) 
                ? data.filter((item: any) => item.status === 'APPROVED_BY_ADMIN' || item.status === 'COMPLETED')
                : [];
            setInvoices(historyData);
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

    const handleDownloadInvoice = (id: number) => {
        const url = `${SERVER_URL}/purchase/requests/${id}/invoice`;
        Linking.openURL(url);
    };

    const renderInvoiceItem = ({ item }: { item: PurchaseInvoice }) => (
        <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
                <View>
                    <Text style={styles.materialName}>{item.material_name}</Text>
                    <Text style={styles.invoiceId}>PI-#{item.id}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadInvoice(item.id)}
                >
                    <Ionicons name="download-outline" size={18} color="white" />
                    <Text style={styles.downloadText}>PDF</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.invoiceBody}>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Quantity</Text>
                        <Text style={styles.value}>{item.requested_quantity} kg</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Price/kg</Text>
                        <Text style={styles.value}>₹{item.vendor_price}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Total</Text>
                        <Text style={[styles.value, { color: '#10B981' }]}>₹{item.total_price || (item.requested_quantity * item.vendor_price)}</Text>
                    </View>
                </View>
                
                <View style={styles.footer}>
                    <View style={styles.vendorBox}>
                        <Ionicons name="business" size={12} color="#64748B" />
                        <Text style={styles.vendorName}>{item.vendor_name}</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/phead')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#10B981" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Purchase History</Text>
                    <Text style={styles.subtitle}>Verified Procurement Invoices</Text>
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInvoiceItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#10B981" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={60} color="#1E293B" />
                            <Text style={styles.emptyText}>No purchase invoices found.</Text>
                        </View>
                    }
                />
            )}
            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#1E293B', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 10 },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: '#0F172A', borderRadius: 12 },
    title: { color: 'white', fontSize: 24, fontWeight: '900' },
    subtitle: { color: '#64748B', fontSize: 13, fontWeight: 'bold' },
    listContainer: { padding: 20 },
    invoiceCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    materialName: { color: 'white', fontSize: 18, fontWeight: '800' },
    invoiceId: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
    downloadBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    downloadText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
    invoiceBody: { },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    col: { },
    label: { color: '#64748B', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    value: { color: 'white', fontSize: 14, fontWeight: '900' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
    vendorBox: { flexDirection: 'row', alignItems: 'center' },
    vendorName: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
    dateText: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#475569', marginTop: 15, fontWeight: 'bold' }
});
