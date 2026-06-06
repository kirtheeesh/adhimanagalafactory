import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadScanQRScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stickerData, setStickerData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then(setUserId);
  }, []);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/sticker/${data}`);
      if (response.ok) {
        const result = await response.json();
        setStickerData(result);
      } else {
        Alert.alert("Error", "Invalid QR Code or Sticker not found", [{ text: "OK", onPress: () => setScanned(false) }]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch sticker details", [{ text: "OK", onPress: () => setScanned(false) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!stickerData || !userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/packing/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sticker_id: stickerData.id,
          dispatched_by: userId
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Sticker Dispatched Successfully");
        setStickerData(null);
        setScanned(false);
        router.push('/phead/dispatch_history');
      } else {
        const err = await response.json();
        Alert.alert("Dispatch Failed", err.error || "Internal Server Error");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/phead')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>SCAN QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.cameraContainer}>
        {!stickerData && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
        
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        )}
      </View>

      {stickerData && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>STICKER DETAILS</Text>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Batch Number:</Text>
                    <Text style={styles.detailValue}>{stickerData.batch_number}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sticker Number:</Text>
                    <Text style={styles.detailValue}>{stickerData.sticker_number}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{stickerData.customer_name}</Text>
                </View>
                
                <Text style={styles.sectionTitle}>PRODUCTS:</Text>
                {stickerData.items?.map((item: any, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemQty}>{item.quantity}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setStickerData(null); setScanned(false); }}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.dispatchBtn, stickerData.status === 'Dispatched' && { backgroundColor: '#64748B' }]} 
                    onPress={handleDispatch}
                    disabled={stickerData.status === 'Dispatched'}
                >
                  <Text style={styles.dispatchBtnText}>{stickerData.status === 'Dispatched' ? 'ALREADY DISPATCHED' : 'DISPATCH'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <PHeadFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 20, margin: 20, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  permissionText: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  permissionBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12 },
  permissionBtnText: { color: '#fff', fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 25, padding: 25, maxHeight: '80%', borderWidth: 1, borderColor: '#334155' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalBody: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#94A3B8', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { color: '#10B981', fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  itemName: { color: '#F1F5F9', fontSize: 14 },
  itemQty: { color: '#10B981', fontWeight: 'bold' },
  modalFooter: { flexDirection: 'row' },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#64748B', alignItems: 'center', marginRight: 10 },
  cancelBtnText: { color: '#64748B', fontWeight: 'bold' },
  dispatchBtn: { flex: 2, backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center' },
  dispatchBtnText: { color: '#fff', fontWeight: 'bold' }
});
