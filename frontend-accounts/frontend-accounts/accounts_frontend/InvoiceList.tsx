import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Linking, Modal,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import AccountsFooter from './AccountsFooter';

export default function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/accounts/invoices`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        console.error("Response Error:", response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceItems = async (id: number) => {
    setFetchingItems(true);
    try {
      // Reuse existing sales endpoint for items
      const response = await fetch(`${SERVER_URL}/sales/invoices/${id}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setFetchingItems(false);
    }
  };

  const openInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    fetchInvoiceItems(invoice.id);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownload = (id: number) => {
    const downloadUrl = `${SERVER_URL}/sales/invoices/${id}/pdf?isAdmin=true`;
    Linking.openURL(downloadUrl).catch(() => {
      Alert.alert("Error", "Could not open download link.");
    });
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.columnHeader, { flex: 0.8 }]}>Inv #</Text>
      <Text style={[styles.columnHeader, { flex: 2 }]}>Customer</Text>
      <Text style={[styles.columnHeader, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
      <Text style={[styles.columnHeader, { flex: 1.5, textAlign: 'center' }]}>Action</Text>
    </View>
  );

  const renderInvoiceRow = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.tableRow} onPress={() => openInvoice(item)}>
      <Text style={[styles.cell, { flex: 0.8 }]}>{item.id}</Text>
      <View style={{ flex: 2 }}>
        <Text style={[styles.cell, { fontWeight: 'bold' }]}>{item.customer_name}</Text>
        <Text style={styles.dateText}>{new Date(item.invoice_date).toLocaleDateString()}</Text>
        <Text style={styles.statusText}>• Approved</Text>
      </View>
      <Text style={[styles.cell, { flex: 1.2, textAlign: 'right', fontWeight: 'bold', color: '#10B981' }]}>
        ₹{item.total_amount}
      </Text>
      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={() => handleDownload(item.id)}
      >
        <Ionicons name="download-outline" size={16} color="#fff" />
        <Text style={styles.downloadBtnText}>PDF</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>APPROVED INVOICES</Text>
          <Text style={styles.subtitle}>Accounts Module</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchInvoices}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <View style={styles.tableContainer}>
            <TableHeader />
            <FlatList
              data={invoices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderInvoiceRow}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No approved invoices found.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>
            
            {selectedInvoice && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>Invoice #: {selectedInvoice.id}</Text>
                <Text style={styles.modalInfoText}>Customer: {selectedInvoice.customer_name}</Text>
                <Text style={styles.modalInfoText}>Date: {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</Text>
                <Text style={[styles.modalInfoText, { color: '#10B981', fontWeight: 'bold' }]}>Total: ₹{selectedInvoice.total_amount}</Text>
              </View>
            )}

            <View style={styles.itemsHeader}>
              <Text style={styles.itemHeaderLabel}>Product</Text>
              <Text style={[styles.itemHeaderLabel, { textAlign: 'right', width: 40 }]}>Qty</Text>
              <Text style={[styles.itemHeaderLabel, { textAlign: 'right', width: 60 }]}>Price</Text>
            </View>

            {fetchingItems ? (
              <ActivityIndicator color="#10B981" style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.itemsList}>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemCell}>{item.product_name}</Text>
                    <Text style={[styles.itemCell, { textAlign: 'right', width: 40 }]}>{item.quantity}</Text>
                    <Text style={[styles.itemCell, { textAlign: 'right', width: 60 }]}>₹{item.price_per_unit}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity 
              style={styles.modalDownloadBtn}
              onPress={() => handleDownload(selectedInvoice.id)}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.modalDownloadBtnText}>Download PDF</Text>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    marginTop: 20 
  },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  refreshBtn: { backgroundColor: '#10B981', padding: 8, borderRadius: 10, marginRight: 10 },
  logout: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  content: { flex: 1, paddingHorizontal: 15 },
  tableContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  columnHeader: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
  },
  cell: {
    color: '#F1F5F9',
    fontSize: 12,
  },
  dateText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  statusText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    flex: 1.5,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  listContent: { paddingBottom: 20 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  modalInfoText: {
    color: '#F1F5F9',
    fontSize: 14,
    marginBottom: 4,
  },
  itemsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    paddingBottom: 8,
    marginBottom: 8,
  },
  itemHeaderLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  itemsList: {
    maxHeight: 300,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  itemCell: {
    color: '#F1F5F9',
    fontSize: 13,
    flex: 1,
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalDownloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
