import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Linking,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

interface PurchaseOrder {
  id: number;
  material_name: string;
  vendor_name: string;
  price: number;
  purchased_quantity: number;
  status: string;
  created_at: string;
}

export default function PurchaseHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/purchase-orders/history`);
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDownloadPDF = (id: number) => {
    const downloadUrl = `${SERVER_URL}/purchase/orders/${id}/pdf?isAdmin=true`;
    Linking.openURL(downloadUrl).catch(() => {
      console.error("Could not open download link.");
    });
  };

  const renderOrderRow = ({ item }: { item: PurchaseOrder }) => {
    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={styles.materialName}>{item.material_name}</Text>
            <Text style={styles.invoiceId}>PO-#{item.id}</Text>
          </View>
          <TouchableOpacity 
            style={styles.downloadBtn}
            onPress={() => handleDownloadPDF(item.id)}
          >
            <Ionicons name="download-outline" size={18} color="white" />
            <Text style={styles.downloadText}>PDF</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.invoiceBody}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.value}>{item.purchased_quantity} kg</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={[styles.value, { color: '#10B981' }]}>₹{item.price}</Text>
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <TouchableOpacity onPress={() => router.replace('/accounts/ledger')} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>PURCHASE HISTORY</Text>
            <Text style={styles.subtitle}>Historical Procurement Records</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderRow}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="archive-outline" size={60} color="#1E293B" />
                <Text style={styles.emptyText}>No purchase history found.</Text>
              </View>
            }
          />
        )}
      </View>

      <AccountsFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, marginTop: 20, backgroundColor: '#1E293B', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 10 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 15 },
  listContent: { paddingBottom: 20, paddingTop: 10 },
  invoiceCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  materialName: { color: 'white', fontSize: 18, fontWeight: '800' },
  invoiceId: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  downloadBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  downloadText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  invoiceBody: { },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { },
  label: { color: '#64748B', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  value: { color: 'white', fontSize: 14, fontWeight: '900' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  vendorBox: { flexDirection: 'row', alignItems: 'center' },
  vendorName: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  dateText: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#475569', fontWeight: 'bold', marginTop: 10 }
});
