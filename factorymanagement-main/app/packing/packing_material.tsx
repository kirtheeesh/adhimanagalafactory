import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl, Modal, TextInput, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PackingFooter from '@shared/components/PackingFooter';

export default function PackingMaterialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Usage Reports'>('Inventory');
  const [materials, setMaterials] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [batchNumber, setBatchNumber] = useState('');

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
      fetchData();
    };
    init();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Inventory') {
        const response = await fetch(`${SERVER_URL}/packing/materials`);
        if (response.ok) setMaterials(await response.json());
      } else {
        const response = await fetch(`${SERVER_URL}/packing/material-reports`);
        if (response.ok) setReports(await response.json());
      }
    } catch (error) {
      console.error("Fetch Data Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSubmitReport = async () => {
    if (!selectedMaterialId || !quantity) {
      Alert.alert("Required", "Please select material and enter quantity");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/material-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          created_by: userId,
          batch_number: batchNumber || 'MANUAL',
          items: [{ packing_material_id: parseInt(selectedMaterialId), quantity: parseFloat(quantity) }]
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Usage report created and sent for approval");
        setShowAddModal(false);
        resetForm();
        setActiveTab('Usage Reports');
        fetchData();
      } else {
        Alert.alert("Error", "Failed to create report");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMaterialId('');
    setQuantity('1');
    setBatchNumber('');
  };

  const renderInventoryCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName}>{item.item_name}</Text>
        <Text style={styles.stockText}>{item.stock_qty_pcs} PCS</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(100, (item.stock_qty_pcs / 1000) * 100)}%` }]} />
      </View>
    </View>
  );

  const renderReportCard = ({ item }: { item: any }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportBatch}>{item.batch_number || 'MANUAL'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.reportItems}>
        {item.items.map((i: any, idx: number) => (
          <Text key={idx} style={styles.reportItemText}>
            • {i.item_name}: {i.quantity}
          </Text>
        ))}
      </View>
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={styles.reportCreator}>By: {item.creator_name}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      case 'Dispatched': return '#3B82F6';
      default: return '#64748B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>PACKING MATERIAL</Text>
          <Text style={styles.subtitle}>{activeTab}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Inventory' && styles.activeTab]} 
          onPress={() => setActiveTab('Inventory')}
        >
          <Text style={[styles.tabText, activeTab === 'Inventory' && styles.activeTabText]}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Usage Reports' && styles.activeTab]} 
          onPress={() => setActiveTab('Usage Reports')}
        >
          <Text style={[styles.tabText, activeTab === 'Usage Reports' && styles.activeTabText]}>Usage History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={activeTab === 'Inventory' ? materials : reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={activeTab === 'Inventory' ? renderInventoryCard : renderReportCard}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data found.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REPORT USED MATERIAL</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>SELECT MATERIAL</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedMaterialId}
                    onValueChange={setSelectedMaterialId}
                    style={styles.picker}
                    dropdownIconColor="#10B981"
                  >
                    <Picker.Item label="-- Choose Material --" value="" color="#000000" />
                    {materials.map((m) => (
                      <Picker.Item key={m.id} label={`${m.item_name} (Stock: ${m.stock_qty_pcs})`} value={m.id.toString()} color="#000000" />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>QUANTITY USED</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>BATCH NUMBER (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 260400004"
                  placeholderTextColor="#64748B"
                  value={batchNumber}
                  onChangeText={setBatchNumber}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleSubmitReport}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>SEND FOR APPROVAL</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PackingFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 12, padding: 5, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#10B981' },
  tabText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  list: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#1E293B', padding: 20, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: '900' },
  stockText: { color: '#10B981', fontSize: 14, fontWeight: '900' },
  progressBarContainer: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10B981' },
  reportCard: { backgroundColor: '#1E293B', padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reportBatch: { color: '#10B981', fontSize: 14, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  reportItems: { marginBottom: 12 },
  reportItemText: { color: '#CBD5E1', fontSize: 13, marginTop: 4 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  reportDate: { color: '#64748B', fontSize: 10 },
  reportCreator: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  form: { flex: 1 },
  field: { marginBottom: 20 },
  label: { color: '#64748B', fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  picker: { height: 55, color: '#000000' },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
