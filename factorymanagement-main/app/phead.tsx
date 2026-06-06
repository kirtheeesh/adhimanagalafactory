import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet, Text, TouchableOpacity, View, Modal, ActivityIndicator, FlatList, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your central API config
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState<any>({
    Day: { present: 0, absent: 0 },
    Night: { present: 0, absent: 0 }
  });

  const inventoryMenu = [
    { label: 'Materials', icon: 'cube', table: 'inventory_materials', color: '#0EA5E9' },
    { label: 'Colors', icon: 'color-palette', table: 'inventory_colors', color: '#EC4899' },
    { label: 'Packing', icon: 'gift', table: 'inventory_packing', color: '#10B981' },
    { label: 'Products', icon: 'layers', table: 'inventory_product', color: '#F59E0B' },
    { label: 'Molds', icon: 'hammer', table: 'inventory_molds', color: '#8B5CF6' },
  ];

  const generalMenu = [
    { label: 'Sales Orders', icon: 'cart', route: '/phead/sales_requests', color: '#F59E0B' },
    { label: 'Packing List', icon: 'list', route: '/phead/packing_list', color: '#10B981' },
    { label: 'Approvals', icon: 'checkmark-circle', route: '/phead/approvals', color: '#3B82F6' },
    { label: 'Attendance', icon: 'people', route: '/phead/attendance', color: '#6366F1' },
    { label: 'Hourly Logs', icon: 'time', route: '/phead/hourly_reports', color: '#8B5CF6' },
    { label: 'Reports', icon: 'document-text', route: '/phead/reports', color: '#F97316' },
    { label: 'Monitoring', icon: 'pulse', route: '/phead/monitoring', color: '#EF4444' },
    { label: 'Scan QR', icon: 'qr-code', route: '/phead/scan_qr', color: '#0EA5E9' },
  ];

  const fetchData = async () => {
    try {
      // Fetch Low Stock Materials for Alert
      const stockRes = await fetch(`${SERVER_URL}/inventory/low-stock`);
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        const lowItems = Array.isArray(stockData) ? stockData : [];
        setLowStockItems(lowItems);
        if (lowItems.length > 0) {
          setShowLowStockModal(true);
        }
      }

      // Fetch Attendance Stats
      const attRes = await fetch(`${SERVER_URL}/attendance/summary-stats`);
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendanceStats(attData);
      }
    } catch (error) {
      console.log(`Sync Error: Is server running at ${SERVER_URL}?`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNav = (route: any) => {
    router.push(route);
  };

  const handleInvNav = (cat: string) => {
    router.push({
      pathname: '/phead/inventory',
      params: { active: cat }
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View>
          <Text style={styles.title}>DASHBOARD</Text>
          <Text style={styles.subtitle}>Production Head Portal</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ATTENDANCE SUMMARY</Text>
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { borderColor: '#3B82F620' }]}>
            <View style={styles.statsHeader}>
              <Ionicons name="sunny" size={16} color="#F59E0B" style={{ marginRight: 5 }} />
              <Text style={styles.statsHeaderText}>DAY SHIFT</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{attendanceStats.Day.present}</Text>
                <Text style={styles.statLabel}>PRESENT</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{attendanceStats.Day.absent}</Text>
                <Text style={styles.statLabel}>ABSENT</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsCard, { borderColor: '#6366F120' }]}>
            <View style={styles.statsHeader}>
              <Ionicons name="moon" size={16} color="#6366F1" style={{ marginRight: 5 }} />
              <Text style={styles.statsHeaderText}>NIGHT SHIFT</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{attendanceStats.Night.present}</Text>
                <Text style={styles.statLabel}>PRESENT</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{attendanceStats.Night.absent}</Text>
                <Text style={styles.statLabel}>ABSENT</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>INVENTORY MENU</Text>
        <View style={styles.menuGrid}>
          {inventoryMenu.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem} 
              onPress={() => handleInvNav(item.label)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>QUICK ACTIONS</Text>
        <View style={styles.menuGrid}>
          {generalMenu.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem} 
              onPress={() => handleNav(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
           <ActivityIndicator size="small" color="#10B981" style={{ marginTop: 20 }} />
        )}
      </ScrollView>

      {/* Low Stock Alert Modal */}
      <Modal animationType="fade" transparent={true} visible={showLowStockModal} onRequestClose={() => setShowLowStockModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseIcon} 
                onPress={() => setShowLowStockModal(false)}
              >
                <Ionicons name="close-circle" size={30} color="#64748B" />
              </TouchableOpacity>
              <Ionicons name="warning" size={40} color="#EF4444" />
              <Text style={styles.modalTitle}>LOW STOCK ALERT</Text>
            </View>
            <Text style={styles.modalDesc}>Materials below threshold. Please request purchase.</Text>
            
            <View style={styles.scrollContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.stockGrid}>
                  {lowStockItems.map((item, index) => (
                    <View key={index} style={styles.stockCard}>
                      <Text style={styles.stockItemName} numberOfLines={1}>{item.material_name}</Text>
                      <Text style={styles.stockItemQty}>{item.current_stock} KG</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.makePurchaseBtn} onPress={() => { setShowLowStockModal(false); router.push('/phead/purchase_request'); }}>
              <Text style={styles.makePurchaseText}>MAKE PURCHASE REQUEST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLowStockModal(false)}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PHeadFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  title: { color: 'white', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  logout: { backgroundColor: '#1E293B', padding: 8, borderRadius: 10 },
  content: { flex: 1, paddingHorizontal: 12 },
  sectionTitle: { color: '#10B981', fontSize: 12, fontWeight: '900', marginBottom: 12, letterSpacing: 1, marginLeft: 5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'space-between' },
  menuItem: { 
    width: '30%', 
    backgroundColor: '#1E293B', 
    borderRadius: 15, 
    paddingVertical: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 5
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  menuLabel: { color: '#F1F5F9', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
  statsCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 15, padding: 12, borderWidth: 1 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statsHeaderText: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#64748B', fontSize: 8, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: '#334155' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 15 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, width: '95%', borderWidth: 2, borderColor: '#EF4444' },
  modalHeader: { alignItems: 'center', marginBottom: 15, position: 'relative' },
  modalCloseIcon: { position: 'absolute', right: -5, top: -5, zIndex: 10 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginTop: 10 },
  modalDesc: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 15 },
  scrollContainer: { maxHeight: 300, marginBottom: 15 },
  stockGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stockCard: { 
    width: '48%', 
    backgroundColor: '#0F172A', 
    borderRadius: 12, 
    padding: 10, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  stockItemName: { color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  stockItemQty: { color: '#EF4444', fontSize: 14, fontWeight: '900' },
  makePurchaseBtn: { backgroundColor: '#E11D48', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  makePurchaseText: { color: 'white', fontWeight: '900', fontSize: 14 },
  closeBtn: { padding: 10, alignItems: 'center' },
  closeBtnText: { color: '#64748B', fontWeight: 'bold' }
});
