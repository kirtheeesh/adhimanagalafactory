import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function SalesHome() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log(`Fetching from: ${SERVER_URL}/sales/products`);
      const response = await fetch(`${SERVER_URL}/sales/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Response Error:", response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.columnHeader, { flex: 0.5 }]}>ID</Text>
      <Text style={[styles.columnHeader, { flex: 2 }]}>Product Name</Text>
      <Text style={[styles.columnHeader, { flex: 1, textAlign: 'right' }]}>Stock</Text>
      <Text style={[styles.columnHeader, { flex: 1, textAlign: 'right' }]}>Weight</Text>
    </View>
  );

  const renderProductRow = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 0.5 }]}>{item.product_id}</Text>
      <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>{item.product_name}</Text>
      <Text style={[styles.cell, { flex: 1, textAlign: 'right', color: item.stock_qty < (item.minimum_stock_level || 0) ? '#EF4444' : '#10B981' }]}>
        {item.stock_qty}
      </Text>
      <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{item.unit_weight_gm || 0}g</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVENTORY</Text>
          <Text style={styles.subtitle}>Product Stock Status</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchProducts}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
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
              data={products}
              keyExtractor={(item, index) => item.product_id?.toString() || `prod-${index}`}
              renderItem={renderProductRow}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No products found in inventory.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      <SalesFooter />
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
  title: { color: 'white', fontSize: 28, fontWeight: '900' },
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
    fontSize: 12,
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
    fontSize: 13,
  },
  listContent: { paddingBottom: 20 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
});
