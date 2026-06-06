import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ScrollView, Alert, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface BankAccount {
  id: number | string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  balance: number;
}

interface Transaction {
  id: number;
  date: string;
  voucher_type: string;
  party_name: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export default function BankAccounts() {
  const insets = useSafeAreaInsets();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'LIST' | 'HISTORY'>('LIST');

  // Transfer Modal States
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [targetBankId, setTargetBankId] = useState<string>('');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History States
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/accounts/bank-accounts`);
      if (response.ok) {
        const data = await response.json();
        setBanks(data);
        const firstBank = data.find((b: BankAccount) => b.bank_name !== 'CASH');
        if (firstBank) setTargetBankId(firstBank.id.toString());
      }
    } catch (error) {
      console.error("Fetch Banks Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !targetBankId) {
      Alert.alert('Error', 'Please enter amount and select bank');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/cash-to-bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          bankAccountId: targetBankId,
          remarks: transferRemarks,
          date: formatDate(new Date())
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Transfer completed');
        setTransferModalVisible(false);
        setTransferAmount('');
        setTransferRemarks('');
        fetchBanks();
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetBalance = (id: string | number) => {
    Alert.alert(
      "Reset Balance",
      "Are you sure you want to set this balance to ₹0?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${SERVER_URL}/accounts/bank-accounts/${id}/reset`, {
                method: 'PUT'
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert("Success", "Balance reset to 0");
                fetchBanks();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to reset balance");
            }
          }
        }
      ]
    );
  };

  const fetchHistory = async (account: BankAccount) => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const response = await fetch(`${SERVER_URL}/accounts/account-transactions?bankAccountId=${account.id}&fromDate=${fromStr}&toDate=${toStr}`);
      const data = await response.json();
      setTransactions(data);
      setSelectedAccount(account);
      setView('HISTORY');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!selectedAccount || transactions.length === 0) return;
    try {
      const aoaData: any[][] = [
        [`TRANSACTION REPORT - ${selectedAccount.bank_name}`, "", "", "", ""],
        ["From Date:", formatDate(fromDate), "To Date:", formatDate(toDate)],
        [],
        ["Date", "Voucher", "Party", "Debit (Out)", "Credit (In)", "Narration"]
      ];

      transactions.forEach(t => {
        aoaData.push([
          new Date(t.date).toLocaleDateString(),
          t.voucher_type,
          t.party_name,
          Number(t.debit_amount || 0),
          Number(t.credit_amount || 0),
          t.description
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(aoaData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const filename = `${selectedAccount.bank_name}_Report_${fromStr}_to_${toStr}.xlsx`;

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

  useEffect(() => {
    fetchBanks();
  }, []);

  const renderItem = ({ item }: { item: BankAccount }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => fetchHistory(item)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.bankIconContainer, item.bank_name === 'CASH' && {backgroundColor: '#F59E0B20'}]}>
          <Ionicons 
            name={item.bank_name === 'CASH' ? "wallet" : "business"} 
            size={24} 
            color={item.bank_name === 'CASH' ? "#F59E0B" : "#10B981"} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.bankName}>{item.bank_name}</Text>
          <Text style={styles.accountName}>{item.account_name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#334155" />
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>ACCOUNT NO</Text>
          <Text style={styles.detailValue}>{item.account_number}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>IFSC CODE</Text>
          <Text style={styles.detailValue}>{item.ifsc_code}</Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <View>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          <Text style={styles.balanceValue}>₹{Number(item.balance || 0).toLocaleString()}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          {item.bank_name === 'CASH' && item.balance > 0 && (
            <TouchableOpacity 
              style={[styles.transferBtn, {marginRight: 10}]} 
              onPress={(e) => {
                e.stopPropagation();
                setTransferModalVisible(true);
              }}
            >
              <Ionicons name="swap-horizontal" size={16} color="#fff" />
              <Text style={styles.transferBtnText}>TRANSFER</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.transferBtn, {backgroundColor: '#EF4444'}]} 
            onPress={(e) => {
              e.stopPropagation();
              handleResetBalance(item.id);
            }}
          >
            <Ionicons name="refresh-circle" size={16} color="#fff" />
            <Text style={styles.transferBtnText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.txCard}>
      <View style={styles.txHeader}>
        <Text style={styles.txVoucher}>{item.voucher_type}</Text>
        <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.txParty}>{item.party_name}</Text>
      <View style={styles.txFooter}>
        <Text style={styles.txDescription} numberOfLines={1}>{item.description}</Text>
        <Text style={[styles.txAmount, { color: item.debit_amount > 0 ? '#EF4444' : '#10B981' }]}>
          {item.debit_amount > 0 ? `- ₹${Number(item.debit_amount).toLocaleString()}` : `+ ₹${Number(item.credit_amount).toLocaleString()}`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 5) }]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {view === 'HISTORY' && (
            <TouchableOpacity onPress={() => setView('LIST')} style={{marginRight: 15}}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{view === 'LIST' ? 'BANKS & CASH' : selectedAccount?.bank_name}</Text>
            {view === 'HISTORY' && <Text style={styles.subtitle}>Account History</Text>}
          </View>
        </View>
        {view === 'LIST' ? (
          <TouchableOpacity onPress={() => { setLoading(true); fetchBanks(); }}>
            <Ionicons name="refresh" size={24} color="#10B981" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={exportToExcel}>
            <Ionicons name="download-outline" size={24} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
        ) : view === 'LIST' ? (
          <FlatList
            data={banks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, { paddingBottom: 150 }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBanks(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bank accounts registered.</Text>
                <Text style={styles.emptySubtext}>Add them in Admin Profile.</Text>
              </View>
            }
          />
        ) : (
          <View style={{flex: 1}}>
            <View style={styles.historyFilter}>
              {Platform.OS === 'web' && (
                <View style={{flexDirection: 'row', padding: 15, backgroundColor: '#1E293B'}}>
                  <input type="date" value={formatDate(fromDate)} onChange={(e) => setFromDate(new Date(e.target.value))} style={[styles.webDateInput, {marginRight: 10}]} />
                  <input type="date" value={formatDate(toDate)} onChange={(e) => setToDate(new Date(e.target.value))} style={[styles.webDateInput, {marginRight: 10}]} />
                  <TouchableOpacity style={styles.applyBtn} onPress={() => fetchHistory(selectedAccount!)}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransaction}
              contentContainerStyle={[styles.list, { paddingBottom: 150 }]}
              ListEmptyComponent={<Text style={styles.emptyText}>No transactions found for this period.</Text>}
            />
          </View>
        )}
      </View>

      {/* Cash to Bank Transfer Modal */}
      <Modal visible={transferModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Cash to Bank</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}><Ionicons name="close" size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            <View style={styles.transferFlow}>
              <View style={styles.flowItem}>
                <Text style={styles.flowLabel}>SENDER</Text>
                <Text style={styles.flowValue}>CASH</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#94A3B8" />
              <View style={styles.flowItem}>
                <Text style={styles.flowLabel}>RECEIVER</Text>
                <Text style={styles.flowValue}>
                  {banks.find(b => b.id.toString() === targetBankId)?.bank_name || 'SELECT BANK'}
                </Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
              <View style={styles.field}>
                <Text style={styles.label}>Select Target Bank</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={targetBankId}
                    onValueChange={(val) => setTargetBankId(val)}
                    style={styles.picker}
                    dropdownIconColor="#000000"
                  >
                    {banks.filter(b => b.bank_name !== 'CASH').map(bank => (
                      <Picker.Item key={bank.id} label={`${bank.bank_name} (${bank.account_number})`} value={bank.id.toString()} color="#000000" />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  value={transferAmount} 
                  onChangeText={setTransferAmount} 
                  placeholder="0.00" 
                  placeholderTextColor="#94A3B8" 
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput 
                  style={styles.input} 
                  value={transferRemarks} 
                  onChangeText={setTransferRemarks} 
                  placeholder="e.g., Bank Deposit" 
                  placeholderTextColor="#94A3B8" 
                />
              </View>
              <TouchableOpacity style={[styles.submitBtn, submitting && {opacity: 0.7}]} onPress={handleTransfer} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>TRANSFER TO BANK</Text>}
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
  title: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  content: { flex: 1 },
  list: { padding: 15 },
  card: { 
    backgroundColor: '#1E293B', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#334155',
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  bankIconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#10B98120', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  headerText: { flex: 1 },
  bankName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  accountName: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  detailItem: { flex: 1 },
  detailLabel: { color: '#64748B', fontSize: 9, fontWeight: 'bold', marginBottom: 3 },
  detailValue: { color: '#CBD5E1', fontSize: 12, fontWeight: 'bold' },
  balanceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#10B981', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 3 },
  balanceValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  transferBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  transferBtnText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginLeft: 4 },
  subtitle: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  
  // History
  historyFilter: { backgroundColor: '#1E293B' },
  webDateInput: { backgroundColor: '#0F172A', color: '#fff', padding: 8, borderRadius: 5, border: '1px solid #334155', flex: 1 },
  applyBtn: { backgroundColor: '#10B981', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, justifyContent: 'center' },
  txCard: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  txVoucher: { color: '#10B981', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  txDate: { color: '#64748B', fontSize: 9 },
  txParty: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  txFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txDescription: { color: '#94A3B8', fontSize: 10, flex: 1, marginRight: 8 },
  txAmount: { fontSize: 13, fontWeight: 'bold' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  transferFlow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 15 },
  flowItem: { flex: 1, alignItems: 'center' },
  flowLabel: { color: '#64748B', fontSize: 9, fontWeight: 'bold', marginBottom: 3 },
  flowValue: { color: '#fff', fontSize: 12, fontWeight: '900' },
  field: { marginBottom: 12 },
  label: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  picker: { color: '#000000', height: 45 },
  submitBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: '#64748B', fontSize: 14, marginTop: 5 },
});
