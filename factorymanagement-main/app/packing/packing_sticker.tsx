import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar,
  StyleSheet, Text, TouchableOpacity, View, Linking, Alert, ScrollView, TextInput, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PackingFooter from '@shared/components/PackingFooter';

export default function PackingStickersScreen() {
  const router = useRouter();
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Sticker State
  const [manualBatchNumber, setManualBatchNumber] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStickers();
  }, []);

  const fetchStickers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/sticker`);
      if (response.ok) {
        const data = await response.json();
        setStickers(data);
      }
    } catch (error) {
      console.error("Fetch Stickers Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStickers();
  };

  const handleCreateSticker = async () => {
    if (!manualBatchNumber) {
      Alert.alert("Required", "Please enter batch number");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/sticker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_number: manualBatchNumber
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Sticker Created/Updated Successfully");
        setManualBatchNumber('');
        setShowAddForm(false);
        fetchStickers();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.error || "Failed to create sticker");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenPdf = (pdfUrl: string) => {
    if (!pdfUrl) return;
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${SERVER_URL}${pdfUrl}`;
    Linking.openURL(fullUrl).catch(err => Alert.alert("Error", "Could not open PDF"));
  };

  const filteredStickers = stickers.filter(s => 
    (s.batch_number && s.batch_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.sticker_number && s.sticker_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.product_name && s.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>PACKING STICKERS</Text>
          <Text style={styles.subtitle}>Batch Label Management</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons name={showAddForm ? "list-outline" : "add-circle-outline"} size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search batch or sticker..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10B981" />
        }
      >
        {showAddForm ? (
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Manual Sticker Generation</Text>
            <Text style={styles.cardDesc}>Enter a batch number to manually generate or regenerate its sticker.</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>BATCH NUMBER</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. 260400004"
                placeholderTextColor="#64748B"
                value={manualBatchNumber}
                onChangeText={setManualBatchNumber}
                autoFocus
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, (!manualBatchNumber || creating) && { opacity: 0.5 }]} 
              disabled={!manualBatchNumber || creating}
              onPress={handleCreateSticker}
            >
              {creating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>GENERATE STICKER</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
            ) : filteredStickers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={60} color="#334155" />
                <Text style={styles.emptyText}>No stickers found</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(true)}>
                  <Text style={styles.addBtnText}>ADD FIRST STICKER</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredStickers.map((s) => (
                <View key={s.id} style={styles.stickerCard}>
                  <View style={styles.stickerHeader}>
                    <View>
                      <Text style={styles.stickerBatch}>{s.batch_number}</Text>
                      <Text style={styles.stickerNum}>{s.sticker_number}</Text>
                    </View>
                    <TouchableOpacity style={styles.pdfBtn} onPress={() => handleOpenPdf(s.pdf_path)}>
                      <Ionicons name="print-outline" size={24} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.stickerDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Product</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>{s.product_name || 'Manual Generation'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{new Date(s.created_at).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <View style={styles.stickerFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: s.status === 'Dispatched' ? '#1E293B' : '#064E3B' }]}>
                      <Text style={[styles.statusText, { color: s.status === 'Dispatched' ? '#94A3B8' : '#10B981' }]}>
                        {s.status || 'Active'}
                      </Text>
                    </View>
                    <Text style={styles.weightText}>{s.box_with_pieces_weight || '0'} KG</Text>
                  </View>
                </View>
              ))
            )}
          </>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  title: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 20, paddingTop: 15 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E293B', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingHorizontal: 10 },
  content: { flex: 1 },
  glassCard: { backgroundColor: '#1E293B', borderRadius: 25, padding: 25, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 10, textAlign: 'center' },
  cardDesc: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 25, lineHeight: 18 },
  field: { marginBottom: 25 },
  label: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  stickerCard: { 
    backgroundColor: '#1E293B', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#334155'
  },
  stickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stickerBatch: { color: '#fff', fontSize: 20, fontWeight: '900' },
  stickerNum: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  pdfBtn: { backgroundColor: '#064E3B', padding: 8, borderRadius: 10 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 15 },
  stickerDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { color: '#64748B', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  detailValue: { color: '#CBD5E1', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  stickerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '900' },
  weightText: { color: '#CBD5E1', fontSize: 12, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  addBtn: { backgroundColor: '#10B981', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' }
});
