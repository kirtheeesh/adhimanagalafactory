import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import SalesFooter from '@shared/components/SalesFooter';

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/sales/customers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error("Fetch Customer Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 100 }} />
    </SafeAreaView>
  );

  if (!customer) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>CUSTOMER NOT FOUND</Text>
        <View style={{ width: 24 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>CUSTOMER DETAILS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>NAME</Text>
            <Text style={styles.value}>{customer.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>CATEGORY</Text>
            <Text style={styles.value}>{customer.category || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>GST NUMBER</Text>
            <Text style={[styles.value, { color: '#10B981' }]}>{customer.gst || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <Text style={styles.value}>{customer.phone_number || 'N/A'}</Text>
          </View>

          {customer.alternate_phone_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>ALT PHONE NUMBER</Text>
              <Text style={styles.value}>{customer.alternate_phone_number}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <Text style={styles.value}>{customer.email || 'N/A'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>ADDRESS</Text>
            <Text style={[styles.value, { marginTop: 10, lineHeight: 20 }]}>
              {customer.address || 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <SalesFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: '900' },
  content: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: '#1E293B', borderRadius: 25, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
  infoRow: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 15 },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 5, letterSpacing: 1 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
