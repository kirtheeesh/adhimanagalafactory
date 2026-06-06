import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PackingFooter from '@shared/components/PackingFooter';

export default function FinishedProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [step, setStep] = useState(0); // 0: input, 1: material/confirm
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [emptyBoxWeight, setEmptyBoxWeight] = useState<string>('');
  const [boxWithPiecesWeight, setBoxWithPiecesWeight] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [numBoxes, setNumBoxes] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  
  const [batchNumber, setBatchNumber] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
      await Promise.all([fetchProducts(), fetchColors()]);
    };
    init();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/inventory/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/inventory/colors`);
      if (response.ok) {
        const data = await response.json();
        setColors(data);
      }
    } catch (error) {
      console.error("Fetch Colors Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const product = products.find(p => p.id.toString() === id);
    setSelectedProduct(product || null);
  };

  const handleGenerateBatch = async () => {
    if (!selectedProductId) {
      Alert.alert("Required", "Please select a product");
      return;
    }
    if (!selectedColorId) {
      Alert.alert("Required", "Please select a color");
      return;
    }
    if (!emptyBoxWeight.trim()) {
      Alert.alert("Required", "Please enter weight of empty box");
      return;
    }
    if (!boxWithPiecesWeight.trim()) {
      Alert.alert("Required", "Please enter weight of box with pieces");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/next-batch-number`);
      if (response.ok) {
        const data = await response.json();
        setBatchNumber(data.batch_number);
        setNumBoxes('1');
        setWeight('0');
        setStep(1);
      } else {
        Alert.alert("Error", "Failed to generate batch number");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/finished-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(selectedProductId),
          color_id: parseInt(selectedColorId),
          empty_box_weight: parseFloat(emptyBoxWeight),
          box_with_pieces_weight: parseFloat(boxWithPiecesWeight),
          created_by: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Success", `Finished product batch ${batchNumber} created successfully! Sticker: ${data.sticker_number || 'Generated'}`);
        resetForm();
        await fetchProducts(); 
      } else {
        const err = await response.json();
        Alert.alert("Error", err.error || "Failed to create batch");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setNumBoxes('');
    setWeight('');
    setSelectedProductId('');
    setSelectedColorId('');
    setEmptyBoxWeight('');
    setBoxWithPiecesWeight('');
    setSelectedProduct(null);
    setBatchNumber('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 0 ? router.replace('/login') : setStep(0)}>
          <Ionicons name={step === 0 ? "chevron-back" : "arrow-back"} size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>FINISHED PRODUCTS</Text>
          <Text style={styles.subtitle}>{step === 0 ? "Step 1: Product Details" : "Step 2: Packing & Confirm"}</Text>
        </View>
        <TouchableOpacity onPress={() => { setLoading(true); fetchProducts(); fetchColors(); }}>
          <Ionicons name="refresh" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.glassCard}>
            {step === 0 ? (
              <>
                <Text style={styles.cardTitle}>Production to Finished Goods</Text>
                
                <View style={styles.field}>
                  <Text style={styles.label}>SELECT PRODUCT (FROM INVENTORY)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker 
                      selectedValue={selectedProductId} 
                      onValueChange={handleProductSelect} 
                      style={styles.picker}
                      dropdownIconColor="#10B981"
                    >
                      <Picker.Item label="-- Choose Product --" value="" color="#000000" />
                      {products.map((p) => (
                        <Picker.Item 
                          key={p.id} 
                          label={`${p.product_name}\n(Stock: ${p.closing_stock ?? 0})`} 
                          value={p.id.toString()} 
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>SELECT COLOR (FROM INVENTORY)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker 
                      selectedValue={selectedColorId} 
                      onValueChange={(val) => setSelectedColorId(val)} 
                      style={styles.picker}
                      dropdownIconColor="#10B981"
                    >
                      <Picker.Item label="-- Choose Color --" value="" color="#000000" />
                      {colors.map((c) => (
                        <Picker.Item key={c.id} label={c.color_name} value={c.id.toString()} color="#000000" />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>WEIGHT OF EMPTY BOX (KG)</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter empty box weight..."
                    value={emptyBoxWeight}
                    onChangeText={setEmptyBoxWeight}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>WEIGHT OF BOX WITH PIECES (KG)</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter box with pieces weight..."
                    value={boxWithPiecesWeight}
                    onChangeText={setBoxWithPiecesWeight}
                    keyboardType="numeric"
                  />
                </View>

                {selectedProduct && (
                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Current Inventory Stock:</Text>
                      <Text style={styles.infoValue}>{selectedProduct.closing_stock} pcs</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Pieces Per Box:</Text>
                      <Text style={styles.infoValue}>{selectedProduct.pieces_per_box || 'Not set'}</Text>
                    </View>
                  </View>
                )}

                {/* Box Count and Weight are now automatic (1 box, 0 weight for sticker) */}
                <View style={styles.infoBox}>
                  <Text style={[styles.label, { marginBottom: 10 }]}>PACKING CONFIGURATION</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Number of Boxes:</Text>
                    <Text style={styles.infoValue}>1 Box (Fixed)</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, (submitting || !selectedProductId) && { opacity: 0.7 }]} 
                  onPress={handleGenerateBatch}
                  disabled={submitting || !selectedProductId}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>GENERATE BATCH NUMBER</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Confirm Batch Details</Text>
                
                <View style={styles.batchDisplay}>
                  <Text style={styles.batchLabel}>GENERATED BATCH NUMBER</Text>
                  <Text style={styles.batchValue}>{batchNumber}</Text>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Product:</Text>
                    <Text style={styles.infoValue}>{selectedProduct?.product_name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Empty Box Weight:</Text>
                    <Text style={styles.infoValue}>{emptyBoxWeight} KG</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Box With Pieces Weight:</Text>
                    <Text style={styles.infoValue}>{boxWithPiecesWeight} KG</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Boxes:</Text>
                    <Text style={styles.infoValue}>1</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>CONFIRM & SAVE</Text>}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.backLink} 
                  onPress={() => setStep(0)}
                  disabled={submitting}
                >
                  <Text style={styles.backLinkText}>Edit Product</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.noteBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={styles.noteText}>
                Sticker and QR code are automatically generated for this single box batch.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <PackingFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  title: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  glassCard: { backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 10, marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  picker: { height: 55, width: '100%', color: '#000000' },
  infoBox: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  infoValue: { fontSize: 12, color: '#0F172A', fontWeight: '900' },
  submitBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  noteBox: { flexDirection: 'row', marginTop: 20, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10 },
  noteText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
  batchDisplay: { backgroundColor: '#1E293B', borderRadius: 15, padding: 20, marginBottom: 20, alignItems: 'center' },
  batchLabel: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  batchValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  backLink: { marginTop: 15, alignItems: 'center' },
  backLinkText: { color: '#64748B', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }
});
