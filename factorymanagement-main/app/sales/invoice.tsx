import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Linking, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function InvoicePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [products, setProducts] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  // Invoice Form State
  const [customerId, setCustomerId] = useState(params.customerId ? parseInt(params.customerId as string) : 0);
  const [customerName, setCustomerName] = useState((params.customerName as string) || '');
  const [customerCategory, setCustomerCategory] = useState((params.category as string) || 'A'); // Renamed internal state to avoid conflict with local vars if any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showError, setShowError] = useState(false); // To track validation state visually

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
        console.log("[INVOICE] Customers loaded:", data.length);
        setAllCustomers(data);
      }
    } catch (error) {
      console.error("Fetch Customers Error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (val: any) => {
    if (val === 0) {
      setCustomerId(0);
      setCustomerName('');
      setCustomerCategory('A');
    } else {
      const cust = allCustomers.find(c => c.id === val);
      if (cust) {
        setCustomerId(cust.id);
        setCustomerName(cust.name);
        setCustomerCategory(cust.category);
      }
    }
  };

  useEffect(() => {
    let total = 0;
    selectedProducts.forEach(p => {
      const lineTotal = (parseFloat(p.quantity) || 0) * (parseFloat(p.price_per_unit) || 0);
      total += lineTotal;
    });
    setTotalAmount(total);
  }, [selectedProducts]);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product_id: '', product_name: '', quantity: '', price_per_unit: '' }]);
  };

  const updateSelectedProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      updated[index].product_name = product ? (product.product_name || product.display_name) : '';
    }
    updated[index][field] = value;
    setSelectedProducts(updated);
  };

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleSubmit = async () => {
    console.log("[INVOICE] Submit triggered. Customer:", customerName, "ID:", customerId);
    console.log("[INVOICE] Products:", selectedProducts);

    if (!customerId || !customerName.trim()) {
      setShowError(true);
      Alert.alert("Required", "Please select a customer from the list.");
      console.log("[INVOICE] Blocked: Missing customer selection");
      return;
    }
    setShowError(false);

    if (selectedProducts.length === 0) {
      Alert.alert("Required", "Please add at least one product.");
      console.log("[INVOICE] Blocked: No products added");
      return;
    }

    // Validate that all products have an ID and quantity
    const invalidProduct = selectedProducts.find(p => !p.product_id || !p.quantity || parseFloat(p.quantity) <= 0);
    if (invalidProduct) {
      Alert.alert("Invalid Data", "Please ensure all products are selected and have a valid quantity.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: customerId || null,
        customer_name: customerName,
        category: customerCategory,
        products: selectedProducts.map(p => ({
          ...p,
          line_total: (parseFloat(p.quantity) || 0) * (parseFloat(p.price_per_unit) || 0)
        })),
        total_amount: totalAmount
      };
      
      console.log("[INVOICE] Sending payload:", payload);

      const response = await fetch(`${SERVER_URL}/sales/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[INVOICE] Success response:", data);
        setInvoiceId(data.invoiceId);
        
        Alert.alert(
          "Success", 
          "Invoice generated and sent to admin for approval."
        );
        
        // Clear form for next entry
        setSelectedProducts([]);
        setTotalAmount(0);
        setCustomerId(0);
        setCustomerName('');
      } else {
        const err = await response.json();
        console.error("[INVOICE] Server Error:", err);
        Alert.alert("Error", err.error || "Failed to generate invoice.");
      }
    } catch (error: any) {
      console.error("[INVOICE] Network Error:", error);
      Alert.alert("Error", "Network error: " + (error.message || "Could not reach server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>INVOICE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Billing Details</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>SELECT CUSTOMER</Text>
            <View style={[styles.pickerContainer, showError && !customerId && { borderColor: '#EF4444', borderWidth: 2 }]}>
              <Picker 
                selectedValue={customerId.toString()} 
                onValueChange={(val) => handleCustomerSelect(parseInt(val))} 
                style={styles.picker}
              >
                <Picker.Item label="Select existing customer" value="0" color="#000000" />
                {allCustomers.map((c) => (
                  <Picker.Item key={c.id} label={c.name} value={c.id.toString()} color="#000000" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={customerCategory} onValueChange={setCustomerCategory} style={styles.picker}>
                <Picker.Item label="Category A" value="A" color="#000000" />
                <Picker.Item label="Category B" value="B" color="#000000" />
                <Picker.Item label="Category C" value="C" color="#000000" />
              </Picker>
            </View>
          </View>

          <View style={styles.productsHeader}>
            <Text style={styles.label}>PRODUCTS</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Text style={styles.addProdLink}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {selectedProducts.map((p, index) => (
            <View key={index} style={styles.productRow}>
              <View style={[styles.field, { flex: 2, marginBottom: 0 }]}>
                <View style={styles.pickerContainerSmall}>
                  <Picker
                    selectedValue={p.product_id}
                    onValueChange={(val) => updateSelectedProduct(index, 'product_id', val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select" value="" color="#000000" />
                    {products.map((prod) => (
                      <Picker.Item key={prod.id} label={prod.product_name || prod.display_name} value={prod.id} color="#000000" />
                    ))}
                  </Picker>
                </View>
              </View>
              <TextInput
                style={[styles.inputSmall, { flex: 1 }]}
                placeholder="Qty"
                keyboardType="numeric"
                value={p.quantity}
                onChangeText={(val) => updateSelectedProduct(index, 'quantity', val)}
              />
              <TextInput
                style={[styles.inputSmall, { flex: 1 }]}
                placeholder="Price"
                keyboardType="numeric"
                value={p.price_per_unit}
                onChangeText={(val) => updateSelectedProduct(index, 'price_per_unit', val)}
              />
              <TouchableOpacity onPress={() => removeProduct(index)} style={styles.removeBtn}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
            <Text style={styles.totalValue}>{totalAmount.toFixed(2)}</Text>
          </View>

          {!invoiceId ? (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>GENERATE INVOICE</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={50} color="#10B981" />
              <Text style={styles.successText}>Invoice Generated Successfully!</Text>
              <Text style={styles.pendingText}>Waiting for admin approval. You can view it in the Invoice List once approved.</Text>
              
              <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => router.replace('/sales/history')}
              >
                <Text style={styles.backBtnText}>GO TO HISTORY</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.newInvoiceBtn} 
                onPress={() => setInvoiceId(null)}
              >
                <Text style={styles.newInvoiceBtnText}>CREATE NEW INVOICE</Text>
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
  title: { color: 'white', fontSize: 24, fontWeight: '900' },
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
  productRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  pickerContainerSmall: { backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', height: 45 },
  inputSmall: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 10, fontSize: 12, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', height: 45, marginLeft: 6 },
  removeBtn: { padding: 4, marginLeft: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 10, paddingTop: 15, marginBottom: 20 },
  totalLabel: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#10B981' },
  submitBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  successContainer: { alignItems: 'center', padding: 20 },
  successText: { fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginVertical: 15 },
  pendingText: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 15 },
  backBtn: { backgroundColor: '#3B82F6', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 10 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
  newInvoiceBtn: { backgroundColor: '#E2E8F0', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  newInvoiceBtnText: { color: '#0F172A', fontWeight: 'bold' },
});
