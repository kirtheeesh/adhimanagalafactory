import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountsFooter from './AccountsFooter';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SERVER_URL } from '@shared/constants/ApiConfig';

type LedgerEntry = {
  referenceNo: string;
  partyName: string;
  amount: number | string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
}

export default function Ledger() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [sales, setSales] = useState<LedgerEntry[]>([]);
  const [purchases, setPurchases] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const response = await fetch(`${SERVER_URL}/accounts/ledger?fromDate=${fromStr}&toDate=${toStr}`);
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
    fetchLedgerData();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ACCOUNTS</Text>
          <Text style={styles.subtitle}>Ledger Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
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
             <TouchableOpacity style={styles.showButton} onPress={fetchLedgerData}>
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
                    <View key={index} style={styles.row}>
                       <Text style={styles.rowDate}>{new Date(item.date).toLocaleDateString()}</Text>
                       <Text style={styles.rowParty}>{item.partyName}</Text>
                       <View style={styles.rowBottom}>
                          <Text style={styles.rowRef}>Inv: {item.referenceNo}</Text>
                          <Text style={styles.rowAmount}>₹{Number(item.amount).toLocaleString()}</Text>
                       </View>
                    </View>
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
                    <View key={index} style={styles.row}>
                       <Text style={styles.rowDate}>{new Date(item.date).toLocaleDateString()}</Text>
                       <Text style={styles.rowParty}>{item.partyName}</Text>
                       <View style={styles.rowBottom}>
                          <Text style={styles.rowRef}>PO: {item.referenceNo}</Text>
                          <Text style={styles.rowAmount}>₹{Number(item.amount).toLocaleString()}</Text>
                       </View>
                    </View>
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
      </ScrollView>

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
    padding: 20,
    marginTop: 10 
  },
  title: { color: 'white', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  logout: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  filterSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 15,
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
    width: '48%',
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
    fontSize: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  analyticsLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  analyticsValue: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    width: 80,
  },
  analyticsSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ledgerSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ledgerHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  columnsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 0 : 15,
    marginRight: Platform.OS === 'web' ? 15 : 0,
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
    fontSize: 14,
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
    fontSize: 14,
  },
  totalRow: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalRowLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
