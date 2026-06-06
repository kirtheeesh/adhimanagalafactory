import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function CustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/sales/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const renderCustomer = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/sales/customer_detail',
        params: { id: item.id }
      })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>Category: {item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/sales')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>CUSTOMERS</Text>
          <Text style={styles.subtitle}>Directory</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCustomer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <SalesFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, backgroundColor: '#1E293B', borderRadius: 12, marginRight: 15 },
  title: { color: 'white', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  submitBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
