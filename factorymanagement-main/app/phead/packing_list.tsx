import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Linking, Alert, RefreshControl, Modal, TextInput, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadPackingListScreen() {
  const router = useRouter();
  const { salesId } = useLocalSearchParams();
  const [packingLists, setPackingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Packing List state
  const [historyId, setHistoryId] = useState('');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const fetchPackingLists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/packing-list`);
      if (response.ok) {
        const data = await response.json();
        setPackingLists(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch PL Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const name = await AsyncStorage.getItem('username');
      setUserId(id);
      setUsername(name);
    };
    getInfo();
    fetchPackingLists();
  }, []);

  // Effect to handle passed salesId
  useEffect(() => {
    if (salesId) {
        setHistoryId(salesId as string);
        setShowCreateModal(true);
        // We need to wait a tiny bit for state to update or just call fetch directly
        handleFetchHistoryWithId(salesId as string);
    }
  }, [salesId]);

  const handleFetchHistoryWithId = async (id: string) => {
    if (!id) return;
    setFetchingData(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/sales-by-batch/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFetchedData(data);
      } else {
        Alert.alert("Error", "Invalid Sales ID");
        setFetchedData(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch sales details");
    } finally {
      setFetchingData(false);
    }
  };

  const handleFetchHistory = () => handleFetchHistoryWithId(historyId);

  const handleSubmitPackingList = async () => {
    if (!fetchedData) return;
    try {
      const response = await fetch(`${SERVER_URL}/packing/packing-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_number: null,
          sales_history_id: fetchedData.id,
          is_history: fetchedData.is_history, // Pass if it was already history or request
          customer_id: fetchedData.customer_id,
          customer_name: fetchedData.customer_name,
          items: fetchedData.items,
          created_by: userId,
          prod_head_name: username
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Packing List Created");
        setShowCreateModal(false);
        setHistoryId('');
        setFetchedData(null);
        fetchPackingLists();
      } else {
        Alert.alert("Error", "Failed to create packing list");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  const handleDownload = (pdfUrl: string) => {
    if (!pdfUrl) return;
    const url = `${SERVER_URL}${pdfUrl}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open download link.");
    });
  };

  const renderPackingList = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.batchNum}>PL #{item.id}</Text>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.summaryText}>{item.items_summary}</Text>
        <Text style={styles.dateText}>Created: {new Date(item.created_at).toLocaleDateString()} by {item.created_by_name}</Text>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.pdf_url)}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>PDF</Text>
        </TouchableOpacity>
        <View style={[styles.statusBadge, item.status === 'Dispatched' && { backgroundColor: '#10B981' }]}>
            <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/phead')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>PACKING LISTS</Text>
          <Text style={styles.subtitle}>Production Head Panel</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={packingLists}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPackingList}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPackingLists(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No packing lists found.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={showCreateModal} animationType="slide" transparent={true} onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE PACKING LIST</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Sales History ID</Text>
              <View style={styles.inputRow}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Enter Sales History ID" 
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={historyId}
                  onChangeText={setHistoryId}
                  onBlur={handleFetchHistory}
                />
                <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchHistory}>
                  {fetchingData ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.fetchBtnText}>FETCH</Text>}
                </TouchableOpacity>
              </View>

              {fetchedData && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailLabel}>Customer:</Text>
                  <Text style={styles.detailValue}>{fetchedData.customer_name}</Text>
                  
                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Products:</Text>
                  {fetchedData.items.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <Text style={styles.itemQty}>{item.quantity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, !fetchedData && { opacity: 0.5 }]} 
              disabled={!fetchedData}
              onPress={handleSubmitPackingList}
            >
              <Text style={styles.submitBtnText}>CREATE PACKING LIST</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { color: 'white', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  createBtn: { backgroundColor: '#10B981', padding: 8, borderRadius: 10 },
  content: { flex: 1 },
  list: { padding: 12 },
  card: { backgroundColor: '#1E293B', padding: 12, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  batchNum: { color: '#10B981', fontSize: 12, fontWeight: '900', marginBottom: 2 },
  customerName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  summaryText: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  dateText: { color: '#64748B', fontSize: 9, marginTop: 6 },
  cardRight: { alignItems: 'flex-end' },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  downloadBtnText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginLeft: 4 },
  statusBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  statusText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#64748B' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalBody: { flex: 1 },
  label: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  fetchBtn: { backgroundColor: '#10B981', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 10, marginLeft: 10 },
  fetchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  detailsBox: { backgroundColor: '#0F172A', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  detailLabel: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  itemName: { color: '#94A3B8', fontSize: 13 },
  itemQty: { color: '#10B981', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15, marginBottom: 10 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});
