import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountsFooter from './AccountsFooter';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SERVER_URL } from '@shared/constants/ApiConfig';

type LedgerEntry = {
  id: number;
  referenceNo: string;
  partyName: string;
  amount: number | string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
  reason?: string;
}

export default function Ledger() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [sales, setSales] = useState<LedgerEntry[]>([]);
  const [purchases, setPurchases] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [gstType, setGstType] = useState<'with' | 'without'>('with');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Bill Form States
  const [partyName, setPartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [reason, setReason] = useState('');
  const [billType, setBillType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');

  // Ledger Editing States
  const [editLedgerModalVisible, setEditLedgerModalVisible] = useState(false);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<LedgerEntry | null>(null);
  const [editLedgerDate, setEditLedgerDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchLedgerData = async (type: 'with' | 'without' = gstType) => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const response = await fetch(`${SERVER_URL}/accounts/ledger?fromDate=${fromStr}&toDate=${toStr}&gstType=${type}`);
      const data = await response.json();
      if (data.sales && data.purchases) {
        setSales(data.sales);
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData(gstType);
  }, [gstType]);

  const handleAddBill = async () => {
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
          type: billType,
          referenceNo,
          reason,
          date: formatDate(new Date())
        })
      });
      if (response.ok) {
        Alert.alert('Success', 'Bill added successfully');
        setModalVisible(false);
        setPartyName('');
        setAmount('');
        setReferenceNo('');
        setReason('');
        fetchLedgerData(gstType);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLedgerDate = async () => {
    if (!selectedLedgerEntry) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/ledger/${selectedLedgerEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDate(editLedgerDate) })
      });
      if (response.ok) {
        Alert.alert('Success', 'Ledger date updated successfully');
        setEditLedgerModalVisible(false);
        fetchLedgerData(gstType);
      } else {
        Alert.alert('Error', 'Failed to update ledger date');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePushTally = async () => {
    if (sales.length === 0 && purchases.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('There is no ledger data to push to Tally.');
      } else {
        Alert.alert('No Data', 'There is no ledger data to push to Tally.');
      }
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/push-to-tally`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales, purchases })
      });
      
      const data = await response.json();
      if (response.ok && data.xml) {
        // Now post the XML from the browser to local Tally (on port 9000)
        try {
          // Use 'no-cors' mode to bypass browser security for Tally's local server
          await fetch('http://127.0.0.1:9000', {
            method: 'POST',
            body: data.xml,
            mode: 'no-cors'
          });
          
          const successMsg = 'Ledger data sent to local Tally! Check Day Book (Alt+F2 for 2026). If it didn\'t appear, use the "Download XML" option.';
          if (Platform.OS === 'web') window.alert(successMsg);
          else Alert.alert('Tally Sent', successMsg);
        } catch (tallyErr) {
          const errMsg = 'Could not reach local Tally. Ensure Tally Prime is open and Port 9000 is enabled. Use "Download XML" as a fallback.';
          if (Platform.OS === 'web') window.alert(errMsg);
          else Alert.alert('Tally Error', errMsg);
        }
      } else {
        if (Platform.OS === 'web') window.alert(data.error || 'Failed to generate Tally XML.');
        else Alert.alert('Tally Error', data.error || 'Failed to generate Tally XML.');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Could not connect to the backend Tally bridge.');
      } else {
        Alert.alert('Error', 'Could not connect to the backend Tally bridge.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTallyXML = async () => {
    if (sales.length === 0 && purchases.length === 0) {
      Alert.alert('No Data', 'There is no ledger data to export.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/push-to-tally`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales, purchases })
      });
      
      const data = await response.json();
      if (response.ok && data.xml) {
        const filename = `TallyVouchers_${new Date().getTime()}.xml`;
        if (Platform.OS === 'web') {
          const blob = new Blob([data.xml], { type: 'text/xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
        } else {
          const uri = FileSystem.cacheDirectory + filename;
          await FileSystem.writeAsStringAsync(uri, data.xml);
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download XML');
    } finally {
      setLoading(false);
    }
  };

  const totalSales = sales.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPurchases = purchases.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netAmount = totalSales - totalPurchases;

  // Analysis KPI Calculations
  const transactionCount = sales.length + purchases.length;
  const profitMargin = totalSales > 0 ? ((totalSales - totalPurchases) / totalSales) * 100 : 0;
  const expenseRatio = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;

  // Analytics
  const highestCustomer = sales.length > 0 
    ? [...sales].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
    : null;
  const highestVendor = purchases.length > 0 
    ? [...purchases].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
    : null;

  const exportToExcel = async () => {
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);

      // --- CONSTRUCT EXCEL DATA (ARRAY OF ARRAYS) ---
      const aoaData: any[][] = [
        ["LEDGER REPORT", "", "", ""],
        ["From Date:", fromStr, "To Date:", toStr],
        [],
        ["CREDIT (SALES)"],
        ["Date", "Customer Name", "Invoice No", "Amount (Credit)"]
      ];

      // Add Sales Rows
      sales.forEach(s => {
        aoaData.push([
          new Date(s.date).toLocaleDateString(),
          s.partyName,
          s.referenceNo,
          Number(s.amount)
        ]);
      });

      // Add Sales Total
      aoaData.push(["TOTAL SALES (CREDIT)", "", "", totalSales]);
      aoaData.push([]); // Empty row
      
      // Add Purchases Header
      aoaData.push(["DEBIT (PURCHASES)"]);
      aoaData.push(["Date", "Vendor Name", "PO/Invoice No", "Amount (Debit)"]);

      // Add Purchases Rows
      purchases.forEach(p => {
        aoaData.push([
          new Date(p.date).toLocaleDateString(),
          p.partyName,
          p.referenceNo,
          Number(p.amount)
        ]);
      });

      // Add Purchases Total
      aoaData.push(["TOTAL PURCHASES (DEBIT)", "", "", totalPurchases]);
      aoaData.push([]); // Empty row

      // Add Final Summary
      aoaData.push(["FINAL SUMMARY"]);
      aoaData.push(["Total Credit (Sales):", "", "", totalSales]);
      aoaData.push(["Total Debit (Purchases):", "", "", totalPurchases]);
      aoaData.push(["NET BALANCE:", "", "", netAmount]);

      // Create Sheet and Workbook
      const ws = XLSX.utils.aoa_to_sheet(aoaData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ledger Report");

      // Export Logic
      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ledger_Report_${fromStr}_to_${toStr}.xlsx`;
        a.click();
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const filename = `Ledger_Report_${fromStr}_to_${toStr}.xlsx`;
        const uri = FileSystem.cacheDirectory + filename;
        
        await FileSystem.writeAsStringAsync(uri, wbout, { 
          encoding: FileSystem.EncodingType.Base64 
        });

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Export Ledger Data',
            UTI: 'com.microsoft.excel.xlsx'
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      }
    } catch (err) {
      console.error("Export Error:", err);
      Alert.alert("Error", "Failed to export Excel file.");
    }
  };

  const onFromChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) setFromDate(selectedDate);
  };

  const onToChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) setToDate(selectedDate);
  };

  const onEditDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEditDatePicker(false);
    if (selectedDate) setEditLedgerDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 5) }]}>
        <View>
          <Text style={styles.title}>ACCOUNTS</Text>
          <Text style={styles.subtitle}>Ledger Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          {gstType === 'with' && (
            <>
              <TouchableOpacity style={styles.downloadTallyBtn} onPress={handleDownloadTallyXML} title="Download XML for Manual Import">
                <Ionicons name="download-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.pushTallyBtn} onPress={handlePushTally}>
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text style={styles.pushTallyText}>Push Tally</Text>
              </TouchableOpacity>
            </>
          )}
          {gstType === 'without' && (
            <TouchableOpacity style={styles.addBillBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={24} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logout} onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* GST Type Selector Menu */}
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filters */}
        <View style={styles.filterSection}>
          <View style={styles.dateInputs}>
             <View style={styles.dateField}>
                <Text style={styles.label}>From Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={formatDate(fromDate)}
                    onChange={(e) => setFromDate(new Date(e.target.value))}
                    style={{
                      backgroundColor: '#0F172A',
                      color: 'white',
                      border: '1px solid #334155',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      width: '100%',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <TouchableOpacity style={styles.dateBox} onPress={() => setShowFromPicker(true)}>
                    <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
                  </TouchableOpacity>
                )}
             </View>
             <View style={styles.dateField}>
                <Text style={styles.label}>To Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={formatDate(toDate)}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      if (!isNaN(selectedDate.getTime())) {
                        setToDate(selectedDate);
                      }
                    }}
                    style={{
                      backgroundColor: '#0F172A',
                      color: 'white',
                      border: '1px solid #334155',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      width: '100%',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <TouchableOpacity style={styles.dateBox} onPress={() => setShowToPicker(true)}>
                    <Text style={styles.dateText}>{formatDate(toDate)}</Text>
                  </TouchableOpacity>
                )}
             </View>
          </View>
          <View style={styles.actionButtons}>
             <TouchableOpacity style={styles.showButton} onPress={() => fetchLedgerData(gstType)}>
                <Text style={styles.buttonText}>Show Accounts</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
                <Ionicons name="download-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Export to Excel</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Dashboard */}
        <View style={styles.dashboardGrid}>
           <View style={[styles.dashboardCard, { borderLeftColor: '#10B981' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="trending-up-outline" size={18} color="#10B981" />
              </View>
              <Text style={styles.dashboardLabel}>Total Revenue</Text>
              <Text style={[styles.dashboardValue, { color: '#10B981' }]}>₹{totalSales.toLocaleString()}</Text>
           </View>
           
           <View style={[styles.dashboardCard, { borderLeftColor: '#EF4444' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="cart-outline" size={18} color="#EF4444" />
              </View>
              <Text style={styles.dashboardLabel}>Expenses</Text>
              <Text style={[styles.dashboardValue, { color: '#EF4444' }]}>₹{totalPurchases.toLocaleString()}</Text>
           </View>

           <View style={[styles.dashboardCard, { borderLeftColor: '#3B82F6' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="wallet-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.dashboardLabel}>Net Balance</Text>
              <Text style={[styles.dashboardValue, { color: '#3B82F6' }]}>₹{netAmount.toLocaleString()}</Text>
           </View>

           <View style={[styles.dashboardCard, { borderLeftColor: '#F59E0B' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="stats-chart-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.dashboardLabel}>Profit Margin</Text>
              <Text style={[styles.dashboardValue, { color: '#F59E0B' }]}>{profitMargin.toFixed(1)}%</Text>
           </View>

           <View style={[styles.dashboardCard, { borderLeftColor: '#8B5CF6' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.dashboardLabel}>Total Trans.</Text>
              <Text style={[styles.dashboardValue, { color: '#8B5CF6' }]}>{transactionCount}</Text>
           </View>

           <View style={[styles.dashboardCard, { borderLeftColor: '#EC4899' }]}>
              <View style={styles.dashboardIconContainer}>
                <Ionicons name="pie-chart-outline" size={18} color="#EC4899" />
              </View>
              <Text style={styles.dashboardLabel}>Exp. Ratio</Text>
              <Text style={[styles.dashboardValue, { color: '#EC4899' }]}>{expenseRatio.toFixed(1)}%</Text>
           </View>
        </View>

        {/* Analytics Section */}
        {(highestCustomer || highestVendor) && (
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionHeader}>Quick Analysis</Text>
            <View style={styles.analyticsGrid}>
              {highestCustomer && (
                <View style={styles.analyticsCard}>
                   <Ionicons name="star" size={20} color="#F59E0B" />
                   <View style={{ marginLeft: 10 }}>
                      <Text style={styles.analyticsLabel}>Top Customer</Text>
                      <Text style={styles.analyticsValue} numberOfLines={1}>{highestCustomer.partyName}</Text>
                      <Text style={styles.analyticsSub}>₹{Number(highestCustomer.amount).toLocaleString()}</Text>
                   </View>
                </View>
              )}
              {highestVendor && (
                <View style={styles.analyticsCard}>
                   <Ionicons name="trending-up" size={20} color="#10B981" />
                   <View style={{ marginLeft: 10 }}>
                      <Text style={styles.analyticsLabel}>Top Vendor</Text>
                      <Text style={styles.analyticsValue} numberOfLines={1}>{highestVendor.partyName}</Text>
                      <Text style={styles.analyticsSub}>₹{Number(highestVendor.amount).toLocaleString()}</Text>
                   </View>
                </View>
              )}
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.ledgerSection}>
            <Text style={styles.ledgerHeaderTitle}>Ledger</Text>
            <View style={styles.columnsContainer}>
              {/* Credit Column */}
              <View style={styles.column}>
                <View style={[styles.columnHeader, { backgroundColor: '#10B98120' }]}>
                   <Text style={[styles.columnHeaderText, { color: '#10B981' }]}>Credit (Sales)</Text>
                </View>
                {sales.length === 0 ? (
                  <Text style={styles.noData}>No sales records</Text>
                ) : (
                  sales.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.row}
                      onPress={() => {
                        setSelectedLedgerEntry(item);
                        setEditLedgerDate(new Date(item.date));
                        setEditLedgerModalVisible(true);
                      }}
                    >
                       <Text style={styles.rowDate}>{new Date(item.date).toLocaleDateString()}</Text>
                       <Text style={styles.rowParty}>{item.partyName}</Text>
                       {item.reason && <Text style={{ color: '#94A3B8', fontSize: 11, fontStyle: 'italic', marginBottom: 2 }}>{item.reason}</Text>}
                       <View style={styles.rowBottom}>
                          <Text style={styles.rowRef}>Inv: {item.referenceNo}</Text>
                          <Text style={styles.rowAmount}>₹{Number(item.amount).toLocaleString()}</Text>
                       </View>
                    </TouchableOpacity>
                  ))
                )}
                {sales.length > 0 && (
                  <View style={[styles.row, styles.totalRow, { borderLeftColor: '#10B981' }]}>
                    <Text style={styles.totalRowLabel}>TOTAL CREDIT</Text>
                    <Text style={[styles.rowAmount, { color: '#10B981' }]}>₹{totalSales.toLocaleString()}</Text>
                  </View>
                )}
              </View>

              {/* Debit Column */}
              <View style={styles.column}>
                <View style={[styles.columnHeader, { backgroundColor: '#EF444420' }]}>
                   <Text style={[styles.columnHeaderText, { color: '#EF4444' }]}>Debit (Purchases)</Text>
                </View>
                {purchases.length === 0 ? (
                   <Text style={styles.noData}>No purchase records</Text>
                ) : (
                  purchases.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.row}
                      onPress={() => {
                        setSelectedLedgerEntry(item);
                        setEditLedgerDate(new Date(item.date));
                        setEditLedgerModalVisible(true);
                      }}
                    >
                       <Text style={styles.rowDate}>{new Date(item.date).toLocaleDateString()}</Text>
                       <Text style={styles.rowParty}>{item.partyName}</Text>
                       {item.reason && <Text style={{ color: '#94A3B8', fontSize: 11, fontStyle: 'italic', marginBottom: 2 }}>{item.reason}</Text>}
                       <View style={styles.rowBottom}>
                          <Text style={styles.rowRef}>PO: {item.referenceNo}</Text>
                          <Text style={styles.rowAmount}>₹{Number(item.amount).toLocaleString()}</Text>
                       </View>
                    </TouchableOpacity>
                  ))
                )}
                {purchases.length > 0 && (
                  <View style={[styles.row, styles.totalRow, { borderLeftColor: '#EF4444' }]}>
                    <Text style={styles.totalRowLabel}>TOTAL DEBIT</Text>
                    <Text style={[styles.rowAmount, { color: '#EF4444' }]}>₹{totalPurchases.toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Native Date Pickers */}
        {showFromPicker && <DateTimePicker value={fromDate} mode="date" onChange={onFromChange} />}
        {showToPicker && <DateTimePicker value={toDate} mode="date" onChange={onToChange} />}
        {showEditDatePicker && <DateTimePicker value={editLedgerDate} mode="date" onChange={onEditDateChange} />}
      </ScrollView>

      {/* Add Bill Modal for Without GST */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Without GST Bill</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 150 }}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.billTypeContainer}>
                <TouchableOpacity 
                  style={[styles.billTypeBtn, {marginRight: 10}, billType === 'CREDIT' && styles.billTypeBtnActive]}
                  onPress={() => setBillType('CREDIT')}
                >
                  <Text style={[styles.billTypeBtnText, billType === 'CREDIT' && styles.billTypeBtnTextActive]}>CREDIT (SALES)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.billTypeBtn, billType === 'DEBIT' && styles.billTypeBtnActive]}
                  onPress={() => setBillType('DEBIT')}
                >
                  <Text style={[styles.billTypeBtnText, billType === 'DEBIT' && styles.billTypeBtnTextActive]}>DEBIT (PURCHASE)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Party Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter party name"
                placeholderTextColor="#94A3B8"
                value={partyName}
                onChangeText={setPartyName}
              />

              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.label}>Reference / Invoice No</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reference no"
                placeholderTextColor="#94A3B8"
                value={referenceNo}
                onChangeText={setReferenceNo}
              />

              <Text style={styles.label}>Reason</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reason"
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleAddBill}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Bill</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Ledger Date Modal */}
      <Modal animationType="slide" transparent={true} visible={editLedgerModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Ledger Date</Text>
              <TouchableOpacity onPress={() => setEditLedgerModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            {selectedLedgerEntry && (
              <View style={styles.form}>
                <View style={styles.entryInfoBrief}>
                  <Text style={styles.infoText}>{selectedLedgerEntry.partyName}</Text>
                  <Text style={styles.infoText}>₹{Number(selectedLedgerEntry.amount).toLocaleString()}</Text>
                </View>

                <Text style={styles.label}>New Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={formatDate(editLedgerDate)}
                    onChange={(e) => setEditLedgerDate(new Date(e.target.value))}
                    style={{
                      backgroundColor: '#0F172A',
                      color: 'white',
                      border: '1px solid #334155',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      width: '100%',
                      marginBottom: 20
                    }}
                  />
                ) : (
                  <TouchableOpacity style={styles.dateBox} onPress={() => setShowEditDatePicker(true)}>
                    <Text style={styles.dateText}>{formatDate(editLedgerDate)}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleUpdateLedgerDate}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Date</Text>}
                </TouchableOpacity>
              </View>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15,
    marginTop: 5 
  },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  logout: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBillBtn: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 15,
  },
  pushTallyBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 15,
  },
  pushTallyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  downloadTallyBtn: {
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 15,
  },
  gstMenu: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gstOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  gstOptionActive: {
    backgroundColor: '#3B82F6',
  },
  gstOptionText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gstOptionTextActive: {
    color: 'white',
  },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 150 },
  filterSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateField: {
    width: '48%',
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  dateBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  dateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#10B981',
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dashboardCard: {
    backgroundColor: '#1E293B',
    width: '47%',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  dashboardIconContainer: {
    backgroundColor: '#0F172A',
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashboardLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dashboardValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  analyticsSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  analyticsGrid: {
    flexDirection: 'column',
  },
  analyticsCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  analyticsLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  analyticsValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    width: '100%',
  },
  analyticsSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ledgerSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ledgerHeaderTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  columnsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  column: {
    width: '100%',
    marginBottom: 12,
  },
  columnHeader: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  columnHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  noData: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  row: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rowDate: {
    color: '#64748B',
    fontSize: 11,
  },
  rowParty: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
    marginVertical: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  rowRef: {
    color: '#94A3B8',
    fontSize: 11,
  },
  rowAmount: {
    color: 'white',
    fontWeight: '900',
    fontSize: 13,
  },
  totalRow: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalRowLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 25, padding: 25, maxHeight: '90%', borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  form: { flexGrow: 0 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 15, color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 5 },
  submitBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  billTypeContainer: { flexDirection: 'row', marginBottom: 10 },
  billTypeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  billTypeBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  billTypeBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  billTypeBtnTextActive: { color: 'white' },
  entryInfoBrief: {
    backgroundColor: '#0F172A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});
