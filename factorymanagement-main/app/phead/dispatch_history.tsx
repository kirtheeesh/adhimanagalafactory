import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Linking, Alert, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadDispatchHistoryScreen() {
  const router = useRouter();
  const [dispatchRecords, setDispatchRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    fetchDispatchHistory();
  }, [selectedDate, selectedMonth, selectedYear]);

  const fetchDispatchHistory = async () => {
    try {
      let url = `${SERVER_URL}/packing/dispatch?year=${selectedYear}`;
      if (selectedDate) {
        url += `&date=${selectedDate}`;
      } else if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDispatchRecords(data);
      }
    } catch (error) {
      console.error("Fetch Dispatch History Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownload = (pdfPath: string) => {
    if (!pdfPath) {
      Alert.alert("Error", "PDF path is missing for this record.");
      return;
    }
    const url = `${SERVER_URL}${pdfPath}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open download link.");
    });
  };

  const handleExport = () => {
    let url = `${SERVER_URL}/packing/dispatch/export?year=${selectedYear}`;
    if (selectedDate) {
      url += `&date=${selectedDate}`;
    } else if (selectedMonth) {
      url += `&month=${selectedMonth}`;
    }
    
    Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not start export.");
    });
  };

  const months = [
    { label: 'Jan', value: '1' }, { label: 'Feb', value: '2' }, { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' }, { label: 'May', value: '5' }, { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' }, { label: 'Aug', value: '8' }, { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' },
  ];

  const years = ['2024', '2025', '2026'];

  const getKPIs = () => {
    const total = dispatchRecords.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = dispatchRecords.filter(r => r.dispatched_at.startsWith(today)).length;
    return { total, todayCount };
  };

  const { total, todayCount } = getKPIs();

  const renderDispatch = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.batchNum}>{item.batch_number}</Text>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.itemsSummary}>{item.items_summary}</Text>
        <Text style={styles.dateText}>Dispatched: {new Date(item.dispatched_at).toLocaleString()}</Text>
        <Text style={styles.byText}>By: {item.dispatched_by_name}</Text>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.pdf_path)}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>PDF</Text>
        </TouchableOpacity>
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
          <Text style={styles.title}>DISPATCH HISTORY</Text>
          <Text style={styles.subtitle}>Production Head Panel</Text>
        </View>
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
          <Ionicons name="document-text-outline" size={24} color="#10B981" />
          <Text style={styles.exportText}>CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL DISPATCH</Text>
          <Text style={styles.kpiValue}>{total}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TODAY</Text>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>{todayCount}</Text>
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
           <TouchableOpacity 
             style={[styles.filterChip, !selectedMonth && !selectedDate && styles.activeChip]}
             onPress={() => { setSelectedMonth(''); setSelectedDate(''); }}
           >
             <Text style={[styles.chipText, !selectedMonth && !selectedDate && styles.activeChipText]}>All</Text>
           </TouchableOpacity>
           
           {months.map(m => (
             <TouchableOpacity 
                key={m.value}
                style={[styles.filterChip, selectedMonth === m.value && styles.activeChip]}
                onPress={() => { setSelectedMonth(m.value); setSelectedDate(''); }}
             >
                <Text style={[styles.chipText, selectedMonth === m.value && styles.activeChipText]}>{m.label}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={dispatchRecords}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDispatch}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDispatchHistory(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No dispatch history found.</Text>
              </View>
            }
          />
        )}
      </View>

      <PHeadFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  exportBtn: { alignItems: 'center' },
  exportText: { color: '#10B981', fontSize: 8, fontWeight: 'bold' },
  kpiContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  kpiCard: { flex: 1, backgroundColor: '#1E293B', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  kpiLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  kpiValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  filterSection: { marginBottom: 10 },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', marginRight: 10 },
  activeChip: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  activeChipText: { color: '#fff' },
  content: { flex: 1 },
  list: { padding: 20, paddingTop: 0 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  batchNum: { color: '#10B981', fontSize: 10, fontWeight: '900', marginBottom: 4 },
  customerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemsSummary: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  dateText: { color: '#94A3B8', fontSize: 10, marginTop: 4 },
  byText: { color: '#64748B', fontSize: 10, marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  downloadBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' }
});
