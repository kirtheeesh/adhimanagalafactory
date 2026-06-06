import { Ionicons } from '@expo/vector-icons';
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

export default function CreateSalesRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [products, setProducts] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [invoiceFY, setInvoiceFY] = useState('');
  const [invoiceCompany, setInvoiceCompany] = useState('');
  const [invoiceSequence, setInvoiceSequence] = useState('');
  
  const [customerId, setCustomerId] = useState(0);
  const [customerNameManual, setCustomerNameManual] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);

  const fetchNextInvoice = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests/next-invoice`);
      if (response.ok) {
        const data = await response.json();
        setInvoiceFY(data.fy);
        setInvoiceCompany(data.companyCode);
        setInvoiceSequence(data.nextSequence);
        setInvoiceNumber(data.fullInvoice);
      }
    } catch (error) {
      console.error("Fetch Invoice Error:", error);
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/customers`);
      if (response.ok) {
        const data = await response.json();
        setAllCustomers(data);
      }
    } catch (error) {
      console.error("Fetch Customers Error:", error);
    }
  };

  useEffect(() => {
    fetchNextInvoice();
    fetchProducts();
    fetchCustomers();
    // Add one empty product row by default
    handleAddProduct();
  }, []);

  const handleCustomerSelect = (val: string) => {
    if (val === 'new') {
      setIsNewCustomer(true);
      setCustomerId(0);
    } else {
      setIsNewCustomer(false);
      setCustomerId(parseInt(val));
      setCustomerNameManual('');
    }
  };

  const handleSequenceChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setInvoiceSequence(clean);
    setInvoiceNumber(`${invoiceFY}/${invoiceCompany}/B${clean}`);
  };

  useEffect(() => {
    let total = 0;
    selectedProducts.forEach(p => {
      const pcs = (parseFloat(p.boxes) || 0) * (p.pieces_per_box || 0);
      const lineTotal = pcs * (parseFloat(p.unit_price) || 0);
      total += lineTotal;
    });
    const gst = gstEnabled ? total * 0.18 : 0;
    setGstAmount(gst);
    setSubTotal(total + gst);
    setTotalAmount(total + gst);
  }, [selectedProducts, gstEnabled]);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { 
      product_id: '', 
      product_name: '', 
      boxes: '', 
      pieces_per_box: 0, 
      quantity: 0, 
      unit_price: '', 
      stock: 0 
    }]);
  };

  const updateSelectedProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    if (field === 'product_id') {
      const product = products.find(p => p.product_id === Number(value));
      updated[index].product_name = product ? product.product_name : '';
      updated[index].stock = product ? product.stock_qty : 0;
      updated[index].pieces_per_box = product ? product.pieces_per_box : 0;
      updated[index].color = product ? product.color : '';
    }
    updated[index][field] = value;
    
    // Recalculate quantity (total pieces) if boxes or product_id changed
    if (field === 'boxes' || field === 'product_id') {
      updated[index].quantity = (parseFloat(updated[index].boxes) || 0) * (updated[index].pieces_per_box || 0);
    }
    
    setSelectedProducts(updated);
  };

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleSubmit = async () => {
    if (!isNewCustomer && !customerId) {
      Alert.alert("Required", "Please select a customer or enter a new one.");
      return;
    }
    if (isNewCustomer && !customerNameManual.trim()) {
      Alert.alert("Required", "Please enter the new customer name.");
      return;
    }
    if (selectedProducts.length === 0 || !selectedProducts[0].product_id) {
      Alert.alert("Required", "Please add at least one product.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: isNewCustomer ? null : customerId,
        customer_name_manual: isNewCustomer ? customerNameManual : null,
        invoice_number: invoiceNumber,
        vehicle_number: vehicleNumber,
        items: selectedProducts.map(p => {
          const pcs = (parseFloat(p.boxes) || 0) * (p.pieces_per_box || 0);
          return {
            product_id: parseInt(p.product_id),
            product_name: p.product_name,
            quantity: pcs,
            boxes: parseInt(p.boxes) || 0,
            pieces_per_box: p.pieces_per_box,
            unit_price: parseFloat(p.unit_price),
            line_total: pcs * (parseFloat(p.unit_price) || 0),
            color: p.color
          };
        }),
        total_amount: totalAmount,
        gst_enabled: gstEnabled,
        gst_amount: gstAmount,
        created_by: 1 // TODO: Get actual user ID from context/storage
      };

      const response = await fetch(`${SERVER_URL}/sales/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setRequestId(data.requestId);
        Alert.alert("Success", "Sales Request created!");
      } else {
        const err = await response.json();
        Alert.alert("Error", err.error || "Failed to create request");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const getProductSummary = () => {
    return selectedProducts
      .filter(p => p.product_name)
      .map(p => p.product_name)
      .join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/sales/requests')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>NEW SALES REQUEST</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Request Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>INVOICE NUMBER</Text>
              <View style={styles.invoiceInputContainer}>
                <Text style={styles.invoicePrefix}>{invoiceFY}/{invoiceCompany}/B</Text>
                <TextInput 
                  style={styles.invoiceInput}
                  value={invoiceSequence}
                  onChangeText={handleSequenceChange}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>VEHICLE NUMBER (OPTIONAL)</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. TN 59 AB 1234"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CUSTOMER</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={isNewCustomer ? 'new' : customerId.toString()} 
                onValueChange={handleCustomerSelect} 
                style={styles.picker}
              >
                <Picker.Item label="Select existing customer" value="0" color="#000000" />
                {allCustomers.map((c) => (
                  <Picker.Item key={c.id} label={c.name} value={c.id.toString()} color="#000000" />
                ))}
                <Picker.Item label="+ New customer" value="new" color="#000000" />
              </Picker>
            </View>
          </View>

          {isNewCustomer && (
            <View style={styles.field}>
              <Text style={styles.label}>NEW CUSTOMER NAME</Text>
              <TextInput 
                style={styles.input}
                placeholder="Type customer name"
                value={customerNameManual}
                onChangeText={setCustomerNameManual}
              />
            </View>
          )}

          <View style={styles.productsHeader}>
            <Text style={styles.label}>PRODUCTS</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Text style={styles.addProdLink}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {selectedProducts.map((p, index) => (
            <View key={index} style={styles.productBlock}>
              <View style={styles.productRow}>
                <View style={[styles.field, { flex: 2, marginBottom: 0 }]}>
                  <View style={styles.pickerContainerSmall}>
                    <Picker
                      selectedValue={p.product_id}
                      onValueChange={(val) => updateSelectedProduct(index, 'product_id', val)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Product" value="" color="#000000" />
                      {products.map((prod) => (
                        <Picker.Item key={prod.product_id} label={prod.product_name} value={prod.product_id.toString()} color="#000000" />
                      ))}
                    </Picker>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeProduct(index)} style={styles.removeBtn}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.productSubRow}>
                <View style={{ flex: 1.5 }}>
                   <Text style={styles.stockText}>Stock: {p.stock || 0} ({p.pieces_per_box} pcs/box)</Text>
                </View>
                <TextInput
                  style={[styles.inputSmall, { flex: 1 }]}
                  placeholder="Boxes"
                  keyboardType="numeric"
                  value={p.boxes}
                  onChangeText={(val) => updateSelectedProduct(index, 'boxes', val)}
                />
                <TextInput
                  style={[styles.inputSmall, { flex: 1 }]}
                  placeholder="Rate/Pc"
                  keyboardType="numeric"
                  value={p.unit_price}
                  onChangeText={(val) => updateSelectedProduct(index, 'unit_price', val)}
                />
                <View style={styles.lineTotalBox}>
                  <Text style={styles.lineTotalText}>
                    ₹{((parseFloat(p.boxes) || 0) * (p.pieces_per_box || 0) * (parseFloat(p.unit_price) || 0)).toFixed(2)}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#64748B' }}>
                    {(parseFloat(p.boxes) || 0) * (p.pieces_per_box || 0)} pcs
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.gstToggleContainer}>
            <TouchableOpacity 
              style={[styles.gstBtn, !gstEnabled && styles.gstBtnActive]} 
              onPress={() => setGstEnabled(false)}
            >
              <Text style={[styles.gstBtnText, !gstEnabled && styles.gstBtnTextActive]}>WITHOUT GST</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.gstBtn, gstEnabled && styles.gstBtnActive]} 
              onPress={() => setGstEnabled(true)}
            >
              <Text style={[styles.gstBtnText, gstEnabled && styles.gstBtnTextActive]}>WITH GST (18%)</Text>
            </TouchableOpacity>
          </View>

          {gstEnabled && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{subTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST (18%):</Text>
                <Text style={styles.summaryValue}>₹{gstAmount.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          {!requestId ? (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>SUBMIT REQUEST</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={50} color="#10B981" />
              <Text style={styles.successText}>Request Submitted!</Text>
              
              <View style={styles.requestIdBox}>
                <Text style={styles.requestIdLabel}>SALES ID</Text>
                <Text style={styles.requestIdValue}>#{requestId}</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Products Included:</Text>
                <Text style={styles.summaryValueText}>{getProductSummary()}</Text>
              </View>

              <Text style={styles.noteText}>Give this ID to Production Head to create Packing List</Text>

              <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => router.replace('/sales/requests')}
              >
                <Text style={styles.backBtnText}>VIEW ALL REQUESTS</Text>
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
  glassCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, marginTop: 10, marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  field: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  picker: { height: 50, width: '100%', color: '#000000' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 5 },
  addProdLink: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
  productBlock: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productSubRow: { flexDirection: 'row', alignItems: 'center' },
  pickerContainerSmall: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', height: 45 },
  inputSmall: { backgroundColor: '#fff', borderRadius: 12, padding: 10, fontSize: 12, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', height: 45, marginLeft: 8 },
  stockText: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  lineTotalBox: { flex: 1.2, alignItems: 'flex-end', marginLeft: 8 },
  lineTotalText: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  removeBtn: { padding: 4, marginLeft: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 10, paddingTop: 15, marginBottom: 20 },
  totalLabel: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#10B981' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    paddingHorizontal: 10
  },
  invoicePrefix: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
  invoiceInput: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#0F172A', 
    fontWeight: 'bold',
    marginLeft: 2
  },
  gstToggleContainer: { flexDirection: 'row', marginVertical: 15 },
  gstBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8FAFC' },
  gstBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  gstBtnText: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  gstBtnTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  summaryValue: { fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  successContainer: { alignItems: 'center', padding: 10 },
  successText: { fontSize: 20, fontWeight: '900', color: '#10B981', textAlign: 'center', marginBottom: 15 },
  requestIdBox: { backgroundColor: '#F1F5F9', padding: 20, borderRadius: 15, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  requestIdLabel: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  requestIdValue: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  summaryBox: { width: '100%', paddingHorizontal: 10, marginBottom: 15 },
  summaryTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  summaryValueText: { fontSize: 14, color: '#0F172A', marginTop: 4 },
  noteText: { fontSize: 11, color: '#64748B', textAlign: 'center', marginVertical: 5 },
  backBtn: { backgroundColor: '#0F172A', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
});
