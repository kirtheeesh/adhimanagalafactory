import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Linking, Alert, RefreshControl, Modal, TextInput, ScrollView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PackingFooter from '@shared/components/PackingFooter';

export default function PackingPackingListScreen() {
  const router = useRouter();
  const [packingLists, setPackingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Detail Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);

  // Material Modal state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [packingMaterials, setPackingMaterials] = useState<any[]>([]);
  const [usedMaterials, setUsedMaterials] = useState<any[]>([{ packing_material_id: '', quantity: '' }]);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  // Shift Over Modal state
  const [showShiftOverModal, setShowShiftOverModal] = useState(false);
  const [shiftOverMaterials, setShiftOverMaterials] = useState<any[]>([{ packing_material_id: '', quantity: '', unit: 'PCS' }]);
  const [selectedShift, setSelectedShift] = useState('Day');
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
    };
    getUserId();
    fetchPackingLists();
    fetchPackingMaterials();
  }, []);

  const fetchPackingLists = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/packing/packing-list`);
      if (response.ok) {
        const data = await response.json();
        setPackingLists(data);
      }
    } catch (error) {
      console.error("Fetch Packing Lists Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPackingMaterials = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/packing/materials`);
      if (response.ok) {
        const data = await response.json();
        setPackingMaterials(data);
      }
    } catch (error) {
      console.error("Fetch Materials Error:", error);
    }
  };

  const handleRegeneratePDF = async (id: number) => {
    try {
      const response = await fetch(`${SERVER_URL}/packing/regenerate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        const data = await response.json();
        const url = `${SERVER_URL}${data.pdf_url}`;
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not regenerate PDF.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error while regenerating PDF.");
    }
  };

  const handleDownload = (pdfUrl: string, id: number) => {
    if (!pdfUrl) return;
    const url = `${SERVER_URL}${pdfUrl}`;
    
    // Check if file exists first or just try to open and handle error
    // In React Native, we can't easily check if a remote URL is 404 without a fetch
    fetch(url, { method: 'HEAD' }).then(res => {
      if (res.status === 404) {
        Alert.alert(
          "PDF Not Found",
          "The PDF file is missing on the server. Would you like to regenerate it?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Regenerate", onPress: () => handleRegeneratePDF(id) }
          ]
        );
      } else {
        Linking.openURL(url).catch(() => {
          Alert.alert("Error", "Could not open download link.");
        });
      }
    }).catch(() => {
        // Fallback to trying to open directly
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open download link.");
        });
    });
  };

  const handleOpenDetail = async (item: any) => {
    // Fetch full items for detail
    try {
        const response = await fetch(`${SERVER_URL}/packing/sales-by-batch/${item.sales_history_id}`);
        if (response.ok) {
            const data = await response.json();
            setSelectedList({ ...item, items: data.items });
            setShowDetailModal(true);
        }
    } catch (error) {
        Alert.alert("Error", "Could not fetch details");
    }
  };

  const handleOpenMaterialModal = (item: any) => {
    setSelectedList(item);
    setUsedMaterials([{ packing_material_id: '', quantity: '' }]);
    setShowMaterialModal(true);
  };

  const handleAddMaterialRow = () => {
    setUsedMaterials([...usedMaterials, { packing_material_id: '', quantity: '' }]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    const updated = [...usedMaterials];
    updated.splice(index, 1);
    setUsedMaterials(updated);
  };

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const updated = [...usedMaterials];
    updated[index][field] = value;
    setUsedMaterials(updated);
  };

  const handleSubmitMaterialReport = async () => {
    // Validate
    const isValid = usedMaterials.every(m => m.packing_material_id && m.quantity);
    if (!isValid) {
      Alert.alert("Required", "Please fill all material fields");
      return;
    }

    setSubmittingMaterial(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/material-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packing_list_id: selectedList.id,
          batch_number: selectedList.batch_number,
          created_by: userId,
          items: usedMaterials
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Material Report Submitted for Approval");
        setShowMaterialModal(false);
        fetchPackingLists();
      } else {
        Alert.alert("Error", "Failed to submit report");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#64748B';
    }
  };

  const handleAddShiftOverMaterialRow = () => {
    setShiftOverMaterials([...shiftOverMaterials, { packing_material_id: '', quantity: '', unit: 'PCS' }]);
  };

  const handleRemoveShiftOverMaterialRow = (index: number) => {
    const updated = [...shiftOverMaterials];
    updated.splice(index, 1);
    setShiftOverMaterials(updated);
  };

  const handleShiftOverMaterialChange = (index: number, field: string, value: any) => {
    const updated = [...shiftOverMaterials];
    updated[index][field] = value;
    setShiftOverMaterials(updated);
  };

  const handleSubmitShiftOverReport = async () => {
    const isValid = shiftOverMaterials.every(m => m.packing_material_id && m.quantity);
    if (!isValid) {
      Alert.alert("Required", "Please select material and enter quantity");
      return;
    }

    setSubmittingMaterial(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/material-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift: selectedShift,
          created_by: userId,
          items: shiftOverMaterials
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Shift Over Material Report Submitted for Approval");
        setShowShiftOverModal(false);
        setShiftOverMaterials([{ packing_material_id: '', quantity: '', unit: 'PCS' }]);
      } else {
        const errData = await response.json();
        Alert.alert("Error", errData.error || "Failed to submit report");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const renderPackingList = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenDetail(item)}>
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.batchNum, { marginRight: 8 }]}>PL #{item.id}</Text>
          {item.material_report_status && (
            <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(item.material_report_status) }]}>
              <Text style={styles.miniStatusText}>{item.material_report_status}</Text>
            </View>
          )}
        </View>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.summaryText}>{item.items_summary}</Text>
        <Text style={styles.dateText}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.pdf_url, item.id)}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.closeBtn, (item.material_report_status !== null || item.status === 'Dispatched') && { opacity: 0.5 }]} 
          onPress={() => handleOpenMaterialModal(item)}
          disabled={item.material_report_status !== null || item.status === 'Dispatched'}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.closeBtnText}>CLOSE</Text>
        </TouchableOpacity>

        <View style={[styles.statusBadge, item.status === 'Dispatched' && { backgroundColor: '#10B981' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>PACKING LISTS</Text>
          <Text style={styles.subtitle}>Packing Section Panel</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowShiftOverModal(true)} style={[styles.shiftOverBtn, { marginRight: 10 }]}>
            <Text style={styles.shiftOverBtnText}>SHIFT OVER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchPackingLists}>
            <Ionicons name="refresh" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={packingLists}
            keyExtractor={(item, index) => item.id?.toString() || `pl-${index}`}
            renderItem={renderPackingList}
            contentContainerStyle={[styles.list, { paddingBottom: 150 }]}
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

      <Modal visible={showDetailModal} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PACKING LIST DETAIL</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 100 }}>
              {selectedList && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailLabel}>Packing List ID:</Text>
                  <Text style={styles.detailValue}>PL #{selectedList.id}</Text>
                  
                  <Text style={[styles.detailLabel, { marginTop: 10 }]}>Customer:</Text>
                  <Text style={styles.detailValue}>{selectedList.customer_name}</Text>
                  
                  <Text style={[styles.detailLabel, { marginTop: 15, marginBottom: 5, color: '#10B981' }]}>PRODUCTS & QUANTITIES:</Text>
                  {selectedList.items?.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <Text style={styles.itemQty}>{item.quantity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.submitBtn, 
                { backgroundColor: '#64748B', marginTop: 20 }
              ]} 
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.submitBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Material Report Modal */}
      <Modal visible={showMaterialModal} animationType="slide" transparent={true} onRequestClose={() => setShowMaterialModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PACKING MATERIALS</Text>
              <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 150 }}>
              <Text style={styles.materialBatchText}>PL #{selectedList?.id}</Text>
              
              {usedMaterials.map((item, index) => (
                <View key={index} style={styles.materialRowContainer}>
                  <View style={styles.materialSelectBox}>
                    <Text style={styles.labelSmall}>Material</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialChips}>
                      {packingMaterials.map((m) => (
                        <TouchableOpacity 
                          key={m.id} 
                          style={[styles.chip, item.packing_material_id === m.id && styles.activeChip]}
                          onPress={() => handleMaterialChange(index, 'packing_material_id', m.id)}
                        >
                          <Text style={[styles.chipText, item.packing_material_id === m.id && styles.activeChipText]}>{m.item_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.qtyInputBox}>
                    <Text style={styles.labelSmall}>Quantity</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <TextInput 
                        style={[styles.input, { flex: 1, marginTop: 5, marginRight: usedMaterials.length > 1 ? 10 : 0 }]} 
                        placeholder="Qty" 
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        value={item.quantity.toString()}
                        onChangeText={(val) => handleMaterialChange(index, 'quantity', val)}
                      />
                      {usedMaterials.length > 1 && (
                        <TouchableOpacity style={styles.removeRowBtn} onPress={() => handleRemoveMaterialRow(index)}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addRowBtn} onPress={handleAddMaterialRow}>
                <Ionicons name="add" size={20} color="#10B981" />
                <Text style={styles.addRowText}>Add Material</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submittingMaterial && { opacity: 0.5 }]} 
              disabled={submittingMaterial}
              onPress={handleSubmitMaterialReport}
            >
              {submittingMaterial ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>SUBMIT REPORT</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Shift Over Modal */}
      <Modal visible={showShiftOverModal} animationType="slide" transparent={true} onRequestClose={() => setShowShiftOverModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SHIFT OVER - MATERIAL USAGE</Text>
              <TouchableOpacity onPress={() => setShowShiftOverModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 50 }}>
              <View style={styles.field}>
                <Text style={styles.label}>SELECT SHIFT</Text>
                <View style={styles.shiftContainer}>
                  {['Day', 'Night'].map((s) => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.shiftBtn, selectedShift === s && styles.activeShiftBtn]}
                      onPress={() => setSelectedShift(s)}
                    >
                      <Text style={[styles.shiftBtnText, selectedShift === s && styles.activeShiftBtnText]}>{s.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {shiftOverMaterials.map((item, index) => (
                <View key={index} style={styles.materialRowContainer}>
                  <View style={styles.materialSelectBox}>
                    <Text style={styles.labelSmall}>Material</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={item.packing_material_id}
                          onValueChange={(val) => handleShiftOverMaterialChange(index, 'packing_material_id', val)}
                          style={[styles.picker, Platform.OS === 'web' && { color: '#fff', backgroundColor: '#1E293B' }]}
                          dropdownIconColor="#000000"
                        >
                          <Picker.Item label="-- Choose Material --" value="" color="#000000" />
                          {packingMaterials.map((m) => (
                            <Picker.Item 
                              key={m.id} 
                              label={`${m.item_name} (Stock: ${m.stock_qty_pcs || 0} Pcs | ${m.stock_qty_kg || 0} Kg | ${m.stock_qty_box || 0} Box)`} 
                              value={m.id} 
                              color="#000000"
                            />
                          ))}
                        </Picker>
                    </View>
                  </View>

                  <View style={styles.usageInputContainer}>
                    <View style={[styles.usageField, { flex: 2 }]}>
                      <Text style={styles.labelSmall}>Quantity</Text>
                      <TextInput 
                        style={styles.inputSmall}
                        placeholder="Qty"
                        keyboardType="numeric"
                        value={item.quantity}
                        onChangeText={(val) => handleShiftOverMaterialChange(index, 'quantity', val)}
                      />
                    </View>
                    <View style={[styles.usageField, { flex: 1 }]}>
                      <Text style={styles.labelSmall}>Unit</Text>
                      <View style={styles.pickerContainerSmall}>
                        <Picker
                          selectedValue={item.unit}
                          onValueChange={(val) => handleShiftOverMaterialChange(index, 'unit', val)}
                          style={[styles.picker, Platform.OS === 'web' && { color: '#fff', backgroundColor: '#1E293B' }]}
                          dropdownIconColor="#000000"
                        >
                          <Picker.Item label="PCS" value="PCS" color="#000000" />
                          <Picker.Item label="KG" value="KG" color="#000000" />
                          <Picker.Item label="BOX" value="BOX" color="#000000" />
                        </Picker>
                      </View>
                    </View>
                    {shiftOverMaterials.length > 1 && (
                      <TouchableOpacity style={styles.removeRowBtn} onPress={() => handleRemoveShiftOverMaterialRow(index)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addRowBtn} onPress={handleAddShiftOverMaterialRow}>
                <Ionicons name="add" size={20} color="#10B981" />
                <Text style={styles.addRowText}>Add Material</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submittingMaterial && { opacity: 0.5 }]} 
              disabled={submittingMaterial}
              onPress={handleSubmitShiftOverReport}
            >
              {submittingMaterial ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>SUBMIT SHIFT REPORT</Text>}
            </TouchableOpacity>
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
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  list: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  batchNum: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 4 },
  customerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  summaryText: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  dateText: { color: '#64748B', fontSize: 10, marginTop: 8 },
  cardRight: { alignItems: 'flex-end' },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  downloadBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  statusBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  modalBody: { flex: 1 },
  detailsBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  detailLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  itemName: { color: '#94A3B8', fontSize: 14 },
  itemQty: { color: '#10B981', fontWeight: 'bold' },
  stickerForm: { marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#334155' },
  input: { backgroundColor: '#1E293B', borderRadius: 12, padding: 15, color: '#fff', borderWidth: 1, borderColor: '#334155', marginTop: 10 },
  submitBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  
  miniStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniStatusText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  closeBtn: { flexDirection: 'row', backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  closeBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  
  materialBatchText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 20 },
  materialRowContainer: { backgroundColor: '#0F172A', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  materialSelectBox: { marginBottom: 15 },
  labelSmall: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  materialChips: { flexDirection: 'row' },
  chip: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  activeChip: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipText: { color: '#94A3B8', fontSize: 12 },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  qtyInputBox: {},
  removeRowBtn: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  addRowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155', borderRadius: 15, marginBottom: 20 },
  addRowText: { color: '#10B981', fontWeight: 'bold', marginLeft: 8 },
  shiftOverBtn: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  shiftOverBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  shiftContainer: { flexDirection: 'row', marginTop: 5, marginBottom: 20 },
  shiftBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginRight: 10 },
  activeShiftBtn: { backgroundColor: '#10B981', borderColor: '#10B981' },
  shiftBtnText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  activeShiftBtnText: { color: '#fff' },
  usageInputContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'flex-end' },
  usageField: { flex: 1, marginRight: 10 },
  inputSmall: { backgroundColor: '#1E293B', borderRadius: 8, padding: 12, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: '#334155', marginTop: 5 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden', marginTop: 5 },
  pickerContainerSmall: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#334155', overflow: 'hidden', marginTop: 5, height: 46, justifyContent: 'center' },
  picker: { height: 50, color: '#000000' },
  field: { marginBottom: 20 },
  label: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
});
