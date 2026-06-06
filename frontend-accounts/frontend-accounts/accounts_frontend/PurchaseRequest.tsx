import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

interface PurchaseRequest {
  id: number;
  material_name: string;
  current_stock: number;
  requested_quantity: number;
  requested_by: string;
  vendor_price: number;
  vendor_name: string;
  status: string;
  created_at: string;
}

export default function PurchaseRequest() {
  const router = useRouter();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/purchase-requests`);
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
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

  const renderRequestItem = ({ item }: { item: PurchaseRequest }) => {
    const isApproved = item.status === 'APPROVED_BY_ADMIN';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.materialName}>{item.material_name}</Text>
          <View style={[styles.statusBadge, isApproved ? styles.statusApproved : styles.statusPending]}>
            <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requested Qty:</Text>
            <Text style={styles.infoValue}>{item.requested_quantity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vendor:</Text>
            <Text style={styles.infoValue}>{item.vendor_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price:</Text>
            <Text style={styles.infoValue}>₹{item.vendor_price}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>By:</Text>
            <Text style={styles.infoValue}>{item.requested_by}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.replace('/accounts/ledger')} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>PURCHASE REQUESTS</Text>
            <Text style={styles.subtitle}>Material Procurement Requisitions</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRequestItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={60} color="#1E293B" />
                <Text style={styles.emptyText}>No purchase requests found.</Text>
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
  header: { padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 15 },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: '#1E293B', borderRadius: 15, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  materialName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPending: { backgroundColor: '#451a03', borderColor: '#d97706', borderWidth: 1 },
  statusApproved: { backgroundColor: '#064e3b', borderColor: '#10b981', borderWidth: 1 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardBody: { },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoLabel: { color: '#94A3B8', fontSize: 12 },
  infoValue: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  dateText: { color: '#475569', fontSize: 10, textAlign: 'right', marginTop: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#475569', fontWeight: 'bold', marginTop: 10 }
});
