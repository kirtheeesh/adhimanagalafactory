import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator, Alert, Modal, TextInput, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountsFooter from './AccountsFooter';
import { SERVER_URL } from '@shared/constants/ApiConfig';

type ExpenseEntry = {
  id: number;
  referenceNo: string;
  partyName: string;
  amount: number | string;
  date: string;
  type: 'DEBIT';
  description?: string;
}

export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Expense Form States
  const [partyName, setPartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // We use the ledger endpoint with gstType=without and then filter for DEBIT
      const response = await fetch(`${SERVER_URL}/accounts/ledger?gstType=without`);
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
  }, []);

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
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>OTHER EXPENSES</Text>
          <Text style={styles.subtitle}>Non-GST Expenditures</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderExpenseItem}
            contentContainerStyle={styles.listContent}
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

            <ScrollView style={styles.form}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  addBtn: { padding: 5 },
  content: { flex: 1 },
  listContent: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  partyName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  refNo: { color: '#10B981', fontSize: 10, fontWeight: '900', marginTop: 4 },
  dateText: { color: '#64748B', fontSize: 12, marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  amount: { color: '#EF4444', fontSize: 18, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#475569', fontWeight: 'bold', marginTop: 10 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 25, padding: 25, maxHeight: '80%', borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  form: { flexGrow: 0 },
  label: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 15, textTransform: 'uppercase' },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 15, color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#EF4444', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }
});
