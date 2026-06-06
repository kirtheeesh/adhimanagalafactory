import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Linking, Modal,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

interface ApprovedRequest {
  id: number;
  material_id: number;
  material_name: string;
  requested_quantity: number;
  current_stock: number;
}

interface PurchaseOrder {
  id: number;
  material_name: string;
  vendor_name: string;
  price: number;
  purchased_quantity: number;
  status: string;
  created_at: string;
}

export default function Purchase() {
  const router = useRouter();
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [vendorName, setVendorName] = useState('');
  const [price, setPrice] = useState('');
  const [username, setUsername] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, pendRes, histRes, storedUser] = await Promise.all([
        fetch(`${SERVER_URL}/purchase-requests`), // Fetch ALL requests (pending + approved)
        fetch(`${SERVER_URL}/purchase-orders/pending`),
        fetch(`${SERVER_URL}/purchase-orders/history`),
        AsyncStorage.getItem('username')
      ]);
      
      const allReqData = await reqRes.json();
      const pendData = await pendRes.json();
      const histData = await histRes.json();
      
      // Keep only approved requests for the "Create Purchase" dropdown
      const approvedOnly = Array.isArray(allReqData) ? allReqData.filter((r: any) => r.status === 'APPROVED_BY_ADMIN') : [];
      setApprovedRequests(approvedOnly);
      
      // Combine all items for history view
      const allItems = [
        ...(Array.isArray(allReqData) ? allReqData.map((r: any) => ({ ...r, isRequest: true })) : []),
        ...(Array.isArray(pendData) ? pendData : []), 
        ...(Array.isArray(histData) ? histData : [])
      ];
      
      const sortedItems = allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPurchaseHistory(sortedItems);
      
      setUsername(storedUser || 'Accounts');
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async () => {
    if (!selectedRequestId || !vendorName || !price) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const selectedReq = approvedRequests.find(r => r.id.toString() === selectedRequestId);
    if (!selectedReq) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedReq.id,
          material_id: selectedReq.material_id,
          material_name: selectedReq.material_name,
          requested_quantity: selectedReq.requested_quantity,
          purchased_quantity: selectedReq.requested_quantity, // Default to requested
          vendor_name: vendorName,
          price: parseFloat(price),
          created_by: username
        })
      });

      if (response.ok) {
        Alert.alert(
          "Success", 
          "Purchase Order created. Awaiting Admin final approval."
        );
        setModalVisible(false);
        setVendorName('');
        setPrice('');
        setSelectedRequestId('');
        fetchData();
      } else {
        Alert.alert("Error", "Failed to create order.");
      }
    } catch (error) {
      Alert.alert("Error", "Check network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = (id: number) => {
    const downloadUrl = `${SERVER_URL}/purchase/orders/${id}/pdf?isAdmin=true`;
    Linking.openURL(downloadUrl).catch(() => {
      Alert.alert("Error", "Could not open download link.");
    });
  };

  const selectedReq = approvedRequests.find(r => r.id.toString() === selectedRequestId);

  const renderOrderRow = ({ item }: { item: any }) => {
    const isRequest = item.isRequest === true;
    let statusText = '';
    let badgeStyle = styles.statusPending;

    if (isRequest) {
      statusText = item.status === 'APPROVED_BY_ADMIN' ? 'APPROVED REQUEST' : 'PENDING ADMIN APPROVAL';
      badgeStyle = item.status === 'APPROVED_BY_ADMIN' ? styles.statusApproved : styles.statusPending;
    } else {
      statusText = item.status === 'APPROVED_BY_ADMIN' ? 'APPROVED ORDER' : 'PENDING ADMIN PURCHASE';
      badgeStyle = item.status === 'APPROVED_BY_ADMIN' ? styles.statusApproved : styles.statusPending;
    }

    return (
      <View style={styles.orderRow}>
        <View style={{ flex: 2 }}>
          <Text style={styles.materialText}>{item.material_name}</Text>
          <Text style={styles.vendorText}>{isRequest ? `Req by: ${item.requested_by}` : `Vendor: ${item.vendor_name}`}</Text>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
          <Text style={styles.priceText}>{isRequest ? `Qty: ${item.requested_quantity}` : `₹${item.price}`}</Text>
          <View style={[styles.statusBadge, badgeStyle]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        {!isRequest && (
          <TouchableOpacity style={styles.pdfBtn} onPress={() => handleDownloadPDF(item.id)}>
            <Ionicons name="document-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PURCHASE MODULE</Text>
          <Text style={styles.subtitle}>Manage Stock Procurement</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Purchase</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Procurement Orders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={purchaseHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderRow}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No purchase orders found.</Text>
              </View>
            }
            refreshControl={
                <ActivityIndicator animating={false} /> 
            }
            onRefresh={fetchData}
            refreshing={false}
          />
        )}
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Purchase Order</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 150 }}>
              <Text style={styles.label}>Select Approved Request</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedRequestId}
                  onValueChange={(val) => setSelectedRequestId(val)}
                  style={styles.picker}
                  dropdownIconColor="#000000"
                >
                  <Picker.Item label="Select material..." value="" color="#000000" />
                  {approvedRequests.map(req => (
                    <Picker.Item key={req.id} label={`${req.material_name} (Req: ${req.requested_quantity})`} value={req.id.toString()} color="#000000" />
                  ))}
                </Picker>
              </View>

              {selectedReq && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>Current Stock: {selectedReq.current_stock}</Text>
                  <Text style={styles.infoText}>Requested Qty: {selectedReq.requested_quantity}</Text>
                </View>
              )}

              <Text style={styles.label}>Vendor Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Type vendor name"
                placeholderTextColor="#94A3B8"
                value={vendorName}
                onChangeText={setVendorName}
              />

              <Text style={styles.label}>Total Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter total amount"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreateOrder}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Order</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AccountsFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, marginTop: 5 },
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  content: { flex: 1, paddingHorizontal: 15 },
  sectionTitle: { color: '#64748B', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  listContent: { paddingBottom: 100 },
  orderRow: { backgroundColor: '#1E293B', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  materialText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  vendorText: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  dateText: { color: '#475569', fontSize: 9, marginTop: 3 },
  priceText: { color: '#10B981', fontSize: 14, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusPending: { backgroundColor: '#451a03' },
  statusApproved: { backgroundColor: '#064e3b' },
  statusText: { color: 'white', fontSize: 7, fontWeight: 'bold' },
  pdfBtn: { backgroundColor: '#334155', padding: 8, borderRadius: 8, marginLeft: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { flexGrow: 0 },
  label: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  picker: { color: '#000000', height: 45 },
  infoBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  infoText: { color: '#94A3B8', fontSize: 11, marginBottom: 2 },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: 'white', fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }
});
