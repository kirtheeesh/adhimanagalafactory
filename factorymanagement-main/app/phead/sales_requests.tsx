import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadSalesRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Detail Modal state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests`);
      if (response.ok) {
        const data = await response.json();
        // Show only approved requests that need packing list? 
        // Or all? User said "after approval make to show in the phead"
        const approved = data.filter((r: any) => r.status === 'Approved');
        setRequests(approved);
      }
    } catch (error) {
      console.error("Fetch Sales Requests Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDetail = async (id: number) => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRequest(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch details");
    }
  };

  const handleCreatePackingList = () => {
    setShowDetailModal(false);
    // Navigate to packing list screen and pass the ID
    router.push({
        pathname: '/phead/packing_list',
        params: { salesId: selectedRequest.id }
    });
  };

  const renderRequest = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenDetail(item.id)}>
      <View style={styles.cardInfo}>
        <Text style={styles.salesId}>SALES ID: #{item.id}</Text>
        <Text style={styles.customerName}>{item.customer_name || item.customer_name_manual}</Text>
        <Text style={styles.dateText}>Approved on {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardRight}>
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/phead')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>SALES ORDERS</Text>
          <Text style={styles.subtitle}>Approved & Waiting for Packing</Text>
        </View>
        <TouchableOpacity onPress={fetchRequests}>
          <Ionicons name="refresh" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item, index) => item.id?.toString() || `order-${index}`}
            renderItem={renderRequest}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No approved sales requests found.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={showDetailModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ORDER DETAILS</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sales ID:</Text>
                    <Text style={styles.detailValue}>#{selectedRequest.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.customer_name || selectedRequest.customer_name_manual}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>PRODUCTS TO PACK:</Text>
                  {selectedRequest.items?.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <Text style={styles.itemQty}>{item.quantity} PCS</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.createPlBtn} onPress={handleCreatePackingList}>
              <Text style={styles.createPlBtnText}>CREATE PACKING LIST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PHeadFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  list: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  salesId: { color: '#10B981', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  customerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dateText: { color: '#64748B', fontSize: 11, marginTop: 6 },
  cardRight: { paddingLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  modalBody: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { color: '#94A3B8', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  itemName: { color: '#F1F5F9', fontSize: 14 },
  itemQty: { color: '#10B981', fontWeight: 'bold' },
  createPlBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  createPlBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});
