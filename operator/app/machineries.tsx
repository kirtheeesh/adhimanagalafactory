import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


// --- SUB-COMPONENT: MACHINE CARD (Memoized for performance) ---
const MachineCard = memo(({ item, onPress, onPausePress, onResumePress }: any) => {
  const mId = item?.id || item?.machine_id;
  const mName = item?.machine_name ?? `Machine ${mId}`;
  const mStatus = item?.status ?? "idle";
  
  const isRunning = String(mStatus).toLowerCase() === 'running';
  const isPaused = String(mStatus).toLowerCase() === 'paused' || String(mStatus).toLowerCase() === 'power_cut';

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <View style={[
      styles.card, 
      isRunning && styles.cardActive,
      isPaused && styles.cardPaused
    ]}>
      <TouchableOpacity 
        style={styles.infoArea}
        onPress={() => onPress(mId)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.unitTag, { marginRight: 8 }]}>UNIT {mId}</Text>
        </View>
        <Text style={styles.machineName}>{mName}</Text>
      </TouchableOpacity>

      <View style={styles.actionArea}>
        {isRunning && (
          <TouchableOpacity 
            style={[styles.miniPauseBtn]} 
            onPress={() => onPausePress(mId)}
          >
            <Text style={styles.miniPauseBtnText}>PAUSE</Text>
          </TouchableOpacity>
        )}
        {isPaused && (
          <TouchableOpacity 
            style={[styles.miniResumeBtn]} 
            onPress={() => onResumePress(mId)}
          >
            <Text style={styles.miniResumeBtnText}>RESUME</Text>
          </TouchableOpacity>
        )}
        <View style={[
          styles.badge, 
          { backgroundColor: isRunning ? '#10B981' : isPaused ? '#F59E0B' : '#475569' }
        ]}>
          <Text style={styles.badgeText}>{String(mStatus).toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
});


// Import your central API config
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';

