import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, StatusBar, FlatList,
  StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl, Modal, ScrollView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PHeadPackingApprovalsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
    };
    getUserId();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/packing/material-reports?status=Pending`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Fetch Reports Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (reportId: number) => {
    console.log(`[FRONTEND] handleApprove called for reportId: ${reportId}, userId: ${userId}`);
    if (!userId) {
      Alert.alert("Error", "User session not found. Please re-login.");
      return;
    }

    const confirmApproval = () => {
      console.log(`[FRONTEND] Approval confirmed for reportId: ${reportId}`);
      performApproval(reportId);
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to approve this report? This will subtract from inventory.")) {
        confirmApproval();
      }
    } else {
      Alert.alert(
        "Confirm Approval",
        "Are you sure you want to approve this report? This will subtract from inventory.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Approve", onPress: confirmApproval }
        ]
      );
    }
  };

  const performApproval = async (reportId: number) => {
    try {
      console.log(`[FRONTEND] Sending approval request to: ${SERVER_URL}/packing/material-report/approve`);
      const response = await fetch(`${SERVER_URL}/packing/material-report/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, approved_by: userId })
      });
      console.log(`[FRONTEND] Response status: ${response.status}`);
      if (response.ok) {
        Alert.alert("Success", "Report Approved");
        setShowDetailModal(false);
        fetchReports();
      } else {
        const data = await response.json();
        console.error(`[FRONTEND] Approval failed:`, data);
        Alert.alert("Error", data.error || "Failed to approve report");
      }
    } catch (error) {
      console.error(`[FRONTEND] Network error during approval:`, error);
      Alert.alert("Error", "Network error");
    }
  };

  const handleReject = async (reportId: number) => {
    const confirmRejection = () => {
      performRejection(reportId);
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to reject this report?")) {
        confirmRejection();
      }
    } else {
      Alert.alert(
        "Confirm Rejection",
        "Are you sure you want to reject this report?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reject", style: "destructive", onPress: confirmRejection }
        ]
      );
    }
  };

  const performRejection = async (reportId: number) => {
    try {
      const response = await fetch(`${SERVER_URL}/packing/material-report/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, approved_by: userId })
      });
      if (response.ok) {
        Alert.alert("Success", "Report Rejected");
        setShowDetailModal(false);
        fetchReports();
      } else {
        Alert.alert("Error", "Failed to reject report");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  const renderReportCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setSelectedReport(item); setShowDetailModal(true); }}>
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.batchNum}>{item.batch_number || `PL #${item.packing_list_id || 'Usage'}`}</Text>
          <View style={styles.shiftBadge}>
            <Text style={styles.shiftText}>{item.shift || 'N/A'}</Text>
          </View>
        </View>
        <Text style={styles.creatorText}>By: {item.creator_name}</Text>
        <Text style={styles.itemSummary}>
          {item.items.map((i: any) => `${i.item_name} (${i.quantity} ${i.unit})`).join(', ')}
        </Text>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/phead')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>PACKING APPROVALS</Text>
          <Text style={styles.subtitle}>Production Head Panel</Text>
        </View>
        <TouchableOpacity onPress={fetchReports}>
          <Ionicons name="refresh" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReportCard}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} tintColor="#10B981" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pending reports found.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={showDetailModal} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REPORT DETAILS</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedReport && (
                <View style={styles.detailsBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View>
                      <Text style={styles.detailLabel}>Batch / ID:</Text>
                      <Text style={styles.detailValue}>{selectedReport.batch_number || `PL #${selectedReport.packing_list_id || 'Usage'}`}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.detailLabel}>Shift:</Text>
                      <Text style={styles.detailValue}>{selectedReport.shift || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.detailLabel}>Requested By:</Text>
                  <Text style={styles.detailValue}>{selectedReport.creator_name}</Text>
                  
                  {selectedReport.remarks && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.detailLabel}>Remarks:</Text>
                      <Text style={styles.detailValue}>{selectedReport.remarks}</Text>
                    </View>
                  )}
                  
                  <Text style={[styles.detailLabel, { marginTop: 15, marginBottom: 10, color: '#10B981', fontSize: 14 }]}>MATERIALS USED:</Text>
                  {selectedReport.items.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemUsageRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.itemName}>{item.item_name}</Text>
                        <View style={styles.usageStatSingle}>
                          <Text style={styles.statValue}>{item.quantity} {item.unit}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(selectedReport.id)}>
                <Text style={styles.actionBtnText}>REJECT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(selectedReport.id)}>
                <Text style={styles.actionBtnText}>APPROVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PHeadFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  list: { padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardInfo: { flex: 1 },
  batchNum: { color: '#10B981', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  creatorText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  itemSummary: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  dateText: { color: '#64748B', fontSize: 10, marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  modalBody: { flex: 1 },
  detailsBox: { backgroundColor: '#0F172A', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  detailLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  itemName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  itemUsageRow: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  itemUsageGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  usageStat: { alignItems: 'center', backgroundColor: '#1E293B', padding: 8, borderRadius: 8, width: '30%' },
  usageStatSingle: { alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#10B981', fontSize: 12, fontWeight: '900', marginTop: 2 },
  shiftBadge: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
  shiftText: { color: '#10B981', fontSize: 10, fontWeight: '900' },
  
  actionRow: { flexDirection: 'row', marginTop: 20, marginBottom: 10 },
  actionBtn: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#EF4444', marginRight: 15 },
  approveBtn: { backgroundColor: '#10B981' },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});
