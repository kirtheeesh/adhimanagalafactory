import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function SalesRequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [request, setRequest] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Fetch Request Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
    }
  };

  const checkUser = async () => {
    const role = await AsyncStorage.getItem('user_role');
    setUserRole(role || '');
    setIsAdmin(role === 'ADMIN');
  };

  useEffect(() => {
    fetchRequest();
    fetchProducts();
    checkUser();
  }, [id]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    if (field === 'product_id') {
      const product = products.find(p => p.product_id === parseInt(value));
      updated[index].product_name = product ? product.product_name : '';
    }
    updated[index][field] = value;
    updated[index].line_total = (parseFloat(updated[index].quantity) || 0) * (parseFloat(updated[index].unit_price) || 0);
    setItems(updated);
  };

  const handleSave = async () => {
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.line_total) || 0), 0);
    const gst = request.gst_enabled ? subtotal * 0.18 : 0;
    const total = subtotal + gst;
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total_amount: total, gst_enabled: request.gst_enabled, gst_amount: gst }),
      });
      if (response.ok) {
        Alert.alert("Success", "Request updated");
        setEditMode(false);
        fetchRequest();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update");
    }
  };

  const handleApprove = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: userId }),
      });
      if (response.ok) {
        Alert.alert("Success", "Request Approved and moved to History");
        router.back();
      } else {
        const data = await response.json();
        Alert.alert("Error", data.error || "Failed to approve");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/${id}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        Alert.alert("Success", "Request Rejected");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 100 }} />
    </SafeAreaView>
  );

  if (!request) return (
    <SafeAreaView style={styles.container}>
      <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>Request not found</Text>
    </SafeAreaView>
  );

  const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.line_total) || 0), 0);
  const gstAmount = request.gst_enabled ? subTotal * 0.18 : 0;
  const totalAmount = subTotal + gstAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>REQUEST DETAILS</Text>
        {isAdmin && request.status === 'Pending approval' ? (
          <TouchableOpacity onPress={() => editMode ? handleSave() : setEditMode(true)}>
             <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{editMode ? 'SAVE' : 'EDIT'}</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>INVOICE NO</Text>
            <Text style={styles.value}>{request.invoice_number || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>VEHICLE NO</Text>
            <Text style={styles.value}>{request.vehicle_number || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CUSTOMER</Text>
            <Text style={styles.value}>{request.customer_name || request.customer_name_manual}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>STATUS</Text>
            <Text style={[styles.value, { color: request.status === 'Approved' ? '#10B981' : request.status === 'Rejected' ? '#EF4444' : '#F59E0B' }]}>
              {request.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{new Date(request.created_at).toLocaleDateString()}</Text>
          </View>

          <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>PRODUCTS</Text>
          
          {items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              {editMode ? (
                <View style={styles.editProductBox}>
                  <View style={styles.pickerContainerSmall}>
                    <Picker
                      selectedValue={item.product_id?.toString()}
                      onValueChange={(val) => updateItem(index, 'product_id', val)}
                      style={styles.picker}
                    >
                      {products.map((prod) => (
                        <Picker.Item key={prod.id} label={prod.product_name} value={prod.product_id.toString()} color="#000000" />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.editInputs}>
                    <TextInput 
                      style={[styles.inputSmall, { marginRight: 10 }]} 
                      value={item.quantity.toString()} 
                      keyboardType="numeric"
                      onChangeText={(val) => updateItem(index, 'quantity', val)}
                    />
                    <TextInput 
                      style={styles.inputSmall} 
                      value={item.unit_price.toString()} 
                      keyboardType="numeric"
                      onChangeText={(val) => updateItem(index, 'unit_price', val)}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.productDisplay}>
                  <Text style={styles.prodName}>{item.product_name}</Text>
                  <Text style={styles.prodDetails}>{item.boxes} boxes ({item.pieces_per_box} pcs/box) = {item.quantity} units</Text>
                  <Text style={styles.prodDetails}>Rate: ₹{item.unit_price} per piece</Text>
                  <Text style={styles.prodTotal}>₹{parseFloat(item.line_total).toFixed(2)}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValueSmall}>₹{subTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST (18%)</Text>
            <Text style={styles.totalValueSmall}>₹{gstAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          {isAdmin && request.status === 'Pending approval' && !editMode && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={handleApprove}>
                <Text style={styles.btnText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
                <Text style={styles.btnText}>REJECT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <SalesFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: '900' },
  content: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: '#1E293B', borderRadius: 25, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 10 },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  productItem: { marginBottom: 15 },
  productDisplay: { backgroundColor: '#0F172A', padding: 15, borderRadius: 15 },
  prodName: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
  prodDetails: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  prodTotal: { color: '#fff', fontWeight: '900', fontSize: 14, marginTop: 8, textAlign: 'right' },
  editProductBox: { },
  pickerContainerSmall: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: 45, marginBottom: 10 },
  picker: { height: 50, width: '100%', color: '#000000' },
  editInputs: { flexDirection: 'row' },
  inputSmall: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, height: 45 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 },
  totalLabel: { color: '#fff', fontWeight: '900' },
  totalValueSmall: { color: '#94A3B8', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#10B981', fontSize: 22, fontWeight: '900' },
  actionRow: { flexDirection: 'row', marginTop: 30 },
  actionBtn: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10B981', marginRight: 15 },
  rejectBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
});
