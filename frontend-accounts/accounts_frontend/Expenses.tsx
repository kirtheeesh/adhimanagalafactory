import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator, Alert, Modal, TextInput, FlatList
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountsFooter from './AccountsFooter';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type ExpenseEntry = {
  id: number;
  referenceNo: string;
  partyName: string;
  amount: number | string;
  date: string;
  type: 'DEBIT';
  description?: string;
  reason?: string;
}

export default function Expenses() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());

  // New Expense Form States
  const [partyName, setPartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const response = await fetch(`${SERVER_URL}/accounts/ledger?gstType=without&fromDate=${fromStr}&toDate=${toStr}`);
      const data = await response.json();
      if (data.purchases) {
        setExpenses(data.purchases);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fromDate, toDate]);

  const exportToExcel = async () => {
    if (expenses.length === 0) return;
    try {
      const aoaData: any[][] = [
        ["OTHER EXPENSES REPORT", "", "", ""],
        ["From Date:", formatDate(fromDate), "To Date:", formatDate(toDate)],
        [],
        ["Date", "Party Name", "Reference No", "Amount", "Description"]
      ];

      expenses.forEach(e => {
        aoaData.push([
          new Date(e.date).toLocaleDateString(),
          e.partyName,
          e.referenceNo || 'N/A',
          Number(e.amount),
          e.description || ''
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(aoaData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expenses");

      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const filename = `OtherExpenses_${fromStr}_to_${toStr}.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to export Excel file.");
    }
  };

  const handleAddExpense = async () => {
    if (!partyName || !amount) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/without-gst`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyName,
          amount: parseFloat(amount),
          type: 'DEBIT',
          referenceNo,
          description,
          reason,
          date: formatDate(new Date())
        })
      });
      if (response.ok) {
        Alert.alert('Success', 'Expense added successfully');
        setModalVisible(false);
        setPartyName('');
        setAmount('');
        setReferenceNo('');
        setDescription('');
        setReason('');
        fetchExpenses();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const renderExpenseItem = ({ item }: { item: ExpenseEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.partyName}>{item.partyName}</Text>
        <Text style={styles.refNo}>{item.referenceNo || 'No Ref'}</Text>
        {item.reason && <Text style={styles.reasonText}>{item.reason}</Text>}
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>₹{Number(item.amount).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 5) }]}>
        <View>
          <Text style={styles.title}>OTHER EXPENSES</Text>
          <Text style={styles.subtitle}>Non-GST Expenditures</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={exportToExcel} style={{marginRight: 15}}>
            <Ionicons name="download-outline" size={24} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterSection}>
        {Platform.OS === 'web' && (
          <View style={{flexDirection: 'row'}}>
            <View style={[styles.dateField, {marginRight: 10}]}>
              <Text style={styles.filterLabel}>From</Text>
              <input type="date" value={formatDate(fromDate)} onChange={(e) => setFromDate(new Date(e.target.value))} style={styles.webDateInput} />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.filterLabel}>To</Text>
              <input type="date" value={formatDate(toDate)} onChange={(e) => setToDate(new Date(e.target.value))} style={styles.webDateInput} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderExpenseItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 150 }]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={60} color="#1E293B" />
                <Text style={styles.emptyText}>No expenses recorded yet.</Text>
              </View>
            }
            onRefresh={fetchExpenses}
            refreshing={loading}
          />
        )}
      </View>

      {/* Add Expense Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Other Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 150 }}>
              <Text style={styles.label}>Vendor / Party Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor="#94A3B8"
                value={partyName}
                onChangeText={setPartyName}
              />

              <Text style={styles.label}>Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.label}>Reference / Bill No</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reference number"
                placeholderTextColor="#94A3B8"
                value={referenceNo}
                onChangeText={setReferenceNo}
              />

              <Text style={styles.label}>Reason *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reason for expense"
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Enter description"
                placeholderTextColor="#94A3B8"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleAddExpense}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Expense</Text>}
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
  addBtn: { padding: 5 },
  filterSection: { paddingHorizontal: 15, marginBottom: 8 },
  dateField: { flex: 1 },
  filterLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  webDateInput: { backgroundColor: '#1E293B', color: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', width: '100%', fontSize: 13 },
  content: { flex: 1 },
  listContent: { padding: 15 },
  card: { backgroundColor: '#1E293B', padding: 12, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  partyName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  refNo: { color: '#10B981', fontSize: 9, fontWeight: '900', marginTop: 3 },
  reasonText: { color: '#F1F5F9', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
  dateText: { color: '#64748B', fontSize: 11, marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  amount: { color: '#EF4444', fontSize: 16, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#475569', fontWeight: 'bold', marginTop: 8, fontSize: 12 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { flexGrow: 0 },
  label: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: 'white', fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#EF4444', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }
});
