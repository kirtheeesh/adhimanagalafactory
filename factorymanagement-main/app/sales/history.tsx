import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Linking, Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';
import PHeadFooter from '@shared/components/PHeadFooter';
import AccountsFooter from '@shared/components/AccountsFooter';

export default function SalesHistoryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/invoices`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Fetch History Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownload = (id: number) => {
    const url = `${SERVER_URL}/sales/invoices/${id}/pdf?isAdmin=true`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open download link.");
    });
  };

  const renderInvoice = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.batchNum}>{item.invoice_number || `ID: ${item.id}`}</Text>
        <Text style={styles.customerName}>{item.customer_name || item.customer_name_manual}</Text>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.id)}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (pathname.startsWith('/phead')) return <PHeadFooter />;
    if (pathname.startsWith('/sales')) return <SalesFooter />;
    if (pathname.startsWith('/accounts')) return <AccountsFooter />;
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>SALES HISTORY</Text>
          <Text style={styles.subtitle}>Invoiced Orders</Text>
        </View>
        <TouchableOpacity onPress={fetchInvoices}>
          <Ionicons name="refresh" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item, index) => item.id?.toString() || `hist-${index}`}
            renderItem={renderInvoice}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInvoices(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sales history found.</Text>
              </View>
            }
          />
        )}
      </View>
      {renderFooter()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  list: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  batchNum: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 4 },
  customerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dateText: { color: '#64748B', fontSize: 12, marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  amount: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  downloadBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' },
});
