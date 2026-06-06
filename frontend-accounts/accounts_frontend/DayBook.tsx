import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

interface DayBookEntry {
  id: number;
  date: string;
  voucher_type: string;
  party_name: string;
  reference_no: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  reason?: string;
}

export default function DayBook() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<DayBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [openingBalance, setOpeningBalance] = useState(0);
  const [gstType, setGstType] = useState<'with' | 'without'>('with');

  // Edit Modal States
  const [selectedEntry, setSelectedEntry] = useState<DayBookEntry | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNarration, setEditNarration] = useState('');
  const [editRefNo, setEditRefNo] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      
      // Fetch Opening Balance
      const summaryRes = await fetch(`${SERVER_URL}/accounts/day-book/summary?fromDate=${fromStr}&gstType=${gstType}`);
      const summaryData = await summaryRes.json();
      setOpeningBalance(summaryData.openingBalance || 0);

      // Fetch Entries
      const response = await fetch(`${SERVER_URL}/accounts/day-book?fromDate=${fromStr}&toDate=${toStr}&gstType=${gstType}`);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch day book');
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = entries.reduce((sum, item) => sum + Number(item.debit_amount || 0), 0);
  const totalCredit = entries.reduce((sum, item) => sum + Number(item.credit_amount || 0), 0);
  const closingBalance = openingBalance + totalCredit - totalDebit;

  useEffect(() => {
    fetchEntries();
  }, [fromDate, toDate, gstType]);

  const handleUpdateEntry = () => {
    if (!selectedEntry) return;

    setSubmitting(true);
    fetch(`${SERVER_URL}/accounts/day-book/${selectedEntry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        narration: editNarration,
        reference_no: editRefNo,
        date: formatDate(editDate)
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        Alert.alert('Success', 'Entry updated successfully');
        setEditModalVisible(false);
        fetchEntries();
      } else {
        Alert.alert('Error', data.error || 'Failed to update entry');
      }
    })
    .catch(err => Alert.alert('Error', 'Network error'))
    .finally(() => setSubmitting(false));
  };

  const handleDeleteEntry = () => {
    if (!selectedEntry) return;

    const performDelete = async () => {
      setSubmitting(true);
      try {
        console.log('Deleting entry:', selectedEntry.id);
        const response = await fetch(`${SERVER_URL}/accounts/day-book/${selectedEntry.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          Alert.alert('Success', 'Entry deleted successfully');
          if (Platform.OS === 'web') alert('Entry deleted successfully');
          setEditModalVisible(false);
          fetchEntries();
        } else {
          Alert.alert('Error', data.error || 'Failed to delete entry');
          if (Platform.OS === 'web') alert('Error: ' + (data.error || 'Failed to delete entry'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        Alert.alert('Error', 'Network error');
      } finally {
        setSubmitting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this entry? This will restore the bill balance and ledger.')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this entry? This will restore the bill balance and ledger.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const renderEntryRow = ({ item }: { item: DayBookEntry }) => (
    <TouchableOpacity 
      style={styles.entryRow}
      onPress={() => {
        setSelectedEntry(item);
        setEditNarration(item.description);
        setEditRefNo(item.reference_no);
        setEditDate(new Date(item.date));
        setEditModalVisible(true);
      }}
    >
      <View style={[styles.col, {flex: 1.5}]}><Text style={styles.cellText}>{new Date(item.date).toLocaleDateString()}</Text></View>
      <View style={[styles.col, {flex: 2}]}><Text style={[styles.cellText, styles.voucherType]}>{item.voucher_type}</Text></View>
      <View style={[styles.col, {flex: 3}]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.party_name}</Text>
        {item.reason && <Text style={{ color: '#94A3B8', fontSize: 9, fontStyle: 'italic' }}>{item.reason}</Text>}
        {item.voucher_type === 'Contra' && (
          <Text style={item.description.includes(`Sender: ${item.party_name}`) ? styles.senderLabel : item.description.includes(`Receiver: ${item.party_name}`) ? styles.receiverLabel : null}>
            {item.description.includes(`Sender: ${item.party_name}`) ? '(Sender)' : item.description.includes(`Receiver: ${item.party_name}`) ? '(Receiver)' : ''}
          </Text>
        )}
      </View>
      <View style={[styles.col, {flex: 2, alignItems: 'flex-end'}]}>
        <Text style={[styles.cellText, {color: '#EF4444'}]}>
          {item.debit_amount > 0 ? Number(item.debit_amount).toLocaleString() : ''}
        </Text>
      </View>
      <View style={[styles.col, {flex: 2, alignItems: 'flex-end'}]}>
        <Text style={[styles.cellText, {color: '#10B981'}]}>
          {item.credit_amount > 0 ? Number(item.credit_amount).toLocaleString() : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 5) }]}>
        <Text style={styles.title}>DAY BOOK</Text>
        <Text style={styles.subtitle}>Daily Accounts Register</Text>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.gstMenu}>
          <TouchableOpacity 
            style={[styles.gstOption, gstType === 'with' && styles.gstOptionActive]} 
            onPress={() => setGstType('with')}
          >
            <Text style={[styles.gstOptionText, gstType === 'with' && styles.gstOptionTextActive]}>With GST</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gstOption, gstType === 'without' && styles.gstOptionActive]} 
            onPress={() => setGstType('without')}
          >
            <Text style={[styles.gstOptionText, gstType === 'without' && styles.gstOptionTextActive]}>Without GST</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateInputs}>
          <View style={[styles.dateField, {marginRight: 8}]}>
            <Text style={styles.label}>From</Text>
            {Platform.OS === 'web' ? (
              <input type="date" value={formatDate(fromDate)} onChange={(e) => setFromDate(new Date(e.target.value))} style={styles.webDateInput} />
            ) : (
              <TouchableOpacity style={styles.dateBox} onPress={() => {}}><Text style={styles.dateText}>{formatDate(fromDate)}</Text></TouchableOpacity>
            )}
          </View>
          <View style={styles.dateField}>
            <Text style={styles.label}>To</Text>
            {Platform.OS === 'web' ? (
              <input type="date" value={formatDate(toDate)} onChange={(e) => setToDate(new Date(e.target.value))} style={styles.webDateInput} />
            ) : (
              <TouchableOpacity style={styles.dateBox} onPress={() => {}}><Text style={styles.dateText}>{formatDate(toDate)}</Text></TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, {flex: 1.5}]}>Date</Text>
        <Text style={[styles.headerCol, {flex: 2}]}>Voucher</Text>
        <Text style={[styles.headerCol, {flex: 3}]}>Party</Text>
        <Text style={[styles.headerCol, {flex: 2, textAlign: 'right'}]}>Debit (Dr)</Text>
        <Text style={[styles.headerCol, {flex: 2, textAlign: 'right'}]}>Credit (Cr)</Text>
      </View>

      <View style={styles.balanceRow}>
        <Text style={[styles.balanceLabel, {flex: 6.5}]}>Opening Balance</Text>
        <Text style={[styles.balanceValue, {flex: 4, textAlign: 'right'}]}>
          {openingBalance >= 0 ? `Cr ${openingBalance.toLocaleString()}` : `Dr ${Math.abs(openingBalance).toLocaleString()}`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>
      ) : (
        <>
          <FlatList
            data={entries}
            renderItem={renderEntryRow}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No entries for this period</Text>}
          />
          
          <View style={styles.footerBalance}>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, {flex: 6.5}]}>Current Total</Text>
              <Text style={[styles.balanceValue, {flex: 2, textAlign: 'right', color: '#EF4444'}]}>{totalDebit.toLocaleString()}</Text>
              <Text style={[styles.balanceValue, {flex: 2, textAlign: 'right', color: '#10B981'}]}>{totalCredit.toLocaleString()}</Text>
            </View>
            <View style={[styles.balanceRow, {borderTopWidth: 1, borderColor: '#334155', marginTop: 5, paddingTop: 10}]}>
              <Text style={[styles.balanceLabel, {flex: 6.5, color: '#fff', fontSize: 14}]}>Closing Balance</Text>
              <Text style={[styles.balanceValue, {flex: 4, textAlign: 'right', color: '#10B981', fontSize: 16}]}>
                {closingBalance >= 0 ? `Cr ${closingBalance.toLocaleString()}` : `Dr ${Math.abs(closingBalance).toLocaleString()}`}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Entry</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedEntry && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.entryInfo}>
                  <Text style={styles.infoLabel}>Voucher: <Text style={{color: '#fff'}}>{selectedEntry.voucher_type}</Text></Text>
                  <Text style={styles.infoLabel}>Party: <Text style={{color: '#fff'}}>{selectedEntry.party_name}</Text></Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date</Text>
                  {Platform.OS === 'web' ? (
                    <input type="date" value={formatDate(editDate)} onChange={(e) => setEditDate(new Date(e.target.value))} style={styles.webInput} />
                  ) : (
                    <TouchableOpacity style={styles.input} onPress={() => {}}><Text style={{color: 'white'}}>{formatDate(editDate)}</Text></TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reference No</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter reference"
                    placeholderTextColor="#94A3B8"
                    value={editRefNo}
                    onChangeText={setEditRefNo}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Narration / Description</Text>
                  <TextInput
                    style={[styles.input, {height: 80, textAlignVertical: 'top'}]}
                    placeholder="Enter narration"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={editNarration}
                    onChangeText={setEditNarration}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveBtn, submitting && {opacity: 0.7}]} 
                  onPress={handleUpdateEntry}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Update Entry</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.deleteBtn, submitting && {opacity: 0.7}]} 
                  onPress={handleDeleteEntry}
                  disabled={submitting}
                >
                  <Text style={styles.deleteBtnText}>Delete Entry</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <AccountsFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 15, backgroundColor: '#1E293B' },
  title: { fontSize: 20, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 11, color: '#10B981', fontWeight: 'bold' },
  filterSection: { padding: 12, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  gstMenu: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 10, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  gstOption: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  gstOptionActive: { backgroundColor: '#10B981' },
  gstOptionText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  gstOptionTextActive: { color: '#fff' },
  dateInputs: { flexDirection: 'row' },
  dateField: { flex: 1 },
  label: { fontSize: 9, color: '#94A3B8', marginBottom: 4, fontWeight: 'bold' },
  webDateInput: { backgroundColor: '#0F172A', color: 'white', border: '1px solid #334155', padding: 6, borderRadius: 5, width: '100%' },
  dateBox: { backgroundColor: '#0F172A', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  dateText: { color: '#fff', fontSize: 11 },
  tableHeader: { flexDirection: 'row', padding: 12, paddingVertical: 10, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerCol: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  listContent: { paddingBottom: 20 },
  entryRow: { flexDirection: 'row', padding: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B', alignItems: 'center' },
  col: { justifyContent: 'center' },
  cellText: { color: '#fff', fontSize: 10 },
  voucherType: { fontWeight: 'bold', color: '#10B981' },
  senderLabel: { fontSize: 8, color: '#F59E0B', fontWeight: 'bold' },
  receiverLabel: { fontSize: 8, color: '#3B82F6', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalBody: { flex: 1 },
  entryInfo: { backgroundColor: '#0F172A', padding: 12, borderRadius: 10, marginBottom: 15 },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 'bold' },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  webInput: { backgroundColor: '#0F172A', color: 'white', border: '1px solid #334155', padding: 12, borderRadius: 10, width: '100%', boxSizing: 'border-box' },
  saveBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  deleteBtn: { backgroundColor: 'transparent', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#F87171' },
  deleteBtnText: { color: '#F87171', fontWeight: 'bold', fontSize: 14 },
  balanceRow: { flexDirection: 'row', padding: 12, paddingVertical: 8, backgroundColor: '#1E293B', alignItems: 'center' },
  balanceLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  balanceValue: { color: '#fff', fontSize: 12, fontWeight: '900' },
  footerBalance: { backgroundColor: '#1E293B', paddingBottom: 20, borderTopWidth: 2, borderColor: '#334155' }
});
