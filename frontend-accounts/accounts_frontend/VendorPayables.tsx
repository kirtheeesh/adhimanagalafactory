import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

interface VendorSummary {
  id: number;
  name: string;
  total_payable: number;
  total_paid: number;
  total_balance: number;
  previous_balance: number;
}

interface PurchaseBill {
  id: number;
  vendor_name: string;
  material_name: string;
  price: number;
  paid_amount: number;
  balance_amount: number;
  created_at: string;
}

interface PaymentHistory {
  id: number;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  bank_name?: string;
  remarks?: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
}

export default function VendorPayables() {
  const router = useRouter();
  const [view, setView] = useState<'LIST' | 'MENU' | 'BILLS' | 'PAYMENTS'>('LIST');
  const [gstType, setGstType] = useState<'with' | 'without'>('with');
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorSummary | null>(null);
  const [bills, setBills] = useState<PurchaseBill[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());

  // Payment Modal States
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK'>('CASH');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Other Expense States
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseParty, setExpenseParty] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'CASH' | 'BANK'>('CASH');
  const [selectedExpenseBankId, setSelectedExpenseBankId] = useState<string>('');

  // Previous Balance States
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [previousBalanceInput, setPreviousBalanceInput] = useState('');

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    fetchVendors(gstType);
    fetchBanks();
  }, [gstType]);

  const fetchVendors = async (type: 'with' | 'without' = gstType) => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/vendors/summary?gstType=${type}`);
      const data = await response.json();
      setVendors(Array.isArray(data) ? data : []);
      if (selectedVendor && Array.isArray(data)) {
        const updated = data.find((v: VendorSummary) => v.id === selectedVendor.id);
        if (updated) setSelectedVendor(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/accounts/bank-accounts`);
      const data = await response.json();
      setBanks(data);
      if (data.length > 0) setSelectedBankId(data[0].id.toString());
    } catch (error) {}
  };

  const fetchVendorBills = async (vendorName: string, type: 'with' | 'without' = gstType) => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const response = await fetch(`${SERVER_URL}/accounts/vendors/purchase-bills?vendorName=${encodeURIComponent(vendorName)}&fromDate=${fromStr}&toDate=${toStr}&gstType=${type}`);
      const data = await response.json();
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPayments = async (partyName: string, type: 'with' | 'without' = gstType) => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/payment-history?partyName=${encodeURIComponent(partyName)}&billType=PURCHASE&gstType=${type}`);
      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedVendor || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    
    // Validate amount against target
    const maxAllowed = selectedBill ? selectedBill.balance_amount : Infinity;
    
    if (isNaN(amount) || amount <= 0 || (selectedBill && amount > maxAllowed)) {
      Alert.alert('Error', 'Invalid payment amount');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/vendors/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: selectedBill?.id || null,
          vendorName: selectedBill ? null : selectedVendor.name,
          billType: 'PURCHASE',
          amount,
          date: formatDate(new Date()),
          remarks,
          paymentMethod,
          bankAccountId: paymentMethod === 'BANK' ? selectedBankId : null
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Payment recorded');
        setPaymentModalVisible(false);
        setPaymentAmount('');
        setRemarks('');
        fetchVendors(gstType); // Update summary
        fetchVendorBills(selectedVendor!.name, gstType);
        fetchVendorPayments(selectedVendor!.name, gstType); // Refresh payment history
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordOtherExpense = async () => {
    if (!expenseAmount || !expenseReason) {
      Alert.alert('Error', 'Please enter amount and reason');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/other-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyName: expenseParty,
          amount: parseFloat(expenseAmount),
          reason: expenseReason,
          paymentMethod: expensePaymentMethod,
          bankAccountId: expensePaymentMethod === 'BANK' ? selectedExpenseBankId : null,
          date: formatDate(new Date())
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Expense recorded');
        setExpenseModalVisible(false);
        setExpenseAmount('');
        setExpenseReason('');
        setExpenseParty('');
        fetchVendors(); // Refresh summaries (including cash/bank indirectly)
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePreviousBalance = async () => {
    if (!selectedVendor || !previousBalanceInput || isNaN(parseFloat(previousBalanceInput))) {
      Alert.alert('Error', 'Invalid balance amount');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/vendors/${selectedVendor.id}/previous-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          previous_balance: parseFloat(previousBalanceInput),
          gstType: gstType 
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Previous balance recorded');
        setBalanceModalVisible(false);
        setPreviousBalanceInput('');
        fetchVendors(); // Update summary
        // We need to update selectedVendor too as it's used in MENU view
        const updatedVendor = vendors.find(v => v.id === selectedVendor.id);
        if (updatedVendor) {
          // Re-fetching summary is better, but let's re-set selectedVendor after summary update
        }
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVendors = vendors
    .filter(v => v.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderVendorItem = ({ item }: { item: VendorSummary }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setSelectedVendor(item);
        fetchVendorBills(item.name);
        fetchVendorPayments(item.name, gstType);
        setView('MENU');
      }}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <View style={styles.cardDetails}>
        <Text style={styles.cardLabel}>Balance Due: <Text style={styles.dueAmount}>₹{Number(item.total_balance).toLocaleString()}</Text></Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" style={styles.cardChevron} />
    </TouchableOpacity>
  );

  const renderBillItem = ({ item }: { item: PurchaseBill }) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <Text style={styles.billId}>PO: {item.id}</Text>
        <Text style={styles.billDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.billMaterial}>{item.material_name}</Text>
      <View style={styles.billMain}>
        <View style={styles.billStat}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>₹{Number(item.price).toLocaleString()}</Text>
        </View>
        <View style={styles.billStat}>
          <Text style={styles.statLabel}>Paid</Text>
          <Text style={[styles.statValue, {color: '#10B981'}]}>₹{Number(item.paid_amount).toLocaleString()}</Text>
        </View>
        <View style={styles.billStat}>
          <Text style={styles.statLabel}>Balance</Text>
          <Text style={[styles.statValue, {color: '#EF4444'}]}>₹{Number(item.balance_amount).toLocaleString()}</Text>
        </View>
      </View>
      {item.balance_amount > 0 && (
        <TouchableOpacity 
          style={styles.payNowBtn}
          onPress={() => {
            setSelectedBill(item);
            setPaymentModalVisible(true);
          }}
        >
          <Text style={styles.payNowText}>Record Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentItem = ({ item }: { item: PaymentHistory }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentAmount}>₹{Number(item.payment_amount).toLocaleString()}</Text>
        <Text style={styles.paymentDate}>{new Date(item.payment_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentMethod}>{item.payment_method} {item.bank_name ? `(${item.bank_name})` : ''}</Text>
        {item.remarks && <Text style={styles.paymentRemarks}>{item.remarks}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {view !== 'LIST' && (
            <TouchableOpacity onPress={() => setView(view === 'MENU' ? 'LIST' : 'MENU')}>
              <Ionicons name="arrow-back" size={24} color="#fff" style={{marginRight: 15}} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>VENDOR PAYABLES</Text>
            {selectedVendor && <Text style={styles.subtitle}>{selectedVendor.name}</Text>}
          </View>
        </View>
        {view === 'LIST' && (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={[styles.otherExpenseBtn, {marginRight: 10}]} onPress={() => setExpenseModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.otherExpenseText}>ADD</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.otherExpenseBtn, {backgroundColor: '#10B981'}]} 
              onPress={() => router.push('/accounts/expenses')}
            >
              <Ionicons name="list-outline" size={20} color="#fff" />
              <Text style={styles.otherExpenseText}>VIEW</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {view === 'LIST' && (
        <View style={styles.listHeaderActions}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vendors..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.gstMenuInline}>
            <TouchableOpacity 
              style={[styles.gstOption, gstType === 'with' && styles.gstOptionActive]} 
              onPress={() => setGstType('with')}
            >
              <Text style={[styles.gstOptionText, gstType === 'with' && styles.gstOptionTextActive]}>GST</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.gstOption, gstType === 'without' && styles.gstOptionActive]} 
              onPress={() => setGstType('without')}
            >
              <Text style={[styles.gstOptionText, gstType === 'without' && styles.gstOptionTextActive]}>No GST</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {view === 'LIST' && (
        <FlatList
          data={filteredVendors}
          renderItem={renderVendorItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={[styles.listPadding, { paddingBottom: 150 }]}
          refreshing={loading}
          onRefresh={fetchVendors}
        />
      )}

      {view === 'MENU' && (
        <ScrollView style={styles.menuContainer} contentContainerStyle={{ paddingBottom: 150 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payable Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Previous Balance:</Text>
              <Text style={[styles.summaryValue, {color: '#F87171'}]}>₹{Number(selectedVendor?.previous_balance || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Payable:</Text>
              <Text style={styles.summaryValue}>₹{Number(selectedVendor?.total_payable || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid:</Text>
              <Text style={[styles.summaryValue, {color: '#10B981'}]}>₹{Number(selectedVendor?.total_paid || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Balance:</Text>
              <Text style={[styles.summaryValue, {color: '#EF4444'}]}>₹{Number(selectedVendor?.total_balance || 0).toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryActionBtn, {marginBottom: 10}]}
            onPress={() => {
              if (selectedVendor) {
                setSelectedBill(null);
                setPaymentModalVisible(true);
              }
            }}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.primaryActionText}>RECORD NEW PAYMENT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryActionBtn, {backgroundColor: '#64748B'}]}
            onPress={() => {
              setPreviousBalanceInput(selectedVendor?.previous_balance?.toString() || '0');
              setBalanceModalVisible(true);
            }}
          >
            <Ionicons name="calculator" size={24} color="#fff" />
            <Text style={styles.primaryActionText}>RECORD PREVIOUS BALANCE</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity onPress={() => setView('PAYMENTS')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {payments.slice(0, 3).map(p => (
            <View key={p.id} style={styles.paymentCardMini}>
              <View>
                <Text style={styles.miniAmount}>₹{Number(p.payment_amount).toLocaleString()}</Text>
                <Text style={styles.miniDate}>{new Date(p.payment_date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.miniMethod}>{p.payment_method}</Text>
            </View>
          ))}
          {payments.length === 0 && <Text style={styles.emptySmall}>No recent payments</Text>}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Bills</Text>
            <TouchableOpacity onPress={() => setView('BILLS')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {bills.filter(b => b.balance_amount > 0).slice(0, 3).map(b => (
            <TouchableOpacity key={b.id} style={styles.billCardMini} onPress={() => { setSelectedBill(b); setPaymentModalVisible(true); }}>
              <View>
                <Text style={styles.miniInv}>PO: {b.id}</Text>
                <Text style={styles.miniBalance}>Due: ₹{Number(b.balance_amount).toLocaleString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </TouchableOpacity>
          ))}
          {bills.filter(b => b.balance_amount > 0).length === 0 && <Text style={styles.emptySmall}>No pending bills</Text>}
          
          <View style={{height: 100}} />
        </ScrollView>
      )}

      {view === 'BILLS' && (
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listPadding, { paddingBottom: 150 }]}
          ListHeaderComponent={
            <View style={styles.dateFilter}>
               {Platform.OS === 'web' && (
                 <View style={{flexDirection: 'row', marginBottom: 15}}>
                    <input type="date" value={formatDate(fromDate)} onChange={(e) => setFromDate(new Date(e.target.value))} style={[styles.webInput, {marginRight: 10}]} />
                    <input type="date" value={formatDate(toDate)} onChange={(e) => setToDate(new Date(e.target.value))} style={styles.webInput} />
                 </View>
               )}
            </View>
          }
        />
      )}

      {view === 'PAYMENTS' && (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listPadding, { paddingBottom: 150 }]}
        />
      )}

      {/* Payment Modal */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}><Ionicons name="close" size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            {(selectedBill || selectedVendor) && (
              <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.billSummary}>
                  <Text style={styles.summaryLabel}>
                    {selectedBill ? `PO ${selectedBill.id} Due:` : 'Total Vendor Due:'} 
                    <Text style={styles.summaryValue}> ₹{Number(selectedBill ? selectedBill.balance_amount : selectedVendor?.total_balance).toLocaleString()}</Text>
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Amount</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={paymentAmount} onChangeText={setPaymentAmount} placeholder="0.00" placeholderTextColor="#94A3B8" />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Payment Method</Text>
                  {Platform.OS === 'web' ? (
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      style={{
                        backgroundColor: '#fff',
                        color: 'black',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        outline: 'none',
                        width: '100%',
                        fontSize: '16px'
                      }}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank Account</option>
                    </select>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={paymentMethod}
                        onValueChange={(val) => setPaymentMethod(val as any)}
                        style={styles.picker}
                        dropdownIconColor="#000000"
                      >
                        <Picker.Item label="Cash" value="CASH" color="#000000" />
                        <Picker.Item label="Bank Account" value="BANK" color="#000000" />
                      </Picker>
                    </View>
                  )}
                </View>
                {paymentMethod === 'BANK' && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Paying Bank</Text>
                    {Platform.OS === 'web' ? (
                      <select
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        style={{
                          backgroundColor: '#fff',
                          color: 'black',
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                          outline: 'none',
                          width: '100%',
                          fontSize: '16px'
                        }}
                      >
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id.toString()}>{bank.bank_name} ({bank.account_number})</option>
                        ))}
                      </select>
                    ) : (
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={selectedBankId}
                          onValueChange={(val) => setSelectedBankId(val)}
                          style={styles.picker}
                          dropdownIconColor="#000"
                        >
                          {banks.map(bank => (
                            <Picker.Item key={bank.id} label={`${bank.bank_name} (${bank.account_number})`} value={bank.id.toString()} color="#000000" />
                          ))}
                        </Picker>
                      </View>
                    )}
                  </View>
                )}
                <View style={styles.field}>
                  <Text style={styles.label}>Remarks</Text>
                  <TextInput style={[styles.input, {height: 80}]} multiline value={remarks} onChangeText={setRemarks} placeholder="Ref number / notes" placeholderTextColor="#94A3B8" />
                </View>
                <TouchableOpacity style={[styles.submitBtn, submitting && {opacity: 0.7}]} onPress={handleMakePayment} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>SAVE PAYMENT</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Other Expense Modal */}
      <Modal visible={expenseModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Other Expense</Text>
              <TouchableOpacity onPress={() => setExpenseModalVisible(false)}><Ionicons name="close" size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
              <View style={styles.field}>
                <Text style={styles.label}>Reason (e.g., Tea, Coffee, Petrol)</Text>
                <TextInput style={styles.input} value={expenseReason} onChangeText={setExpenseReason} placeholder="Enter reason" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Party Name (Optional)</Text>
                <TextInput style={styles.input} value={expenseParty} onChangeText={setExpenseParty} placeholder="e.g., Local Stall" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={expenseAmount} onChangeText={setExpenseAmount} placeholder="0.00" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Payment Method</Text>
                {Platform.OS === 'web' ? (
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                    style={{
                      backgroundColor: '#fff',
                      color: 'black',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      outline: 'none',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Account</option>
                  </select>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={expensePaymentMethod}
                      onValueChange={(val) => setExpensePaymentMethod(val as any)}
                      style={styles.picker}
                      dropdownIconColor="#000"
                    >
                      <Picker.Item label="Cash" value="CASH" color="#000000" />
                      <Picker.Item label="Bank Account" value="BANK" color="#000000" />
                    </Picker>
                  </View>
                )}
              </View>
              {expensePaymentMethod === 'BANK' && (
                <View style={styles.field}>
                  <Text style={styles.label}>Paying Bank</Text>
                  {Platform.OS === 'web' ? (
                    <select
                      value={selectedExpenseBankId}
                      onChange={(e) => setSelectedExpenseBankId(e.target.value)}
                      style={{
                        backgroundColor: '#fff',
                        color: 'black',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        outline: 'none',
                        width: '100%',
                        fontSize: '16px'
                      }}
                    >
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id.toString()}>{bank.bank_name} ({bank.account_number})</option>
                      ))}
                    </select>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedExpenseBankId}
                        onValueChange={(val) => setSelectedExpenseBankId(val)}
                        style={styles.picker}
                        dropdownIconColor="#000000"
                      >
                        {banks.map(bank => (
                          <Picker.Item key={bank.id} label={`${bank.bank_name} (${bank.account_number})`} value={bank.id.toString()} color="#000000" />
                        ))}
                      </Picker>
                    </View>
                  )}
                </View>
              )}
              <TouchableOpacity style={[styles.submitBtn, submitting && {opacity: 0.7}]} onPress={handleRecordOtherExpense} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>RECORD EXPENSE</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Record Previous Balance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={balanceModalVisible}
        onRequestClose={() => setBalanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Previous Balance</Text>
              <TouchableOpacity onPress={() => setBalanceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter Previous Balance Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={previousBalanceInput}
                onChangeText={setPreviousBalanceInput}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, {marginTop: 20}]}
              onPress={handleUpdatePreviousBalance}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>UPDATE BALANCE</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AccountsFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, backgroundColor: '#1E293B' },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
  otherExpenseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 10 },
  otherExpenseText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 5 },
  listHeaderActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginVertical: 15 },
  searchHeaderContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: '#334155', marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8 },
  gstMenuInline: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#334155' },
  gstOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  gstOptionActive: { backgroundColor: '#3B82F6' },
  gstOptionText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  gstOptionTextActive: { color: '#fff' },
  listPadding: { padding: 15 },
  card: { backgroundColor: '#1E293B', borderRadius: 15, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  cardLabel: { fontSize: 12, color: '#94A3B8' },
  dueAmount: { color: '#EF4444', fontWeight: '900' },
  cardChevron: { position: 'absolute', right: 20, top: 25 },
  menuContainer: { flex: 1, padding: 20 },
  summaryCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  summaryTitle: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#94A3B8', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonGrid: { flexDirection: 'row', marginBottom: 20 },
  menuItem: { flex: 1, backgroundColor: '#1E293B', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  menuText: { color: '#fff', marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  primaryActionBtn: { backgroundColor: '#EF4444', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryActionText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1, marginLeft: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  viewAll: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  paymentCardMini: { backgroundColor: '#1E293B', borderRadius: 12, padding: 15, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  miniAmount: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  miniDate: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  miniMethod: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  billCardMini: { backgroundColor: '#1E293B', borderRadius: 12, padding: 15, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  miniInv: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  miniBalance: { color: '#EF4444', fontSize: 10, marginTop: 2 },
  emptySmall: { color: '#64748B', fontSize: 12, textAlign: 'center', marginVertical: 10, fontStyle: 'italic' },
  billCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  billHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billId: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  billDate: { color: '#94A3B8', fontSize: 12 },
  billMaterial: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  billMain: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  billStat: { alignItems: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 10, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  payNowBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 10, alignItems: 'center' },
  payNowText: { color: '#fff', fontWeight: 'bold' },
  paymentCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 15, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  paymentAmount: { color: '#fff', fontSize: 18, fontWeight: '900' },
  paymentDate: { color: '#94A3B8', fontSize: 12 },
  paymentDetails: { },
  paymentMethod: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  paymentRemarks: { color: '#94A3B8', fontSize: 11, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  billSummary: { backgroundColor: '#0F172A', padding: 15, borderRadius: 15, marginBottom: 20 },
  field: { marginBottom: 15 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 15, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  picker: { color: '#000000', height: 50 },
  submitBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  webInput: { backgroundColor: '#0F172A', color: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', flex: 1 },
  cardDetails: { },
  dateFilter: { marginBottom: 15 }
});
