import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function AdminSalesApprovals() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests`);
      if (response.ok) {
        const data = await response.json();
        // Filter for Pending only or show all? 
        // Requirement says "show a table/list of all sales requests" in Sales section.
        // For Admin section, let's show all but highlight pending.
        setRequests(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const renderRequest = ({ item }: { item: any }) => {
    const isPending = item.status === 'Pending approval';
    return (
      <TouchableOpacity 
        style={[styles.card, isPending && styles.pendingCard]} 
        onPress={() => router.push({ pathname: '/sales/request_detail', params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.batchNum}>SALES ID: #{item.id}</Text>
          <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.otherBadge]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.customerName}>{item.customer_name || item.customer_name_manual}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        {isPending && (
          <View style={styles.actionPrompt}>
            <Text style={styles.actionPromptText}>Action Required</Text>
            <Ionicons name="chevron-forward" size={16} color="#10B981" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/sales')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>ADMIN PANEL</Text>
          <Text style={styles.subtitle}>Sales Request Approvals</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item, index) => item.id?.toString() || `approval-${index}`}
            renderItem={renderRequest}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No requests to display.</Text>
              </View>
            }
          />
        )}
      </View>
      <SalesFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 12, marginRight: 15 },
  title: { color: 'white', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  list: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  pendingCard: { borderColor: '#10B981', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  batchNum: { color: '#10B981', fontSize: 12, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  otherBadge: { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
  statusText: { color: '#F59E0B', fontSize: 9, fontWeight: '900' },
  customerName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { color: '#fff', fontSize: 16, fontWeight: '900' },
  dateText: { color: '#64748B', fontSize: 12 },
  actionPrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 },
  actionPromptText: { color: '#10B981', fontSize: 11, fontWeight: 'bold', marginRight: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' },
});
