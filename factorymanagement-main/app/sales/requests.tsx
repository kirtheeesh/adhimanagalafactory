import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, SectionList,
  StyleSheet, Text, TextInput, TouchableOpacity, View, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function SalesRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/sales/requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Fetch Requests Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    const date = new Date(req.created_at);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString();

    const matchDay = day === '' || d === day.padStart(2, '0');
    const matchMonth = month === '' || m === month.padStart(2, '0');
    const matchYear = year === '' || y.includes(year);

    return matchDay && matchMonth && matchYear;
  });

  const groupedRequests = filteredRequests.reduce((acc: any[], req) => {
    const dateStr = new Date(req.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const existingSection = acc.find(section => section.title === dateStr);
    if (existingSection) {
      existingSection.data.push(req);
    } else {
      acc.push({ title: dateStr, data: [req] });
    }
    return acc;
  }, []);

  const renderRequest = ({ item }: { item: any }) => {
    const date = new Date(item.created_at).toLocaleDateString('en-GB');
    const status = item.status || 'Pending approval';
    const isApproved = status === 'Approved';
    const isRejected = status === 'Rejected';
    const isPending = status === 'Pending approval';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({ pathname: '/sales/request_detail', params: { id: item.id } })}
      >
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <Text style={styles.batchNum}>{item.invoice_number || `ID: ${item.id}`}</Text>
            <View style={[
              styles.statusBadge, 
              isApproved && styles.approvedBadge,
              isRejected && styles.rejectedBadge,
              isPending && styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                isApproved && styles.approvedText,
                isRejected && styles.rejectedText,
                isPending && styles.pendingText
              ]}>
                {status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>{item.customer_name || item.customer_name_manual || 'Unknown Customer'}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/sales')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>SALES REQUESTS</Text>
          <Text style={styles.subtitle}>Order Approval Queue</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.createBtn} 
            onPress={() => router.push('/sales/create_request')}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createBtnText}>NEW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchRequests}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterInputGroup}>
          <Text style={styles.filterLabel}>DAY</Text>
          <TextInput 
            style={styles.filterInput} 
            placeholder="DD" 
            placeholderTextColor="#475569"
            keyboardType="numeric"
            maxLength={2}
            value={day}
            onChangeText={setDay}
          />
        </View>
        <View style={styles.filterInputGroup}>
          <Text style={styles.filterLabel}>MONTH</Text>
          <TextInput 
            style={styles.filterInput} 
            placeholder="MM" 
            placeholderTextColor="#475569"
            keyboardType="numeric"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
          />
        </View>
        <View style={styles.filterInputGroup}>
          <Text style={styles.filterLabel}>YEAR</Text>
          <TextInput 
            style={styles.filterInput} 
            placeholder="YYYY" 
            placeholderTextColor="#475569"
            keyboardType="numeric"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={() => { setDay(''); setMonth(''); setYear(''); }}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <SectionList
            sections={groupedRequests}
            keyExtractor={(item, index) => item.id?.toString() || `req-${index}`}
            renderItem={renderRequest}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={true}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No requests found.</Text>
              </View>
            }
          />
        )}
      </View>

      <SalesFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 20, marginTop: 20 },
  backBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 12, marginRight: 15 },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  createBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 10 },
  createBtnText: { color: '#fff', fontSize: 10, fontWeight: '900', marginLeft: 6 },
  title: { color: 'white', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  refreshBtn: { backgroundColor: '#10B981', padding: 10, borderRadius: 12 },
  sectionHeader: { backgroundColor: '#0F172A', paddingVertical: 10, marginBottom: 5 },
  sectionTitle: { color: '#10B981', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  filterSection: { flexDirection: 'row', backgroundColor: '#1E293B', marginHorizontal: 20, padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  filterInputGroup: { flex: 1, marginRight: 10 },
  filterLabel: { color: '#94A3B8', fontSize: 8, fontWeight: '900', marginBottom: 4 },
  filterInput: { backgroundColor: '#0F172A', borderRadius: 8, padding: 8, color: '#fff', fontSize: 12, textAlign: 'center', borderWidth: 1, borderColor: '#334155' },
  clearBtn: { padding: 5 },
  content: { flex: 1, paddingHorizontal: 20 },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, marginLeft: 8 },
  statusText: { fontSize: 8, fontWeight: '900' },
  approvedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  approvedText: { color: '#10B981' },
  rejectedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  rejectedText: { color: '#EF4444' },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  pendingText: { color: '#F59E0B' },
  batchNum: { color: '#10B981', fontSize: 10, fontWeight: '900' },
  customerName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginVertical: 2 },
  dateText: { color: '#64748B', fontSize: 12 },
  cardRight: { flexDirection: 'row', alignItems: 'center' },
  amount: { color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 10 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
});