export default function MachineryList() {
  const [machines, setMachines] = useState([]);
  const todayLabel = useMemo(() => new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }), []);
  const [loading, setLoading] = useState(true);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [submittingPause, setSubmittingPause] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isMounted = React.useRef(true);

  // --- LOGIC: FETCH DATA FROM DATABASE ---
  const syncData = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!isMounted.current) return;
      if (!userId) {
        // Only redirect if it stays missing for multiple checks or we are sure it's gone
        console.log("[DEBUG] userId missing in syncData");
        return;
      }

      const response = await fetchWithTimeout(`${SERVER_URL}/operator/current-shift/${userId}`, {}, 5000);
      const data = await response.json();
      
      if (!isMounted.current) return;

      if (data.active) {
        const sortedData = [...data.machines].sort((a, b) => {
          const idA = a.id || a.machine_id || 0;
          const idB = b.id || b.machine_id || 0;
          return idA - idB;
        });
        
        // --- PERFORMANCE OPTIMIZATION: Deep Compare before setting state ---
        setMachines(prev => {
          if (JSON.stringify(prev) === JSON.stringify(sortedData)) return prev;
          return sortedData;
        });
      } else {
        // If shift ended elsewhere, redirect back to selection
        // BUT: Add a small delay/retry check to be 100% sure it wasn't a transient DB error
        console.log("[DEBUG] Shift not active for user", userId);
        router.replace('/select-machine');
      }
    } catch (error) {
      console.log("Server error - check connection to Node.js", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleShiftOver = async () => {
    const performShiftOver = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const response = await fetchWithTimeout(`${SERVER_URL}/operator/shift-over`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operator_id: userId })
        }, 10000);

        if (response.ok) {
          Alert.alert("Success", "Shift Over successful!");
          router.replace('/select-machine');
        } else {
          const err = await response.json();
          Alert.alert("Error", err.error || "Failed to shift over");
        }
      } catch (error) {
        Alert.alert("Error", "Network error during shift over");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("End your shift and release machines?")) {
        performShiftOver();
      }
    } else {
      Alert.alert("Confirm Shift Over", "End your shift and release machines?", [
        { text: "Cancel", style: "cancel" },
        { text: "SHIFT OVER", style: "destructive", onPress: performShiftOver }
      ]);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    syncData(); 
    const interval = setInterval(syncData, 3000); // Throttled to 3s for stability
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const handlePauseMachine = (mId: number) => {
    setSelectedMachineId(mId);
    setPauseReason('');
    setPauseModalVisible(true);
  };

  const handleResumeMachine = async (mId: number) => {
    try {
      const res = await fetchWithTimeout(`${SERVER_URL}/machines/${mId}/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, 10000);

      if (res.ok) {
        Alert.alert("Success", "Machine resumed.");
        syncData();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.error || "Failed to resume machine");
      }
    } catch (e) {
      Alert.alert("Error", "Network error while resuming machine");
    }
  };

  const confirmPause = async () => {
    if (!selectedMachineId) return;
    if (!pauseReason.trim()) {
      Alert.alert("Required", "Please enter a reason for pausing.");
      return;
    }

    setSubmittingPause(true);
    try {
      const res = await fetchWithTimeout(`${SERVER_URL}/machines/${selectedMachineId}/pause`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: pauseReason })
      }, 10000);

      if (res.ok) {
        Alert.alert("Success", "Machine paused and log stored.");
        setPauseModalVisible(false);
        syncData();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.error || "Failed to pause machine");
      }
    } catch (e) {
      Alert.alert("Error", "Network error while pausing machine");
    } finally {
      setSubmittingPause(false);
    }
  };

  // --- UPDATED GLOBAL ACTIONS TO MATCH BACKEND ---
  const handlePauseAll = () => {
    console.log("[DEBUG] Pause All button clicked");
    
    const performPause = async () => {
      console.log("[DEBUG] Proceeding with Pause All API call");
      try {
        const res = await fetchWithTimeout(`${SERVER_URL}/machines/power-toggle`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'pause' }) 
        }, 10000);
        
        console.log(`[DEBUG] Pause All response status: ${res.status}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log("[DEBUG] Pause All success", data);
          Alert.alert("Success", "Paused all machines");
          syncData();
        } else {
          const errBody = await res.json().catch(() => ({}));
          console.error("[DEBUG] Pause All server error", errBody);
          Alert.alert("Error", `Server failed: ${errBody.error || "Unknown error"}`);
        }
      } catch (e) { 
        console.error("[DEBUG] Pause All network error", e);
        Alert.alert("Error", "Could not reach server"); 
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Freeze production for all machines?")) {
        performPause();
      }
    } else {
      Alert.alert("Confirm Pause", "Freeze production for all machines?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "PAUSE ALL", 
          style: "destructive",
          onPress: performPause
        }
      ]);
    }
  };

  const handleResumeAll = async () => {
    console.log("[DEBUG] Resume All button clicked");
    try {
      const res = await fetchWithTimeout(`${SERVER_URL}/machines/power-toggle`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }) 
      }, 10000);
      
      console.log(`[DEBUG] Resume All response status: ${res.status}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] Resume All success", data);
        Alert.alert("Success", "Resumed all machines");
        syncData();
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.error("[DEBUG] Resume All server error", errBody);
        Alert.alert("Error", `Server failed: ${errBody.error || "Unknown error"}`);
      }
    } catch (e) { 
      console.error("[DEBUG] Resume All network error", e);
      Alert.alert("Error", "Could not reach server"); 
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('user_role');
      await AsyncStorage.removeItem('user_dept');
      router.replace('/login');
    } catch (e) {
      console.error("Logout failed", e);
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutTxt}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>FACTORY MONITOR</Text>
          <Text style={styles.headerDate}>{todayLabel}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]} onPress={handleShiftOver}>
            <Text style={[styles.logoutTxt, { color: 'white' }]}>SHIFT OVER</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.masterControlBar}>
        <TouchableOpacity 
          style={[styles.masterBtn, styles.pauseBtn]} 
          onPress={handlePauseAll}
        >
          <Text style={styles.masterBtnText}>⏸ PAUSE ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.masterBtn, styles.resumeBtn]} 
          onPress={handleResumeAll}
        >
          <Text style={styles.masterBtnText}>▶ RESUME ALL</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={machines}
        keyExtractor={(item, index) => (item?.id || item?.machine_id || index).toString()}
        renderItem={({ item }) => (
          <MachineCard 
            item={item} 
            onPress={(mId) => router.push({ pathname: "/machinedetail", params: { id: mId } })} 
            onPausePress={handlePauseMachine}
            onResumePress={handleResumeMachine}
          />
        )}
        contentContainerStyle={{ padding: 15 }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={pauseModalVisible}
        onRequestClose={() => setPauseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PAUSE REASON</Text>
            <Text style={styles.modalSub}>UNIT {selectedMachineId}</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Why are you pausing?"
              placeholderTextColor="#64748B"
              value={pauseReason}
              onChangeText={setPauseReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setPauseModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={confirmPause}
                disabled={submittingPause}
              >
                {submittingPause ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>SUBMIT PAUSE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  header: { 
    backgroundColor: '#1E293B', 
    paddingTop: 10, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15
  },
  masterControlBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  masterBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  pauseBtn: { backgroundColor: '#F59E0B' },
  resumeBtn: { backgroundColor: '#10B981' },
  stopBtn: { backgroundColor: '#EF4444' },
  masterBtnText: { color: 'white', fontWeight: '900', fontSize: 12 },
  logoutBtn: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  logoutTxt: { color: '#EF4444', fontWeight: 'bold', fontSize: 10 },
  headerTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  headerDate: { color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' },
  headerLeft: { flex: 1, alignItems: 'flex-start' },
  headerCenter: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  card: { 
    backgroundColor: '#1E293B', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  cardActive: { borderLeftWidth: 6, borderLeftColor: '#10B981' },
  cardPaused: { borderLeftWidth: 6, borderLeftColor: '#F59E0B' },
  infoArea: { flex: 1, paddingRight: 10 },
  unitTag: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  machineName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, minWidth: 70, alignItems: 'center' },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  actionArea: { alignItems: 'flex-end' },
  miniPauseBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
    marginBottom: 8
  },
  miniPauseBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 10
  },
  miniResumeBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 8
  },
  miniResumeBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20
  },
  reasonInput: {
    backgroundColor: '#0F172A',
    color: 'white',
    borderRadius: 15,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#334155',
    marginRight: 10
  },
  confirmBtn: {
    backgroundColor: '#F59E0B'
  },
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});