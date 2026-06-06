import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';

export default function SelectMachine() {
  const insets = useSafeAreaInsets();
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);
  const [machines, setMachines] = useState([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchAvailableMachines = async () => {
    try {
      const response = await fetchWithTimeout(`${SERVER_URL}/operator/available-machines`, {}, 5000);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMachines(data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch available machines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableMachines();
  }, []);

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleShiftIn = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("Selection Required", "Please select at least one machine.");
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetchWithTimeout(`${SERVER_URL}/operator/shift-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: userId,
          machine_ids: selectedIds
        })
      }, 10000);

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Shift In successful!");
        router.replace('/machineries');
      } else {
        Alert.alert("Error", data.error || "Failed to shift in");
        fetchAvailableMachines(); // Refresh list if someone else took it
      }
    } catch (error) {
      Alert.alert("Error", "Network error during shift in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutTxt}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SELECT MACHINES</Text>
          <Text style={styles.headerDate}>{todayLabel}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={machines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.machineCard,
              selectedIds.includes(item.id) && styles.machineCardSelected
            ]}
            onPress={() => toggleSelection(item.id)}
          >
            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>UNIT {item.id}</Text>
            </View>
            <Text style={styles.machineName}>{item.machine_name}</Text>
            <View style={[
              styles.checkbox,
              selectedIds.includes(item.id) && styles.checkboxSelected
            ]} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No available machines found.</Text>
        }
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <Text style={styles.selectionCount}>
          {selectedIds.length} Machine(s) Selected
        </Text>
        <TouchableOpacity 
          style={[
            styles.shiftInBtn,
            (selectedIds.length === 0 || submitting) && styles.shiftInBtnDisabled
          ]}
          onPress={handleShiftIn}
          disabled={selectedIds.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.shiftInBtnText}>SHIFT IN</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  header: { 
    backgroundColor: '#1E293B', 
    padding: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerLeft: { flex: 1, alignItems: 'flex-start' },
  headerCenter: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  logoutBtn: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  logoutTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  machineCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  machineCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  unitBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10
  },
  unitText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  machineName: { color: '#fff', fontSize: 15, flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#334155'
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  footer: {
    padding: 15,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  selectionCount: { color: '#94A3B8', textAlign: 'center', marginBottom: 8 },
  shiftInBtn: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  shiftInBtnDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  shiftInBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 50 },
  headerDate: { color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' },
});
